import { useState } from 'react'

function App() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(id)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="code-block text-sm text-gray-300 font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedCommand === id ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-400 text-sm font-medium">
            Visual UX Unit Testing
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            OpenLook
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-semibold">
            Visual UX unit tests for coding agents
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Write a UX spec. Let Bob run the browser. Record the session. Let Gemini Live judge the experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#install" className="btn-primary">
              Install Bob Skill
            </a>
            <a href="#mcp" className="btn-secondary">
              Configure MCP
            </a>
          </div>
        </div>
      </header>

      {/* Install Bob Skill Section */}
      <section id="install" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Install Bob Skill</h2>
          
          <div className="space-y-6">
            <div className="section-card">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">List available skills</h3>
              <CodeBlock 
                code="npx skills add system1970/openlook-web -a bob --list"
                id="list-skills"
              />
            </div>

            <div className="section-card">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Install OpenLook into current Bob project</h3>
              <CodeBlock 
                code="npx skills add system1970/openlook-web -a bob --skill openlook -y"
                id="install-current"
              />
            </div>

            <div className="section-card">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Install OpenLook globally</h3>
              <CodeBlock 
                code="npx skills add system1970/openlook-web -a bob --skill openlook -g -y"
                id="install-global"
              />
            </div>

            <div className="section-card">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Direct path fallback</h3>
              <p className="text-gray-400 mb-3 text-sm">
                Useful if repository-wide discovery fails or if you want to install from the exact skill folder.
              </p>
              <CodeBlock 
                code="npx skills add https://github.com/system1970/openlook-web/tree/master/.bob/skills/openlook -a bob -y"
                id="install-direct"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MCP Installation Section */}
      <section id="mcp" className="container mx-auto px-4 py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">MCP Installation</h2>
          
          <div className="section-card mb-6">
            <p className="text-gray-300 mb-4">
              OpenLook works best with two MCP servers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 mb-6">
              <li><span className="text-blue-400 font-semibold">OpenLook MCP</span> - Spec validation, Gemini Live analysis, and reporting</li>
              <li><span className="text-purple-400 font-semibold">Playwright MCP</span> - Browser navigation and video capture</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-400">Example .bob/mcp.json</h3>
            <CodeBlock 
              code={`{
  "mcpServers": {
    "openlook": {
      "command": "node",
      "args": ["C:/absolute/path/to/openlook-web/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key"
      },
      "disabled": false
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--browser=chromium",
        "--headless=false"
      ],
      "disabled": false
    }
  }
}`}
              id="mcp-config"
            />

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Notes</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                <li>Use absolute paths on Windows</li>
                <li>Do not commit real API keys</li>
                <li>Keep <code className="bg-gray-800 px-1 rounded">.env</code> out of git</li>
                <li>Use Playwright MCP for browser navigation</li>
                <li>Use OpenLook MCP for spec validation and Gemini Live analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Visual Workflow</h2>
          
          <div className="section-card">
            <div className="space-y-4">
              {[
                { step: 1, text: 'User asks Bob to run an OpenLook spec', color: 'blue' },
                { step: 2, text: 'Bob activates OpenLook Skill', color: 'purple' },
                { step: 3, text: 'OpenLook MCP validates spec', color: 'blue' },
                { step: 4, text: 'Playwright MCP runs browser', color: 'purple' },
                { step: 5, text: 'Browser video/frames are captured', color: 'blue' },
                { step: 6, text: 'OpenLook MCP evaluates with Gemini Live', color: 'purple' },
                { step: 7, text: 'report.json + report.md are generated', color: 'blue' },
                { step: 8, text: 'Bob summarizes failures and fixes', color: 'purple' },
              ].map(({ step, text, color }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${color}-600/20 border border-${color}-600/30 flex items-center justify-center text-${color}-400 font-bold text-sm`}>
                    {step}
                  </div>
                  <p className="text-gray-300 pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OpenLook YAML Spec Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">OpenLook YAML Spec</h2>
          
          <div className="section-card">
            <p className="text-gray-300 mb-4">
              OpenLook specs use a declarative YAML format (v0.1):
            </p>
            <CodeBlock 
              code={`version: "0.1"

test:
  id: "homepage-first-impression"
  name: "Homepage first impression"
  description: "Check whether a first-time user understands the product and primary action."

target:
  url: "http://localhost:3000"
  viewport:
    width: 1280
    height: 720
  device: "desktop"

persona:
  name: "First-time visitor"
  role: "Potential user"
  context: "The user is landing on the product for the first time."
  knowledge_level: "novice"
  patience: "medium"

goal:
  statement: "Understand what the product does and find the primary action."
  success_signal: "The user can clearly identify and click the main CTA."
  max_time_seconds: 90

run:
  mode: "bob_playwright_mcp"
  max_steps: 25
  allowed_actions:
    - "navigate"
    - "click"
    - "scroll"
    - "wait"
    - "observe"

checks:
  - id: "primary-action-visible"
    type: "visual"
    instruction: "Verify that the main CTA is visible and understandable."
    pass_if: "The CTA is visible and clearly communicates the next action."
    fail_if: "The CTA is hidden, ambiguous, or visually weak."
    severity: "critical"

failure_conditions:
  - "The page fails to load."
  - "The user cannot identify the next action."

evidence:
  required:
    - "video_or_frames"
  optional:
    - "screenshots"
    - "dom_snapshots"
    - "console_logs"
    - "network_logs"
  capture_policy: "video_first"

verdict:
  pass_policy: "all_critical_checks_pass"
  allow_needs_review: true

metadata:
  tags:
    - "ux"
    - "visual"
    - "openlook"`}
              id="yaml-spec"
            />
          </div>
        </div>
      </section>

      {/* Report Output Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Report Output</h2>
          
          <div className="section-card mb-6">
            <p className="text-gray-300 mb-4">
              OpenLook writes structured reports to:
            </p>
            <CodeBlock 
              code={`reports/<test-id>/<run-id>/report.json
reports/<test-id>/<run-id>/report.md`}
              id="report-paths"
            />
          </div>

          <div className="section-card">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Sample Verdict Card</h3>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-red-400 font-bold text-lg mb-1">FAIL</div>
                  <div className="text-gray-400 text-sm">Confidence: 0.82</div>
                </div>
                <div className="bg-red-600/20 px-3 py-1 rounded text-red-400 text-sm font-semibold">
                  Critical
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Failed Check</div>
                  <div className="text-white font-medium">primary-action-visible</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Evidence</div>
                  <div className="text-gray-300">00:14, CTA below fold</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Recommended Fix</div>
                  <div className="text-gray-300">Move primary CTA above the fold and strengthen label copy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Troubleshooting</h2>
          
          <div className="space-y-4">
            {[
              {
                issue: 'openlook does not appear in skill list',
                solution: 'Try the direct GitHub URL installation method with the master branch path'
              },
              {
                issue: 'Direct GitHub URL uses master, not main',
                solution: 'The repository uses master as the default branch. Use the exact URL provided above'
              },
              {
                issue: 'Bob cannot find .bob/skills/openlook',
                solution: 'Verify the skill was installed correctly and check the installation path'
              },
              {
                issue: 'MCP server path is wrong',
                solution: 'Use absolute paths in .bob/mcp.json, especially on Windows'
              },
              {
                issue: 'GEMINI_API_KEY missing',
                solution: 'Add your Gemini API key to the env section of the OpenLook MCP config'
              },
              {
                issue: 'Playwright MCP not installed',
                solution: 'The npx command will auto-install. Ensure you have internet connectivity'
              },
              {
                issue: 'Video/frame capture unavailable',
                solution: 'Check Playwright MCP is configured with --headless=false for video recording'
              },
              {
                issue: 'Reports/videos accidentally staged in git',
                solution: 'Add reports/ and video files to .gitignore before committing'
              },
              {
                issue: 'Vercel CLI not logged in',
                solution: 'Run vercel login before deploying, or deploy via Vercel dashboard'
              },
            ].map(({ issue, solution }, index) => (
              <div key={index} className="section-card">
                <h3 className="text-lg font-semibold mb-2 text-red-400">❌ {issue}</h3>
                <p className="text-gray-300">✓ {solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Security</h2>
          
          <div className="section-card">
            <div className="space-y-4">
              {[
                'Do not commit videos - they may contain sensitive application data',
                'Do not commit .env files - keep API keys secure',
                'Do not expose GEMINI_API_KEY in public repositories',
                'Browser video/frames may contain private data - treat as confidential',
                'Keep artifacts under reports/<test-id>/<run-id>/ for easy .gitignore',
                'Treat Gemini Live evaluation as an explicit analysis step with data upload',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-yellow-400 text-xl">🔒</div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            OpenLook - Visual UX unit tests for coding agents
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <a href="https://github.com/system1970/openlook-web" className="hover:text-blue-400 transition-colors">
              GitHub
            </a>
            <span>•</span>
            <a href="https://github.com/system1970/openlook-web/blob/master/LICENSE" className="hover:text-blue-400 transition-colors">
              MIT License
            </a>
            <span>•</span>
            <span>Built for IBM Bob Hackathon</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

// Made with Bob
