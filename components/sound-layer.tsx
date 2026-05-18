// SoundLayer: Non-visual sound state integration (M2A Skeleton)
// Reads engine snapshot for soundEnabled and state.

import { useEffect, useRef, useMemo } from "react"
import { useEngineSnapshot } from "@/src/template-kit/hooks"
import type { SoundProfile, SystemState, SpectrumMode } from "@/src/template-kit/engine/types"

// M2A: Define SoundCueId values
export type SoundCueId =
  | "AMBIENCE_VOID"
  | "AMBIENCE_EXPLORATION"
  | "AMBIENCE_CTA"
  | "AMBIENCE_IR"
  | "UI_TOGGLE"

// M2A: Define a SoundCueRegistry with mock asset paths
export const SoundCueRegistry: Record<SoundCueId, string> = {
  AMBIENCE_VOID: "/audio/void.ogg",
  AMBIENCE_EXPLORATION: "/audio/exploration.ogg",
  AMBIENCE_CTA: "/audio/cta.ogg",
  AMBIENCE_IR: "/audio/ir.ogg",
  UI_TOGGLE: "/audio/ui-toggle.ogg",
}

// M2A: Map existing SoundProfile values to ambience cue ids
const profileToCueMap: Record<SoundProfile, SoundCueId> = {
  VOID_PROFILE: "AMBIENCE_VOID",
  EXPLORATION_PROFILE: "AMBIENCE_EXPLORATION",
  CTA_PROFILE: "AMBIENCE_CTA",
  IR_PROFILE: "AMBIENCE_IR",
}

// Internal resolver (preserves any intended mapping logic)
function resolveSoundProfile(state: SystemState, spectrum: SpectrumMode): SoundProfile {
  if (spectrum === "IR") return "IR_PROFILE"
  if (state === "CTA") return "CTA_PROFILE"
  if (state === "SCAN" || state === "FOCUS" || state === "PORTAL_READY") return "EXPLORATION_PROFILE"
  return "VOID_PROFILE"
}

export function SoundLayer() {
  // Read soundEnabled and state from engine snapshot (M1/M2A)
  const snapshot = useEngineSnapshot()
  
  const currentProfile = resolveSoundProfile(snapshot.systemState, snapshot.spectrum)
  const prevProfileRef = useRef<SoundProfile | null>(null)

  useEffect(() => {
    // Only process changes if sound is enabled
    if (!snapshot.soundEnabled) return

    if (currentProfile !== prevProfileRef.current) {
      const cueId = profileToCueMap[currentProfile]
      const cuePath = SoundCueRegistry[cueId]

      if (process.env.NODE_ENV === "development") {
        console.log(`[SoundLayer] Profile changed: ${prevProfileRef.current ?? "NONE"} -> ${currentProfile}`)
        console.log(`[SoundLayer] Ambience cue resolved: ${cueId} (${cuePath})`)
      }

      prevProfileRef.current = currentProfile
    }
  }, [currentProfile, snapshot.soundEnabled])

  // No audio playback, just observe state
  return null
}
