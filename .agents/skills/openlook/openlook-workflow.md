# OpenLook Workflow

Video-first visual unit testing with Playwright MCP + OpenLook MCP.

## Sequence

```text
1. Agent reads the OpenLook YAML spec.
2. Agent calls openlook_prepare_run(spec).
3. OpenLook creates .openlook/runs/<run-id>/ and returns recordingPath + startVideoArgs.
4. Agent calls browser_start_video(startVideoArgs).
5. Agent uses Playwright MCP to perform task.steps.
6. Agent calls browser_stop_video and gets the saved .webm path.
7. Agent calls openlook_review(spec, recordingPath).
8. Gemini watches the browser recording and returns verdicts.
9. Agent reports [x]/[ ] checks and recommended fixes.
```

## Tool call reference

### Prepare run

```json
openlook_prepare_run({
  "spec": { "...full parsed spec object..." }
})
```

Returns:

```json
{
  "runId": "homepage-first-impression-...",
  "runDir": "/absolute/path/.openlook/runs/homepage-first-impression-...",
  "recordingPath": "/absolute/path/.openlook/runs/homepage-first-impression-.../recording.webm",
  "startVideoArgs": {
    "filename": "/absolute/path/.openlook/runs/homepage-first-impression-.../recording.webm",
    "width": 1440,
    "height": 900
  }
}
```

### Start recording

```json
browser_start_video({
  "filename": "/absolute/path/.openlook/runs/<run-id>/recording.webm",
  "width": 1440,
  "height": 900
})
```

Call this before any navigation. Playwright MCP must be started with `--caps=devtools`.

### Stop recording

```json
browser_stop_video()
```

If this returns a saved file path, pass that path to `openlook_review`. If it does not, use the `recordingPath` from `openlook_prepare_run`.

### Send for analysis

```json
openlook_review({
  "spec": { "...full parsed spec object..." },
  "recordingPath": "/absolute/path/.openlook/runs/<run-id>/recording.webm",
  "writeReport": true
})
```

The only evidence is the browser recording. Do not send screenshot arrays, DOM snapshots, or notes unless the product explicitly adds a separate evidence mode later.

## Response shape

```json
{
  "verdict": "pass | fail | needs_review",
  "confidence": 0.85,
  "short_reason": "One-sentence summary",
  "checks": [
    {
      "id": "check-id",
      "status": "[x]",
      "passed": true,
      "reasoning": "What Gemini saw in the browser recording",
      "fix": "Specific fix if failed"
    }
  ],
  "recommended_fix": "Overall fix if verdict is fail",
  "recordingPath": "/absolute/path/.openlook/runs/<run-id>/recording.webm",
  "reportDir": "reports/<spec-id>-<timestamp>"
}
```

## Rerun loop

```text
fail -> read reasoning -> fix UI -> prepare a new run -> record again -> review again
```

Never modify the spec to make it pass. The spec is the source of truth for user intent.
