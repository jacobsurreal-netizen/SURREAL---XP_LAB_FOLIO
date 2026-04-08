"use client"

import { useEffect, useRef } from "react"
import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

export type SpectrumMode = "COLOR" | "IR" | "SCAN"

const SPECTRUM_SHIFT_STATE = "SPECTRUM_SHIFT" as const
const SPECTRUM_SHIFT_MS = 120
const SPECTRUM_SETTLE_MS = 210

export function useSpectrum() {
  const snap = useEngineSnapshot()
  const spectrum = (snap.spectrum as SpectrumMode | undefined) ?? "COLOR"
  const systemState = (snap.systemState as string | undefined) ?? "IDLE"
  const timeoutsRef = useRef<number[]>([])

  const clearTransitionTimers = () => {
    for (const timeoutId of timeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearTransitionTimers()
  }, [])

  const setSpectrum = (next: SpectrumMode) => {
    if (next === spectrum) return

    clearTransitionTimers()

    const isColorIrHop =
      (spectrum === "COLOR" && next === "IR") ||
      (spectrum === "IR" && next === "COLOR")

    if (!isColorIrHop) {
      engine.dispatch("COMMAND/SET_SPECTRUM", next)
      return
    }

    const restoreState =
      systemState === SPECTRUM_SHIFT_STATE ? "IDLE" : systemState

    engine.dispatch("COMMAND/SET_STATE", SPECTRUM_SHIFT_STATE)

    timeoutsRef.current.push(
      window.setTimeout(() => {
        engine.dispatch("COMMAND/SET_SPECTRUM", next)
      }, SPECTRUM_SHIFT_MS)
    )

    timeoutsRef.current.push(
      window.setTimeout(() => {
        engine.dispatch("COMMAND/SET_STATE", restoreState)
      }, SPECTRUM_SETTLE_MS)
    )
  }

  return {
    spectrum,
    isSpectrumTransitioning: systemState === SPECTRUM_SHIFT_STATE,
    setSpectrum,
    toggleSpectrum: () =>
      setSpectrum(spectrum === "COLOR" ? "IR" : "COLOR"),
  }
}
