"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePointerPresence } from "@/hooks/use-pointer-presence"
import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { resolveReticleState } from "@/src/hud/reticle/utils/resolveReticleState"
import { useEngineSnapshot } from "@/src/template-kit/hooks"
import { useSystemState } from "@/src/template-kit/hooks/use-system-state"
import {
  computeEdgeTriggers,
  mapSoundBehavior,
} from "./behavior-mapper"
import type { SoundBehaviorInputs, SoundBehaviorState } from "./types"

function buildInputs(
  snapshot: ReturnType<typeof useEngineSnapshot>,
  spectrumMode: "COLOR" | "IR" | "SCAN",
  isSpectrumTransitioning: boolean,
  isPointerActive: boolean
): SoundBehaviorInputs {
  const reticleMode =
    spectrumMode === "IR"
      ? "IR"
      : spectrumMode === "SCAN"
        ? "SCAN"
        : "COLOR"

  const reticle = resolveReticleState({
    mode: reticleMode,
    sectorName: snapshot.sectorName,
    isSnapped: snapshot.isSnapped,
    hasRecentInteraction: snapshot.isSnapped,
    isPointerActive,
    isCTAZone: snapshot.sectorName === "CTA",
    isGatewayZone: false,
  })

  return {
    sectorName: snapshot.sectorName,
    sectorIndex: snapshot.sectorIndex,
    isSnapped: snapshot.isSnapped,
    soundEnabled: snapshot.soundEnabled,
    spectrumMode,
    isSpectrumTransitioning,
    reticleState: reticle.state,
    isPointerActive,
  }
}

export function useSoundBehaviorState(): SoundBehaviorState {
  const snapshot = useEngineSnapshot()
  const { mode: spectrumMode } = useSpectrumMode()
  const { isSpectrumTransitioning } = useSystemState()
  const { isPointerActive } = usePointerPresence()

  const inputs = useMemo(
    () =>
      buildInputs(
        snapshot,
        spectrumMode,
        isSpectrumTransitioning,
        isPointerActive
      ),
    [snapshot, spectrumMode, isSpectrumTransitioning, isPointerActive]
  )

  const previousInputsRef = useRef<SoundBehaviorInputs | null>(null)
  const [behaviorState, setBehaviorState] = useState<SoundBehaviorState>(() =>
    mapSoundBehavior(inputs, [])
  )

  useEffect(() => {
    const triggerEvents = computeEdgeTriggers(previousInputsRef.current, inputs)
    previousInputsRef.current = inputs

    const nextState = mapSoundBehavior(inputs, triggerEvents)
    setBehaviorState(nextState)

    if (triggerEvents.length === 0) return

    const frame = requestAnimationFrame(() => {
      setBehaviorState((current) =>
        current.triggerEvents.length > 0
          ? { ...current, triggerEvents: [] }
          : current
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [inputs])

  return behaviorState
}

/** @deprecated Use useSoundBehaviorState */
export function useSoundBehaviorSnapshot(): SoundBehaviorState {
  return useSoundBehaviorState()
}
