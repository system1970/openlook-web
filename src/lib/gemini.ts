/**
 * Gemini Integration
 * Sends browser recordings to Google Gemini for visual unit test evaluation.
 *
 * - Uses gemini-2.5-flash or configured model.
 * - Video files (.webm/.mp4) sent inline (≤18MB) or via File API (>18MB).
 * - Falls back to ffmpeg frame extraction if File API upload fails.
 * - Requests structured JSON output via responseMimeType.
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn } from 'node:child_process';
import type { OpenLookSpec, CheckResult, Evidence, AnalysisResult } from './types.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_MAX_FRAMES = 90;
const INLINE_VIDEO_SIZE_LIMIT = 18 * 1024 * 1024; // 18MB

/**
 * Analyze a browser recording using Gemini.
 * Returns mock results if no API key is available.
 */
export async function analyzeEvidence(
  spec: OpenLookSpec,
  evidence: Evidence[],
  apiKeyOverride?: string
): Promise<AnalysisResult> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return createMockAnalysis(spec, evidence);
  }

  try {
    return await analyzeWithGemini(spec, evidence, apiKey);
  } catch (error) {
    console.error('Gemini API error:', error);
    return createMockAnalysis(
      spec,
      evidence,
      `Gemini API Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Send recording + prompt to Gemini and parse the structured response.
 */
async function analyzeWithGemini(
  spec: OpenLookSpec,
  evidence: Evidence[],
  apiKey: string
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const maxFrames = Number(process.env.OPENLOOK_MAX_FRAMES || DEFAULT_MAX_FRAMES);

  // Build video content parts
  const contentParts: unknown[] = [];
  const videoParts = await buildVideoParts(ai, evidence, maxFrames);
  contentParts.push(...videoParts);

  if (contentParts.length === 0) {
    throw new Error('No browser recording found. Provide a .webm/.mp4 recordingPath.');
  }

  // Add analysis prompt as the final text part
  const prompt = buildPrompt(spec, contentParts.length);
  contentParts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: contentParts as any[] }],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  if (!text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }

  return parseGeminiResponse(spec, text);
}

// ============================================================================
// Video Parts
// ============================================================================

/**
 * Build content parts from evidence items.
 * Handles: video files (inline or upload), frame directories, screenshots, inline base64.
 */
async function buildVideoParts(
  ai: GoogleGenAI,
  evidence: Evidence[],
  maxFrames: number
): Promise<unknown[]> {
  const parts: unknown[] = [];

  for (const ev of evidence) {
    if (parts.length >= maxFrames) break;

    // Inline base64 frame/screenshot (no file path)
    if ((ev.kind === 'frame' || ev.kind === 'screenshot') && !ev.path) {
      const inline = getInlineImage(ev);
      if (inline) {
        parts.push({
          inlineData: { mimeType: inline.mimeType, data: inline.base64 },
        });
      }
      continue;
    }

    if (!ev.path) continue;

    const evidencePath = path.resolve(ev.path);
    const stat = await safeStat(evidencePath);
    if (!stat) continue;

    // Directory of extracted frames
    if (stat.isDirectory()) {
      const images = await listImages(evidencePath);
      for (const imgPath of images.slice(0, maxFrames - parts.length)) {
        const imgData = await fs.readFile(imgPath);
        parts.push({
          inlineData: { mimeType: getImageMimeType(imgPath), data: imgData.toString('base64') },
        });
      }
      continue;
    }

    // Video file
    if (isVideoFile(evidencePath)) {
      const videoPart = await buildVideoFilePart(ai, evidencePath, maxFrames);
      if (videoPart !== null) {
        const asAny = videoPart as any;
        if (asAny._ffmpegFrames) {
          for (const framePath of (asAny._ffmpegFrames as string[]).slice(0, maxFrames - parts.length)) {
            const imgData = await fs.readFile(framePath);
            parts.push({ inlineData: { mimeType: getImageMimeType(framePath), data: imgData.toString('base64') } });
          }
        } else {
          parts.push(videoPart);
        }
      }
      continue;
    }

    // Single image file
    if (isImageFile(evidencePath)) {
      const imgData = await fs.readFile(evidencePath);
      parts.push({
        inlineData: { mimeType: getImageMimeType(evidencePath), data: imgData.toString('base64') },
      });
    }
  }

  return parts;
}

/**
 * Build a content part for a video file.
 * Inline for ≤18MB, File API upload for larger, ffmpeg fallback if upload fails.
 */
async function buildVideoFilePart(
  ai: GoogleGenAI,
  videoPath: string,
  maxFrames: number
): Promise<unknown | null> {
  const stat = await safeStat(videoPath);
  if (!stat) return null;

  const mimeType = getVideoMimeType(videoPath);

  // Small file: inline
  if (stat.size <= INLINE_VIDEO_SIZE_LIMIT) {
    const videoData = await fs.readFile(videoPath);
    return {
      inlineData: { mimeType, data: videoData.toString('base64') },
    };
  }

  // Large file: upload via File API
  try {
    const uploadedFile = await ai.files.upload({
      file: videoPath,
      config: { mimeType },
    });

    if (uploadedFile.uri && uploadedFile.mimeType) {
      return {
        fileData: { fileUri: uploadedFile.uri, mimeType: uploadedFile.mimeType },
      };
    }
  } catch (uploadError) {
    console.warn('File API upload failed, falling back to frame extraction:', uploadError);
  }

  // Fallback: extract frames with ffmpeg
  const frames = await extractFramesFromVideo(videoPath, maxFrames);
  if (frames.length === 0) return null;
  return { _ffmpegFrames: frames };
}

// ============================================================================
// Prompt Builder
// ============================================================================

/**
 * Build the Gemini analysis prompt from a simplified spec.
 */
function buildPrompt(spec: OpenLookSpec, visualPartCount: number): string {
  const lines: string[] = [];

  // System instruction
  lines.push('You are OpenLook, a strict visual unit test evaluator.');
  lines.push('You evaluate browser recordings against visual checks.');
  lines.push('');
  lines.push('Rules:');
  lines.push('- The browser recording is the ONLY evidence.');
  lines.push('- Do not invent UI behavior not visible in the recording.');
  lines.push('- If evidence is insufficient or ambiguous, use needs_review.');
  lines.push('- Return JSON only. No markdown wrapping.');
  lines.push('');

  // Test context
  lines.push(`# Test: ${spec.id}`);
  lines.push(`URL: ${spec.url}`);
  lines.push(`Viewport: ${spec.viewport.width}x${spec.viewport.height}`);
  lines.push(`Recording parts: ${visualPartCount}`);
  lines.push('');

  // Steps performed
  lines.push('## Steps Performed');
  spec.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push('');

  // Checks to evaluate
  lines.push('## Checks');
  lines.push('');
  spec.checks.forEach((check, index) => {
    lines.push(`### Check ${index}: ${check.id}`);
    lines.push(`Question: ${check.question}`);
    lines.push(`Pass if: ${check.pass}`);
    lines.push(`Fail if: ${check.fail}`);
    lines.push('');
  });

  // Output shape
  lines.push('## Output JSON');
  lines.push('');
  lines.push('{');
  lines.push('  "verdict": "pass | fail | needs_review",');
  lines.push('  "short_reason": "One-line overall assessment",');
  lines.push('  "checks": [');
  lines.push('    {');
  lines.push('      "check_index": 0,');
  lines.push('      "passed": true,');
  lines.push('      "reasoning": "Explanation grounded in the recording",');
  lines.push('      "fix": "Specific fix if failed, omit if passed"');
  lines.push('    }');
  lines.push('  ]');
  lines.push('}');

  return lines.join('\n');
}

// ============================================================================
// Response Parser
// ============================================================================

/**
 * Parse Gemini JSON response into typed AnalysisResult.
 */
function parseGeminiResponse(spec: OpenLookSpec, responseText: string): AnalysisResult {
  try {
    const jsonMatch =
      responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${responseText.slice(0, 500)}`);
    }

    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    const checks: CheckResult[] = spec.checks.map((check, index) => {
      // Multi-strategy matching: 0-based, 1-based, string, or id match
      const checkResult = parsed.checks?.find((c: any) =>
        c.check_index === index ||
        c.check_index === index + 1 ||
        String(c.check_index) === String(index) ||
        String(c.check_index) === String(index + 1) ||
        (typeof c.id === 'string' && c.id.toLowerCase() === check.id.toLowerCase()) ||
        (typeof c.check_id === 'string' && c.check_id.toLowerCase() === check.id.toLowerCase())
      );

      if (!checkResult) {
        return {
          check,
          passed: false,
          confidence: 0.5,
          reasoning: 'No analysis provided by Gemini for this check.',
          recommendations: ['Review manually or provide clearer video evidence.'],
        };
      }

      return {
        check,
        passed: Boolean(checkResult.passed),
        confidence: typeof checkResult.confidence === 'number' ? checkResult.confidence : undefined,
        reasoning: checkResult.reasoning || 'No reasoning provided.',
        evidence_refs: Array.isArray(checkResult.evidence) ? checkResult.evidence.map(String) : undefined,
        fix: typeof checkResult.fix === 'string' ? checkResult.fix : undefined,
        recommendations: Array.isArray(checkResult.recommendations) ? checkResult.recommendations : undefined,
      };
    });

    return {
      verdict: normalizeVerdict(parsed.verdict),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      short_reason: parsed.short_reason || 'Analysis completed.',
      checks,
      recommended_fix: parsed.recommended_fix,
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return createMockAnalysis(
      spec,
      [],
      `Parse Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function normalizeVerdict(value: unknown): 'pass' | 'fail' | 'needs_review' {
  if (value === 'pass' || value === 'fail' || value === 'needs_review') return value;
  return 'needs_review';
}

// ============================================================================
// Mock Analysis (no API key or error fallback)
// ============================================================================

export function createMockAnalysis(
  spec: OpenLookSpec,
  _evidence: Evidence[],
  errorMessage?: string
): AnalysisResult {
  const checks: CheckResult[] = spec.checks.map((check, index) => {
    const passed = index % 2 === 0;
    return {
      check,
      passed,
      confidence: 0.5,
      reasoning: errorMessage
        ? `Unable to analyze: ${errorMessage}. Mock result.`
        : 'GEMINI_API_KEY not configured. Mock result.',
      recommendations: passed ? undefined : ['Configure GEMINI_API_KEY for real analysis.'],
      fix: passed ? undefined : 'Provide real video evidence and rerun.',
    };
  });

  return {
    verdict: 'needs_review',
    confidence: 0.5,
    short_reason: errorMessage
      ? `Mock analysis: ${errorMessage}`
      : `Mock analysis — no API key. ${checks.filter(c => c.passed).length}/${checks.length} passed.`,
    checks,
    recommended_fix: 'Configure GEMINI_API_KEY to enable real analysis.',
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function getInlineImage(ev: Evidence): { base64: string; mimeType: 'image/jpeg' | 'image/png' } | null {
  const raw = typeof ev.text === 'string' && ev.text.trim() ? ev.text.trim()
    : typeof (ev.metadata as any)?.data === 'string' ? (ev.metadata as any).data.trim()
    : typeof (ev.metadata as any)?.base64 === 'string' ? (ev.metadata as any).base64.trim()
    : null;

  if (!raw) return null;

  const dataUrl = raw.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/i);
  if (dataUrl) {
    return { mimeType: dataUrl[1] === 'image/png' ? 'image/png' : 'image/jpeg', base64: dataUrl[2] };
  }

  return {
    mimeType: typeof (ev.metadata as any)?.mimeType === 'string' && (ev.metadata as any).mimeType === 'image/png'
      ? 'image/png' : 'image/jpeg',
    base64: raw,
  };
}

async function extractFramesFromVideo(videoPath: string, maxFrames: number): Promise<string[]> {
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openlook-frames-'));
  const outPattern = path.join(outDir, 'frame-%04d.jpg');

  await runCommand(ffmpegPath, [
    '-y', '-i', videoPath,
    '-t', String(maxFrames),
    '-vf', 'fps=1,scale=1280:-1:force_original_aspect_ratio=decrease',
    '-q:v', '3',
    outPattern,
  ]);

  return listImages(outDir);
}

async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += String(chunk); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}. ${stderr || 'No stderr.'}`));
    });
  });
}

async function listImages(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir);
  return entries.filter(isImageFile).sort().map(file => path.join(dir, file));
}

async function safeStat(filePath: string) {
  try { return await fs.stat(filePath); } catch { return null; }
}

function isVideoFile(p: string): boolean {
  return ['.mp4', '.webm', '.mov', '.mkv'].includes(path.extname(p).toLowerCase());
}

function isImageFile(p: string): boolean {
  return ['.jpg', '.jpeg', '.png'].includes(path.extname(p).toLowerCase());
}

function getImageMimeType(p: string): 'image/jpeg' | 'image/png' {
  return path.extname(p).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
}

function getVideoMimeType(p: string): string {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.mkv') return 'video/x-matroska';
  return 'video/mp4';
}
