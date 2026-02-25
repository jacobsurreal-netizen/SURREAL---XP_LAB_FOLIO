"use client"

import { WorldLayer } from "./world-layer"
import { HUDLayer } from "./hud-layer"
import { useOrbitSector } from "@/hooks/use-orbit-sector"
import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { useHudInactivity } from "@/hooks/use-hud-inactivity"
import { useLanguage } from "@/hooks/use-language"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"

export function SystemShell() {
  const { progress, sectorIndex, sectorName, goToSector } = useOrbitSector()
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
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0">
        <WorldLayer progress={progress} sector={sectorName} />

        {/* IR overlay tint -- GPU-friendly single div */}
        {mode === "IR" && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
            style={{ background: "var(--world-tint)" }}
          />
        )}

        <div
          className="absolute inset-0 z-30 transition-opacity duration-700 ease-in-out"
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

          {/* Center debug sector label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="flex flex-col items-center gap-4">
              <span
                className="font-heading text-[clamp(3rem,10vw,8rem)] font-bold leading-none tracking-[0.2em] select-none motion-reduce:animate-none"
                style={{ color: "var(--hud-accent-dim)" }}
                data-text={sectorName}
              >
                {sectorName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ScrollTrack - invisible 400vh timeline driver */}
      <div className="relative z-10 w-full" style={{ height: "400vh" }} aria-hidden="true" />
    </>
  )
}
