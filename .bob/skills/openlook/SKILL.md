---
name: openlook
description: Create, run, analyze, fix, and rerun OpenLook video-first visual UX tests using Playwright MCP, OpenLook MCP, and Gemini Live.
---

# OpenLook Bob Skill

OpenLook is a video-first visual UX unit testing workflow.

A developer writes an OpenLook YAML spec describing the intended user experience. Bob uses Playwright MCP to run the browser flow. OpenLook MCP validates the spec, collects the recording or frames, evaluates the run with Gemini Live, and writes a local report.

## Core rule

The browser video or captured video frames are the primary evidence.

Screenshots, snapshots, console logs, network logs, and textual observations are supporting evidence only. Do not evaluate the UX from screenshots alone unless the user explicitly asks for a fallback review.

## Main workflow

When the user asks to create, run, analyze, fix, or rerun an OpenLook test:

1. Locate or create an OpenLook YAML spec under `openlook/`.
2. Validate the spec with OpenLook MCP.
3. Start or prepare an OpenLook review session/run.
4. Use Playwright MCP to run the browser flow.
5. Record the full browser session as video or capture video frames for the full run.
6. Navigate to the spec target URL.
7. Perform the UX flow according to:
   - persona
   - goal
   - allowed_actions
   - max_steps
   - checks
8. Capture screenshots, DOM snapshots, console logs, network logs, and observations only as optional supporting evidence.
9. Attach evidence to the OpenLook review session.
10. Ask OpenLook MCP to evaluate the spec against the recording or frames using Gemini Live.
11. Ask OpenLook MCP to finish the report.
12. Summarize the result for the user:
    - verdict
    - confidence
    - failed checks
    - evidence references
    - recommended fixes
    - report paths
13. If the verdict is fail or needs_review, fix the app/code/spec issue and rerun the same spec.

## Tool choreography

Use the available OpenLook MCP tools. Prefer the newer video-first names if available:

1. `openlook_validate_spec`
2. `openlook_prepare_run`
3. Playwright MCP browser navigation and interaction tools
4. Playwright MCP video recording or frame capture tools
5. `openlook_add_evidence` only for supporting evidence, if this tool exists
6. `openlook_analyze_video_live` or the closest available OpenLook analyze tool
7. `openlook_finish_report` or the closest available OpenLook finish tool
8. `openlook_get_report`, if available

If the current OpenLook MCP exposes older names, map them like this:

- `openlook_load_spec` = load/validate/start review
- `openlook_add_evidence` = attach video, frames, screenshots, snapshots, logs, and observations
- `openlook_analyze` = Gemini Live evaluation
- `openlook_finish` = write final report

But keep the mental model video-first.

## Playwright MCP behavior

Use Playwright MCP to:

- navigate to the target URL
- click
- type
- scroll
- wait
- observe
- capture screenshots/snapshots when useful
- record browser video or provide captured frames when supported

Always make sure the run has complete visual evidence before analysis.

If Playwright MCP supports explicit video recording tools:

- start video before navigation or immediately before the flow begins
- stop video only after the goal/checks have been exercised
- pass the final local video path to OpenLook MCP

If Playwright MCP does not expose a final video path:

- capture frame evidence during the run
- save frames under `reports/<test-id>/<run-id>/frames/`
- attach those frames as the primary visual evidence for Gemini Live evaluation
- clearly report that the run used frame-based video evidence rather than a single video file

## Gemini Live evaluation rule

OpenLook uses Gemini Live for video analysis.

The evaluation should include:

- normalized OpenLook spec
- run context
- browser recording or frames
- supporting observations and artifacts

Gemini Live should return structured results:

- overall verdict: pass / fail / needs_review
- confidence
- check-by-check verdicts
- reasoning
- evidence timestamps or frame references
- failed checks
- recommended fixes

Do not call Gemini Live directly from Bob if OpenLook MCP already provides the analysis tool. Bob should normally use OpenLook MCP as the evaluation boundary.

## OpenLook spec requirements

OpenLook specs should use version `0.1`.

Required top-level fields:

- `version`
- `test`
- `target`
- `persona`
- `goal`
- `run`
- `checks`
- `failure_conditions`
- `evidence`
- `verdict`
- `metadata`

Use the template in `openlook-spec-v0.1-template.yml`.

## Reporting

The final run should produce local artifacts under:

`reports/<test-id>/<run-id>/`

Expected outputs:

- `report.json`
- `report.md`
- local video path or frame directory
- normalized spec
- evaluator metadata
- check-by-check results
- verdict
- confidence
- recommended fixes
- evidence references

## Safety rules

- Do not commit videos by default.
- Do not commit generated reports by default unless the user explicitly wants demo artifacts included.
- Do not expose `GEMINI_API_KEY`.
- Keep `.env` files out of git.
- Keep artifacts under `reports/<test-id>/<run-id>/`.
- Validate file paths before reading local artifacts.
- Treat video/frame upload to Gemini Live as an explicit analysis step.
- If the run may contain secrets, auth tokens, private data, or personal information, warn the user before analysis.

## When fixing failures

When OpenLook reports a failure:

1. Read `report.md` and `report.json`.
2. Identify failed checks.
3. Inspect the relevant UI/code.
4. Make the smallest fix that satisfies the spec.
5. Rerun the same OpenLook spec.
6. Compare the new report with the previous one.
7. Tell the user what changed.

Do not change the spec just to make the test pass unless the spec is clearly wrong or the user asks you to update the intended UX.