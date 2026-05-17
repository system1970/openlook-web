---
name: openlook
description: Run OpenLook visual unit tests to verify UI quality from browser recordings. Use this skill whenever the user asks to visually test a page, check a UI, run a visual spec, create a visual test, review a UI change, or mentions OpenLook. Also use when the user says things like "does this look right", "check the homepage", "run the tests", "test the UI", or "visual review". Always use this skill when the user mentions visual unit tests, browser recording review, or evidence-based UX feedback.
---

# OpenLook

Visual unit testing for coding agents. Write a spec (steps + checks), record a browser session with Playwright, and Gemini evaluates the recording against your checks.

```
spec → openlook_prepare_run → Playwright records .webm → openlook_review → Gemini watches → pass/fail
```

Three systems, three jobs:
- **You** (the agent): read the spec, orchestrate the run, perform the steps, report results.
- **Playwright MCP**: drives the browser, records video. Does not evaluate.
- **OpenLook MCP**: allocates recording paths, sends video to Gemini, returns verdicts. Does not drive the browser.

## Spec format

Specs live in `.openlook/` in the project root. Each `.yaml` file is one visual unit test.

```yaml
id: homepage-first-impression
url: http://localhost:3000

steps:
  - Open the homepage
  - Observe the first viewport without scrolling
  - Scroll once to see supporting content

checks:
  - id: value-prop-clear
    question: Can the user understand the product value from the first viewport?
    pass: The hero explains the product, who it is for, and why it matters.
    fail: The hero is vague, generic, or does not explain the product.

  - id: primary-action-visible
    question: Is the primary next action visually obvious?
    pass: One visually dominant CTA is easy to find near the hero.
    fail: No clear CTA, or multiple competing actions with equal weight.
```

Fields:
- `id` — unique test name
- `url` — page to test
- `viewport` — optional `{ width, height }`, defaults to 1440×900
- `steps` — ordered browser actions you perform during recording
- `checks` — visual assertions Gemini evaluates from the recording. Each check has `id`, `question`, `pass` criteria, `fail` criteria

Checks must be visually verifiable — Gemini can only judge what it sees in the video.

## Writing a spec

When the user asks to create a visual test:

1. Ask for the URL, what to do (steps), and what to check (2–5 checks).
2. Write the YAML spec using the exact format above.
3. Save to `.openlook/<id>.yaml` in the project root. Create the `.openlook/` directory if it does not exist.

## Running a single spec

### 1. Read the spec

Read and parse the `.yaml` file. You need the full spec object for both `openlook_prepare_run` and `openlook_review`.

### 2. Prepare the run

```
openlook_prepare_run { "spec": { ...parsed spec... } }
```

Save the returned `recordingPath` and `startVideoArgs`.

### 3. Start recording

Call Playwright MCP **before** navigating anywhere:

```
browser_start_video <startVideoArgs>
```

### 4. Perform the steps

Use Playwright MCP to execute each step from the spec:
- Navigate to the spec URL.
- Perform each step exactly as written (observe, scroll, click, type).
- Add `browser_video_chapter` markers at key transitions ("Start", "After scroll", "Task complete").

### 5. Stop recording

```
browser_stop_video
```

If the response includes a saved file path, use that path for review. Otherwise use `recordingPath` from step 2.

### 6. Review

```
openlook_review { "spec": { ...same spec... }, "recordingPath": "<path>", "writeReport": true }
```

### 7. Report results

Present results to the user using this exact format:

```
## OpenLook: <spec id>

**Verdict: PASS** ✅  (or **FAIL** ❌ or **NEEDS REVIEW** ⚠️)

| # | Check | Status | Reasoning |
|---|-------|--------|-----------|
| 1 | value-prop-clear | ✅ | The hero headline clearly states... |
| 2 | primary-action-visible | ❌ | No dominant CTA found above the fold... |

### Recommended Fix
<fix from Gemini, if verdict is not pass>

📁 Report: <reportDir path>
```

Always use the table format with the reasoning column. Always show the recommended fix when the test did not pass.

## Running all specs

When the user says "run the tests", "run openlook", or "run visual tests":

1. Find all `.yaml` files in `.openlook/` in the project root.
2. Run each spec sequentially using the single-spec flow above.
3. After all specs complete, show a summary:

```
## OpenLook Results

| Spec | Verdict | Passed | Failed |
|------|---------|--------|--------|
| homepage-first-impression | ✅ PASS | 3/3 | 0 |
| onboarding-flow | ❌ FAIL | 1/3 | 2 |

Overall: 1 passed, 1 failed out of 2 specs.
```

## Playwright MCP

Playwright MCP must have video capabilities (`--caps=devtools`).

| Tool | Purpose |
|---|---|
| `browser_start_video` | Start recording. Pass `startVideoArgs` from OpenLook. |
| `browser_video_chapter` | Add chapter marker during recording. |
| `browser_stop_video` | Stop recording and save the video file. |

## Directory structure

```
<project-root>/
  .openlook/                  ← specs (committed to git)
    homepage.yaml
    onboarding.yaml
  reports/                    ← generated reports
    homepage-first-impression-.../
      report.json
      report.md
      recording.webm

~/.openlook/<project-name>/   ← run recordings (not committed)
  runs/
    homepage-first-impression-.../
      recording.webm
```

## Safety

- Never log or expose `GEMINI_API_KEY`.
- Do not commit `~/.openlook/`, `.webm` files, or `reports/` unless the user explicitly asks.
- Warn before sending recordings that may contain credentials or personal data.
