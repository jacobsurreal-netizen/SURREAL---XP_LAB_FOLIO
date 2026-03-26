"use client"

import React, { useEffect } from "react"
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

  const { mode, setMode, toggle: toggleSpectrum } = useSpectrumMode()

  const hudOpacity = useHudInactivity(sectorIndex)
  const { lang, cycle: cycleLang, t } = useLanguage()

  useKeyboardControls({
    goToSector,
    sectorIndex,
    toggleSpectrum,
    cycleLang,
  })

  // 🔥 DEV: SCAN toggle on "S"
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "s") {
        setMode((prev: any) => (prev === "SCAN" ? "COLOR" : "SCAN"))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setMode])

  return (
    <>
      {/* Fixed full-viewport shell */}
      <div
  className="fixed inset-0 w-screen h-screen overflow-hidden z-0 bg-black"
  style={
    mode === "SCAN"
      ? {
          ["--hud-accent" as any]: "rgba(180, 120, 255, 0.95)",
          ["--hud-accent-dim" as any]: "rgba(120, 70, 180, 0.22)",
          ["--hud-ink" as any]: "rgba(225, 190, 255, 0.96)",
          ["--hud-text" as any]: "rgba(205, 170, 255, 0.82)",
          ["--hud-text-dim" as any]: "rgba(160, 130, 210, 0.55)",
          ["--hud-glow" as any]: "rgba(190, 130, 255, 0.65)",
          ["--hud-grid" as any]: "rgba(170, 120, 255, 0.08)",
          ["--world-radial" as any]: "rgba(120, 40, 220, 0.22)",
          ["--world-tint" as any]: "rgba(35, 0, 70, 0.45)",
        }
      : undefined
  }
>

        {/* Layer 0: World Foundation */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={smoothedProgress} sector={sectorName} mode={mode} />
        </div>

        {/* Layer 10: Three Stage */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeRuntimeAdapter
            progress={smoothedProgress}
            snapshot={{
              scrollProgress: smoothedProgress,
              sectorIndex,
              sectorName,
              isSnapped,
               spectrumMode: mode,
            }}
          />
          <CameraDebugHUD />
        </div>

        {/* Layer 20: IR overlay */}
        {mode === "IR" && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
            style={{ background: "var(--world-tint)" }}
          />
        )}

        {/* 🔥 Layer 20: SCAN overlay */}
        {mode === "SCAN" && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* vignette + blur */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.42) 100%)",
                backdropFilter: "blur(2px)",
              }}
            />

            {/* scanlines */}
            <div
              className="absolute inset-0 mix-blend-screen"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 2px, transparent 4px)",
              }}
            />
          </div>
        )}

        {/* Layer 30: HUD */}
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

          {/* Debug sector label */}
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

      {/* Scrollable Content */}
      <div
        className="relative z-[100] w-full overflow-x-hidden"
        style={{ minHeight: "600vh" }}
      >
        {children}
      </div>
    </>
  )
}