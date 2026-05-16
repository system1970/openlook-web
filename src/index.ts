#!/usr/bin/env node

/**
 * OpenLook - Visual Unit Testing for User Experience
 * Entry point - routes to CLI or MCP mode
 */

import { runCLI } from './cli.js';
import { startMcpServer } from './mcp-server.js';

// Check if running as CLI (has command-line arguments)
const args = process.argv.slice(2);

if (args.length > 0) {
  // CLI mode - run visual test
  runCLI(args).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  // MCP mode - start MCP server on stdio
  startMcpServer().catch(error => {
    console.error('MCP server error:', error);
    process.exit(1);
  });
}

// Made with Bob
