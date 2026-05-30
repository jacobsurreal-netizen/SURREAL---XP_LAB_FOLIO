"use client"

import { WorldLayer } from "@/components/world-layer"
import { ThreeRuntimeAdapter } from "@/src/scene/three-adapter"
import { SoundLayer } from "@/components/sound-layer"
import { ReconHUD } from "./recon-hud"
import { ReconInitOverlay } from "./recon-init-overlay"
import { useReconTelemetry } from "./use-recon-telemetry"
import { ReconOpticalOverlay } from "./recon-optical-overlay"
import { useReconInitSequence } from "./use-recon-init-sequence"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useSmoothedProgress } from "@/hooks/use-smoothed-progress"

interface ReconShellProps {
  children: React.ReactNode;
  bypassInit?: boolean;
  captureInstability?: CaptureInstabilityState;
  reverseCameraProgress?: boolean;
}

type CaptureInstabilityState = {
  enabled: boolean;
  elapsedSeconds: number;
  phase: string;
  progress: number;
  pressure: number;
};

export function ReconShell({ children, bypassInit = false, captureInstability, reverseCameraProgress = false }: ReconShellProps) {
  const { initPhase, bootStep, startBoot } = useReconInitSequence();
  const initPhaseRef = useRef(initPhase);
  initPhaseRef.current = initPhase;

  const hudContainerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const smoothedProgress = useSmoothedProgress(progress, {
    lerpFactor: 0.015,
    epsilon: 0.0005,
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // If bypassInit, always allow scroll/progress
          if (!bypassInit && initPhaseRef.current !== "ready") {
            ticking = false;
            return;
          }
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const newProgress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0;
          setProgress(newProgress);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bypassInit]);

  // ── Pointer parallax ───────────────────────────────────────────────────────
  // Writes normalized pointer position (-1..1) into CSS custom properties on the
  // HUD container via rAF (no React re-render). HUD layers consume these as
  // --recon-parallax-x / --recon-parallax-y. Mouse-only, desktop-only, and fully
  // disabled under prefers-reduced-motion; touch falls back to the 0 default.
  useEffect(() => {
    if (!mounted || isMobile) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = hudContainerRef.current;
    if (!el) return;

    let raf = 0;
    let nx = 0;
    let ny = 0;
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      nx = Math.max(-1, Math.min(1, (event.clientX / w) * 2 - 1));
      ny = Math.max(-1, Math.min(1, (event.clientY / h) * 2 - 1));
      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--recon-parallax-x", nx.toFixed(3));
          el.style.setProperty("--recon-parallax-y", ny.toFixed(3));
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (raf) cancelAnimationFrame(raf);
      el.style.setProperty("--recon-parallax-x", "0");
      el.style.setProperty("--recon-parallax-y", "0");
    };
  }, [mounted, isMobile]);

  // Desktop/mobile sector logic
  const mode = "COLOR";
  let sectorIndex = 0;
  if (progress >= 0.333 && progress < 0.666) sectorIndex = 1;
  if (progress >= 0.666) sectorIndex = 2;
  const SECTOR_NAMES = ["OBSERVATION", "ANALYSIS", "GATEWAY"];
  const sectorName = SECTOR_NAMES[sectorIndex];

  // Camera-only progress. When reversed, the artifact starts distant/foggy and
  // is pulled closer/more revealed while scrolling. UI/telemetry/sector mapping
  // intentionally keep the normal progress so OBSERVATION → ANALYSIS → GATEWAY
  // is unaffected.
  const cameraProgress = reverseCameraProgress ? 1 - smoothedProgress : smoothedProgress;

  const telemetry = useReconTelemetry({ sectorIndex, sectorName, progress });

  // If not bypassing INIT, show INIT overlay until ready
  const showInit = !bypassInit && initPhase !== "ready";

  return (
    <>
      <div
        ref={hudContainerRef}
        className="fixed inset-0 z-30 w-screen h-screen overflow-hidden bg-black pointer-events-none"
        style={{ "--recon-parallax-x": 0, "--recon-parallax-y": 0 } as CSSProperties}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={smoothedProgress} sector={sectorName} mode={mode} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeRuntimeAdapter
            progress={cameraProgress}
            captureInstability={captureInstability}
            snapshot={{
              scrollProgress: cameraProgress,
              sectorIndex,
              sectorName,
              isSnapped: true,
              spectrumMode: mode,
            }}
          />
        </div>
        <ReconOpticalOverlay />
        {!showInit && (
          <ReconHUD
            sectorIndex={sectorIndex}
            isMobile={isMobile}
            sectorName={sectorName}
            progress={progress}
            telemetry={telemetry}
          />
        )}
        {showInit && (
          <ReconInitOverlay phase={initPhase} bootStep={bootStep} onInitialize={startBoot} />
        )}
        <SoundLayer />
      </div>
      <div className="relative z-0 w-full overflow-x-hidden min-h-screen pointer-events-none">
        {children}
      </div>
    </>
  )
}
