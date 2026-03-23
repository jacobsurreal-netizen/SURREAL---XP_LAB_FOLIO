import { useMemo } from "react"
import type {
  ReticlePresentation,
  ReticleRuntimeSignals,
} from "../Reticle.types"
import { resolveReticleState } from "../utils/resolveReticleState"

export function useReticleState(
  signals: ReticleRuntimeSignals
): ReticlePresentation {
  return useMemo(() => {
    return resolveReticleState(signals)
  }, [
    signals.mode,
    signals.sectorName,
    signals.sectorIndex,
    signals.isSnapped,
    signals.hasRecentInteraction,
    signals.isCTAZone,
    signals.isGatewayZone,
  ])
}