"use client"

import { useMemo } from "react"

import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { useOrbitSector } from "@/hooks/use-orbit-sector"

import type {
  ReticleMode,
  ReticlePresentation,
  ReticleRuntimeSignals,
} from "../Reticle.types"
import { resolveReticleState } from "../utils/resolveReticleState"

export function useReticleState(): ReticlePresentation {
  const { mode } = useSpectrumMode()
  const { sectorName, isSnapped } = useOrbitSector()

  return useMemo(() => {
    const normalizedMode: ReticleMode =
      mode === "IR" ? "IR" : "COLOR"

    const signals: ReticleRuntimeSignals = {
      mode: normalizedMode,
      sectorName,
      isSnapped,
      hasRecentInteraction: Boolean(isSnapped),
      isCTAZone: sectorName === "CTA",
      isGatewayZone: false,
    }

    return resolveReticleState(signals)
  }, [mode, sectorName, isSnapped])
}