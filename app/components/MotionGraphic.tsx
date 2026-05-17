'use client';

import { useEffect, useState } from 'react';

export default function MotionGraphic() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  // Smoothly cycle through the Vercel/Linear-style testing phases
  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => ((prev + 1) % 4) as 0 | 1 | 2 | 3);
    }, 4500); // 4.5 seconds per phase for smooth pacing
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[500px] aspect-[1.35/1] bg-black border border-neutral-900 rounded-xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] group select-none">
      
      {/* High-fidelity CSS Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Subtle Radial Ambient Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none transition-all duration-1000" />

      {/* Premium Minimalist IDE/Browser Header */}
      <div className="relative z-20 flex items-center justify-between px-4 h-11 border-b border-neutral-900/60 bg-black/80 backdrop-blur-md">
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-neutral-800 bg-neutral-950 transition-colors group-hover:bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full border border-neutral-800 bg-neutral-950 transition-colors group-hover:bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full border border-neutral-800 bg-neutral-950 transition-colors group-hover:bg-neutral-800" />
        </div>
        <div className="flex items-center gap-1.5 bg-neutral-950/80 border border-neutral-900 px-3 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          <span className="text-[10px] font-mono text-neutral-400 tracking-wider font-medium">openlook://live-visual-unit-test</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[calc(100%-44px)] p-6 flex items-center justify-center bg-black">
        
        {/* ====================================================
            PHASE 0: SPEC COMPILATION (IDE VIEW)
            ==================================================== */}
        <div
          className="absolute inset-6 flex flex-col justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: phase === 0 ? 1 : 0,
            transform: phase === 0 ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
            pointerEvents: phase === 0 ? 'auto' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-semibold tracking-wider text-neutral-500 uppercase">Input Spec</span>
              <span className="text-[10px] text-neutral-400 font-mono">homepage.yaml</span>
            </div>
            <span className="text-[9px] text-neutral-600 font-mono tracking-tighter">Line 1-7</span>
          </div>
          <pre className="text-[11.5px] font-mono text-neutral-500 bg-neutral-950/60 border border-neutral-900/80 rounded-lg p-5 leading-relaxed overflow-hidden shadow-inner">
            <div><span className="text-white font-medium">id:</span> <span className="text-neutral-400">homepage-motion-graphic</span></div>
            <div><span className="text-white font-medium">url:</span> <span className="text-neutral-400">http://localhost:3000</span></div>
            <div><span className="text-white font-medium">steps:</span></div>
            <div className="text-neutral-600 pl-3.5">- Observe continuous loop animation</div>
            <div className="text-neutral-600 pl-3.5">- Assert verdict fade-in easing</div>
            <div className="text-white font-medium">checks:</div>
            <div className="text-emerald-500/80 pl-3.5">- id: verdict-aesthetic-correct</div>
          </pre>
        </div>

        {/* ====================================================
            PHASE 1: BROWSER RECORDING & CURSOR TARGETING
            ==================================================== */}
        <div
          className="absolute inset-6 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: phase === 1 ? 1 : 0,
            transform: phase === 1 ? 'translateY(0) scale(1)' : phase < 1 ? 'translateY(10px) scale(0.97)' : 'translateY(-10px) scale(0.97)',
            pointerEvents: phase === 1 ? 'auto' : 'none'
          }}
        >
          {/* Pulsing REC Indicator */}
          <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-neutral-950 border border-neutral-900 px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-red-500 tracking-widest uppercase">PLAYWRIGHT RECORDING</span>
          </div>

          {/* Premium UI Mock Viewport */}
          <div className="w-[90%] aspect-[1.5/1] bg-neutral-950 border border-neutral-900/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            
            {/* Fine grid inside mock app */}
            <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Selector box that highlights dynamically */}
            <div 
              className="absolute border border-dashed rounded-lg transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] p-2 z-10"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 15px rgba(255,255,255,0.02)',
                animation: 'pulseSelector 2.5s infinite ease-in-out'
              }}
            >
              <div className="text-[7px] font-mono text-neutral-500 absolute -top-4 left-0">div.cta-btn</div>
              <div className="w-20 h-6 bg-white border border-neutral-800 rounded flex items-center justify-center">
                <div className="w-8 h-1.5 bg-black rounded-sm" />
              </div>
            </div>

            {/* Premium Vector Cursor path animation */}
            <div 
              className="absolute w-3.5 h-3.5 pointer-events-none z-30 transition-all duration-1000 ease-out"
              style={{
                top: '52%',
                left: '46%',
                animation: 'cursorPathSim 4.5s infinite cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-md">
                <path d="M0 0V11.5L3.5 8L7.5 14L10 12.5L6.2 6.7L10.5 6.2L0 0Z" fill="white" stroke="black" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="w-12 h-2 bg-neutral-900 rounded mb-2.5" />
            <div className="w-32 h-3.5 bg-neutral-900 rounded mb-1.5" />
            <div className="w-20 h-1.5 bg-neutral-950 rounded mb-6" />
          </div>
          <div className="mt-4 text-[10.5px] text-neutral-500 font-mono">Simulating interactive user actions...</div>
        </div>

        {/* ====================================================
            PHASE 2: HOLOGRAPHIC SCANNING & GEMINI AUDIT
            ==================================================== */}
        <div
          className="absolute inset-6 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: phase === 2 ? 1 : 0,
            transform: phase === 2 ? 'translateY(0) scale(1)' : phase < 2 ? 'translateY(10px) scale(0.97)' : 'translateY(-10px) scale(0.97)',
            pointerEvents: phase === 2 ? 'auto' : 'none'
          }}
        >
          {/* Holographic Glowing Scanner Bar */}
          <div 
            className="absolute left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.4)] z-30 pointer-events-none"
            style={{
              animation: 'holographicScan 2.2s infinite ease-in-out'
            }}
          />

          <div className="w-[90%] aspect-[1.5/1] bg-neutral-950 border border-neutral-900 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden filter brightness-[0.7]">
            <div className="w-20 h-6 bg-white border border-neutral-800 rounded flex items-center justify-center mb-6">
              <div className="w-8 h-1.5 bg-black rounded-sm" />
            </div>
            <div className="w-12 h-2 bg-neutral-900 rounded mb-2.5" />
            <div className="w-32 h-3.5 bg-neutral-900 rounded mb-1.5" />
          </div>
          <div className="mt-4 text-[10.5px] text-neutral-400 font-mono tracking-wider animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Gemini parsing video sequence frames...
          </div>
        </div>

        {/* ====================================================
            PHASE 3: VERDICT badge (PRISTINE PASS BADGE)
            ==================================================== */}
        <div
          className="absolute inset-6 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: phase === 3 ? 1 : 0,
            transform: phase === 3 ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
            pointerEvents: phase === 3 ? 'auto' : 'none'
          }}
        >
          {/* Fixed: Smooth slide-up animation with proper easing */}
          <div
            className="w-[85%] bg-neutral-950 border border-emerald-500/40 rounded-xl p-6 shadow-2xl relative select-none flex flex-col items-center justify-center overflow-hidden"
            style={{
              animation: phase === 3 ? 'verdictSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
            }}
          >
            {/* Subtle Gradient Backlight behind badge */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/[0.08] to-transparent pointer-events-none" />

            {/* Fixed: Smooth slide-up with scale and ease-out deceleration */}
            <div className="openlook-verdict-badge flex flex-col items-center justify-center border border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400 px-6 py-4 rounded-xl shadow-[0_8px_32px_rgba(16,185,129,0.12)] mb-4">
              <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-500/70 mb-1">Visual Unit Test Verdict</span>
              <div className="text-[19px] font-mono font-medium tracking-tight flex items-center gap-1.5">
                <span>PASS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 font-mono text-center max-w-[280px]">
              All visual checks passed with smooth animations.
            </div>
          </div>
        </div>

      </div>

      {/* Styled Animations Injection */}
      <style jsx global>{`
        @keyframes pulseSelector {
          0%, 100% { border-color: rgba(255, 255, 255, 0.08); }
          50% { border-color: rgba(255, 255, 255, 0.25); }
        }
        @keyframes cursorPathSim {
          0% { top: 80%; left: 80%; }
          30% { top: 50%; left: 48%; }
          60% { top: 52%; left: 49%; }
          100% { top: 80%; left: 80%; }
        }
        @keyframes holographicScan {
          0% { top: 15%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        @keyframes verdictSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
