"use client";
import { useEffect, useRef, useState } from "react";
import { ReconShell } from "../recon/recon-shell";


const CAPTURE_SCAN_SECONDS = 9;
const CAPTURE_TOTAL_SECONDS = 15;

// Deterministic 15s timeline driver
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
    label: "FREQ: [UNSTABLE]",
    subline: "RESONANCE DRIFT DETECTED",
    glitch: false,
    blackout: false,
  },
  {
    phase: "fail",
    start: 5.8,
    end: 6.5,
    label: "OPTICAL ALIGNMENT:\nFAILED",
    subline: "",
    glitch: true,
    blackout: true,
  },
  {
    phase: "insufficient",
    start: 6.5,
    end: 8.5,
    label: "SINGLE VIEWPOINT\nINSUFFICIENT.",
    subline: "PARTIAL ACQUISITION",
    glitch: false,
    blackout: false,
  },
  {
    phase: "signal_loss",
    start: 8.5,
    end: 9.0,
    label: "SIGNAL LOST",
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
    end: 12.5,
    label: "MACHINE ANALYSIS INSUFFICIENT",
    subline: "",
    glitch: false,
    blackout: true,
  },
  {
    phase: "human_required",
    start: 12.6,
    end: 14.2,
    label: "HUMAN CORRELATION REQUIRED",
    subline: "",
    glitch: false,
    blackout: true,
  },
  {
    phase: "final_black",
    start: 14.2,
    end: 15.0,
    label: "",
    subline: "",
    glitch: false,
    blackout: true,
  },
];

type CaptureInstabilityPhase = (typeof CAPTURE_TIMELINE)[number]["phase"] | "done";

type CaptureInstabilityState = {
  enabled: boolean;
  elapsedSeconds: number;
  phase: CaptureInstabilityPhase;
  progress: number;
  pressure: number;
};

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

function getPhaseProgress(phase: string, elapsedSeconds: number) {
  const entry = CAPTURE_TIMELINE.find((item) => item.phase === phase);
  if (!entry) return 1;

  return Math.max(0, Math.min(1, (elapsedSeconds - entry.start) / (entry.end - entry.start)));
}

