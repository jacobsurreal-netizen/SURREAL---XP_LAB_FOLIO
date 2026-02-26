
"use client"

import { useSyncExternalStore } from "react"
import { engine } from "@/src/template-kit/engine"

// Stable server snapshot for hydration (client component still needs it).
// Keep it as a constant reference.
const SERVER_SNAPSHOT = {
  systemState: "INIT",
  sectorIndex: 0,
  sectorName: "HERO",
  scrollProgress: 0,
  isSnapped: true,
  spectrum: "COLOR",
  language: "EN",
} as const

export function useEngineSnapshot() {
  return useSyncExternalStore(
    (onStoreChange) => engine.subscribe(onStoreChange),
    () => engine.getSnapshot(),
    () => SERVER_SNAPSHOT as any
  )
}