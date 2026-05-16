# OpenLook

**Visual Unit Testing for User Experience**

Test your UX like you test your code - with assertions, evidence, and clear pass/fail verdicts.

## Hackathon Context

This project is being developed for the [IBM Bob Hackathon](https://lablab.ai/ai-hackathons/ibm-bob-hackathon).

## What is OpenLook?

OpenLook is a visual unit testing framework that brings the rigor of code testing to user experience. Instead of writing code assertions, you write **visual assertions** in YAML specs that describe what a user should see and experience.

### The Vision

Traditional QA testing is either:
- **Manual**: Slow, inconsistent, hard to scale
- **Code-based**: Brittle selectors, misses visual issues, requires programming

OpenLook bridges this gap with **declarative visual tests**:

```yaml
persona: new_user
target:
  url: https://myapp.com/onboarding
checks:
  - type: visual_presence
    description: "Welcome message is visible and friendly"
    expected: "Clear welcome text for first-time users"
  - type: visual_flow
    description: "Next steps are obvious"
    expected: "Prominent call-to-action button"
```

### How It Works

1. **Write a spec** - Describe the user persona, target page, and visual checks in YAML
2. **Run OpenLook** - AI-powered visual reasoning evaluates your UX
3. **Get a report** - Clear pass/fail with screenshots and actionable feedback

**Current Status**: 🚧 Foundation phase - spec parser and report writer only

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 18 (for running built output)
- Google Gemini API key (for future AI integration)

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Add your Gemini API key to .env (for future use)
# Get key from: https://aistudio.google.com/app/apikey
```

### Usage

```bash
# Run a visual test spec
bun run openlook examples/openlook.first-run.yaml

# Or after building
bun run build
./dist/index.js examples/openlook.first-run.yaml
```

## Spec Format

OpenLook specs are YAML files that describe visual unit tests:

```yaml
id: homepage-hero-check
persona:
  type: new_user
  context: "First visit to the site"

target:
  url: https://example.com
  
run_config:
  viewport:
    width: 1920
    height: 1080
  device: desktop

checks:
  - type: visual_presence
    selector: ".hero-section"
    description: "Hero section is prominent"
    expected: "Large hero image with clear value proposition"
    
  - type: visual_hierarchy
    description: "Call-to-action stands out"
    expected: "Primary CTA button is visually dominant"

evidence:
  screenshots: true
  full_page: true
```

See `examples/openlook.first-run.yaml` for a complete example.

## Using with IBM Bob

OpenLook works as an MCP server alongside Playwright MCP in IBM Bob for interactive visual testing.

### Bob MCP Configuration

Add both MCPs to your Bob configuration file:

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

**Note:** Replace `C:/path/to/openlook/dist/index.js` with the actual path to your OpenLook installation.

### Workflow with Bob

1. **Load a spec**: Use `openlook_load_spec` to start a visual test session
2. **Navigate & capture**: Use Playwright MCP tools (`playwright_navigate`, `playwright_screenshot`) to interact with the page
3. **Add evidence**: Use `openlook_add_evidence` to attach screenshots and observations
4. **Analyze**: Use `openlook_analyze` for AI-powered evaluation of all checks
5. **Generate report**: Use `openlook_finish` to create JSON and Markdown reports

### Example Bob Conversation

```
You: Load the spec examples/openlook.first-run.yaml

Bob: [Uses openlook_load_spec]
     Session created! Target: https://example.com
     Recommended: Navigate to URL and capture screenshot

You: Navigate to the URL and take a screenshot

Bob: [Uses playwright_navigate and playwright_screenshot]
     Screenshot saved to screenshots/page-1.png
     
Bob: [Uses openlook_add_evidence]
     Evidence added. Ready for analysis.

You: Analyze the evidence

Bob: [Uses openlook_analyze]
     Verdict: PASS (confidence: 0.85)
     All 3 checks passed!

You: Generate the final report

Bob: [Uses openlook_finish]
     Report saved to reports/homepage-first-impression-2026-05-15/
```

## Architecture

OpenLook has three modes:

### 1. CLI Mode
Run visual tests from the command line:
```bash
openlook path/to/spec.yaml
```

### 2. MCP Server Mode ✅
Integrate with AI assistants like IBM Bob for interactive testing.

### 3. CI/CD Mode (Future)
Run visual tests in your deployment pipeline.

## Project Structure

```
openlook/
├── src/
│   ├── index.ts          # Entry point (CLI/MCP router)
│   ├── cli.ts            # CLI runner
│   ├── mcp-server.ts     # MCP server with 4 tools ✅
│   ├── review-session.ts # Session management ✅
│   ├── gemini.ts         # Gemini AI integration ✅
│   ├── spec.ts           # YAML spec parser with validation
│   ├── report.ts         # Report generator (JSON + Markdown)
│   ├── types.ts          # TypeScript types and Zod schemas
│   ├── browser.ts        # Browser controller (future)
│   ├── evaluator.ts      # AI evaluator (future)
│   └── session.ts        # Session manager (future)
├── examples/
│   └── openlook.first-run.yaml  # Example spec
├── reports/              # Generated test reports
└── docs/
    └── notes.md          # Technical references
```

## Development Status

### Completed ✅
- Project renamed to OpenLook
- YAML spec format defined
- Spec parser with Zod validation
- Report generator (JSON + Markdown)
- CLI runner with mock data
- Example spec file
- **MCP server mode with 4 tools**
- **Gemini AI integration**
- **Session management**

### Not Yet Implemented ⏳
- Real browser automation (handled by Playwright MCP)
- Video recording and Gemini Live
- CI/CD integration
- Hosted dashboard

## Why "OpenLook"?

- **Open**: Open source, open format, open to all skill levels
- **Look**: Visual-first testing - what users actually see
- **Unit Testing**: Bring the discipline of unit tests to UX

## Documentation

- [Example Spec](examples/openlook.first-run.yaml) - See the spec format in action
- [Technical Notes](docs/notes.md) - Implementation references
- [Bob Sessions](bob_sessions/README.md) - Hackathon development evidence

## Contributing

This is a hackathon project, but contributions are welcome! The foundation is in place - help us build the future of visual UX testing.

## License

MIT