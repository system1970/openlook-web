# OpenLook Workflow

This skill uses a video-first UX test flow.

## Sequence

1. User asks Bob to run an OpenLook spec.
2. Bob loads the spec.
3. Bob asks OpenLook MCP to validate and start/prepare the review.
4. Bob uses Playwright MCP to run the browser flow.
5. Bob records the browser session as video or captures frames throughout the run.
6. Bob optionally captures supporting screenshots, DOM snapshots, logs, and observations.
7. Bob attaches the video/frames and supporting evidence to OpenLook MCP.
8. OpenLook MCP evaluates the run with Gemini Live.
9. OpenLook MCP writes `report.json` and `report.md`.
10. Bob summarizes what passed, what failed, and what to fix.

## Expected tool sequence

Preferred video-first tool sequence:

1. `openlook_validate_spec`
2. `openlook_prepare_run`
3. Playwright MCP: start video recording or prepare frame capture
4. Playwright MCP: navigate to target URL
5. Playwright MCP: click / type / scroll / wait / observe
6. Playwright MCP: capture optional supporting evidence
7. Playwright MCP: stop video recording or finalize frame capture
8. `openlook_analyze_video_live`
9. `openlook_finish_report`
10. `openlook_get_report`

If the current MCP server exposes older tool names, use this compatibility mapping:

| Preferred workflow step                 | Older tool name         |
| --------------------------------------- | ----------------------- |
| validate/prepare spec                   | `openlook_load_spec`    |
| attach video/frames/supporting evidence | `openlook_add_evidence` |
| Gemini Live analysis                    | `openlook_analyze`      |
| finish reports                          | `openlook_finish`       |

## Evidence priority

Primary evidence:

- browser session video
- captured browser video frames

Supporting evidence:

- screenshots
- DOM snapshots
- console logs
- network logs
- textual observations

Do not use screenshot-only analysis unless video or frame capture fails.

## Rerun loop

When the report fails:

1. Read failed checks.
2. Inspect evidence references.
3. Fix the UI/code.
4. Rerun the same spec.
5. Compare the new verdict with the previous report.

Do not weaken the spec to pass the test.