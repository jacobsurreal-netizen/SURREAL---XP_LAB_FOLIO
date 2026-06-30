"use client"

import { useEffect, useState } from "react"
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
import { HudSkeleton } from "@/src/hud/hud-skeleton"
import { SdiOverlay } from "@/src/sdi/sdi-overlay"
import { useSound } from "@/src/template-kit/hooks"
import { engine } from "@/src/template-kit/engine/core"
import { audioRuntime } from "@/src/sound/audio-runtime"
import { SoundLayer } from "./sound-layer"

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

  const [scanTransition, setScanTransition] = useState(false)

  const hudOpacity = useHudInactivity(sectorIndex)
  const { lang, cycle: cycleLang, t } = useLanguage()
  const { soundEnabled } = useSound()
  const onToggleSound = () => {
    audioRuntime.prepareFromUserGesture()
    engine.dispatch("COMMAND/TOGGLE_SOUND")
  }

  useKeyboardControls({
    goToSector,
    sectorIndex,
    toggleSpectrum,
    cycleLang,
    toggleSound: onToggleSound,
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

  useEffect(() => {
    if (mode === "SCAN") {
      setScanTransition(false)
      return
    }
    setScanTransition(true)
    const timeout = window.setTimeout(() => {
      setScanTransition(false)
    }, 520)

    return () => window.clearTimeout(timeout)
  }, [mode])

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
              }
            : undefined
        }
      />

      {/* Layer 0: World Foundation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <WorldLayer progress={smoothedProgress} sector={sectorName} mode={mode} />
      </div>

      {/* Layer 10: Three Stage */}
      <div className="fixed inset-0 z-10 pointer-events-none">
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
          className="fixed inset-0 pointer-events-none z-20 mix-blend-multiply"
          style={{ background: "var(--world-tint)" }}
        />
      )}

      {/* 🔥 Layer 20: SCAN overlay */}
      {mode === "SCAN" && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {/* vignette + blur */}
          <div
            className="fixed inset-0 transition-all duration-500 ease-out"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, rgba(18,0,36,0.18) 40%, rgba(0,0,0,0.5) 100%)",
              backdropFilter: scanTransition ? "blur(4px)" : "blur(2px)",
              opacity: scanTransition ? 1 : 0.88,
            }}
          />

          {/* scan lines */}
          <div
            className="absolute inset-0 mix-blend-screen transition-opacity duration-500"
            style={{
              opacity: scanTransition ? 0.68 : 0.34,
              background:
                "repeating-linear-gradient(to bottom, rgba(215,170,255,0.025) 0px, rgba(215,170,255,0.025) 1px, transparent 2px, transparent 4px)",
            }}
          />

          {/* sweep flash */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: scanTransition ? 0.22 : 0,
              background:
                "linear-gradient(90deg, transparent, rgba(220,180,255,0.12), transparent)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}

      {/* Layer 30: HUD */}
      <div
        className="fixed inset-0 z-30 transition-opacity duration-700 ease-in-out pointer-events-none"
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
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
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

      {/* Layer 35: HUD runtime bridge — temporary during migration */}
      <HudSkeleton mode={mode} />
      {/* Layer 90: SDI debug overlay */}
      <SdiOverlay />
      <SoundLayer />
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