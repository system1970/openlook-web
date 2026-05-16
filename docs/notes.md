# Technical Context and References

This document provides accurate technical context for OpenLook, with source links for all claims.

## 1. IBM Bob MCP Server Configuration

### MCP Server Integration with Bob

**Source**: `.agents/skills/mcp-builder/` in Bob's agent skills

Bob integrates with MCP servers using:
- **Transport**: stdio (standard input/output) for local servers
- **Server Naming**: `{service}-mcp-server` format (e.g., `openlook-mcp-server`)
- **Tool Naming**: Use namespace prefix to avoid collisions (e.g., `openlook_run_spec`)

### Bob MCP Best Practices

**Source**: `.agents/skills/mcp-builder/reference/mcp_best_practices.md`

Key guidelines:
- Use stdio transport for local integrations
- Tools should be action-oriented with clear names
- Include service prefix in tool names (e.g., `web_` prefix)
- Log to stderr, not stdout (stdio servers)
- Provide clear error messages

### Bob Task Session Exports

Bob can export task session reports including:
- Markdown files documenting the task workflow
- Screenshots showing Bob's work
- These exports serve as hackathon judging evidence

**Location**: `bob_sessions/` directory

## 2. Model Context Protocol TypeScript SDK

### Official SDK

**Package**: `@modelcontextprotocol/sdk`  
**Source**: https://github.com/modelcontextprotocol/typescript-sdk

### Server Initialization

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'my-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Source**: https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md

### Tool Registration

Modern API uses `setRequestHandler` for tool registration:

```typescript
server.setRequestHandler(
  {
    method: 'tools/call',
    schema: z.object({
      name: z.literal('tool_name'),
      arguments: z.object({
        param: z.string()
      })
    })
  },
  async (request) => {
    // Tool implementation
    return {
      content: [{ type: 'text', text: 'result' }]
    };
  }
);
```

**Source**: MCP TypeScript SDK documentation

### Input Validation

Use Zod for schema validation:

```typescript
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
  timeout: z.number().optional()
});
```

**Source**: https://github.com/modelcontextprotocol/typescript-sdk

## 3. Playwright Browser Automation

### Official Package

**Package**: `playwright`  
**Source**: https://github.com/microsoft/playwright

### Basic Browser Control

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

**Source**: https://github.com/microsoft/playwright/blob/main/README.md

### Key Features for QA

- **Cross-browser**: Chromium, Firefox, WebKit
- **Screenshots**: Full page or viewport
- **Element interaction**: Click, type, scroll
- **Wait strategies**: Network idle, element visibility
- **Mobile emulation**: Device profiles

**Source**: https://playwright.dev/docs/intro

### TypeScript Support

Playwright has first-class TypeScript support with full type definitions.

**Source**: https://playwright.dev/docs/test-typescript

## 4. Google GenAI SDK (@google/genai)

### Official SDK

**Package**: `@google/genai` (v2.0.1+)  
**Source**: https://github.com/googleapis/js-genai

**Note**: This is the newer official SDK, replacing the deprecated `@google/generative-ai` package.

### Initialization

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'GEMINI_API_KEY' });
```

**Source**: https://github.com/googleapis/js-genai/blob/main/README.md

### Multimodal Image Analysis

```typescript
const generateContentResponse = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    {
      role: 'user',
      parts: [
        { text: 'What is in this picture?' },
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        }
      ]
    }
  ]
});

console.log(generateContentResponse.text);
```

**Source**: https://github.com/googleapis/js-genai/blob/main/js-genai/sdk-samples/interactions_multimodal_input_text_and_image_with_generate_content.ts

### Base64 Image Encoding

```typescript
import * as fs from 'fs';

function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType
    }
  };
}
```

**Source**: https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md

### Gemini Models

Available models for vision tasks:
- `gemini-2.0-flash-exp` - Fast, multimodal
- `gemini-2.5-flash` - Latest flash model
- `gemini-3-pro-image-preview` - Image generation

**Source**: https://github.com/googleapis/js-genai

### API Key Management

Get API key from: https://aistudio.google.com/app/apikey

Store in environment variable:
```bash
GEMINI_API_KEY=your_api_key_here
```

## 5. Secret Handling for Public Repos

### Environment Variables

**Best Practice**: Store secrets in `.env` file, never commit to git.

```bash
# .env (gitignored)
GEMINI_API_KEY=actual_secret_key
```

```bash
# .env.example (committed)
GEMINI_API_KEY=your_api_key_here
```

### .gitignore Patterns

```gitignore
# Secrets
.env

