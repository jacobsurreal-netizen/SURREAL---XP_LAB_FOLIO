"use client"

import React from "react"
import { WorldLayer } from "./world-layer"
import { HUDLayer } from "./hud-layer"
import { useOrbitSector } from "@/hooks/use-orbit-sector"
import { useSmoothedProgress } from "@/hooks/use-smoothed-progress"
import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { useHudInactivity } from "@/hooks/use-hud-inactivity"
import { useLanguage } from "@/hooks/use-language"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"
import { ThreeRuntimeAdapter } from "@/src/scene/three-adapter"
import { CameraDebugHUD } from "@/src/scene/camera/camera-debug-hud"

interface SystemShellProps {
  children: React.ReactNode
}

export function SystemShell({ children }: SystemShellProps) {
  const { progress, sectorIndex, sectorName, isSnapped, goToSector } = useOrbitSector()
  const smoothedProgress = useSmoothedProgress(progress, {
    lerpFactor: 0.015,
    epsilon: 0.0005,
  })

  const { mode, toggle: toggleSpectrum } = useSpectrumMode()
  const hudOpacity = useHudInactivity(sectorIndex)
  const { lang, cycle: cycleLang, t } = useLanguage()

  useKeyboardControls({
    goToSector,
    sectorIndex,
    toggleSpectrum,
    cycleLang,
  })

  return (
    <>
      {/* Fixed full-viewport shell */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0 bg-black">
        {/* Layer 0: World Foundation (Atmospheric Overlays) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={smoothedProgress} sector={sectorName} />
        </div>

        {/* Layer 10: Pinned Three Stage (Artifact) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeRuntimeAdapter
            progress={smoothedProgress}
            snapshot={{
              scrollProgress: smoothedProgress,
              sectorIndex,
              sectorName,
              isSnapped,
            }}
          />
          <CameraDebugHUD />
        </div>

        {/* Layer 20: IR overlay tint */}
        {mode === "IR" && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
            style={{ background: "var(--world-tint)" }}
          />
        )}

        {/* Layer 30+: HUD & Interface */}
        <div
          className="absolute inset-0 z-30 transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{ opacity: hudOpacity }}
        >
          <HUDLayer
            progress={progress}
            sector={sectorName}
            sectorIndex={sectorIndex}
            goToSector={goToSector}
            spectrumMode={mode}
            onToggleSpectrum={toggleSpectrum}
            lang={lang}
            onCycleLang={cycleLang}
            t={t}
          />

          {/* Center debug sector label (Layer 40) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="flex flex-col items-center gap-4">
              <span
                className="font-heading text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-[0.2em] select-none opacity-20"
                style={{ color: "var(--hud-accent-dim)" }}
                data-text={sectorName}
              >
                {sectorName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Slot */}
      <div
  className="relative z-[100] w-full overflow-x-hidden"
  style={{ minHeight: "600vh" }}
>
  {children}
</div>
    </>
  )
}