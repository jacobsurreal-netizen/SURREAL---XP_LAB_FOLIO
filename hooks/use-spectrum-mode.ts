"use client"

import { useSyncExternalStore } from "react"
import { useSpectrum as useEngineSpectrum } from "@/src/template-kit/hooks"

export type SpectrumMode = "COLOR" | "IR" | "SCAN"

export type SpectrumModeUpdater =
  | SpectrumMode
  | ((prev: SpectrumMode) => SpectrumMode)

// -----------------------------
// Shared app-level SCAN override
// -----------------------------
let scanOverride = false
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getScanOverrideSnapshot() {
  return scanOverride
}

function getScanOverrideServerSnapshot() {
  return false
}

function setScanOverride(next: boolean) {
  if (scanOverride === next) return
  scanOverride = next
  emitChange()
}

/**
 * App-friendly wrapper around the template-kit engine spectrum hook.
 *
 * Important:
 * - Engine remains COLOR / IR only
 * - App layer may expose SCAN as shared global override
 */
export function useSpectrumMode() {
  const { spectrum, setSpectrum, toggleSpectrum } = useEngineSpectrum()

  const engineMode = ((spectrum as "COLOR" | "IR") ?? "COLOR")

  const isScan = useSyncExternalStore(
    subscribe,
    getScanOverrideSnapshot,
    getScanOverrideServerSnapshot
  )

  const mode: SpectrumMode = isScan ? "SCAN" : engineMode

  const setMode = (next: SpectrumModeUpdater) => {
    const resolved =
      typeof next === "function" ? next(mode) : next

    if (resolved === "SCAN") {
      setScanOverride(true)
      // engine-safe fallback
      setSpectrum("IR")
      return
    }

    setScanOverride(false)
    setSpectrum(resolved)
  }

  const toggle = () => {
    // Regular UI toggle keeps classic COLOR / IR behavior.
    // If SCAN is active, toggle exits SCAN back to COLOR.
    if (isScan) {
      setScanOverride(false)
      setSpectrum("COLOR")
      return
    }

    toggleSpectrum()
  }

  return {
    mode,
    setMode,
    toggle,
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