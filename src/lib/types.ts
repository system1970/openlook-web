/**
 * Type definitions for OpenLook - Visual Unit Testing Framework
 */

import { z } from 'zod';

// ============================================================================
// OpenLook Spec Types (Input)
// ============================================================================

/**
 * Check - a visual assertion to verify from the browser recording.
 */
export const CheckSchema = z.object({
  id: z.string().describe('Stable check identifier'),
  question: z.string().describe('The visual question being evaluated'),
  pass: z.string().describe('What must be visible or true for this check to pass'),
  fail: z.string().describe('What visible evidence means this check failed'),
});

export type Check = z.infer<typeof CheckSchema>;

/**
 * OpenLookSpec - a visual unit test.
 *
 * Flat structure: url to visit, steps to perform, checks to evaluate.
 */
export const OpenLookSpecSchema = z.object({
  id: z.string().describe('Unique test identifier'),
  url: z.string().url().describe('URL to test'),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).default({ width: 1440, height: 900 }),
  steps: z.array(z.string()).min(1).describe('Ordered browser actions for the agent to perform'),
  checks: z.array(CheckSchema).min(1).describe('Visual assertions Gemini evaluates from the recording'),
});

export type OpenLookSpec = z.infer<typeof OpenLookSpecSchema>;

// ============================================================================
// OpenLook Report Types (Output)
// ============================================================================

/**
 * EvidenceItem - a piece of captured evidence
 */
export const EvidenceItemSchema = z.object({
  type: z.enum(['video', 'frame', 'screenshot', 'snapshot', 'console', 'network', 'note']),
  path: z.string().describe('Relative path to the evidence file'),
  description: z.string().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

/**
 * CheckResult - result of a single check
 */
export const CheckResultSchema = z.object({
  check: CheckSchema,
  passed: z.boolean(),
  confidence: z.number().min(0).max(1).optional().describe('AI confidence in the result (0-1)'),
  reasoning: z.string().describe('Why this check passed or failed'),
  evidence: z.array(EvidenceItemSchema).optional(),
  evidence_refs: z.array(z.string()).optional().describe('Frame, timestamp, or artifact references supporting the result'),
  fix: z.string().optional().describe('Specific recommended fix for this check'),
  recommendations: z.array(z.string()).optional().describe('Suggestions for improvement'),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;

/**
 * OpenLookReport - complete test report
 */
export const OpenLookReportSchema = z.object({
  spec_id: z.string(),
  timestamp: z.string().datetime(),
  duration_ms: z.number().int().nonnegative(),
  verdict: z.enum(['pass', 'fail', 'needs_review', 'error']),
  summary: z.string().describe('High-level summary of results'),

  checks_total: z.number().int().nonnegative(),
  checks_passed: z.number().int().nonnegative(),
  checks_failed: z.number().int().nonnegative(),

  results: z.array(CheckResultSchema),
  evidence: z.array(EvidenceItemSchema),

  recommendations: z.array(z.string()).optional().describe('Overall recommendations'),
  error: z.string().optional().describe('Error message if test errored'),
});

export type OpenLookReport = z.infer<typeof OpenLookReportSchema>;

// ============================================================================
// Evidence and Analysis Types (used by gemini.ts and mcp-server.ts)
// ============================================================================

export type EvidenceKind = 'video' | 'frame' | 'screenshot' | 'snapshot' | 'console' | 'network' | 'note';

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  path?: string;
  text?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface AnalysisResult {
  verdict: 'pass' | 'fail' | 'needs_review';
  confidence: number;
  short_reason: string;
  checks: CheckResult[];
  recommended_fix?: string;
}