function getCapturePressure(phase: string, elapsedSeconds: number) {
  const phaseProgress = getPhaseProgress(phase, elapsedSeconds);

  if (phase === "boot") return 0.08 + phaseProgress * 0.04;
  if (phase === "aligning") return 0.2 + phaseProgress * 0.22;
  if (phase === "unstable") return 0.62 + phaseProgress * 0.33;
  if (phase === "fail") return 1.2;
  if (phase === "insufficient") return 0.42 - phaseProgress * 0.16;

  return 0;
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

// HUD instability intensity per phase (0 = steady, 1 = peak stress)
function getHudInstabilityLevel(phase: string, elapsedSeconds: number): number {
  const p = getPhaseProgress(phase, elapsedSeconds);
  if (phase === "boot") return 0.10;
  if (phase === "aligning") return 0.20 + p * 0.10;
  if (phase === "unstable") return 0.42 + p * 0.20;
  if (phase === "fail") return 0.85;
  if (phase === "insufficient") return 0.44 - p * 0.08;
  if (phase === "signal_loss") return 0.90;
  return 0.00;
}

// CSS keyframes for phase-driven HUD life — deterministic, no dependencies
const HUD_INSTABILITY_CSS = `
  @keyframes hud-ambient-pulse {
    0%, 100% { opacity: 1; }
    46% { opacity: 0.87; }
    54% { opacity: 0.93; }
  }
  @keyframes hud-flicker-light {
    0%, 100% { opacity: 1; }
    7% { opacity: 0.82; }
    8.5% { opacity: 0.97; }
    18% { opacity: 0.78; }
    19% { opacity: 1; }
    55% { opacity: 0.86; }
    56% { opacity: 1; }
    79% { opacity: 0.91; }
  }
  @keyframes hud-flicker-heavy {
    0%, 100% { opacity: 1; }
    4% { opacity: 0.64; }
    5% { opacity: 0.93; }
    6.5% { opacity: 0.48; }
    8% { opacity: 0.87; }
    28% { opacity: 0.72; }
    29% { opacity: 1; }
    63% { opacity: 0.56; }
    65% { opacity: 0.92; }
    66.5% { opacity: 0.74; }
    68% { opacity: 1; }
  }
  @keyframes hud-dropout {
    0% { opacity: 1; }
    10% { opacity: 0.90; }
    18% { opacity: 0.22; }
    21% { opacity: 0.78; }
    25% { opacity: 0.08; }
    29% { opacity: 0.84; }
    34% { opacity: 0.44; }
    40% { opacity: 0.92; }
    50% { opacity: 0.66; }
    56% { opacity: 1; }
    100% { opacity: 1; }
  }
  @keyframes hud-jitter {
    0%, 100% { transform: translateX(0) translateY(0); }
    22% { transform: translateX(-0.6px) translateY(0.3px); }
    48% { transform: translateX(0.9px) translateY(-0.4px); }
    72% { transform: translateX(-0.4px) translateY(0.6px); }
  }
  @keyframes hud-border-breathe {
    0%, 100% { opacity: 1; }
    44% { opacity: 0.68; }
    58% { opacity: 0.80; }
  }
`;

// Phase-driven CRT noise intensity (0 = silent, 1 = peak degradation)
function getCRTNoiseIntensity(phase: string, elapsedSeconds: number): number {
  const p = getPhaseProgress(phase, elapsedSeconds);
  if (phase === "boot") return 0.15;
  if (phase === "aligning") return 0.15 + p * 0.15;          // 0.15 → 0.30
  if (phase === "unstable") return 0.30 + p * 0.30;          // 0.30 → 0.60
  if (phase === "fail") return 0.90;
  if (phase === "insufficient") return 0.55 - p * 0.10;      // 0.55 → 0.45
  if (phase === "signal_loss") return 0.85;
  if (phase === "diagnosis_pause") return Math.max(0, 0.08 - p * 0.07);
  if (phase === "machine_insufficient") return 0.05;
  if (phase === "human_required") return 0.04;
  return 0.00;
}

// Dedicated horizontal acquisition layer: sits between scene degradation and HUD.
function getTransmissionGrainIntensity(phase: string, elapsedSeconds: number): number {
  const p = getPhaseProgress(phase, elapsedSeconds);
  if (phase === "boot") return 0.10;
  if (phase === "aligning") return 0.18 + p * 0.04;           // 0.18 → 0.22
  if (phase === "unstable") return 0.42 + p * 0.08;           // 0.42 → 0.50
  if (phase === "fail") return 0.85;
  if (phase === "insufficient") return 0.45 - p * 0.04;       // 0.45 → 0.41
  if (phase === "signal_loss") return 0.75;
  if (phase === "diagnosis_pause") return Math.max(0, 0.04 - p * 0.04);
  return 0.00;
}

const DIAGNOSIS_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\[]{}<>#_";

function getResolvedDiagnosisText(
  text: string,
  progress: number,
  elapsedSeconds: number,
  seed: number,
  settleAt: number
) {
  const chars = Array.from(text);
  const revealProgress = Math.min(1, progress / settleAt);
  const tick = Math.floor(elapsedSeconds * 18);

  return chars
    .map((char, index) => {
      if (char === " ") return " ";
      if (progress > 0.92) return char;

      const revealPoint = ((index + 1) / chars.length) * 0.86;
      if (revealProgress >= revealPoint) return char;

      const glyphIndex =
        (seed * 31 + index * 17 + tick * ((index % 5) + 1)) % DIAGNOSIS_GLYPHS.length;
      return DIAGNOSIS_GLYPHS[glyphIndex];
    })
    .join("");
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

function PurpleWarningOverlay({ elapsed }: { elapsed: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[36] overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 82% 62% at 50% 47%, rgba(168,121,255,0.22), rgba(71,45,126,0.34) 38%, rgba(8,6,18,0.62) 82%), linear-gradient(180deg, rgba(32,19,56,0.24), rgba(9,7,19,0.58))",
          backdropFilter: "blur(4.2px) saturate(0.72) brightness(0.64)",
          WebkitBackdropFilter: "blur(4.2px) saturate(0.72) brightness(0.64)",
        }}
      />
      <div
        className="absolute -inset-8"
        style={{
          background:
            "radial-gradient(ellipse 46% 24% at 48% 38%, rgba(216,198,255,0.18), transparent 66%), radial-gradient(ellipse 34% 18% at 58% 62%, rgba(128,82,214,0.22), transparent 72%), radial-gradient(ellipse 68% 30% at 40% 72%, rgba(54,31,96,0.24), transparent 76%)",
          filter: "blur(13px)",
          opacity: 0.82,
          transform: `translate3d(${Math.sin(elapsed * 1.4) * 7}px, ${Math.cos(elapsed * 1.1) * 9}px, 0)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(96deg, transparent 0 9px, rgba(168,121,255,0.055) 10px 11px, transparent 12px 24px), repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 7px)",
          opacity: 0.48,
          transform: `translateY(${Math.sin(elapsed * 8.5) * 2}px)`,
          mixBlendMode: "soft-light",
        }}
      />
      <div
        className="absolute inset-x-[-10%] top-[36%] h-[28vh] rotate-[-3deg]"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(168,121,255,0.18), rgba(64,38,118,0.18), transparent)",
          filter: "blur(8px)",
          opacity: 0.68,
          transform: `translate3d(${Math.sin(elapsed * 2.2) * 11}px, ${Math.cos(elapsed * 1.8) * 5}px, 0) rotate(-3deg)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 68% at 50% 50%, transparent 44%, rgba(4,3,10,0.28) 72%, rgba(4,3,10,0.7) 100%)",
        }}
      />
    </div>
  );
}

