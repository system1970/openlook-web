# OpenLook Security Notes

## API Key Management

### Gemini API Key

OpenLook requires a Gemini API key for video analysis.

**NEVER commit API keys to version control.**

### Setup

1. Copy `.env.example` to `.env`
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Verify `.env` is in `.gitignore`

### Bob Configuration

When configuring OpenLook MCP in Bob's settings:

```json
{
  "mcpServers": {
    "openlook": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/openlook-web/src/index.ts"],
      "env": {
        "GEMINI_API_KEY": "your_actual_key_here"
      }
    }
  }
}
```

**Security risk:** API keys in Bob's settings file are stored in plaintext.

**Mitigation options:**

1. Use environment variables from your shell profile
2. Use a secrets manager (e.g., 1Password CLI, AWS Secrets Manager)
3. Restrict file permissions on Bob's settings file
4. Use a dedicated API key with usage limits for testing

### Mock Fallback

OpenLook includes a mock evaluation mode when `GEMINI_API_KEY` is missing.

This allows:
- Testing the workflow without API access
- Demonstrating the tool without exposing keys
- Development without incurring API costs

Mock mode always returns PASS verdicts with placeholder reasoning.

## Evidence Storage

### Session Directories

OpenLook stores evidence in `bob_sessions/`:

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

### Privacy Considerations

Evidence may contain:

- User interface screenshots
- Video recordings of browser sessions
- DOM snapshots with HTML content
- Console logs with debug information
- Network logs with API requests/responses

**Do not commit evidence to public repositories.**

### .gitignore Rules

Ensure `.gitignore` includes:

```gitignore
# OpenLook evidence
bob_sessions/
*.mp4
*.webm
*.mov

# Environment variables
.env
.env.local

# Reports (optional - commit if needed for demos)
reports/*.json
reports/*.md
```

## Hackathon Submissions

When submitting to hackathons:

1. Remove all API keys from code and config
2. Use `.env.example` with placeholder values
3. Exclude `bob_sessions/` from submission
4. Include mock evaluation mode instructions
5. Document how judges can test without API keys

## Public Repositories

Before pushing to GitHub:

1. Run `git status` and verify no `.env` files are staged
2. Check `bob_sessions/` is not tracked
3. Verify no API keys in commit history
4. Review Bob configuration examples for placeholder keys
5. Test mock mode works without real API key

## Gemini API Usage Limits

Gemini API has rate limits and quotas.

**Best practices:**

- Use mock mode for development
- Enable real Gemini only for final testing
- Monitor API usage in Google Cloud Console
- Set up billing alerts
- Use a dedicated project for hackathon testing

## Video Evidence Privacy

Browser session videos may capture:

- Personal information
- Login credentials (if typed)
- Private data from web applications
- Sensitive UI elements

**Recommendations:**

- Use test accounts with fake data
- Avoid recording production environments
- Redact sensitive information before sharing
- Delete evidence after testing
- Do not share videos publicly without review

## Network Security

OpenLook does not transmit evidence to external services except:

- Gemini API (for video analysis)
- Playwright browser automation (local only)

**Network isolation:**

- Gemini API calls use HTTPS
- No telemetry or analytics
- No third-party tracking
- All evidence stored locally

## Dependency Security

OpenLook uses:

- `@google/generative-ai` - Official Google SDK
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `zod` - Schema validation
- `yaml` - YAML parsing

**Security practices:**

- Pin dependency versions in `package.json`
- Run `bun audit` regularly
- Review dependency updates before upgrading
- Use `bun install --frozen-lockfile` in CI/CD

## Reporting Security Issues

If you discover a security vulnerability:

1. Do not open a public GitHub issue
2. Email the maintainer directly
3. Include steps to reproduce
4. Allow time for a fix before public disclosure

## License and Liability

OpenLook is provided "as is" without warranty.

Users are responsible for:

- Securing their API keys
- Managing evidence privacy
- Complying with terms of service
- Protecting sensitive data

See LICENSE file for full terms.