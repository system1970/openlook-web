# OpenLook Report Format

OpenLook generates two report files per run:

1. `report.json` - Machine-readable structured data
2. `report.md` - Human-readable markdown summary

## report.json structure

```json
{
  "specVersion": "0.1",
  "specName": "Login Flow",
  "timestamp": "2026-05-16T02:30:00.000Z",
  "verdict": "PASS" | "FAIL" | "PARTIAL",
  "checks": [
    {
      "id": "login-button-visible",
      "description": "Login button is visible and clickable",
      "status": "PASS" | "FAIL" | "SKIP",
      "evidence": ["screenshot-001.png", "video-session.mp4"],
      "reasoning": "Gemini analysis explanation",
      "timestamp": "2026-05-16T02:30:15.000Z"
    }
  ],
  "evidence": [
    {
      "id": "video-session.mp4",
      "type": "video" | "screenshot" | "dom" | "log" | "observation",
      "path": "bob_sessions/2026-05-16T02-30-00/video-session.mp4",
      "timestamp": "2026-05-16T02:30:00.000Z",
      "metadata": {
        "duration_ms": 15000,
        "resolution": "1920x1080",
        "fps": 30
      }
    }
  ],
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "skipped": 0
  },
  "geminiModel": "gemini-2.0-flash-exp",
  "sessionDir": "bob_sessions/2026-05-16T02-30-00"
}
```

## report.md structure

```markdown
# OpenLook Report: Login Flow

**Verdict:** PASS | FAIL | PARTIAL
**Timestamp:** 2026-05-16T02:30:00.000Z
**Session:** bob_sessions/2026-05-16T02-30-00

## Summary

- Total checks: 5
- Passed: 4
- Failed: 1
- Skipped: 0

## Checks

### ✅ login-button-visible
**Status:** PASS
**Description:** Login button is visible and clickable
**Evidence:** screenshot-001.png, video-session.mp4
**Reasoning:** Gemini analysis explanation

### ❌ error-message-shown
**Status:** FAIL
**Description:** Error message appears on invalid credentials
**Evidence:** screenshot-002.png, video-session.mp4
**Reasoning:** Gemini analysis explanation

## Evidence

- video-session.mp4 (video, 15s, 1920x1080@30fps)
- screenshot-001.png (screenshot)
- screenshot-002.png (screenshot)
- dom-snapshot.html (dom)
- console.log (log)

## Next Steps

[Gemini-generated recommendations for failed checks]
```

## Evidence types

| Type         | Description                          | Example filename       |
| ------------ | ------------------------------------ | ---------------------- |
| video        | Browser session recording            | video-session.mp4      |
| screenshot   | Single frame capture                 | screenshot-001.png     |
| dom          | HTML snapshot                        | dom-snapshot.html      |
| log          | Console/network logs                 | console.log            |
| observation  | Textual notes from Bob or user       | observation-001.txt    |

## Video-first priority

Primary evidence should always be video or video frames when available.

Screenshots are supplementary evidence only.

## Report location

Reports are written to the session directory:

```
bob_sessions/
  2026-05-16T02-30-00/
    report.json
    report.md
    video-session.mp4
    screenshot-001.png
    dom-snapshot.html
    console.log
```

## Verdict logic

- **PASS**: All checks passed
- **FAIL**: One or more checks failed
- **PARTIAL**: Some checks passed, some skipped, none failed

## Gemini analysis

Each check includes:

- `status`: PASS/FAIL/SKIP
- `reasoning`: Gemini's explanation based on video/evidence
- `evidence`: List of evidence IDs that support the verdict

Gemini Live analyzes the video stream and supporting evidence to determine check status.

## Mock fallback

When `GEMINI_API_KEY` is missing, OpenLook uses mock evaluation:

- All checks marked as PASS
- Reasoning: "Mock evaluation (no Gemini API key)"
- Verdict: PASS

This allows testing the workflow without Gemini API access.