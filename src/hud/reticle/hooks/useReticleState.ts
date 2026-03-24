"use client"

import { useMemo } from "react"

import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { useOrbitSector } from "@/hooks/use-orbit-sector"
import { usePointerPresence } from "@/hooks/use-pointer-presence"
import { useMouseParallax } from "../../hooks/use-mouse-parallax"

import type {
  ReticleMode,
  ReticlePresentation,
  ReticleRuntimeSignals,
} from "../Reticle.types"
import { resolveReticleState } from "../utils/resolveReticleState"

export function useReticleState(): ReticlePresentation {
  const { mode } = useSpectrumMode()
  const { sectorName, isSnapped } = useOrbitSector()
  const { isPointerActive } = usePointerPresence()
  const { offset } = useMouseParallax(0.05)

  return useMemo(() => {
    const normalizedMode: ReticleMode =
      mode === "IR" ? "IR" : "COLOR"

    const signals: ReticleRuntimeSignals = {
      mode: normalizedMode,
      sectorName,
      isSnapped,
      hasRecentInteraction: Boolean(isSnapped),
      isPointerActive,
      isCTAZone: sectorName === "CTA",
      isGatewayZone: false,
    }

    const base = resolveReticleState(signals)

    const motionStrength =
      normalizedMode === "IR" ? 2 : 3.5

    const motionScale =
      normalizedMode === "IR" ? 1 : 1.01

    return {
      ...base,
      motionX: offset.x * motionStrength,
      motionY: offset.y * motionStrength,
      motionScale,
    }
  }, [mode, sectorName, isSnapped, isPointerActive, offset.x, offset.y])
}