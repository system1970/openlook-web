# AGENTS.md

## What this project is

OpenLook is a visual unit testing MCP server for coding agents. It records browser sessions and sends them to Gemini for pass/fail evaluation.

## Build and run

```bash
bun install
bun run build:mcp          # Build the MCP server
bun run dev                 # Run the website (Next.js)
node dist/src/index.js      # Run MCP server in stdio mode
```

## Project structure

- `src/lib/` — MCP server core (types, gemini integration, report generation)
- `app/` — Next.js website
- `.agents/skills/openlook/` — Skill file that teaches agents how to use OpenLook
- `.openlook/` — Visual test spec YAML files
- `examples/` — Example specs and runner scripts

## Spec format

Visual tests are flat YAML files with `id`, `url`, `steps[]`, and `checks[]`. No nesting. See `.openlook/*.yaml` for examples.

## Do not

- Commit API keys or `.env` files
- Commit `~/.openlook/` run recordings
- Modify the Zod schemas in `types.ts` without also updating `gemini.ts` (the prompt builder reads the same fields)
