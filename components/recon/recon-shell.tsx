"use client"

import { WorldLayer } from "@/components/world-layer"
import { ThreeRuntimeAdapter } from "@/src/scene/three-adapter"

interface ReconShellProps {
  children: React.ReactNode
}

export function ReconShell({ children }: ReconShellProps) {
  // Hardcoded initial state for the first safe step
  const mode = "COLOR"
  const sectorIndex = 0
  const sectorName = "OBSERVATION DECK"
  const progress = 0

  return (
    <>
      {/* Fixed full-viewport shell */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0 bg-black">
        {/* Layer 0: World Foundation */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={progress} sector={sectorName} mode={mode} />
        </div>

        {/* Layer 10: Three Stage */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeRuntimeAdapter
            progress={progress}
            snapshot={{
              scrollProgress: progress,
              sectorIndex,
              sectorName,
              isSnapped: true,
              spectrumMode: mode,
            }}
          />
        </div>

        {/* Layer 30: Simple Placeholder HUD */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span
              className="font-heading text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-[0.2em] select-none opacity-20"
              style={{ color: "var(--hud-accent-dim, rgba(160, 130, 210, 0.55))" }}
            >
              [ RECON MODE ]
            </span>
            <span
              className="font-heading text-[clamp(1.5rem,4vw,3rem)] font-bold leading-none tracking-[0.2em] select-none opacity-40"
              style={{ color: "var(--hud-accent, rgba(180, 120, 255, 0.95))" }}
            >
              [ {sectorName} ]
            </span>
            <span
              className="font-mono text-sm tracking-[0.2em] select-none opacity-50 mt-8"
              style={{ color: "var(--hud-text, rgba(205, 170, 255, 0.82))" }}
            >
              [ SCROLL FLOW PENDING ]
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Content (pending actual flow) */}
      <div className="relative z-[100] w-full overflow-x-hidden min-h-screen">
        {children}
      </div>
    </>
  )
}
