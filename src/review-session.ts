/**
 * Review Session Management
 * Manages test sessions for MCP mode
 */

import type { OpenLookSpec, CheckResult } from './types.js';

/**
 * Evidence item types
 */
export type EvidenceKind = 'screenshot' | 'video' | 'snapshot' | 'console' | 'network' | 'note';

/**
 * Evidence item in a review session
 */
export interface Evidence {
  id: string;
  kind: EvidenceKind;
  path?: string;
  text?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Session state
 */
export type SessionState = 'loading' | 'collecting' | 'analyzing' | 'complete' | 'error';

/**
 * Analysis result from Gemini
 */
export interface AnalysisResult {
  verdict: 'pass' | 'fail' | 'needs_review';
  confidence: number;
  short_reason: string;
  checks: CheckResult[];
  recommended_fix?: string;
}

/**
 * Review session for a single test run
 */
export class ReviewSession {
  public readonly id: string;
  public readonly spec: OpenLookSpec;
  public readonly createdAt: Date;
  public state: SessionState;
  public evidence: Evidence[];
  public analysis?: AnalysisResult;
  public error?: string;

  constructor(id: string, spec: OpenLookSpec) {
    this.id = id;
    this.spec = spec;
    this.createdAt = new Date();
    this.state = 'loading';
    this.evidence = [];
  }

  /**
   * Add evidence to the session
   */
  addEvidence(kind: EvidenceKind, options: {
    path?: string;
    text?: string;
    metadata?: Record<string, unknown>;
  }): Evidence {
    const evidence: Evidence = {
      id: `${this.id}-evidence-${this.evidence.length + 1}`,
      kind,
      path: options.path,
      text: options.text,
      metadata: options.metadata,
      timestamp: new Date(),
    };

    this.evidence.push(evidence);
    
    // Update state if this is the first evidence
    if (this.state === 'loading') {
      this.state = 'collecting';
    }

    return evidence;
  }

  /**
   * Set analysis result
   */
  setAnalysis(analysis: AnalysisResult): void {
    this.analysis = analysis;
    this.state = 'analyzing';
  }

  /**
   * Mark session as complete
   */
  complete(): void {
    if (this.state !== 'error') {
      this.state = 'complete';
    }
  }

  /**
   * Mark session as error
   */
  setError(error: string): void {
    this.error = error;
    this.state = 'error';
  }

  /**
   * Get session summary
   */
  getSummary(): {
    sessionId: string;
    specId: string;
    state: SessionState;
    evidenceCount: number;
    hasAnalysis: boolean;
    createdAt: string;
  } {
    return {
      sessionId: this.id,
      specId: this.spec.id,
      state: this.state,
      evidenceCount: this.evidence.length,
      hasAnalysis: !!this.analysis,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Get evidence summary
   */
  getEvidenceSummary(): string {
    const counts: Record<EvidenceKind, number> = {
      screenshot: 0,
      video: 0,
      snapshot: 0,
      console: 0,
      network: 0,
      note: 0,
    };

    this.evidence.forEach(ev => {
      counts[ev.kind]++;
    });

    const parts: string[] = [];
    Object.entries(counts).forEach(([kind, count]) => {
      if (count > 0) {
        parts.push(`${count} ${kind}${count > 1 ? 's' : ''}`);
      }
    });

    return parts.length > 0 ? parts.join(', ') : 'No evidence collected';
  }
}

/**
 * Session store - manages all review sessions
 */
export class SessionStore {
  private sessions: Map<string, ReviewSession>;
  private sessionCounter: number;

  constructor() {
    this.sessions = new Map();
    this.sessionCounter = 0;
  }

  /**
   * Create a new session
   */
  createSession(spec: OpenLookSpec): ReviewSession {
    this.sessionCounter++;
    const id = `session-${Date.now()}-${this.sessionCounter}`;
    const session = new ReviewSession(id, spec);
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(id: string): ReviewSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ReviewSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete a session
   */
  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    this.sessions.clear();
    this.sessionCounter = 0;
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Made with Bob