function PhaseDiagnosticReadout({
  phase,
  label,
  subline,
}: {
  phase: CaptureInstabilityPhase;
  label: string;
  subline: string;
}) {
  if (!label || phase === "insufficient" || phase === "done") return null;

  const phaseIndex =
    phase === "boot" ? "000" : phase === "aligning" ? "001" : phase === "unstable" ? "003" : "005";
  const isFailure = phase === "fail";

  if (isFailure) {
    const [failureContext, failureState] = label.split("\n");

    return (
      <div className="pointer-events-none absolute left-6 right-6 top-[34%] z-[45] font-mono uppercase">
        <div className="relative overflow-hidden border border-[#2affef]/35 bg-[#030908]/82 px-4 py-4 shadow-[0_0_30px_rgba(42,255,239,0.16)] backdrop-blur-[3px]">
          <CaptureCornerBrackets compact />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2affef]/80 to-transparent" />
          <div className="absolute inset-y-2 left-0 w-px bg-[#2affef]/60" />
          <div className="absolute right-3 top-3 h-1.5 w-1.5 bg-[#7dff9b]/45 shadow-[0_0_9px_rgba(125,255,155,0.35)]" />
          <div className="flex items-center justify-between gap-4 text-[7px] tracking-[0.18em] text-[#2affef]/58">
            <span>ALIGNMENT INTERRUPT</span>
            <span className="tabular-nums">{`ERR_${phaseIndex}`}</span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="text-[10px] leading-none tracking-[0.14em] text-[#2affef]/68">
              {failureContext}
            </div>
            <div className="text-[19px] leading-none tracking-[0.13em] text-[#dffdfa] drop-shadow-[0_0_12px_rgba(42,255,239,0.36)]">
              {failureState}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute left-5 right-5 top-[56%] z-[32] font-mono uppercase">
      <div className="relative max-w-[20rem] border-l border-[#2affef]/36 bg-[#03100f]/58 px-3.5 py-3 shadow-[0_0_24px_rgba(42,255,239,0.08)] backdrop-blur-[1.5px]">
        <div className="absolute left-0 right-8 top-0 h-px bg-gradient-to-r from-[#2affef]/55 via-[#2affef]/18 to-transparent" />
        <div className="absolute left-0 right-14 bottom-0 h-px bg-gradient-to-r from-[#2affef]/28 to-transparent" />
        <div className="mb-2 flex items-center justify-between gap-3 text-[7px] tracking-[0.16em] text-[#2affef]/48">
          <span>ACQ.STATUS</span>
          <span className="tabular-nums">{`LOG_${phaseIndex}`}</span>
        </div>
        <div className="text-[13px] leading-[1.25] tracking-[0.12em] text-[#2affef]/86 drop-shadow-[0_0_10px_rgba(42,255,239,0.24)]">
          {label}
        </div>
        {subline && (
          <div className="mt-1.5 text-[8px] leading-[1.35] tracking-[0.14em] text-[#9dfdf4]/52">
            {subline}
          </div>
        )}
      </div>
    </div>
  );
}

function PurpleWarningMessage() {
  return (
    <div className="pointer-events-none absolute left-6 right-6 top-[34%] z-[45] font-mono uppercase">
      <div className="relative border border-[#a879ff]/45 bg-[#080711]/76 px-4 py-4 shadow-[0_0_34px_rgba(117,75,203,0.18)] backdrop-blur-[5px]">
        <CaptureCornerBrackets compact />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8c6ff]/70 to-transparent" />
        <div className="absolute inset-y-3 left-0 w-px bg-[#a879ff]/40" />
        <div className="absolute inset-y-3 right-0 w-px bg-[#a879ff]/25" />
        <div className="flex items-center justify-between gap-3 text-[7px] tracking-[0.22em] text-[#cbb8ff]/80">
          <span>OBSERVATION ERROR</span>
          <span className="tabular-nums text-[#7dff9b]/35">LOG_006</span>
        </div>
        <div className="mt-4 text-[15px] leading-[1.25] tracking-[0.16em] text-[#efeaff]/90 drop-shadow-[0_0_12px_rgba(168,121,255,0.3)]">
          <div>SINGLE VIEWPOINT</div>
          <div>INSUFFICIENT.</div>
        </div>
        <div className="mt-3 space-y-1 text-[8px] tracking-[0.14em] text-[#d8c6ff]/62">
          <div>PARTIAL ACQUISITION</div>
        </div>
      </div>
    </div>
  );
}