# Dependencies
node_modules/

# Build output
dist/
```

### Validation on Startup

```typescript
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not set');
  process.exit(1);
}
```

### Public Repository Safety

- ✅ Commit `.env.example` with placeholder values
- ✅ Commit `bun.lockb` (no secrets)
- ✅ Document required environment variables
- ❌ Never commit `.env` with real secrets
- ❌ Never hardcode API keys in source code

## 6. Bun Runtime

### Official Runtime

**Source**: https://bun.sh/

Bun is a fast JavaScript runtime with:
- Native TypeScript support
- Fast package installation
- Built-in bundler
- Node.js compatibility

### Project Commands

```bash
# Install dependencies
bun install

# Run TypeScript directly
bun run src/index.ts

# Build for production
bun build src/index.ts --outdir dist --target node

# Type check
bun run typecheck
```

### Lockfile

**File**: `bun.lockb` (binary format)  
**Should be committed**: Yes (contains no secrets, ensures reproducible builds)

## References Summary

1. **MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
2. **Playwright**: https://github.com/microsoft/playwright
3. **Google GenAI**: https://github.com/googleapis/js-genai
4. **Bob Skills**: `.agents/skills/mcp-builder/` (local)
5. **Bun**: https://bun.sh/

## 7. OpenLook MCP Architecture

### Overview

OpenLook implements an MCP server that works alongside Playwright MCP in IBM Bob to provide AI-powered visual testing capabilities.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         IBM Bob                              │
│  (AI Assistant with MCP Client)                             │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
                │ stdio                   │ stdio
                │                         │
    ┌───────────▼──────────┐   ┌─────────▼──────────┐
    │  OpenLook MCP        │   │  Playwright MCP    │
    │  Server              │   │  Server            │
    └───────────┬──────────┘   └─────────┬──────────┘
                │                         │
                │                         │
    ┌───────────▼──────────┐   ┌─────────▼──────────┐
    │  Spec Management     │   │  Browser Control   │
    │  Session Tracking    │   │  Screenshots       │
    │  Evidence Collection │   │  Page Interaction  │
    │  Gemini Analysis     │   │  Navigation        │
    │  Report Generation   │   │                    │
    └──────────────────────┘   └────────────────────┘
```

### Responsibilities

#### OpenLook MCP Server
- **Spec Management**: Load and validate YAML test specifications
- **Session Management**: Track test sessions with unique IDs
- **Evidence Collection**: Store screenshots, console logs, notes
- **AI Analysis**: Send evidence to Gemini for evaluation
- **Report Generation**: Create JSON and Markdown reports

#### Playwright MCP Server
- **Browser Automation**: Launch and control browsers
- **Navigation**: Navigate to URLs, click, type, scroll
- **Screenshot Capture**: Take viewport or full-page screenshots
- **Page Interaction**: Execute JavaScript, wait for elements
- **Network Monitoring**: Track requests and responses

### Tool Interaction Flow

```
1. Bob: openlook_load_spec(specPath)
   ↓
   OpenLook: Parse spec, create session, return session ID
   
2. Bob: playwright_navigate(url)
   ↓
   Playwright: Navigate browser to URL
   
3. Bob: playwright_screenshot(path)
   ↓
   Playwright: Capture screenshot, save to file
   
4. Bob: openlook_add_evidence(sessionId, kind="screenshot", path)
   ↓
   OpenLook: Attach screenshot to session
   
5. Bob: openlook_analyze(sessionId)
   ↓
   OpenLook: Send evidence to Gemini, evaluate checks
   
6. Bob: openlook_finish(sessionId)
   ↓
   OpenLook: Generate reports, mark session complete
```

### OpenLook MCP Tools

#### 1. openlook_load_spec
**Purpose**: Load a spec and create a review session

**Input**:
```json
{
  "specPath": "examples/openlook.first-run.yaml"
}
```

**Output**:
```json
{
  "sessionId": "session-1234567890-1",
  "targetUrl": "https://example.com",
  "personaSummary": "new_user - First visit to the site",
  "goal": "Test homepage first impression",
  "checks": [...],
  "recommendedFirstAction": "Navigate to URL and capture screenshot"
}
```

#### 2. openlook_add_evidence
**Purpose**: Attach evidence to a session

**Input**:
```json
{
  "sessionId": "session-1234567890-1",
  "kind": "screenshot",
  "path": "screenshots/page-1.png",
  "metadata": { "viewport": "1920x1080" }
}
```

