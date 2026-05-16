/**
 * Type definitions for OpenLook - Visual Unit Testing Framework
 */

import { z } from 'zod';

// ============================================================================
// OpenLook Spec Types (Input)
// ============================================================================

/**
 * Persona - describes the user type and context
 */
export const PersonaSchema = z.object({
  type: z.string().describe('User type (e.g., new_user, power_user, admin)'),
  context: z.string().describe('Situational context for this user'),
  expectations: z.array(z.string()).optional().describe('What this user expects to see/do'),
});

export type Persona = z.infer<typeof PersonaSchema>;

/**
 * Target - the page/app to test
 */
export const TargetSchema = z.object({
  url: z.string().url().describe('URL to test'),
  auth: z.union([
    z.literal('none'),
    z.object({
      type: z.enum(['basic', 'bearer', 'cookie']),
      credentials: z.record(z.string()),
    }),
  ]).optional().default('none'),
  initial_state: z.record(z.any()).optional().describe('Initial state/setup'),
});

export type Target = z.infer<typeof TargetSchema>;

/**
 * RunConfig - how to run the test
 */
export const RunConfigSchema = z.object({
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  device: z.enum(['desktop', 'mobile', 'tablet']),
  browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
  network: z.enum(['fast_3g', '4g', 'wifi', 'offline']).optional(),
});

export type RunConfig = z.infer<typeof RunConfigSchema>;

/**
 * Check - a visual assertion to verify
 */
export const CheckSchema = z.object({
  type: z.enum([
    'visual_presence',
    'visual_hierarchy', 
    'text_clarity',
    'visual_flow',
    'cognitive_load',
    'trust_signals',
    'mobile_friendly',
  ]),
  selector: z.string().optional().describe('CSS selector for element-specific checks'),
  description: z.string().describe('What this check verifies'),
  expected: z.string().describe('Expected visual state or behavior'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
});

export type Check = z.infer<typeof CheckSchema>;

/**
 * EvidenceConfig - what to capture during the test
 */
export const EvidenceConfigSchema = z.object({
  screenshots: z.union([
    z.boolean(),
    z.array(z.object({
      timing: z.enum(['initial_load', 'after_scroll', 'after_interaction', 'on_failure']),
      type: z.enum(['viewport', 'full_page', 'element']),
      description: z.string().optional(),
      selector: z.string().optional(),
    })),
  ]).optional().default(true),
  recordings: z.object({
    enabled: z.boolean(),
    duration: z.number().optional(),
  }).optional(),
  metrics: z.array(z.string()).optional().describe('Performance metrics to collect'),
});

export type EvidenceConfig = z.infer<typeof EvidenceConfigSchema>;

/**
 * SuccessCriteria - what constitutes a passing test
 */
export const SuccessCriteriaSchema = z.object({
  min_checks_passed: z.number().int().nonnegative().optional(),
  critical_checks_required: z.boolean().optional().default(true),
});

export type SuccessCriteria = z.infer<typeof SuccessCriteriaSchema>;

/**
 * ReportPreferences - how to format the report
 */
export const ReportPreferencesSchema = z.object({
  format: z.array(z.enum(['json', 'markdown', 'html'])).optional().default(['json', 'markdown']),
  include_screenshots: z.boolean().optional().default(true),
  include_recommendations: z.boolean().optional().default(true),
  highlight_critical_failures: z.boolean().optional().default(true),
});

export type ReportPreferences = z.infer<typeof ReportPreferencesSchema>;

/**
 * OpenLookSpec - complete test specification
 */
export const OpenLookSpecSchema = z.object({
  id: z.string().describe('Unique identifier for this spec'),
  description: z.string().optional().describe('Human-readable description'),
  persona: PersonaSchema,
  target: TargetSchema,
  run_config: RunConfigSchema,
  checks: z.array(CheckSchema).min(1).describe('Visual checks to perform'),
  evidence: EvidenceConfigSchema.optional(),
  success_criteria: SuccessCriteriaSchema.optional(),
  report: ReportPreferencesSchema.optional(),
});

export type OpenLookSpec = z.infer<typeof OpenLookSpecSchema>;

// ============================================================================
// OpenLook Report Types (Output)
// ============================================================================

/**
 * EvidenceItem - a piece of captured evidence
 */
export const EvidenceItemSchema = z.object({
  type: z.enum(['screenshot', 'video', 'metric']),
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
  recommendations: z.array(z.string()).optional().describe('Suggestions for improvement'),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;

/**
 * OpenLookReport - complete test report
 */
export const OpenLookReportSchema = z.object({
  spec_id: z.string(),
  spec_description: z.string().optional(),
  timestamp: z.string().datetime(),
  duration_ms: z.number().int().nonnegative(),
  verdict: z.enum(['pass', 'fail', 'error']),
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
// Legacy Types (kept for backward compatibility with existing code)
// ============================================================================

/**
 * Test session state (legacy - for MCP mode)
 */
export interface TestSession {
  id: string;
  url: string;
  startedAt: Date;
  status: 'active' | 'completed' | 'failed';
  observations: ObservationResult[];
  actions: ActionRecord[];
  evaluations: EvaluationResult[];
}

/**
 * Result of observing page state (legacy)
 */
export interface ObservationResult {
  timestamp: Date;
  screenshot?: string; // base64 encoded
  url: string;
  title: string;
  viewport: {
    width: number;
    height: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Record of an action performed (legacy)
 */
export interface ActionRecord {
  timestamp: Date;
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait';
  target?: string;
  value?: string;
  success: boolean;
  error?: string;
}

/**
 * Result of AI evaluation (legacy)
 */
export interface EvaluationResult {
  timestamp: Date;
  passed: boolean;
  confidence: number;
  reasoning: string;
  suggestions?: string[];
  screenshot?: string;
}

/**
 * Final test report (legacy)
 */
export interface TestReport {
  sessionId: string;
  url: string;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  status: 'passed' | 'failed' | 'error';
  summary: string;
  observations: ObservationResult[];
  actions: ActionRecord[];
  evaluations: EvaluationResult[];
  screenshots: string[];
}

/**
 * Browser configuration (legacy)
 */
export interface BrowserConfig {
  headless: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

/**
 * AI evaluator configuration (legacy)
 */
export interface EvaluatorConfig {
  apiKey: string;
  model: string;
  temperature?: number;
}

// Made with Bob