// CRT noise / signal interference overlay — five deterministic layers.
// Sits at z-23: above optical instability (z-20), below HUD (z-30).
function CRTInterferenceOverlay({
  phase,
  elapsed,
  noiseIntensity,
}: {
  phase: string;
  elapsed: number;
  noiseIntensity: number;
}) {
  if (noiseIntensity < 0.01) return null;

  const i = noiseIntensity;
  const isFail = phase === "fail";
  const isUnstable = phase === "unstable";
  const isSignalLoss = phase === "signal_loss";
  const needsTearing = isFail || isUnstable || isSignalLoss;

  // Slow-drift interference band positions — deterministic sine offsets
  const band1Y = 19 + Math.sin(elapsed * 2.3) * 11;
  const band2Y = 53 + Math.cos(elapsed * 1.8) * 9;
  const band3Y = 77 + Math.sin(elapsed * 3.4) * 6;

  // Fast signal-tearing scan line: speed scales with phase pressure
  const tearSpeed = isFail ? 38 : isSignalLoss ? 28 : 20;
  const tearY = (elapsed * tearSpeed) % 100;

  // Rolling broad acquisition sweep — one pass per ~9 s
  const sweepY = (elapsed * 9) % 110 - 10;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 23 }}
      aria-hidden="true"
    >
      {/* Layer 1: Fine CRT scanlines (3 px period, darker raster) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0 2px, rgba(0,0,0,0.20) 2px 3px)",
          opacity: i * 0.68,
          mixBlendMode: "multiply",
        }}
      />

      {/* Layer 2: Grain / noise cross-hatch (two diagonal gradients) */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            `repeating-linear-gradient(${47 + Math.sin(elapsed * 0.6) * 3}deg, transparent 0 2px, rgba(42,255,239,0.04) 2px 3px, transparent 3px 8px)`,
            `repeating-linear-gradient(${-52 + Math.cos(elapsed * 0.5) * 2}deg, transparent 0 2px, rgba(0,0,0,0.05) 2px 3px, transparent 3px 10px)`,
          ].join(", "),
          opacity: i * 0.42,
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 3a: Primary horizontal interference band */}
      <div
        className="absolute inset-x-0"
        style={{
          top: `${band1Y}%`,
          height: "2.5vh",
          background:
            "linear-gradient(180deg, transparent, rgba(42,255,239,0.20) 50%, transparent)",
          opacity: i * 0.72,
          mixBlendMode: "screen",
          transform: `translateX(${Math.sin(elapsed * 10.8) * i * 8}px)`,
          filter: "blur(0.5px)",
        }}
      />

      {/* Layer 3b: Secondary horizontal interference band */}
      <div
        className="absolute inset-x-0"
        style={{
          top: `${band2Y}%`,
          height: "1.5vh",
          background:
            "linear-gradient(180deg, transparent, rgba(42,255,239,0.14) 50%, transparent)",
          opacity: i * 0.56,
          mixBlendMode: "screen",
          transform: `translateX(${Math.cos(elapsed * 8.3) * i * -6}px)`,
        }}
      />

      {/* Layer 3c: Tertiary band — high-pressure phases only */}
      {needsTearing && (
        <div
          className="absolute inset-x-0"
          style={{
            top: `${band3Y}%`,
            height: "1vh",
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.09) 50%, transparent)",
            opacity: i * 0.50,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Layer 4: Signal tearing — 1 px bright scan line, phase-speed driven */}
      {needsTearing && (
        <div
          className="absolute inset-x-0"
          style={{
            top: `${tearY}%`,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(202,255,239,0.85) 15%, rgba(42,255,239,0.65) 50%, rgba(202,255,239,0.85) 85%, transparent)",
            opacity: i * 0.88,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Layer 5: Rolling broad acquisition sweep */}
      <div
        className="absolute inset-x-[-8%]"
        style={{
          top: `${sweepY}%`,
          height: "7vh",
          background:
            "linear-gradient(180deg, transparent, rgba(42,255,239,0.055), rgba(42,255,239,0.03), transparent)",
          opacity: i * 0.55,
          mixBlendMode: "screen",
          filter: "blur(2.5px)",
        }}
      />
    </div>
  );
}

function HorizontalTransmissionGrainLayer({
  phase,
  elapsed,
  intensity,
  zIndex = 24,
}: {
  phase: string;
  elapsed: number;
  intensity: number;
  zIndex?: number;
}) {
  if (intensity < 0.01) return null;

  const i = intensity;
  const isUnstable = phase === "unstable";
  const isFail = phase === "fail";
  const isSignalLoss = phase === "signal_loss";
  const needsScrape = isUnstable || isFail || isSignalLoss;
  const needsTearing = isFail || isSignalLoss;
  const rollY = (elapsed * (isFail ? 19 : isSignalLoss ? 17 : 8)) % 100;
  const counterRollY = (78 - elapsed * (isFail ? 11 : 5)) % 100;
  const scrapeY = (elapsed * (isFail ? 43 : isSignalLoss ? 34 : 23)) % 100;
  const lineDrift = Math.sin(elapsed * 9.2) * i * (isFail ? 11 : isUnstable ? 6 : 2.4);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex }}
      aria-hidden="true"
    >
      {/* Fine horizontal acquisition raster: bright and dark scan rows only. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(202,255,239,0.055) 0 1px, transparent 1px 3px, rgba(0,0,0,0.16) 3px 4px, transparent 4px 8px)",
          opacity: i * 0.58,
          transform: `translateY(${Math.sin(elapsed * 5.7) * 1.4}px)`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Broken horizontal line fragments: masked by a lateral cadence, not random noise. */}
      <div
        className="absolute inset-x-[-6%] inset-y-0"
        style={{
          background: [
            "repeating-linear-gradient(180deg, transparent 0 11px, rgba(202,255,239,0.18) 11px 12px, transparent 12px 29px)",
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 22px, transparent 22px 42px, rgba(0,0,0,0.2) 42px 66px, transparent 66px 91px)",
          ].join(", "),
          backgroundBlendMode: "screen, multiply",
          opacity: i * (isFail ? 0.46 : isUnstable ? 0.32 : 0.20),
          transform: `translate3d(${lineDrift}px, ${Math.cos(elapsed * 3.4) * 2}px, 0)`,
          mixBlendMode: "screen",
          filter: "blur(0.15px)",
        }}
      />

      {/* Slow rolling scan bands that make the feed feel reconstructed line-by-line. */}
      <div
        className="absolute inset-x-[-8%] h-[12vh]"
        style={{
          top: `${rollY}%`,
          background:
            "linear-gradient(180deg, transparent, rgba(42,255,239,0.07), rgba(255,255,255,0.035), transparent)",
          opacity: i * 0.62,
          transform: `translateX(${Math.sin(elapsed * 6.6) * i * 7}px)`,
          mixBlendMode: "screen",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute inset-x-[-10%] h-[7vh]"
        style={{
          top: `${counterRollY}%`,
          background:
            "linear-gradient(180deg, transparent, rgba(0,0,0,0.32), rgba(42,255,239,0.045), transparent)",
          opacity: i * 0.38,
          transform: `translateX(${Math.cos(elapsed * 7.8) * i * -5}px)`,
          mixBlendMode: "soft-light",
          filter: "blur(1.4px)",
        }}
      />

      {needsScrape && (
        <div
          className="absolute inset-x-[-12%]"
          style={{
            top: `${scrapeY}%`,
            height: isFail ? "4px" : "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(202,255,239,0.64) 9%, transparent 22%, rgba(42,255,239,0.48) 34%, transparent 49%, rgba(255,255,255,0.5) 72%, transparent 100%)",
            opacity: i * (isFail ? 0.86 : 0.58),
            transform: `translateX(${Math.sin(elapsed * 21.5) * i * (isFail ? 18 : 9)}px)`,
            mixBlendMode: "screen",
            filter: "blur(0.25px)",
          }}
        />
      )}

      {needsTearing && (
        <div
          className="absolute inset-x-[-14%]"
          style={{
            top: `${(scrapeY + 17) % 100}%`,
            height: "7vh",
            background:
              "repeating-linear-gradient(180deg, transparent 0 3px, rgba(202,255,239,0.2) 3px 4px, transparent 4px 9px), linear-gradient(90deg, transparent, rgba(42,255,239,0.12), transparent)",
            opacity: i * 0.50,
            transform: `translate3d(${Math.cos(elapsed * 18.2) * i * 22}px, 0, 0) skewY(${Math.sin(elapsed * 8.8) * i * 1.2}deg)`,
            mixBlendMode: "screen",
            filter: "blur(0.8px)",
          }}
        />
      )}
    </div>
  );
}

