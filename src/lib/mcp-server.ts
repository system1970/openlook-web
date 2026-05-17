/**
 * OpenLook MCP Server
 *
 * Tools:
 * - openlook_prepare_run: allocate recording path for Playwright MCP
 * - openlook_review: send recorded video to Gemini for pass/fail verdicts
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { analyzeEvidence } from './gemini.js';
import { generateReport } from './report.js';
import { getProjectInfo } from './project.js';
import {
  OpenLookSpecSchema,
  type OpenLookReport,
  type OpenLookSpec,
  type Evidence,
  type EvidenceKind,
  type AnalysisResult,
} from './types.js';

export class OpenLookMcpServer {
  private server: Server;
  private geminiApiKey?: string;

  constructor(options: { geminiApiKey?: string } = {}) {
    this.geminiApiKey = options.geminiApiKey;
    this.server = new Server(
      { name: 'openlook', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        if (name === 'openlook_prepare_run') {
          return await this.handlePrepareRun(args);
        }
        if (name === 'openlook_review') {
          return await this.handleReview(args);
        }
        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'openlook_prepare_run',
        description:
          'Prepare an OpenLook visual test run. Call this BEFORE starting a Playwright browser recording. ' +
          'Creates a run directory under ~/.openlook/<project>/runs/ and returns: ' +
          '(1) recordingPath — the absolute path where Playwright should save the .webm, ' +
          '(2) startVideoArgs — pass these directly to browser_start_video, ' +
          '(3) reviewArgs — pass these directly to openlook_review after recording. ' +
          'Workflow: openlook_prepare_run → browser_start_video → perform steps → browser_stop_video → openlook_review.',
        inputSchema: {
          type: 'object',
          properties: {
            spec: {
              type: 'object',
              description:
                'The full OpenLook spec object parsed from YAML. Must contain: ' +
                'id (string), url (string), steps (string[]), checks (array of {id, question, pass, fail}). ' +
                'Optional: viewport ({width, height}, defaults to 1440x900).',
            },
          },
          required: ['spec'],
        },
      },
      {
        name: 'openlook_review',
        description:
          'Review an OpenLook browser recording. Sends the .webm video to Gemini for visual analysis against the spec checks. ' +
          'Returns: verdict (pass/fail/needs_review), per-check results with ✅/❌ status, reasoning for each check, ' +
          'and a recommended fix when the verdict is not pass. ' +
          'The recordingPath must point to a non-empty .webm/.mp4 file saved by Playwright MCP. ' +
          'Set writeReport to true to also generate report.md and report.json in the project reports/ directory.',
        inputSchema: {
          type: 'object',
          properties: {
            spec: {
              type: 'object',
              description:
                'The same OpenLook spec object used in openlook_prepare_run. ' +
                'Must contain: id, url, steps, checks. The checks define what Gemini evaluates.',
            },
            recordingPath: {
              type: 'string',
              description:
                'Absolute path to the .webm browser recording from Playwright MCP. ' +
                'Use the recordingPath from openlook_prepare_run, or the saved path returned by browser_stop_video.',
            },
            writeReport: {
              type: 'boolean',
              description:
                'When true, writes report.json and report.md with a copy of the recording to <project-root>/reports/<spec-id>-<timestamp>/. Defaults to false.',
            },
          },
          required: ['spec', 'recordingPath'],
        },
      },
    ];
  }

  private async handlePrepareRun(args: any) {
    const parsedSpec = OpenLookSpecSchema.safeParse(args?.spec);
    if (!parsedSpec.success) {
      throw new Error(`Invalid spec: ${parsedSpec.error.message}`);
    }

    const spec = parsedSpec.data;
    const runId = `${sanitizeFileName(spec.id)}-${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
    const projectInfo = await getProjectInfo();
    const runDir = path.join(projectInfo.baseOpenLookDir, 'runs', runId);
    const recordingPath = path.join(runDir, 'recording.webm');

    await fs.mkdir(runDir, { recursive: true });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              runId,
              runDir,
              recordingPath,
              startVideoTool: 'browser_start_video',
              startVideoArgs: {
                filename: recordingPath,
                size: {
                  width: spec.viewport.width,
                  height: spec.viewport.height,
                },
              },
              stopVideoTool: 'browser_stop_video',
              reviewTool: 'openlook_review',
              reviewArgs: {
                spec,
                recordingPath,
                writeReport: true,
              },
              nextSteps: [
                'Call browser_start_video with startVideoArgs before navigating.',
                'Perform the browser steps from the spec.',
                'Call browser_stop_video and keep the returned saved path if provided.',
                'Call openlook_review with the spec and recordingPath.',
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleReview(args: any) {
    const parsedSpec = OpenLookSpecSchema.safeParse(args?.spec);
    if (!parsedSpec.success) {
      throw new Error(`Invalid spec: ${parsedSpec.error.message}`);
    }

    const recordingPath = getRecordingPath(args);
    if (!recordingPath) {
      throw new Error('recordingPath is required. Record with Playwright MCP, then pass the .webm path.');
    }
    const verifiedRecordingPath = await verifyRecordingPath(recordingPath);

    const startedAt = Date.now();
    const evidence: Evidence[] = [{
      id: 'recording-1',
      kind: 'video' as EvidenceKind,
      path: verifiedRecordingPath,
      metadata: { source: 'playwright-mcp' },
      timestamp: new Date(),
    }];

    const analysis = await analyzeEvidence(parsedSpec.data, evidence, this.geminiApiKey);
    const report = buildReport(parsedSpec.data, evidence, analysis, startedAt);
    const reportDir = args?.writeReport ? await generateReport(parsedSpec.data, report, verifiedRecordingPath) : undefined;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              verdict: analysis.verdict,
              short_reason: analysis.short_reason,
              checks: analysis.checks.map((c) => ({
                id: c.check.id,
                question: c.check.question,
                status: c.passed ? '✅' : '❌',
                passed: c.passed,
                reasoning: c.reasoning,
                fix: c.fix,
              })),
              recommended_fix: analysis.recommended_fix,
              reportDir,
              recordingPath: verifiedRecordingPath,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);
  }
}

function buildReport(
  spec: OpenLookSpec,
  evidence: Evidence[],
  analysis: AnalysisResult,
  startedAtMs: number
): OpenLookReport {
  return {
    spec_id: spec.id,
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - startedAtMs,
    verdict: analysis.verdict,
    summary: analysis.short_reason,
    checks_total: analysis.checks.length,
    checks_passed: analysis.checks.filter((c) => c.passed).length,
    checks_failed: analysis.checks.filter((c) => !c.passed).length,
    results: analysis.checks,
    evidence: evidence.map(ev => ({
      type: ev.kind,
      path: ev.path || '',
      description: ev.text,
      timestamp: ev.timestamp.toISOString(),
      metadata: ev.metadata,
    })),
    recommendations: analysis.recommended_fix ? [analysis.recommended_fix] : undefined,
  };
}

function getRecordingPath(args: any): string | undefined {
  if (typeof args?.recordingPath === 'string' && args.recordingPath.trim()) {
    return args.recordingPath;
  }
  const legacyVideo = Array.isArray(args?.evidence)
    ? args.evidence.find((item: any) => item?.kind === 'video' && typeof item.path === 'string')
    : undefined;
  return legacyVideo?.path;
}

async function verifyRecordingPath(recordingPath: string): Promise<string> {
  const resolvedPath = path.resolve(recordingPath);
  const stat = await fs.stat(resolvedPath).catch(() => null);

  if (!stat) throw new Error(`Recording file not found: ${resolvedPath}`);
  if (!stat.isFile()) throw new Error(`Recording path is not a file: ${resolvedPath}`);
  if (stat.size === 0) throw new Error(`Recording file is empty: ${resolvedPath}`);

  const ext = path.extname(resolvedPath).toLowerCase();
  if (!['.webm', '.mp4', '.mov', '.mkv'].includes(ext)) {
    throw new Error(`Recording must be a video file (.webm, .mp4, .mov, .mkv): ${resolvedPath}`);
  }

  return resolvedPath;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'openlook-run';
}
