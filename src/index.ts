#!/usr/bin/env node

import * as path from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OpenLookMcpServer } from './lib/mcp-server.js';

// Load .env file if process.loadEnvFile is supported (Node.js >= 20.6.0)
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), '.env'));
  } catch {
    // Ignore error if file doesn't exist or fail to load
  }
}

async function main() {
  const server = new OpenLookMcpServer();
  await server.connect(new StdioServerTransport());
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