export default function ReconCaptureStage() {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Ensure scroll-derived camera progress cannot leak in from /recon navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timeline driver: 0–15s, deterministic, no random
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
  const captureInstability: CaptureInstabilityState = {
    enabled: !isFinalDiagnosisPhase(timeline.capturePhase),
    elapsedSeconds: timeline.elapsedSeconds,
    phase: timeline.capturePhase,
    progress: timeline.captureProgress,
    pressure: getCapturePressure(timeline.capturePhase, timeline.elapsedSeconds),
  };

  // Final diagnosis: clean black screen, no scene/HUD/timeline competition.
  if (timeline.blackoutActive && isFinalDiagnosisPhase(timeline.capturePhase)) {
    const diagnosisProgress = getPhaseProgress(timeline.capturePhase, timeline.elapsedSeconds);
    const isMachineDiagnosis = timeline.capturePhase === "machine_insufficient";
    const isHumanDiagnosis = timeline.capturePhase === "human_required";
    const diagnosisText =
      isMachineDiagnosis || isHumanDiagnosis
        ? getResolvedDiagnosisText(
            timeline.captureLabel,
            diagnosisProgress,
            timeline.elapsedSeconds,
            isMachineDiagnosis ? 11 : 23,
            isMachineDiagnosis ? 0.78 : 0.62
          )
        : timeline.captureLabel;
    const resolvingDiagnosis = isMachineDiagnosis || isHumanDiagnosis;
    const diagnosisSettled = diagnosisProgress > (isMachineDiagnosis ? 0.82 : 0.68);

    const diagCRTIntensity = getCRTNoiseIntensity(timeline.capturePhase, elapsed);
    const diagTransmissionIntensity = getTransmissionGrainIntensity(timeline.capturePhase, elapsed);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#040b0a] select-none">
        <style>{HUD_INSTABILITY_CSS}</style>
        <CRTInterferenceOverlay
          phase={timeline.capturePhase}
          elapsed={elapsed}
          noiseIntensity={diagCRTIntensity}
        />
        <HorizontalTransmissionGrainLayer
          phase={timeline.capturePhase}
          elapsed={elapsed}
          intensity={diagTransmissionIntensity}
          zIndex={24}
        />
        {diagnosisText && (
          <div
            className="relative px-6 text-center font-mono text-[13px] tracking-[0.24em] text-[#2affef]/75 uppercase md:text-[15px]"
            style={{
              zIndex: 30,
              animation: timeline.capturePhase === "signal_loss" ? "hud-dropout 0.46s linear" : undefined,
            }}
          >
            {resolvingDiagnosis && !diagnosisSettled && (
              <>
                <span
                  className="absolute inset-0 text-[#a879ff]/25"
                  style={{ transform: `translateX(${Math.sin(elapsed * 12) * 2}px)` }}
                  aria-hidden="true"
                >
                  {diagnosisText}
                </span>
                <span
                  className="absolute inset-0 text-[#7dff9b]/15"
                  style={{ transform: `translateX(${Math.cos(elapsed * 15) * -1.5}px)` }}
                  aria-hidden="true"
                >
                  {diagnosisText}
                </span>
              </>
            )}
            <span>{diagnosisText}</span>
          </div>
        )}
      </div>
    );
  }

  // Synthetic meter values (timeline-driven, simple animation)
  const gravimetric = `${Math.round(80 + 8 * timeline.captureProgress)}%`;
  const fieldRes = `${Math.round(70 + 10 * timeline.captureProgress)}%`;
  const phase = timeline.capturePhase;
  const phaseProgress = getPhaseProgress(phase, elapsed);
  const warningActive = phase === "insufficient";
  const pressure = captureInstability.pressure;
  const focusHunt = phase === "aligning" ? (Math.sin(elapsed * 7) + 1) / 2 : 0;
  const resonancePressure =
    phase === "unstable" ? Math.max(0, Math.min(1, (elapsed - 3.5) / 2.3)) : 0;
  const failurePressure = phase === "fail" ? 1 : 0;
  const unresolvedPressure = phase === "insufficient" ? 0.12 - phaseProgress * 0.04 : 0;
  const visualPressure = Math.max(
    0,
    Math.min(phase === "fail" ? 1.28 : 1, pressure + failurePressure * 0.18 + unresolvedPressure)
  );
  const lockSlip = Math.sin(elapsed * 10.7) * visualPressure + Math.sin(elapsed * 17.3) * visualPressure * 0.35;
  const sceneShiftX = lockSlip * (phase === "fail" ? 13 : phase === "unstable" ? 7 : phase === "aligning" ? 2.5 : 1.25);
  const sceneShiftY = Math.cos(elapsed * 8.9) * visualPressure * (phase === "fail" ? 8 : phase === "unstable" ? 3.5 : 1.4);
  const sceneRotate = Math.sin(elapsed * 5.1) * visualPressure * (phase === "fail" ? 1.8 : 0.65);
  const sceneScaleX = 1 + visualPressure * 0.012 + Math.sin(elapsed * 6.4) * visualPressure * 0.006;
  const sceneScaleY = 1 - visualPressure * 0.008 + Math.cos(elapsed * 7.2) * visualPressure * 0.005;
  const sceneBlur =
    phase === "fail"
      ? 4.6
      : phase === "unstable"
        ? 0.85 + resonancePressure * 1.7
        : phase === "aligning"
          ? 0.25 + focusHunt * 0.85 + visualPressure * 0.45
          : phase === "insufficient"
            ? 1.25
            : 0.12 + visualPressure * 0.55;
  const sceneSaturation = Math.max(0.38, 0.9 - visualPressure * 0.24 - failurePressure * 0.12);
  const sceneContrast = 1.05 + visualPressure * 0.22 + failurePressure * 0.28;
  const sceneBrightness =
    phase === "boot"
      ? 0.98
      : phase === "aligning"
        ? 0.96
        : warningActive
          ? 0.72
          : 0.94 - visualPressure * 0.06 + failurePressure * 0.04;
  const ghostOpacity =
    phase === "boot"
      ? 0.035
      : phase === "aligning"
        ? 0.08 + focusHunt * 0.08
        : phase === "unstable"
          ? 0.28 + resonancePressure * 0.24
          : phase === "fail"
            ? 0.78
            : phase === "insufficient"
              ? 0.18
              : 0;
  const acquisitionMaskOpacity =
    phase === "unstable"
      ? 0.32 + resonancePressure * 0.22
      : phase === "fail"
        ? 0.9
        : phase === "aligning"
          ? 0.12 + focusHunt * 0.08
          : phase === "insufficient"
            ? 0.16
            : 0.045;
  const opticalHazeOpacity =
    phase === "boot"
      ? 0.08
      : phase === "aligning"
        ? 0.12 + focusHunt * 0.1
        : phase === "unstable"
          ? 0.28 + resonancePressure * 0.28
          : phase === "fail"
            ? 0.76
            : phase === "insufficient"
              ? 0.18
              : 0.06;
  const opticalBlur =
    phase === "aligning"
      ? 0.55 + focusHunt * 1.45
      : phase === "unstable"
        ? 1.35 + resonancePressure * 2.35
        : phase === "fail"
          ? 5.8
          : phase === "insufficient"
            ? 1.55
            : 0.28;
  const washOpacity =
    phase === "unstable"
      ? 0.28 + resonancePressure * 0.3
      : phase === "fail"
        ? 0.92
        : phase === "aligning"
          ? 0.08 + focusHunt * 0.1
          : phase === "boot"
            ? 0.04
            : phase === "insufficient"
              ? 0.16
              : 0.04;
  const driftOpacity =
    phase === "unstable"
      ? 0.3 + resonancePressure * 0.28
      : phase === "aligning"
        ? 0.1
        : phase === "fail"
          ? 0.7
          : phase === "insufficient"
            ? 0.13
            : 0;
  const scanTearOpacity = phase === "fail" ? 0.92 : phase === "unstable" ? 0.3 + resonancePressure * 0.18 : phase === "insufficient" ? 0.1 : 0;
  const acquisitionBlur =
    phase === "unstable" ? 2.6 + resonancePressure * 2.1 : phase === "fail" ? 6.6 : 0.7 + visualPressure * 1.8;
  const ghostBandBlur =
    phase === "unstable" ? 1.1 + resonancePressure * 1.8 : phase === "fail" ? 5.4 : 0.55 + visualPressure * 1.7;
  const crtNoiseIntensity = getCRTNoiseIntensity(phase, elapsed);
  const transmissionGrainIntensity = getTransmissionGrainIntensity(phase, elapsed);

  // === HUD instability — Pass 5: phase-driven HUD life ===
  const hudLevel = getHudInstabilityLevel(phase, elapsed);
  const isFailPhase = phase === "fail";

  // Pulse/flicker duration decreases as stress rises (shorter = more erratic)
  const hudPulseDur =
    phase === "boot" ? "4.8s" :
    phase === "aligning" ? "3.3s" :
    phase === "unstable" ? "2.1s" :
    phase === "insufficient" ? "3.8s" :
    "6s";
  const hudJitterDur = phase === "unstable" ? "1.2s" : phase === "aligning" ? "2.8s" : "9s";

  // Top HUD panels: dropout for fail, heavy/light flicker for unstable/aligning, ambient pulse otherwise
  const hudTopAnim = isFailPhase
    ? "hud-dropout 0.68s linear"
    : phase === "unstable"
    ? `hud-flicker-heavy ${hudPulseDur} ease-in-out infinite, hud-jitter ${hudJitterDur} linear infinite`
    : phase === "aligning"
    ? `hud-flicker-light ${hudPulseDur} ease-in-out infinite, hud-jitter ${hudJitterDur} linear infinite`
    : `hud-ambient-pulse ${hudPulseDur} ease-in-out infinite`;

  // Bottom panel: slightly delayed relative to top for organic non-sync
  const hudBottomAnim = isFailPhase
    ? "hud-dropout 0.68s 0.09s linear"
    : phase === "unstable"
    ? `hud-flicker-heavy ${hudPulseDur} 0.44s ease-in-out infinite, hud-jitter ${hudJitterDur} 0.22s linear infinite`
    : phase === "aligning"
    ? `hud-flicker-light ${hudPulseDur} 0.6s ease-in-out infinite`
    : `hud-ambient-pulse ${hudPulseDur} 1.5s ease-in-out infinite`;

  // Frame lines / brackets: breathe at phase-matched rate
  const hudFrameAnim = isFailPhase
    ? "hud-border-breathe 0.32s ease-in-out infinite"
    : phase === "unstable"
    ? `hud-border-breathe ${hudPulseDur} 0.9s ease-in-out infinite`
    : phase === "insufficient"
    ? "hud-border-breathe 3.5s ease-in-out infinite"
    : `hud-border-breathe ${phase === "aligning" ? "4.2s" : "7s"} ease-in-out infinite`;

  // Main label glow oscillates deterministically via elapsed (no extra keyframe needed)
  const hudLabelShadow = `0 0 ${(7 + Math.sin(elapsed * (isFailPhase ? 18 : phase === "unstable" ? 8.5 : 3.2)) * hudLevel * 10).toFixed(1)}px rgba(42,255,239,${(0.18 + hudLevel * 0.32).toFixed(2)})`;

  // Secondary microcopy dims proportionally to stress
  const microOpacity = isFailPhase ? 0.42 : phase === "unstable" ? 0.54 : phase === "aligning" ? 0.60 : phase === "insufficient" ? 0.58 : 0.65;

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
        <style>{HUD_INSTABILITY_CSS}</style>
        {/* Real RECON scene, forced mobile mode */}
        <div
          className="absolute inset-0 z-0"
          style={{
            filter: `blur(${sceneBlur}px) saturate(${warningActive ? sceneSaturation * 0.68 : sceneSaturation}) contrast(${warningActive ? sceneContrast * 0.9 : sceneContrast}) brightness(${sceneBrightness}) hue-rotate(${warningActive ? -18 : 0}deg)`,
            transform: `translate3d(${sceneShiftX}px, ${sceneShiftY}px, 0) rotate(${sceneRotate}deg) scale(${sceneScaleX}, ${sceneScaleY})`,
            transformOrigin: "50% 48%",
          }}
        >
          <ReconShell bypassInit captureInstability={captureInstability}>
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
        <div className="pointer-events-none absolute inset-0 z-20" style={{background:'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, #040b0a 100%)',opacity:0.32}} />
        <div className="pointer-events-none absolute inset-0 z-20" style={{backdropFilter:'blur(1.6px)',WebkitBackdropFilter:'blur(1.6px)',opacity:0.12}} />

        {/* Capture-only optical instability: sensor interpretation layers, not scene/model changes. */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 38% 34% at 50% 48%, transparent 0 34%, rgba(2,188,126,0.24) 42%, rgba(42,255,239,0.08) 52%, transparent 68%)",
              filter: `blur(${acquisitionBlur}px)`,
              opacity: acquisitionMaskOpacity,
              transform: `translate3d(${Math.sin(elapsed * 4.8) * visualPressure * 7}px, ${Math.cos(elapsed * 3.7) * visualPressure * 5}px, 0) scale(${1 + visualPressure * 0.055})`,
              mixBlendMode: phase === "fail" ? "screen" : "plus-lighter",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${ghostBandBlur}px) contrast(${1 + visualPressure * 0.35}) saturate(${0.75 + failurePressure * 0.75})`,
              WebkitBackdropFilter: `blur(${ghostBandBlur}px) contrast(${1 + visualPressure * 0.35}) saturate(${0.75 + failurePressure * 0.75})`,
              clipPath: `polygon(0 ${20 + Math.sin(elapsed * 5.5) * 8}%, 100% ${17 + Math.sin(elapsed * 5.5) * 8}%, 100% ${37 + Math.cos(elapsed * 4.1) * 7}%, 0 ${42 + Math.cos(elapsed * 4.1) * 7}%)`,
              opacity: ghostOpacity,
              transform: `translate3d(${Math.sin(elapsed * 11.4) * visualPressure * 14}px, ${Math.cos(elapsed * 8.8) * visualPressure * 8}px, 0)`,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${Math.max(0.45, ghostBandBlur * 0.82)}px) invert(${failurePressure * 0.08}) hue-rotate(${Math.sin(elapsed * 8) * visualPressure * 14}deg)`,
              WebkitBackdropFilter: `blur(${Math.max(0.45, ghostBandBlur * 0.82)}px) invert(${failurePressure * 0.08}) hue-rotate(${Math.sin(elapsed * 8) * visualPressure * 14}deg)`,
              clipPath: `polygon(0 ${58 + Math.cos(elapsed * 6.3) * 9}%, 100% ${54 + Math.sin(elapsed * 7.1) * 7}%, 100% ${76 + Math.sin(elapsed * 5.7) * 5}%, 0 ${72 + Math.cos(elapsed * 4.9) * 6}%)`,
              opacity: ghostOpacity * 0.58,
              transform: `translate3d(${Math.cos(elapsed * 12.2) * visualPressure * -12}px, ${Math.sin(elapsed * 9.5) * visualPressure * 7}px, 0)`,
              mixBlendMode: phase === "fail" ? "difference" : "soft-light",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(42,255,239,0.32), rgba(0,172,108,0.14) 38%, rgba(1,8,7,0.18) 58%, transparent 74%)",
              opacity: washOpacity,
              mixBlendMode: phase === "fail" ? "screen" : "soft-light",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${opticalBlur}px) saturate(${0.55 + resonancePressure * 0.75 + failurePressure * 1.4}) contrast(${0.82 + visualPressure * 0.2})`,
              WebkitBackdropFilter: `blur(${opticalBlur}px) saturate(${0.55 + resonancePressure * 0.75 + failurePressure * 1.4}) contrast(${0.82 + visualPressure * 0.2})`,
              opacity: opticalHazeOpacity,
            }}
          />
          <div
            className="absolute -inset-x-8 top-1/2 h-24 -translate-y-1/2 rotate-[-2deg]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(42,255,239,0.28), rgba(0,172,108,0.18), rgba(2,188,126,0.08), transparent)",
              opacity: driftOpacity,
              transform: `translate3d(${Math.sin(elapsed * 2.4) * (8 + visualPressure * 18)}px, ${Math.sin(elapsed * 3.1) * (8 + visualPressure * 14)}px, 0) rotate(${-2 + Math.sin(elapsed * 4.7) * visualPressure * 4}deg) scaleY(${1 + visualPressure * 0.45})`,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(178deg, transparent 0 14px, rgba(42,255,239,0.16) 15px 16px, rgba(255,255,255,0.06) 17px 18px, transparent 19px 34px)",
              opacity: phase === "unstable" ? 0.28 : phase === "aligning" ? 0.1 : phase === "fail" ? 0.5 : phase === "insufficient" ? 0.14 : 0.045,
              transform: `translateY(${Math.sin(elapsed * 8) * (2 + visualPressure * 8)}px) skewY(${Math.sin(elapsed * 6.1) * visualPressure * 1.1}deg)`,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute left-0 right-0 h-[18vh]"
            style={{
              top: `${34 + Math.sin(elapsed * 18) * (12 + visualPressure * 9)}%`,
              background:
                "linear-gradient(180deg, transparent, rgba(202,255,239,0.46), rgba(42,255,239,0.25), rgba(0,172,108,0.12), transparent)",
              opacity: scanTearOpacity,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute left-[-8%] right-[-8%] top-[40%] h-[34vh]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(42,255,239,0.08), transparent 18%, rgba(0,172,108,0.12) 24%, transparent 42%, rgba(202,255,239,0.1) 58%, transparent)",
              opacity: phase === "fail" ? 0.75 : phase === "unstable" ? 0.26 + resonancePressure * 0.24 : phase === "aligning" ? 0.08 : 0.06,
              transform: `translate3d(${Math.sin(elapsed * 15.2) * visualPressure * 24}px, ${Math.cos(elapsed * 7.4) * visualPressure * 9}px, 0) rotate(${Math.sin(elapsed * 3.9) * 2.5}deg)`,
              filter: `blur(${0.65 + visualPressure * 3}px)`,
              mixBlendMode: "plus-lighter",
            }}
          />
        </div>

        {/* CRT noise + signal interference layers (z-23) */}
        <CRTInterferenceOverlay phase={phase} elapsed={elapsed} noiseIntensity={crtNoiseIntensity} />

        {/* Horizontal transmission grain (z-24): acquisition layer between scene and HUD. */}
        <HorizontalTransmissionGrainLayer
          phase={phase}
          elapsed={elapsed}
          intensity={transmissionGrainIntensity}
        />

        {(phase === "unstable" || phase === "fail") && (
          <div className="pointer-events-none absolute left-1/2 top-[24%] z-30 -translate-x-1/2 font-mono text-[8px] tracking-[0.2em] text-[#2affef] opacity-45">
            {phase === "fail" ? "SENSOR SATURATION: CRITICAL" : "Z-AXIS GEOMETRY: UNRESOLVED"}
          </div>
        )}

        {/* Capture-only HUD overlay (z-30) */}
        <div
          className="pointer-events-none absolute inset-0 z-30 select-none"
          style={
            warningActive
              ? {
                  filter: "brightness(0.72) saturate(0.78) blur(0.25px) hue-rotate(-22deg)",
                  opacity: 0.82,
                }
              : undefined
          }
        >
          {/* Frame lines pulsed by border-breathe — wrapper carries animation, inner geometry unchanged */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ animation: hudFrameAnim }}
            aria-hidden="true"
          >
            <CaptureFrameLines />
          </div>

          <div className="absolute inset-x-4 top-4 flex flex-col items-center gap-2" style={{ animation: hudTopAnim }}>
            <CaptureHudPanel className="w-full max-w-[22rem]">
              <div className="text-center font-mono uppercase text-[#2affef]">
                <div className="text-[11px] tracking-[0.24em] opacity-90" style={{ textShadow: hudLabelShadow }}>DEEP_SPACE_RECON</div>
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

          <div className="absolute inset-x-4 bottom-4 flex justify-center" style={{ animation: hudBottomAnim }}>
            <CaptureHudPanel className="w-full max-w-[22rem]">
              <div className="flex flex-col items-center gap-1 font-mono text-[#2affef] uppercase">
                <span className="text-[10px] tracking-[0.2em] opacity-85">LOG_000 // DORMANT</span>
                <span className="text-[8px] tracking-[0.18em]" style={{ opacity: microOpacity }}>ORIGIN VECTOR: TOKEN-LOCKED</span>
                <span className="text-[8px] tracking-[0.18em]" style={{ opacity: microOpacity }}>SIGNAL TRACE: PARTIAL</span>
              </div>
            </CaptureHudPanel>
          </div>
        </div>

        {/* Capture phase readout: diagnostic HUD module, not subtitle copy. */}
        <PhaseDiagnosticReadout
          phase={phase}
          label={timeline.captureLabel}
          subline={timeline.captureSubline}
        />

        {warningActive && (
          <>
            <PurpleWarningOverlay elapsed={elapsed} />
            <PurpleWarningMessage />
          </>
        )}

        {/* Blackout/glitch overlay (z-40) */}
        {timeline.glitchActive && (
          <div className="absolute inset-0 z-40 bg-[#05070A] opacity-80 animate-pulse" style={{ mixBlendMode: 'screen' }} />
        )}
        {timeline.glitchActive && (
          <div
            className="pointer-events-none absolute inset-0 z-40"
            style={{
              background:
                "radial-gradient(ellipse 44% 36% at 50% 48%, rgba(255,255,255,0.22), rgba(42,255,239,0.32) 22%, rgba(0,0,0,0.62) 58%, #05070A 100%)",
              opacity: 0.78,
              mixBlendMode: "screen",
            }}
          />
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
