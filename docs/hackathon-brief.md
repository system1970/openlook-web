# IBM Bob Hackathon Brief

Source pages checked on 2026-05-16:

- https://lablab.ai/ai-hackathons/ibm-bob-hackathon
- https://bob.ibm.com/
- https://bob.ibm.com/docs/ide/getting-started/tutorials/introduction
- https://newsroom.ibm.com/2026-04-28-introducing-ibm-bob-ai-development-partner-that-takes-enterprises-from-AI-Assisted-Coding-to-Production-Ready-Software

## Event

The IBM Bob Hackathon by lablab.ai is a fully online 48-hour hackathon running from May 15 to May 17, 2026. The build happens through the lablab.ai platform and Discord.

The theme is: "Turn idea into impact faster."

The challenge is to build a proof-of-concept solution using IBM Bob as an AI-powered development partner. The solution should improve how developers work, especially by speeding up everyday workflows such as understanding existing code, generating documentation and tests, reducing repetitive work, or helping teams ship high-quality software with more confidence.

## Required Bob Angle

The submission must clearly demonstrate meaningful IBM Bob usage. Projects that do not show meaningful Bob use may be disqualified.

Bob should not be treated as a side note. It needs to be part of the product story and the build story:

- Bob understands the repository and helps reason over complete codebase context.
- Bob assists across the software development lifecycle, not just code autocomplete.
- Bob can work through agentic workflows, custom modes, MCP servers, code review, testing, security, and repo-aware implementation.
- The public repository should include the exported IBM Bob report for relevant tasks or sessions.

For OpenLook, the strong Bob angle is:

Bob becomes the agent that can run visual UX test specs through MCP, drive the browser through Playwright MCP, collect visual evidence, call OpenLook MCP for analysis, and generate a judge-readable report. This shows Bob doing multi-step developer work with repo context and external tools.

## Judging Criteria

The public criteria are:

- Application of Technology: how complete and well thought-out the project is, with clear application of IBM Bob.
- Presentation: clarity and effectiveness of the project presentation.
- Business Value: practical impact and how well the solution addresses a high-priority issue.
- Originality: uniqueness and creativity of the solution and the approach to applying IBM Bob.

## Submission Requirements

The submission should include:

- Project title
- Short description
- Long description
- Technology and category tags
- Cover image
- Video presentation
- Slide presentation
- Public GitHub repository
- Exported IBM Bob report for relevant tasks and sessions
- Demo application platform
- Application URL

Private repositories can reduce reviewability and hurt scoring.

## Prize Pool

Total prize pool: $10,000.

- 1st place: $5,000
- 2nd place: $3,000
- 3rd place: $2,000

## OpenLook Positioning

OpenLook should be positioned as:

"Visual unit testing for user experience, built for AI-assisted development workflows."

The problem:

Developers can unit test logic, but UX regressions often stay subjective, manual, and hard to automate. Selector-based tests can prove that a button exists while missing whether the page is visually understandable, trustworthy, or usable for a target persona.

The solution:

OpenLook lets teams write declarative visual UX specs, then lets Bob run them using Playwright MCP and OpenLook MCP. The run produces evidence, verdicts, confidence, failed checks, and recommended fixes.

Why Bob matters:

Bob is the development partner that understands the repo, runs the workflow, interprets failures, updates code, and reruns the same visual spec. That maps directly to the hackathon goal of turning ideas into impact faster.

## Demo Narrative

A strong demo should show this loop:

1. A developer writes or asks Bob to create an OpenLook spec for a page.
2. Bob loads the spec through OpenLook MCP.
3. Bob uses Playwright MCP to open the app, interact with the page, and capture evidence.
4. OpenLook analyzes the evidence against the visual checks.
5. The first run finds a real UX issue.
6. Bob fixes the app with repo context.
7. Bob reruns the same spec.
8. The final report shows a pass or improved result.

This is stronger than a static demo because it proves a repeatable developer workflow.

## Build Priorities For The Hackathon

Highest priority:

- End-to-end Bob MCP workflow: OpenLook MCP plus Playwright MCP.
- One polished demo app/page with a deliberate visual UX issue and a fixed version.
- One convincing OpenLook spec that matches the demo.
- Report output that judges can read quickly.
- Exported Bob task/session report committed or linked in the public repo.
- Hosted demo URL.

Lower priority:

- Broad CI/CD support.
- Many check types.
- Complex dashboards.
- Large spec language.
- Multi-browser matrix.

The winning path is a narrow, complete, visually demonstrable workflow.
