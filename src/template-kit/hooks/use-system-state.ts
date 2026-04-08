"use client"

import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

export type SystemState =
  | "INIT"
  | "IDLE"
  | "SCAN"
  | "FOCUS"
  | "CTA"
  | "PORTAL_READY"
  | "SPECTRUM_SHIFT"

export function useSystemState() {
  const snap = useEngineSnapshot()
  const systemState = (snap.systemState as SystemState | undefined) ?? "IDLE"

  return {
    systemState,
    isSpectrumTransitioning: systemState === "SPECTRUM_SHIFT",
    setSystemState: (next: SystemState) =>
      engine.dispatch("COMMAND/SET_STATE", next),
  }
}
