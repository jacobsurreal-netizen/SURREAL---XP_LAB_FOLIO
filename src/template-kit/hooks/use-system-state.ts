"use client"

import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

export type SystemState = "INIT" | "IDLE" | "SCAN" | "FOCUS" | "CTA" | "PORTAL_READY"

export function useSystemState() {
  const snap = useEngineSnapshot()
  const systemState = snap.systemState as SystemState

  return {
    systemState,
    setSystemState: (next: SystemState) => engine.dispatch("COMMAND/SET_STATE", next),
  }
}
