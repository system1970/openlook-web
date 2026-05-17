# OpenLook Report Format

OpenLook writes reports when `openlook_review` is called with `writeReport: true`.

Reports are written to `reports/<spec-id>-<timestamp>/` relative to where the OpenLook server runs. The report folder contains:

1. `report.json` - machine-readable structured data
2. `report.md` - human-readable markdown summary
3. `recording.webm` - copy of the browser recording when available

## report.json structure

```json
{
  "spec_id": "homepage-first-impression",
  "spec_description": "Verify a first-time visitor understands the product.",
  "timestamp": "2026-05-16T18:00:00.000Z",
  "duration_ms": 4200,
  "verdict": "pass | fail | needs_review | error",
  "summary": "2 of 3 visual checks passed.",
  "checks_total": 3,
  "checks_passed": 2,
  "checks_failed": 1,
  "results": [
    {
      "check": {
        "id": "value-prop-clear",
        "question": "Can the user understand the product value?",
        "pass": "Hero explains value clearly.",
        "fail": "Hero is vague or generic."
      },
      "passed": true,
      "confidence": 0.92,
      "reasoning": "The hero headline directly states the product purpose.",
      "evidence_refs": ["0:02"],
      "fix": null,
      "recommendations": []
    }
  ],
  "evidence": [
    {
      "type": "video",
      "path": "/absolute/path/.openlook/runs/<run-id>/recording.webm",
      "timestamp": "2026-05-16T18:00:00.000Z"
    }
  ],
  "recommendations": ["Overall fix if verdict is fail"]
}
```

## Verdict values

| Value | Meaning |
|---|---|
| `pass` | All checks passed |
| `fail` | One or more checks failed |
| `needs_review` | Gemini was uncertain or the recording was insufficient |
| `error` | Analysis failed |

## Gemini model

OpenLook uses `gemini-3-flash-preview` by default via `generateContent`. Video is sent as inline bytes for small files or via the Gemini File API for larger files. If video upload fails, OpenLook can fall back to extracted frames when ffmpeg is available.

## MCP tools

- `openlook_prepare_run` creates `.openlook/runs/<run-id>/` and returns the recording path for Playwright MCP.
- `openlook_review` verifies `recordingPath`, sends the browser recording to Gemini, returns results inline, and writes files when requested.
