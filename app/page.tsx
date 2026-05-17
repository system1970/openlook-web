'use client';

import { useState } from 'react';

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

export default function Home() {
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
            <div className="mt-8 flex gap-4 justify-center md:justify-start">
              <a href="#install" className="bg-white text-black text-[13px] font-medium px-5 py-2.5 rounded-md hover:bg-[#ddd] transition-colors shadow-lg">
                Get started
              </a>
              <a href="https://github.com/system1970/openlook-web" className="text-[13px] font-medium px-5 py-2.5 rounded-md border border-[#222] text-[#bbb] hover:text-white hover:border-[#444] transition-colors">
                View source
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
          <div className="max-w-[520px]">
            <h2 className="text-[28px] font-semibold tracking-tight">Install</h2>
            <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
              Add the OpenLook skill and MCP server to your project.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {/* Skill install */}
            <div>
              <div className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Add the skill</div>
              <Code id="install-skill">{`bunx skills add system1970/openlook-web`}</Code>
            </div>

            {/* MCP config */}
            <div>
              <div className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Configure MCP servers</div>
              <Code id="install-mcp">{`{
  "mcpServers": {
    "openlook": {
      "command": "bunx",
      "args": ["-y", "openlook-mcp"],
      "env": { "GEMINI_API_KEY": "your_key" }
    },
    "playwright": {
      "command": "bunx",
      "args": ["-y", "@playwright/mcp@latest", "--caps=devtools"]
    }
  }
}`}</Code>
              <p className="mt-3 text-[12px] text-[#555]">
                <code className="font-mono">--caps=devtools</code> enables video recording in Playwright MCP.
              </p>
            </div>

            {/* Write spec */}
            <div>
              <div className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Write a spec</div>
              <Code id="install-mkdir">{`mkdir .openlook
# create .openlook/homepage.yaml with your steps and checks`}</Code>
            </div>

            {/* Run */}
            <div>
              <div className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Run</div>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-lg px-5 py-4">
                <p className="text-[14px] text-[#999]">
                  Tell your agent: <span className="text-white">&ldquo;Run the visual tests&rdquo;</span>
                </p>
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
