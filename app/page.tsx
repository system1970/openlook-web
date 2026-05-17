'use client';

import { useState } from 'react';
type InstallMode = 'agent' | 'manual';

import MotionGraphic from './components/MotionGraphic';

function Code({ children, id }: { children: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-[#111] rounded-lg p-5 overflow-x-auto text-[13px] leading-relaxed text-[#999] font-mono border border-[#1a1a1a]">
        <code>{children}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 text-[11px] text-[#555] hover:text-[#aaa] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

const SETUP_PROMPT = `Set up OpenLook visual testing in this project. Do the following:

1. Install the OpenLook skill:
   Run: bunx skills add system1970/openlook-web
   This places the skill in .agents/skills/openlook/ with the full workflow instructions.

2. Add MCP server configuration:
   Add both servers to my MCP config (mcp.json or equivalent):

   {
     "mcpServers": {
       "openlook": {
         "command": "bunx",
         "args": ["-y", "openlook"],
         "env": { "GEMINI_API_KEY": "<my_key>" }
       },
       "playwright": {
         "command": "bunx",
         "args": ["-y", "@playwright/mcp@latest", "--caps=devtools"]
       }
     }
   }

3. Add visual testing rules to AGENTS.md:
   Create or append to the AGENTS.md file in the project root with these rules:

   ## Visual Testing with OpenLook

   This project uses OpenLook for visual unit testing. Visual specs live in .openlook/.

   ### Rules

   - After any UI change, run all visual specs in .openlook/ before marking the task as done.
   - Use the openlook skill workflow: prepare run > record with Playwright > review with OpenLook.
   - If a visual check fails, read the recommended fix from the report and apply it. Re-run the spec until it passes.
   - Never skip visual verification. A component that renders correctly in the DOM can still be visually broken.
   - Do not commit recordings or reports to git. Only commit .openlook/*.yaml spec files.

   ### Commands

   After any UI work, run this sequence:
   1. Build: bun run build (or the project's build command)
   2. Typecheck: bun run typecheck (or tsc --noEmit)
   3. Visual tests: Read and run all .openlook/*.yaml specs using the openlook skill

4. Create the .openlook/ directory if it doesn't exist:
   mkdir .openlook

After setup, confirm what was installed and tell me to write my first visual spec.`;

export default function Home() {
  const [installMode, setInstallMode] = useState<InstallMode>('agent');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  return (
    <div className="min-h-screen bg-black text-[#e5e5e5] antialiased">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight">OpenLook</span>
          <div className="hidden sm:flex items-center gap-8 text-[13px] text-[#888]">
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#spec" className="hover:text-white transition-colors">Spec</a>
            <a href="#install" className="hover:text-white transition-colors">Install</a>
            <a href="https://github.com/system1970/openlook-web" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        <div className="h-px bg-[#111]" />
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] pt-24 pb-12 flex items-center justify-center overflow-hidden">
        <div className="relative z-[2] max-w-[960px] mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-16">
          {/* Left Column: Premium Copy */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-[500px]">
            <h1 className="text-[42px] sm:text-[62px] font-semibold tracking-tight leading-[1.08] text-white">
              Visual unit tests for software agents.
            </h1>
            <p className="mt-6 text-[16px] sm:text-[18px] text-[#999] leading-relaxed font-light">
              Write a spec. Record the browser. Gemini judges the visual experience. Your agent gets a verdict and knows exactly what to fix.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start w-full">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SETUP_PROMPT);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }}
                className="bg-white text-black text-[13px] font-medium px-5 py-2.5 rounded-md hover:bg-[#ddd] transition-colors shadow-lg flex items-center justify-center gap-2 min-w-[200px]"
              >
                {copiedPrompt ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied Setup Prompt!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Setup Prompt
                  </>
                )}
              </button>
              <a href="#install" className="text-[13px] font-medium px-5 py-2.5 rounded-md border border-[#222] text-[#bbb] hover:text-white hover:border-[#444] transition-colors flex items-center justify-center gap-2">
                Manual Setup
              </a>
            </div>
          </div>

          {/* Right Column: Sleek Motion Graphic Simulation */}
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <MotionGraphic />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[960px] mx-auto px-6"><div className="h-px bg-[#111]" /></div>

      {/* Pipeline */}
      <section className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 sm:gap-8">
            {[
              ['Spec', 'Steps + checks in YAML'],
              ['Record', 'Playwright captures video'],
              ['Analyze', 'Gemini watches the session'],
              ['Verdict', 'Pass/fail per check with fixes'],
            ].map(([title, desc], i) => (
              <div key={i}>
                <div className="text-[13px] text-[#555] font-mono mb-2">0{i + 1}</div>
                <div className="text-[15px] font-medium text-white">{title}</div>
                <div className="text-[13px] text-[#666] mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[960px] mx-auto px-6"><div className="h-px bg-[#111]" /></div>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="max-w-[520px]">
            <h2 className="text-[28px] font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
              Three systems, three jobs. Your agent orchestrates. Playwright records. OpenLook judges.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-16">
            <div className="space-y-10">
              {[
                {
                  n: '1',
                  title: 'Write the spec',
                  desc: 'Define steps and checks in a YAML file. Steps tell the agent what to do in the browser. Checks tell Gemini what to evaluate from the recording.',
                },
                {
                  n: '2',
                  title: 'Record the session',
                  desc: 'The agent calls openlook_prepare_run, then drives the browser through Playwright MCP while recording every interaction as video.',
                },
                {
                  n: '3',
                  title: 'Get the verdict',
                  desc: 'The agent calls openlook_review. Gemini watches the recording, evaluates each check, and returns pass/fail with reasoning and fixes.',
                },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-5">
                  <div className="text-[13px] text-[#444] font-mono mt-1 flex-shrink-0">{n}.</div>
                  <div>
                    <div className="text-[15px] font-medium text-white">{title}</div>
                    <div className="text-[14px] text-[#777] mt-2 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict preview */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-[13px] font-mono text-[#f87171]">FAIL</span>
                <span className="text-[12px] text-[#444]">1 of 2 checks passed</span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-[13px] mt-0.5 text-[#4ade80] flex-shrink-0">pass</span>
                  <div>
                    <div className="text-[13px] font-mono text-[#ccc]">value-prop-clear</div>
                    <div className="text-[12px] text-[#666] mt-1">Hero explains the product and who it is for.</div>
                  </div>
                </div>

                <div className="h-px bg-[#1a1a1a]" />

                <div className="flex gap-3">
                  <span className="text-[13px] mt-0.5 text-[#f87171] flex-shrink-0">fail</span>
                  <div>
                    <div className="text-[13px] font-mono text-[#ccc]">cta-visible</div>
                    <div className="text-[12px] text-[#666] mt-1">Two buttons compete for attention. No dominant CTA.</div>
                  </div>
                </div>

                <div className="h-px bg-[#1a1a1a]" />

                <div>
                  <div className="text-[11px] text-[#555] uppercase tracking-wider mb-2">Fix</div>
                  <div className="text-[13px] text-[#a78bfa] leading-relaxed">
                    Increase contrast on primary CTA. Remove or demote the secondary action.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[960px] mx-auto px-6"><div className="h-px bg-[#111]" /></div>

      {/* Spec format */}
      <section id="spec" className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="max-w-[520px]">
            <h2 className="text-[28px] font-semibold tracking-tight">Spec format</h2>
            <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
              Where to go. What to do. What to check. Specs live in <code className="text-[13px] font-mono text-[#999] bg-[#1a1a1a] px-1.5 py-0.5 rounded">.openlook/</code> in your project root.
            </p>
          </div>

          <div className="mt-12">
            <Code id="spec-yaml">{`id: homepage-first-impression
url: http://localhost:3000

steps:
  - Open the homepage
  - Observe the first viewport without scrolling
  - Scroll once to see supporting content

checks:
  - id: value-prop-clear
    question: Can the user understand the product value?
    pass: The hero explains the product, who it is for, and why it matters.
    fail: The hero is vague, generic, or does not explain the product.

  - id: primary-action-visible
    question: Is the primary next action visually obvious?
    pass: One visually dominant CTA is easy to find near the hero.
    fail: No clear CTA, or multiple competing actions with equal weight.`}</Code>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['id', 'Unique test name'],
              ['url', 'Page to test'],
              ['steps', 'Browser actions to perform'],
              ['checks', 'Visual assertions for Gemini'],
            ].map(([field, desc]) => (
              <div key={field}>
                <div className="text-[13px] font-mono text-white">{field}</div>
                <div className="text-[12px] text-[#666] mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[960px] mx-auto px-6"><div className="h-px bg-[#111]" /></div>

      {/* Install */}
      <section id="install" className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="max-w-[520px] mb-12">
            <h2 className="text-[28px] font-semibold tracking-tight">Install</h2>
            <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
              Choose your path: Bootstrap in one-click using a coding agent, or configure the steps manually.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Agent Setup Card */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] rounded-xl p-8 flex flex-col justify-between min-h-[500px] hover:border-[#2a2a30] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[64px] pointer-events-none" />
              <div>
                <div className="text-[12px] font-mono text-[#a78bfa] tracking-wider uppercase mb-2">Option A — Recommended</div>
                <h3 className="text-[20px] font-medium text-white">Agent Bootstrap</h3>
                <p className="mt-3 text-[14px] text-[#777] leading-relaxed">
                  Paste a single, comprehensive setup prompt into your agent. It will install the openlook skill, register both MCP servers, and write agent visual testing rules to your project root.
                </p>

                <div className="mt-8 space-y-6">
                  {[
                    ['Install OpenLook skill', 'Integrates browser visual testing workflows directly into your agent.'],
                    ['Configure MCP servers', 'Adds Playwright and OpenLook review tools to the agent environment.'],
                    ['Write AGENTS.md rules', 'Establishes visual unit testing as a standard for all future agent sessions.'],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3">
                      <svg width="16" height="16" className="text-purple-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-[13px] font-medium text-white">{title}</div>
                        <div className="text-[12px] text-[#666] mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SETUP_PROMPT);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="w-full bg-white text-black text-[13px] font-medium py-3 rounded-lg hover:bg-[#ddd] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {copiedPrompt ? (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied Agent Prompt!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Agent Setup Prompt
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Manual Setup Card */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] rounded-xl p-8 flex flex-col justify-between min-h-[500px] hover:border-[#2a2a30] transition-colors relative overflow-hidden group">
              <div>
                <div className="text-[12px] font-mono text-[#555] tracking-wider uppercase mb-2">Option B — Traditional</div>
                <h3 className="text-[20px] font-medium text-white">Manual Setup</h3>
                <p className="mt-3 text-[14px] text-[#777] leading-relaxed">
                  Run the installation commands, define the required MCP servers in your environment, and write your first visual spec.
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <div className="text-[11px] text-[#555] uppercase tracking-wider mb-2 font-mono">1. Add OpenLook skill</div>
                    <Code id="install-skill-man">{`bunx skills add system1970/openlook-web`}</Code>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#555] uppercase tracking-wider mb-2 font-mono">2. Configure MCP servers</div>
                    <Code id="install-mcp-man">{`{
  "mcpServers": {
    "openlook": {
      "command": "bunx",
      "args": ["-y", "openlook"],
      "env": { "GEMINI_API_KEY": "your_key" }
    },
    "playwright": {
      "command": "bunx",
      "args": ["-y", "@playwright/mcp@latest", "--caps=devtools"]
    }
  }
}`}</Code>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-[12px] text-[#555] border-t border-[#1a1a1e] pt-4">
                <span>Visual specs live in <code className="font-mono text-[#777]">.openlook/</code></span>
                <a href="#spec" className="text-[#888] hover:text-white transition-colors underline">View format</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[960px] mx-auto px-6"><div className="h-px bg-[#111]" /></div>

      {/* What it catches */}
      <section className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="max-w-[520px]">
            <h2 className="text-[28px] font-semibold tracking-tight">What OpenLook catches</h2>
            <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
              Problems that pass every unit test but fail every user.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-16 gap-y-6">
            {[
              'The CTA renders but is visually invisible',
              'The page loads but overwhelms the user',
              'The form works but nobody knows what to do next',
              'The layout is correct but feels broken',
              'The onboarding flow completes but confuses at every step',
              'The hero exists but communicates nothing',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[12px] text-[#444] mt-1 flex-shrink-0">—</span>
                <span className="text-[14px] text-[#888]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111] py-10 px-6">
        <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[13px] text-[#555]">OpenLook</span>
          <div className="flex items-center gap-6 text-[12px] text-[#444]">
            <a href="https://github.com/system1970/openlook-web" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/openlook-mcp" className="hover:text-white transition-colors">npm</a>
            <span>Built with IBM Bob</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
