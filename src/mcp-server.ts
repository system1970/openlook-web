/**
 * OpenLook MCP Server
 * Provides 4 tools for visual testing workflow with IBM Bob
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { loadSpec } from './spec.js';
import { SessionStore, type EvidenceKind } from './review-session.js';
import { analyzeEvidence } from './gemini.js';
import { generateReport } from './report.js';
import type { OpenLookReport } from './types.js';

/**
 * OpenLook MCP Server
 */
export class OpenLookMcpServer {
  private server: Server;
  private sessionStore: SessionStore;

  constructor() {
    this.server = new Server(
      {
        name: 'openlook',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.sessionStore = new SessionStore();
    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'openlook_load_spec':
            return await this.handleLoadSpec(args);
          case 'openlook_add_evidence':
            return await this.handleAddEvidence(args);
          case 'openlook_analyze':
            return await this.handleAnalyze(args);
          case 'openlook_finish':
            return await this.handleFinish(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Get list of available tools
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'openlook_load_spec',
        description: 'Load an OpenLook spec and create a review session. This starts a new visual testing session.',
        inputSchema: {
          type: 'object',
          properties: {
            specPath: {
              type: 'string',
              description: 'Path to the YAML spec file',
            },
          },
          required: ['specPath'],
        },
      },
      {
        name: 'openlook_add_evidence',
        description: 'Add evidence to a review session. Use this to attach screenshots, console logs, or notes collected during testing.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID from openlook_load_spec',
            },
            kind: {
              type: 'string',
              enum: ['screenshot', 'video', 'snapshot', 'console', 'network', 'note'],
              description: 'Type of evidence',
            },
            path: {
              type: 'string',
              description: 'File path for screenshots/videos (optional)',
            },
            text: {
              type: 'string',
              description: 'Text content for notes/console logs (optional)',
            },
            metadata: {
              type: 'object',
              description: 'Additional context (optional)',
            },
          },
          required: ['sessionId', 'kind'],
        },
      },
      {
        name: 'openlook_analyze',
        description: 'Analyze collected evidence using Gemini AI. This evaluates all checks against the evidence and provides a verdict.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID from openlook_load_spec',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'openlook_finish',
        description: 'Finalize the session and generate reports. This creates JSON and Markdown reports in the reports/ directory.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID from openlook_load_spec',
            },
          },
          required: ['sessionId'],
        },
      },
    ];
  }

  /**
   * Handle openlook_load_spec tool call
   */
  private async handleLoadSpec(args: any) {
    const { specPath } = args;

    if (!specPath) {
      throw new Error('specPath is required');
    }

    // Load and validate spec
    const spec = await loadSpec(specPath);

    // Create session
    const session = this.sessionStore.createSession(spec);

    // Build response
    const personaSummary = `${spec.persona.type} - ${spec.persona.context}`;
    const checksCount = spec.checks.length;
    const criticalCount = spec.checks.filter(c => c.priority === 'critical').length;

    const response = {
      sessionId: session.id,
      targetUrl: spec.target.url,
      personaSummary,
      goal: spec.description || `Test ${spec.id}`,
      checks: spec.checks.map(c => ({
        type: c.type,
        description: c.description,
        priority: c.priority || 'medium',
      })),
      checksCount,
      criticalCount,
      recommendedFirstAction: `Navigate to ${spec.target.url} using Playwright MCP and capture a screenshot with playwright_screenshot. Then use openlook_add_evidence to attach it.`,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  /**
   * Handle openlook_add_evidence tool call
   */
  private async handleAddEvidence(args: any) {
    const { sessionId, kind, path, text, metadata } = args;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    if (!kind) {
      throw new Error('kind is required');
    }

    // Get session
    const session = this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add evidence
    const evidence = session.addEvidence(kind as EvidenceKind, {
      path,
      text,
      metadata,
    });

    const response = {
      evidenceId: evidence.id,
      evidenceCount: session.evidence.length,
      sessionStatus: session.state,
      message: `Added ${kind} evidence. Total evidence: ${session.evidence.length}`,
      nextAction: session.evidence.length >= session.spec.checks.length
        ? 'You have collected evidence. Use openlook_analyze to evaluate the checks.'
        : 'Continue collecting evidence or use openlook_analyze when ready.',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  /**
   * Handle openlook_analyze tool call
   */
  private async handleAnalyze(args: any) {
    const { sessionId } = args;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // Get session
    const session = this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Check if we have evidence
    if (session.evidence.length === 0) {
      throw new Error('No evidence collected yet. Use openlook_add_evidence first.');
    }

    // Analyze with Gemini
    const analysis = await analyzeEvidence(session.spec, session.evidence);
    session.setAnalysis(analysis);

    const response = {
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      short_reason: analysis.short_reason,
      checks: analysis.checks.map(c => ({
        description: c.check.description,
        type: c.check.type,
        passed: c.passed,
        confidence: c.confidence,
        reasoning: c.reasoning,
        recommendations: c.recommendations,
      })),
      recommended_fix: analysis.recommended_fix,
      nextAction: 'Use openlook_finish to generate the final report.',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  /**
   * Handle openlook_finish tool call
   */
  private async handleFinish(args: any) {
    const { sessionId } = args;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // Get session
    const session = this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Check if analyzed
    if (!session.analysis) {
      throw new Error('Session not analyzed yet. Use openlook_analyze first.');
    }

    // Build report
    const report: OpenLookReport = {
      spec_id: session.spec.id,
      spec_description: session.spec.description,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - session.createdAt.getTime(),
      verdict: session.analysis.verdict === 'pass' ? 'pass' : session.analysis.verdict === 'fail' ? 'fail' : 'error',
      summary: session.analysis.short_reason,
      checks_total: session.analysis.checks.length,
      checks_passed: session.analysis.checks.filter(c => c.passed).length,
      checks_failed: session.analysis.checks.filter(c => !c.passed).length,
      results: session.analysis.checks,
      evidence: session.evidence.map(ev => ({
        type: ev.kind === 'screenshot' ? 'screenshot' : ev.kind === 'video' ? 'video' : 'metric',
        path: ev.path || '',
        description: ev.text,
        timestamp: ev.timestamp.toISOString(),
        metadata: ev.metadata,
      })),
      recommendations: session.analysis.recommended_fix ? [session.analysis.recommended_fix] : undefined,
    };

    // Generate report files
    const reportDir = await generateReport(session.spec, report);

    // Mark session complete
    session.complete();

    const response = {
      reportJsonPath: `${reportDir}/report.json`,
      reportMdPath: `${reportDir}/report.md`,
      verdict: report.verdict,
      summary: report.summary,
      checksTotal: report.checks_total,
      checksPassed: report.checks_passed,
      checksFailed: report.checks_failed,
      message: `Report generated successfully in ${reportDir}/`,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

/**
 * Create and start the MCP server
 */
export async function startMcpServer(): Promise<void> {
  const server = new OpenLookMcpServer();
  await server.start();
}

// Made with Bob