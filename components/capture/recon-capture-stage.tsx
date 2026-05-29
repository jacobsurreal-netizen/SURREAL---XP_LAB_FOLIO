"use client";
import { useEffect, useRef, useState } from "react";
import { ReconShell } from "../recon/recon-shell";


const CAPTURE_SCAN_SECONDS = 9;
const CAPTURE_TOTAL_SECONDS = 13;

// Deterministic 13s timeline driver
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
  {
    phase: "diagnosis_pause",
    start: 9.0,
    end: 10.0,
    label: "",
    subline: "",
    glitch: false,
    blackout: true,
  },
  {
    phase: "machine_insufficient",
    start: 10.0,
    end: 11.2,
    label: "MACHINE ANALYSIS INSUFFICIENT",
    subline: "",
    glitch: false,
    blackout: true,
  },
  {
    phase: "human_required",
    start: 11.2,
    end: 12.6,
    label: "HUMAN CORRELATION REQUIRED",
    subline: "",
    glitch: false,
    blackout: true,
  },
  {
    phase: "final_black",
    start: 12.6,
    end: 13.0,
    label: "",
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
        captureProgress: Math.min(t / CAPTURE_SCAN_SECONDS, 1),
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
    captureLabel: "",
    captureSubline: "",
    glitchActive: false,
    blackoutActive: true,
  };
}

function isFinalDiagnosisPhase(phase: string) {
  return (
    phase === "signal_loss" ||
    phase === "diagnosis_pause" ||
    phase === "machine_insufficient" ||
    phase === "human_required" ||
    phase === "final_black" ||
    phase === "done"
  );
}

function CaptureCornerBrackets({ compact = false }: { compact?: boolean }) {
  const size = compact ? "w-2 h-2" : "w-3 h-3";
  const cornerClass = `absolute ${size} text-[#2affef] opacity-35`;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className={`${cornerClass} top-0 left-0`} viewBox="0 0 12 12">
        <path d="M0 12 V0 H12" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} top-0 right-0`} viewBox="0 0 12 12">
        <path d="M12 12 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 left-0`} viewBox="0 0 12 12">
        <path d="M0 0 V12 H12" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 right-0`} viewBox="0 0 12 12">
        <path d="M12 0 V12 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

function CaptureFrameLines() {
  return (
    <div className="pointer-events-none absolute inset-3 border border-[#2affef]/12" aria-hidden="true">
      <CaptureCornerBrackets />
      <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-[#2affef]/15" />
      <div className="absolute bottom-0 left-1/2 h-5 w-px -translate-x-1/2 bg-[#2affef]/15" />
      <div className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-[#2affef]/15" />
      <div className="absolute right-0 top-1/2 h-px w-5 -translate-y-1/2 bg-[#2affef]/15" />
    </div>
  );
}

function CaptureHudPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative border border-[#2affef]/15 bg-[#040b0a]/35 px-4 py-3 backdrop-blur-[1px] ${className}`}>
      <CaptureCornerBrackets compact />
      {children}
    </div>
  );
}

function CaptureMeter({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-28 space-y-1.5">
      <div className="flex items-center justify-between gap-3 font-mono text-[7px] tracking-[0.18em] text-[#2affef] uppercase">
        <span className="opacity-55">{label}</span>
        <span className="tabular-nums opacity-85">{value}</span>
      </div>
      <div className="relative h-px w-full overflow-hidden bg-[#2affef]/15">
        <div className="absolute inset-y-0 left-0 bg-[#2affef]/60" style={{ width: value }} />
      </div>
    </div>
  );
}


