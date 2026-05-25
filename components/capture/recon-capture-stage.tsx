"use client";
import { useEffect, useRef, useState } from "react";
import { ReconShell } from "../recon/recon-shell";

// Timeline overlays
const TIMELINE = [
  { t: 0, lines: ["SYS.CORE // ONLINE", "LOG_000 // DORMANT"] },
  { t: 2.0, lines: ["ALIGNING OPTICS...", "SIGNAL TRACE: PARTIAL"] },
  { t: 4.5, lines: ["FREQ: 369.9 Hz [UNSTABLE]", "RESONANCE DRIFT DETECTED"] },
  { t: 6.5, lines: ["OPTICAL ALIGNMENT: FAILED", ""] },
  { t: 7.0, lines: ["SINGLE VIEWPOINT INSUFFICIENT.", ""] },
  { t: 8.5, lines: ["", ""] }, // blackout
];

function getTimelineLines(time: number): [string, string] {
  for (let i = TIMELINE.length - 1; i >= 0; --i) {
    if (time >= TIMELINE[i].t) {
      const [a, b] = TIMELINE[i].lines;
      return [a, b];
    }
  }
  return ["", ""];
}

export default function ReconCaptureStage() {
  const [time, setTime] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / 1000, 9);
      setTime(t);
      if (t < 9) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // blackout at end
  if (time >= 8.5) {
    return <div className="fixed inset-0 bg-[#040b0a]" />;
  }

  // Timeline text (dual line)
  const [mainText, subText] = getTimelineLines(time);
  const isGlitch = time >= 6.5 && time < 7.0;

  // 9:16 mobile frame sizing
  // max height = 100vh, max width = 9/16 * 100vh
  // Centered, with dark void outside
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#040b0a] overflow-hidden select-none">
      <div
        className="relative flex items-center justify-center bg-black rounded-lg shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '9/16',
          height: '100vh',
          maxHeight: '100dvh',
          width: 'auto',
          maxWidth: 'calc(100vh * 9 / 16)',
          boxShadow: '0 0 0 9999px #040b0a',
        }}
      >
        {/* Real RECON scene, forced mobile mode */}
        <div className="absolute inset-0 z-0">
          <ReconShell bypassInit>
            {/* Force mobile mode for all HUD/scene logic via context override */}
            <style>{`body { overscroll-behavior: none !important; }`}</style>
            {/* Patch isMobile for all children via window width spoof */}
            <ForceMobileWidth />
          </ReconShell>
        </div>
        {/* Capture overlays */}
        {/* Blur/scrim overlay */}
        <div className="pointer-events-none absolute inset-0 z-30" style={{backdropFilter:'blur(2.5px)',WebkitBackdropFilter:'blur(2.5px)',opacity:0.18}} />
        {/* Vignette overlay */}
        <div className="pointer-events-none absolute inset-0 z-30" style={{background:'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, #040b0a 100%)',opacity:0.38}} />
        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 z-30" style={{opacity:0.10}}>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(0,172,108,0.09)_0_2px,transparent_2px_8px)]" />
        </div>
        {/* Timeline text overlay */}
        {(mainText || subText) && (
          <div className="absolute left-1/2 top-[68%] z-40 w-full flex flex-col items-center" style={{ transform: 'translateX(-50%)' }}>
            {mainText && (
              <div className="font-mono text-[18px] md:text-[22px] tracking-[0.22em] text-[#2aff84] drop-shadow-[0_0_8px_#00ac6c88] text-center uppercase" style={{ letterSpacing: '0.18em' }}>
                {mainText}
              </div>
            )}
            {subText && (
              <div className="font-mono text-[12px] md:text-[14px] tracking-[0.18em] text-[#00ac6c] opacity-80 text-center mt-1 uppercase" style={{ letterSpacing: '0.13em' }}>
                {subText}
              </div>
            )}
          </div>
        )}
        {/* Blackout/glitch overlay */}
        {isGlitch && (
          <div className="absolute inset-0 z-50 bg-[#05070A] opacity-80 animate-pulse" style={{ mixBlendMode: 'screen' }} />
        )}
      </div>
    </div>
  );
}

// Context provider to spoof mobile width for media queries and matchMedia
function ForceMobileWidth({ children }: { children?: React.ReactNode }) {
  // This effect will spoof window.innerWidth and matchMedia for mobile queries
  useEffect(() => {
    const origWidth = window.innerWidth;
    const origMatchMedia = window.matchMedia;
    // Patch matchMedia to always return true for max-width: 768px
    window.matchMedia = (query: string) => {
      if (/max-width:\s*768px/.test(query)) {
        return { matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {} } as any;
      }
      return origMatchMedia(query);
    };
    // Optionally patch innerWidth if needed
    Object.defineProperty(window, 'innerWidth', { get: () => 375, configurable: true });
    return () => {
      window.matchMedia = origMatchMedia;
      Object.defineProperty(window, 'innerWidth', { get: () => origWidth, configurable: true });
    };
  }, []);
  return <>{children}</>;
}
