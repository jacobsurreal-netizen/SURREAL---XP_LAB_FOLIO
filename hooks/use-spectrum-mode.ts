"use client"

import { useSpectrum as useEngineSpectrum } from "@/src/template-kit/hooks"

export type SpectrumMode = "COLOR" | "IR" | "SCAN"

export type SpectrumModeUpdater =
  | SpectrumMode
  | ((prev: SpectrumMode) => SpectrumMode)

/**
 * App-friendly wrapper around the template-kit engine spectrum hook.
 * Matches SystemShell expectations: { mode, toggle, setMode }.
 */
export function useSpectrumMode() {
  const { spectrum, setSpectrum, toggleSpectrum } = useEngineSpectrum()
  const mode = ((spectrum as SpectrumMode) ?? "COLOR")

  return {
    mode,
    setMode: (next: SpectrumModeUpdater) => {
       const resolved =
    typeof next === "function" ? next(mode) : next

  // ❗ ENGINE SAFE GUARD
  const engineMode = resolved === "SCAN" ? "IR" : resolved

  setSpectrum(engineMode)
    },
    toggle: toggleSpectrum,
  }
}

/**
 * Back-compat alias (older shape).
 */
export function useSpectrumModeLegacy() {
  const { mode, setMode, toggle } = useSpectrumMode()

  return {
    spectrumMode: mode,
    setSpectrumMode: setMode,
    toggleSpectrumMode: toggle,
  }
}