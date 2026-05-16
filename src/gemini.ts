/**
 * Gemini AI Integration
 * Handles evidence analysis using Google Gemini API
 */

import { GoogleGenAI } from '@google/genai';
import type { OpenLookSpec, CheckResult } from './types.js';
import type { Evidence, AnalysisResult } from './review-session.js';

/**
 * Analyze evidence using Gemini AI
 */
export async function analyzeEvidence(
  spec: OpenLookSpec,
  evidence: Evidence[]
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key, use mock analysis
  if (!apiKey) {
    return createMockAnalysis(spec, evidence);
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    // Build prompt with spec context and evidence
    const prompt = buildAnalysisPrompt(spec, evidence);

    // Call Gemini API
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });
    const text = result.text || '';

    // Parse response into structured CheckResult[]
    const analysis = parseGeminiResponse(spec, text);

    return analysis;
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to mock analysis on error
    return createMockAnalysis(spec, evidence, `API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Build analysis prompt for Gemini
 */
function buildAnalysisPrompt(spec: OpenLookSpec, evidence: Evidence[]): string {
  const lines: string[] = [];

  lines.push('You are a UX expert evaluating a user interface based on visual evidence.');
  lines.push('');
  lines.push('# Test Specification');
  lines.push('');
  lines.push(`**Spec ID:** ${spec.id}`);
  if (spec.description) {
    lines.push(`**Description:** ${spec.description}`);
  }
  lines.push('');
  lines.push('## Persona');
  lines.push(`- **Type:** ${spec.persona.type}`);
  lines.push(`- **Context:** ${spec.persona.context}`);
  if (spec.persona.expectations && spec.persona.expectations.length > 0) {
    lines.push('- **Expectations:**');
    spec.persona.expectations.forEach(exp => {
      lines.push(`  - ${exp}`);
    });
  }
  lines.push('');
  lines.push('## Target');
  lines.push(`- **URL:** ${spec.target.url}`);
  lines.push('');
  lines.push('## Checks to Evaluate');
  lines.push('');
  spec.checks.forEach((check, index) => {
    lines.push(`### Check ${index + 1}: ${check.description}`);
    lines.push(`- **Type:** ${check.type}`);
    lines.push(`- **Priority:** ${check.priority || 'medium'}`);
    if (check.selector) {
      lines.push(`- **Selector:** ${check.selector}`);
    }
    lines.push(`- **Expected:** ${check.expected}`);
    lines.push('');
  });

  lines.push('# Evidence Collected');
  lines.push('');
  if (evidence.length === 0) {
    lines.push('No evidence collected yet.');
  } else {
    evidence.forEach((ev, index) => {
      lines.push(`## Evidence ${index + 1}`);
      lines.push(`- **Type:** ${ev.kind}`);
      if (ev.path) {
        lines.push(`- **Path:** ${ev.path}`);
      }
      if (ev.text) {
        lines.push(`- **Content:**`);
        lines.push('```');
        lines.push(ev.text);
        lines.push('```');
      }
      if (ev.metadata) {
        lines.push(`- **Metadata:** ${JSON.stringify(ev.metadata)}`);
      }
      lines.push('');
    });
  }

  lines.push('# Task');
  lines.push('');
  lines.push('Evaluate each check based on the evidence provided. For each check, provide:');
  lines.push('1. **Passed:** true or false');
  lines.push('2. **Confidence:** 0.0 to 1.0 (how confident you are in this assessment)');
  lines.push('3. **Reasoning:** Clear explanation of why it passed or failed');
  lines.push('4. **Recommendations:** (if failed) Specific suggestions for improvement');
  lines.push('');
  lines.push('Format your response as JSON:');
  lines.push('```json');
  lines.push('{');
  lines.push('  "verdict": "pass" | "fail" | "needs_review",');
  lines.push('  "confidence": 0.85,');
  lines.push('  "short_reason": "Brief summary of overall assessment",');
  lines.push('  "checks": [');
  lines.push('    {');
  lines.push('      "check_index": 0,');
  lines.push('      "passed": true,');
  lines.push('      "confidence": 0.9,');
  lines.push('      "reasoning": "Detailed explanation",');
  lines.push('      "recommendations": ["suggestion 1", "suggestion 2"]');
  lines.push('    }');
  lines.push('  ],');
  lines.push('  "recommended_fix": "Overall recommendation if verdict is fail"');
  lines.push('}');
  lines.push('```');

  return lines.join('\n');
}

/**
 * Parse Gemini response into structured analysis
 */
function parseGeminiResponse(spec: OpenLookSpec, responseText: string): AnalysisResult {
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Build CheckResult[] from parsed response
    const checks: CheckResult[] = spec.checks.map((check, index) => {
      const checkResult = parsed.checks?.find((c: any) => c.check_index === index);
      
      if (!checkResult) {
        return {
          check,
          passed: false,
          confidence: 0.5,
          reasoning: 'No analysis provided by AI',
          recommendations: ['Unable to evaluate - insufficient evidence'],
        };
      }

      return {
        check,
        passed: checkResult.passed ?? false,
        confidence: checkResult.confidence ?? 0.5,
        reasoning: checkResult.reasoning || 'No reasoning provided',
        recommendations: checkResult.recommendations,
      };
    });

    return {
      verdict: parsed.verdict || 'needs_review',
      confidence: parsed.confidence || 0.5,
      short_reason: parsed.short_reason || 'Analysis completed',
      checks,
      recommended_fix: parsed.recommended_fix,
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // Return fallback analysis
    return createMockAnalysis(spec, [], `Parse Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create mock analysis when Gemini is not available
 */
export function createMockAnalysis(
  spec: OpenLookSpec,
  _evidence: Evidence[],
  errorMessage?: string
): AnalysisResult {
  const checks: CheckResult[] = spec.checks.map((check, index) => {
    // Mock logic: critical checks pass, others alternate
    const passed = check.priority === 'critical' || index % 2 === 0;

    return {
      check,
      passed,
      confidence: 0.5,
      reasoning: errorMessage
        ? `Unable to perform AI analysis: ${errorMessage}. This is a mock result.`
        : 'Gemini API key not configured. This is a mock result for testing. Configure GEMINI_API_KEY environment variable for real AI analysis.',
      recommendations: passed ? undefined : [
        'Configure Gemini API key for real analysis',
        'Collect more evidence (screenshots, console logs)',
        'Review this check manually',
      ],
    };
  });

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;

  return {
    verdict: 'needs_review',
    confidence: 0.5,
    short_reason: errorMessage
      ? `Mock analysis due to error: ${errorMessage}`
      : `Mock analysis - Gemini API not configured. ${passedCount}/${totalCount} checks passed in simulation.`,
    checks,
    recommended_fix: 'Configure GEMINI_API_KEY environment variable to enable real AI-powered visual analysis.',
  };
}

// Made with Bob