import { randomUUID } from 'node:crypto';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { OpenLookMcpServer } from '@/src/lib/mcp-server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface McpConnection {
  server: OpenLookMcpServer;
  transport: WebStandardStreamableHTTPServerTransport;
}

const connections = new Map<string, McpConnection>();

async function getOrCreateConnection(sessionId?: string, geminiApiKey?: string): Promise<McpConnection> {
  if (sessionId) {
    const existing = connections.get(sessionId);
    if (existing) return existing;
  }

  let connection: McpConnection | undefined;

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      if (connection) connections.set(id, connection);
    },
    onsessionclosed: (id) => {
      connections.delete(id);
    },
  });

  transport.onclose = () => {
    const id = transport.sessionId;
    if (id) connections.delete(id);
  };

  const server = new OpenLookMcpServer({ geminiApiKey });
  connection = { server, transport };
  await server.connect(transport);
  return connection;
}

async function handle(req: NextRequest): Promise<Response> {
  const sessionId = req.headers.get('mcp-session-id') ?? undefined;
  const geminiApiKey = getGeminiApiKey(req);
  const connection = await getOrCreateConnection(sessionId, geminiApiKey);
  return connection.transport.handleRequest(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function DELETE(req: NextRequest) {
  return handle(req);
}

function getGeminiApiKey(req: NextRequest): string | undefined {
  const explicit = req.headers.get('x-openlook-gemini-api-key')?.trim();
  if (explicit) return explicit;

  const auth = req.headers.get('authorization')?.trim();
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return auth.slice('bearer '.length).trim() || undefined;
  }

  return undefined;
}
