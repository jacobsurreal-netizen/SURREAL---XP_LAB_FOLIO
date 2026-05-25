"use client";
import { useEffect, useRef, useState } from "react";
import { ReconShell } from "../recon/recon-shell";


// Deterministic 9s timeline driver
const CAPTURE_TIMELINE = [
  {
    phase: "boot",
    start: 0.0,
    end: 1.5,
    label: "SYS.CORE // ONLINE",
    subline: "LOG_000 // DORMANT",
    glitch: false,
    blackout: false,
  },
  {
    phase: "aligning",
    start: 1.5,
    end: 3.5,
    label: "ALIGNING OPTICS...",
    subline: "SIGNAL TRACE: PARTIAL",
    glitch: false,
    blackout: false,
  },
  {
    phase: "unstable",
    start: 3.5,
    end: 5.8,
    label: "FREQ: 369.9 Hz [UNSTABLE]",
    subline: "RESONANCE DRIFT DETECTED",
    glitch: false,
    blackout: false,
  },
  {
    phase: "fail",
    start: 5.8,
    end: 6.5,
    label: "OPTICAL ALIGNMENT: FAILED",
    subline: "",
    glitch: true,
    blackout: true,
  },
  {
    phase: "insufficient",
    start: 6.5,
    end: 8.5,
    label: "SINGLE VIEWPOINT INSUFFICIENT.",
    subline: "ORIGIN VECTOR: TOKEN-LOCKED",
    glitch: false,
    blackout: false,
  },
  {
    phase: "signal_loss",
    start: 8.5,
    end: 9.0,
    label: "SIGNAL LOSS",
    subline: "",
    glitch: false,
    blackout: true,
  },
];

function getCaptureTimelineState(t: number) {
  for (let i = 0; i < CAPTURE_TIMELINE.length; ++i) {
    const entry = CAPTURE_TIMELINE[i];
    if (t >= entry.start && t < entry.end) {
      return {
        elapsedSeconds: t,
        capturePhase: entry.phase,
        captureProgress: Math.min(t / 9, 1),
        captureLabel: entry.label,
        captureSubline: entry.subline,
        glitchActive: entry.glitch,
        blackoutActive: entry.blackout,
      };
    }
  }
  // After timeline, treat as blackout
  return {
    elapsedSeconds: t,
    capturePhase: "done",
    captureProgress: 1,
    captureLabel: "SIGNAL LOST",
    captureSubline: "",
    glitchActive: false,
    blackoutActive: true,
  };
}

export default function ReconCaptureStage() {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Timeline driver: 0–9s, deterministic, no random
  useEffect(() => {
    let start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / 1000, 9);
      setElapsed(t);
      if (t < 9) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Timeline state for overlays
  const timeline = getCaptureTimelineState(elapsed);

  // Blackout at end
  if (timeline.blackoutActive && timeline.capturePhase === "signal_loss") {
    return <div className="fixed inset-0 bg-[#040b0a]" />;
  }

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
        {(timeline.captureLabel || timeline.captureSubline) && (
          <div className="absolute left-1/2 top-[68%] z-40 w-full flex flex-col items-center" style={{ transform: 'translateX(-50%)' }}>
            {timeline.captureLabel && (
              <div className="font-mono text-[18px] md:text-[22px] tracking-[0.22em] text-[#2aff84] drop-shadow-[0_0_8px_#00ac6c88] text-center uppercase" style={{ letterSpacing: '0.18em' }}>
                {timeline.captureLabel}
              </div>
            )}
            {timeline.captureSubline && (
              <div className="font-mono text-[12px] md:text-[14px] tracking-[0.18em] text-[#00ac6c] opacity-80 text-center mt-1 uppercase" style={{ letterSpacing: '0.13em' }}>
                {timeline.captureSubline}
              </div>
            )}
          </div>
        )}
        {/* Blackout/glitch overlay */}
        {timeline.glitchActive && (
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
