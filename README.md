# OpenLook Visual Bug Demo

This branch is intentionally broken.

It exists to demonstrate OpenLook as a visual unit testing loop for coding agents. The app still builds, renders, and can pass normal code checks, but the motion graphic contains a visual regression that should fail the OpenLook spec in `.openlook/hero-motion-graphic.yaml`.

## What To Test

There is exactly one visual spec:

```text
.openlook/hero-motion-graphic.yaml
```

The spec records the homepage for 15 seconds and asks Gemini to verify:

- smooth transitions between the YAML/spec phase and browser mockup phase
- organic cursor movement with visual inertia
- smooth verdict card slide-up easing

The current branch should fail the verdict animation/style check because the verdict card has been intentionally degraded.

## Agent Prompt

Use this prompt in IBM Bob or another coding agent with MCP tools:

```text
This branch intentionally contains a visual regression. Use the OpenLook skill and run the visual test in .openlook/hero-motion-graphic.yaml.

Follow the OpenLook workflow exactly:
1. Read and parse the spec.
2. Call openlook_prepare_run with the parsed spec.
3. Start Playwright recording using the returned startVideoArgs.
4. Navigate to the spec URL and perform the spec steps.
5. Stop recording with browser_stop_video.
6. Call openlook_review with the same spec and recordingPath.
7. Use the Gemini failure report to fix the UI.
8. Rerun the same spec until it passes.

Preserve the OpenLook report path and summarize the visual failure, the code fix, and the final pass result.
```

## MCP Configuration

OpenLook needs Gemini and Playwright MCP needs video enabled:

```json
{
  "mcpServers": {
    "openlook": {
      "command": "npx",
      "args": ["-y", "openlook"],
      "cwd": "/absolute/path/to/this/repo",
      "env": {
        "GEMINI_API_KEY": "your_key_here"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--caps=devtools"],
      "cwd": "/absolute/path/to/this/repo"
    }
  }
}
```

## Local App

Start the app before running the spec:

```bash
bun install
bun run dev
```

The spec targets:

```text
http://localhost:3000
```

## Expected Demo Story

1. Bob runs `.openlook/hero-motion-graphic.yaml`.
2. Playwright records the homepage motion graphic.
3. OpenLook sends the recording to Gemini.
4. Gemini reports a visual failure in the motion/verdict sequence.
5. Bob patches the UI animation/style.
6. Bob reruns the exact same spec.
7. OpenLook returns a passing visual report.

This is the core OpenLook loop: the agent can see the UI it built, understand the visual bug, fix it, and verify the repair.
