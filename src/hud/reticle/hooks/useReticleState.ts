"use client"

import { useMemo } from "react"
import { useOrbitSector } from "@/hooks/use-orbit-sector"
import { usePointerPresence } from "@/hooks/use-pointer-presence"
import { useMouseParallax } from "../../hooks/use-mouse-parallax"

import type {
  ReticleMode,
  ReticlePresentation,
  ReticleRuntimeSignals,
} from "../Reticle.types"
import { resolveReticleState } from "../utils/resolveReticleState"

import type { SpectrumMode } from "@/hooks/use-spectrum-mode"

export function useReticleState(mode: SpectrumMode): ReticlePresentation {
  const { sectorName, isSnapped } = useOrbitSector()
  const { isPointerActive } = usePointerPresence()
  const { offset } = useMouseParallax(0.05)

  return useMemo(() => {
    const normalizedMode: ReticleMode =
      mode === "IR" ? "IR" : mode === "SCAN" ? "SCAN" : "COLOR"

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

    let motionStrength =
      normalizedMode === "IR" ? 2 :
      normalizedMode === "SCAN" ? 4.5 :
      3.5

    let motionScale =
      normalizedMode === "IR" ? 1 :
      normalizedMode === "SCAN" ? 1.03 :
      1.01

    switch (base.state) {
      case "IDLE":
        motionStrength *= 0.6
        motionScale *= 1
        break

      case "HOVER":
        motionStrength *= 0.9
        motionScale *= 1.006
        break

      case "FOCUS":
        motionStrength *= 0.75
        motionScale *= 1.012
        break

      case "ACTIVE":
        motionStrength *= 1
        motionScale *= 1.01
        break

      case "CTA":
        motionStrength *= 0.8
        motionScale *= 1.018
        break

      case "GATEWAY":
        motionStrength *= 0.85
        motionScale *= 1.02
        break
    }

    return {
      ...base,
      motionX: offset.x * motionStrength,
      motionY: offset.y * motionStrength,
      motionScale,
    }
  }, [mode, sectorName, isSnapped, isPointerActive, offset.x, offset.y])
}