**Output**:
```json
{
  "evidenceId": "session-1234567890-1-evidence-1",
  "evidenceCount": 1,
  "sessionStatus": "collecting",
  "message": "Added screenshot evidence. Total evidence: 1"
}
```

#### 3. openlook_analyze
**Purpose**: Analyze evidence using Gemini AI

**Input**:
```json
{
  "sessionId": "session-1234567890-1"
}
```

**Output**:
```json
{
  "verdict": "pass",
  "confidence": 0.85,
  "short_reason": "All visual checks passed",
  "checks": [
    {
      "description": "Hero section is prominent",
      "passed": true,
      "confidence": 0.9,
      "reasoning": "Clear hero image with value proposition"
    }
  ],
  "recommended_fix": null
}
```

#### 4. openlook_finish
**Purpose**: Generate final reports

**Input**:
```json
{
  "sessionId": "session-1234567890-1"
}
```

**Output**:
```json
{
  "reportJsonPath": "reports/homepage-first-impression-2026-05-15/report.json",
  "reportMdPath": "reports/homepage-first-impression-2026-05-15/report.md",
  "verdict": "pass",
  "summary": "All 3 checks passed",
  "checksTotal": 3,
  "checksPassed": 3,
  "checksFailed": 0
}
```

### Evidence Flow

```
Playwright MCP                OpenLook MCP
     │                             │
     │ 1. Navigate to URL          │
     ├─────────────────────────────┤
     │                             │
     │ 2. Capture screenshot       │
     │    → screenshots/page.png   │
     │                             │
     │                             │ 3. Add evidence
     │                             │    (path: screenshots/page.png)
     │                             ├────────────────────►
     │                             │                     │
     │                             │                     │ Store in session
     │                             │                     │
     │                             │ 4. Analyze         │
     │                             ├────────────────────►
     │                             │                     │
     │                             │                     │ Send to Gemini
     │                             │                     │ with spec context
     │                             │                     │
     │                             │ 5. Get results     │
     │                             │◄────────────────────┤
     │                             │                     │
     │                             │ 6. Generate report │
     │                             ├────────────────────►
     │                             │                     │
     │                             │                     │ Write JSON + MD
```

### Session State Machine

```
┌─────────┐
│ loading │  Initial state when spec is loaded
└────┬────┘
     │ openlook_add_evidence
     ▼
┌────────────┐
│ collecting │  Evidence is being collected
└─────┬──────┘
      │ openlook_analyze
      ▼
┌───────────┐
│ analyzing │  Gemini is evaluating checks
└─────┬─────┘
      │ openlook_finish
      ▼
┌──────────┐
│ complete │  Reports generated, session done
└──────────┘
```

### Gemini Integration

OpenLook uses Gemini AI for visual reasoning:

1. **Prompt Construction**: Build context with spec + evidence
2. **API Call**: Send to Gemini 1.5 Flash model
3. **Response Parsing**: Extract structured CheckResult[]
4. **Fallback**: Use mock analysis if API key not configured

**Mock Mode**: When `GEMINI_API_KEY` is not set, OpenLook provides deterministic mock results for testing the workflow without requiring a real API key.

### File Structure

```
src/
├── mcp-server.ts       # MCP server implementation
│   ├── OpenLookMcpServer class
│   ├── Tool handlers (load_spec, add_evidence, analyze, finish)
│   └── Request routing
│
├── review-session.ts   # Session management
│   ├── ReviewSession class (stores spec, evidence, analysis)
│   ├── SessionStore class (manages multiple sessions)
│   └── Evidence types and state tracking
│
├── gemini.ts          # Gemini AI integration
│   ├── analyzeEvidence() - Real AI analysis
│   ├── createMockAnalysis() - Fallback for testing
│   └── Prompt building and response parsing
│
└── index.ts           # Entry point
    ├── CLI mode (with args)
    └── MCP mode (no args, stdio)
```

### Configuration in Bob

Add to Bob's MCP configuration:

```json
{
  "mcpServers": {
    "openlook": {
      "command": "node",
      "args": ["C:/path/to/openlook/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_key_here"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    }
  }
}
```

### Benefits of This Architecture

1. **Separation of Concerns**: OpenLook handles testing logic, Playwright handles browser
2. **Reusability**: Playwright MCP can be used by other tools
3. **Flexibility**: Can swap browser automation without changing OpenLook
4. **Testability**: Mock mode allows testing without browser or API key
5. **Scalability**: Multiple sessions can run concurrently

6. **IBM Bob Hackathon**: https://lablab.ai/ai-hackathons/ibm-bob-hackathon