export default function ReconCaptureStage() {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Timeline driver: 0–13s, deterministic, no random
  useEffect(() => {
    let start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / 1000, CAPTURE_TOTAL_SECONDS);
      setElapsed(t);
      if (t < CAPTURE_TOTAL_SECONDS) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Timeline state for overlays
  const timeline = getCaptureTimelineState(elapsed);

  // Final diagnosis: clean black screen, no scene/HUD/timeline competition.
  if (timeline.blackoutActive && isFinalDiagnosisPhase(timeline.capturePhase)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#040b0a] select-none">
        {timeline.captureLabel && (
          <div className="px-6 text-center font-mono text-[13px] tracking-[0.24em] text-[#2affef]/75 uppercase md:text-[15px]">
            {timeline.captureLabel}
          </div>
        )}
      </div>
    );
  }

  // Synthetic meter values (timeline-driven, simple animation)
  const gravimetric = `${Math.round(80 + 8 * timeline.captureProgress)}%`;
  const fieldRes = `${Math.round(70 + 10 * timeline.captureProgress)}%`;
  const phase = timeline.capturePhase;
  const focusHunt = phase === "aligning" ? (Math.sin(elapsed * 7) + 1) / 2 : 0;
  const resonancePressure =
    phase === "unstable" ? Math.max(0, Math.min(1, (elapsed - 3.5) / 2.3)) : 0;
  const failurePressure = phase === "fail" ? 1 : 0;
  const opticalHazeOpacity =
    phase === "boot"
      ? 0.08
      : phase === "aligning"
        ? 0.10 + focusHunt * 0.08
        : phase === "unstable"
          ? 0.18 + resonancePressure * 0.10
          : phase === "fail"
            ? 0.42
            : 0.06;
  const opticalBlur =
    phase === "aligning"
      ? 0.6 + focusHunt * 1.3
      : phase === "unstable"
        ? 1.2 + resonancePressure * 0.8
        : phase === "fail"
          ? 2.5
          : 0.4;
  const washOpacity =
    phase === "unstable"
      ? 0.20 + resonancePressure * 0.18
      : phase === "fail"
        ? 0.72
        : phase === "aligning"
          ? 0.08 + focusHunt * 0.08
          : phase === "boot"
            ? 0.05
            : 0.04;
  const driftOpacity =
    phase === "unstable" ? 0.16 + resonancePressure * 0.12 : phase === "aligning" ? 0.08 : 0;
  const scanTearOpacity = phase === "fail" ? 0.72 : phase === "unstable" ? 0.10 : 0;

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
        {/* Scanline/vignette overlays (z-20) */}
        <div className="pointer-events-none absolute inset-0 z-20" style={{opacity:0.10}}>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(0,172,108,0.09)_0_2px,transparent_2px_8px)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-20" style={{background:'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, #040b0a 100%)',opacity:0.38}} />
        <div className="pointer-events-none absolute inset-0 z-20" style={{backdropFilter:'blur(2.5px)',WebkitBackdropFilter:'blur(2.5px)',opacity:0.18}} />

        {/* Capture-only optical instability: sensor interpretation layers, not scene/model changes. */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(42,255,239,0.18), rgba(0,172,108,0.06) 38%, transparent 68%)",
              opacity: washOpacity,
              mixBlendMode: phase === "fail" ? "screen" : "soft-light",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${opticalBlur}px) saturate(${1 + resonancePressure * 0.55 + failurePressure * 1.6}) contrast(${1 - resonancePressure * 0.14})`,
              WebkitBackdropFilter: `blur(${opticalBlur}px) saturate(${1 + resonancePressure * 0.55 + failurePressure * 1.6}) contrast(${1 - resonancePressure * 0.14})`,
              opacity: opticalHazeOpacity,
            }}
          />
          <div
            className="absolute -inset-x-8 top-1/2 h-24 -translate-y-1/2 rotate-[-2deg]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(42,255,239,0.14), rgba(0,172,108,0.08), transparent)",
              opacity: driftOpacity,
              transform: `translate3d(${Math.sin(elapsed * 2.4) * 8}px, ${Math.sin(elapsed * 3.1) * 10}px, 0) rotate(-2deg)`,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(178deg, transparent 0 18px, rgba(42,255,239,0.10) 19px 20px, transparent 21px 42px)",
              opacity: phase === "unstable" ? 0.16 : phase === "aligning" ? 0.08 : 0,
              transform: `translateY(${Math.sin(elapsed * 8) * 3}px)`,
            }}
          />
          <div
            className="absolute left-0 right-0 h-[18vh]"
            style={{
              top: `${34 + Math.sin(elapsed * 18) * 12}%`,
              background:
                "linear-gradient(180deg, transparent, rgba(202,255,239,0.28), rgba(42,255,239,0.16), transparent)",
              opacity: scanTearOpacity,
              mixBlendMode: "screen",
            }}
          />
        </div>

        {(phase === "unstable" || phase === "fail") && (
          <div className="pointer-events-none absolute left-1/2 top-[24%] z-30 -translate-x-1/2 font-mono text-[8px] tracking-[0.2em] text-[#2affef] opacity-45">
            {phase === "fail" ? "SENSOR SATURATION: CRITICAL" : "Z-AXIS GEOMETRY: UNRESOLVED"}
          </div>
        )}

        {/* Capture-only HUD overlay (z-30) */}
        <div className="pointer-events-none absolute inset-0 z-30 select-none">
          <CaptureFrameLines />

          <div className="absolute inset-x-4 top-4 flex flex-col items-center gap-2">
            <CaptureHudPanel className="w-full max-w-[22rem]">
              <div className="text-center font-mono uppercase text-[#2affef]">
                <div className="text-[11px] tracking-[0.24em] opacity-90">DEEP_SPACE_RECON</div>
                <div className="mt-2 flex items-center justify-center gap-4 text-[8px] tracking-[0.18em] opacity-65">
                  <span>MODE: CAPTURE</span>
                  <span className="h-3 w-px bg-[#2affef]/20" aria-hidden="true" />
                  <span>SIGNAL: PARTIAL</span>
                </div>
              </div>
            </CaptureHudPanel>

            <CaptureHudPanel className="w-full max-w-[18rem]">
              <div className="flex items-center justify-center gap-5">
                <CaptureMeter label="GRAVIMETRIC" value={gravimetric} />
                <CaptureMeter label="FIELD RES." value={fieldRes} />
              </div>
            </CaptureHudPanel>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex justify-center">
            <CaptureHudPanel className="w-full max-w-[22rem]">
              <div className="flex flex-col items-center gap-1 font-mono text-[#2affef] uppercase">
                <span className="text-[10px] tracking-[0.2em] opacity-85">LOG_000 // DORMANT</span>
                <span className="text-[8px] tracking-[0.18em] opacity-65">ORIGIN VECTOR: TOKEN-LOCKED</span>
                <span className="text-[8px] tracking-[0.18em] opacity-65">SIGNAL TRACE: PARTIAL</span>
              </div>
            </CaptureHudPanel>
          </div>
        </div>

        {/* Timeline text overlay (z-30, above HUD meters) */}
        {(timeline.captureLabel || timeline.captureSubline) && (
          <div className="absolute left-1/2 top-[68%] z-30 w-full flex flex-col items-center pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
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

        {/* Blackout/glitch overlay (z-40) */}
        {timeline.glitchActive && (
          <div className="absolute inset-0 z-40 bg-[#05070A] opacity-80 animate-pulse" style={{ mixBlendMode: 'screen' }} />
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
