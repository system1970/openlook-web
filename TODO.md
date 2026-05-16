# Open Architecture Questions

This document tracks unresolved architectural decisions for the Orkestrate Web MCP server.

## 1. Browser Session Management

**Question**: Should we use a single persistent browser instance or create new browsers per tool call?

**Options**:
- **A. Single Persistent Browser**: Launch once, reuse across test sessions
  - ✅ Faster (no launch overhead)
  - ✅ Lower resource usage
  - ❌ State pollution between tests
  - ❌ Harder to isolate failures
  
- **B. New Browser Per Session**: Launch for each `web_start_test`
  - ✅ Clean state per test
  - ✅ Better isolation
  - ❌ Slower startup
  - ❌ Higher resource usage
  
- **C. Browser Pool**: Pre-launch N browsers, assign to sessions
  - ✅ Balance of speed and isolation
  - ❌ More complex implementation

**Decision Needed**: Choose based on typical usage patterns and resource constraints.

## 2. Screenshot Strategy

**Question**: When and how should we capture screenshots?

**Options**:
- **A. Automatic on Every Observation**: `web_observe` always captures
  - ✅ Complete visual history
  - ❌ Large storage requirements
  - ❌ Slower execution
  
- **B. On-Demand Only**: Capture only when explicitly requested
  - ✅ Minimal overhead
  - ❌ May miss important states
  
- **C. Smart Capture**: Capture on page changes, errors, evaluations
  - ✅ Balance of coverage and efficiency
  - ❌ Requires change detection logic

**Screenshot Type**:
- Full page vs. viewport only?
- Compression level?
- Storage format (PNG, JPEG, WebP)?

**Decision Needed**: Define capture policy and storage strategy.

## 3. Gemini Integration Point

**Question**: How should AI vision analysis integrate with the workflow?

**Options**:
- **A. Analyze Every Screenshot**: Automatic analysis on `web_observe`
  - ✅ Rich context for every state
  - ❌ High API costs
  - ❌ Slower execution
  
- **B. On-Demand via `web_evaluate`**: Only when explicitly called
  - ✅ Cost-effective
  - ✅ User controls when to use AI
  - ❌ May miss insights
  
- **C. Streaming Analysis**: Continuous vision stream (Gemini Live)
  - ✅ Real-time feedback
  - ❌ Complex implementation
  - ❌ Higher costs

**Analysis Scope**:
- Full page description vs. targeted questions?
- Include DOM analysis or vision-only?
- Cache results to avoid re-analysis?

**Decision Needed**: Balance cost, latency, and insight quality.

## 4. Tool Granularity

**Question**: Should we have many specific tools or few flexible tools?

**Current Design**: 5 workflow tools (start, observe, act, evaluate, finish)

**Alternative A - More Granular**:
- `web_navigate`, `web_click`, `web_type`, `web_scroll`, `web_wait`
- `web_screenshot`, `web_get_title`, `web_get_url`
- `web_analyze_ui`, `web_check_element`, `web_compare_state`
- ✅ Clear, single-purpose tools
- ❌ More tools to manage
- ❌ More complex workflows

**Alternative B - More Flexible**:
- `web_test` - Single tool with action parameter
- ✅ Simpler tool list
- ❌ Complex parameter schemas
- ❌ Less discoverable

**Decision Needed**: Find the right balance for Bob's usage patterns.

## 5. State Management

**Question**: How should we track and persist test state across tool calls?

**Current Design**: In-memory `SessionManager` with Map storage

**Considerations**:
- **Persistence**: Should sessions survive server restarts?
- **Concurrency**: Can multiple sessions run in parallel?
- **Cleanup**: When to garbage collect old sessions?
- **Sharing**: Can sessions be accessed across MCP connections?

**Options**:
- **A. In-Memory Only**: Current approach
  - ✅ Simple, fast
  - ❌ Lost on restart
  
- **B. File-Based**: Serialize to JSON files
  - ✅ Survives restarts
  - ❌ Slower, file I/O overhead
  
- **C. Database**: SQLite or similar
  - ✅ Queryable, persistent
  - ❌ Adds dependency

**Decision Needed**: Choose based on reliability requirements.

## 6. Error Recovery

**Question**: How should we handle browser crashes, network failures, and API errors?

**Scenarios**:
- Browser crashes mid-test
- Network timeout during navigation
- Gemini API rate limit or error
- Invalid selector in `web_act`
- Page load timeout

**Recovery Strategies**:
- **Retry Logic**: Automatic retries with backoff?
- **Fallback Behavior**: Continue test or fail fast?
- **Error Reporting**: How detailed should error messages be?
- **Session Recovery**: Can we resume a failed session?

**Decision Needed**: Define error handling policy for each scenario.

## 7. Performance Optimization

**Question**: What performance optimizations should we implement?

**Considerations**:
- **Headless vs. Headed**: Always headless or configurable?
- **Browser Pooling**: Pre-launch browsers for faster tests?
- **Screenshot Caching**: Avoid re-capturing unchanged pages?
- **Parallel Execution**: Run multiple tests concurrently?
- **Resource Limits**: Memory, CPU, storage constraints?

**Trade-offs**:
- Speed vs. resource usage
- Isolation vs. efficiency
- Cost vs. insight quality

**Decision Needed**: Define performance targets and optimization priorities.

## 8. Bob Session Report Format

**Question**: What format should Bob task session exports use?

**Requirements**:
- Human-readable for judges
- Include screenshots and reasoning
- Show MCP tool usage
- Demonstrate problem-solving

**Format Options**:
- **A. Markdown**: Simple, readable, version-controllable
- **B. HTML**: Rich formatting, embedded images
- **C. JSON + Assets**: Structured data + separate files
- **D. PDF**: Professional, self-contained

**Content Structure**:
- Task description and goals
- Step-by-step workflow
- Tool calls and responses
- Screenshots with annotations
- Final results and insights

**Decision Needed**: Choose format that best serves hackathon judging.

## 9. Orkestrate QA Report Format

**Question**: What format should generated test reports use?

**Requirements**:
- Machine-readable for automation
- Include all test data
- Support aggregation and trends
- Easy to export/share

**Format Options**:
- **A. JSON**: Structured, parseable
- **B. Markdown**: Human-readable
- **C. HTML**: Rich visualization
- **D. JUnit XML**: CI/CD compatible

**Decision Needed**: May support multiple formats for different use cases.

## 10. Vision Model Selection

**Question**: Which Gemini model should we use for vision analysis?

**Available Models** (from @google/genai):
- `gemini-2.0-flash-exp` - Fast, experimental
- `gemini-2.5-flash` - Latest stable flash
- `gemini-3-pro-image-preview` - High quality, slower

**Considerations**:
- **Speed**: Flash models are faster
- **Quality**: Pro models may be more accurate
- **Cost**: Flash models are cheaper
- **Availability**: Some models may be preview-only

**Decision Needed**: Choose default model and allow configuration.

## Priority for Next Steps

1. **High Priority**:
   - Browser session management (#1)
   - Screenshot strategy (#2)
   - Gemini integration point (#3)

2. **Medium Priority**:
   - Error recovery (#6)
   - State management (#5)

3. **Lower Priority**:
   - Tool granularity (#4) - current design is reasonable
   - Performance optimization (#7) - optimize after basic functionality works
   - Report formats (#8, #9) - can iterate based on usage

4. **Research Needed**:
   - Vision model selection (#10) - test different models for quality/speed

## Decision Log

When decisions are made, document them here:

| # | Question | Decision | Date | Rationale |
|---|----------|----------|------|-----------|
| - | - | - | - | - |
