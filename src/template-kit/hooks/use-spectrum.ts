"use client"

import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

export type SpectrumMode = "COLOR" | "IR"

export function useSpectrum() {
  const snap = useEngineSnapshot()
  const spectrum = snap.spectrum as SpectrumMode

  return {
    spectrum,
    setSpectrum: (next: SpectrumMode) => engine.dispatch("COMMAND/SET_SPECTRUM", next),
    toggleSpectrum: () => engine.dispatch("COMMAND/SET_SPECTRUM", spectrum === "COLOR" ? "IR" : "COLOR"),
  }
}
