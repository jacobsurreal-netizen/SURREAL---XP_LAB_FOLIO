import type {
  ReticleMode,
  ReticlePresentation,
  ReticleRuntimeSignals,
  ReticleSector,
  ReticleState,
} from "../Reticle.types"

function normalizeSector(sectorName?: string | null): ReticleSector {
  switch ((sectorName ?? "").toUpperCase()) {
    case "ABOUT":
      return "ABOUT"
    case "PROJECTS":
      return "PROJECTS"
    case "CTA":
      return "CTA"
    case "HERO":
    default:
      return "HERO"
  }
}

function resolveState(signals: ReticleRuntimeSignals): ReticleState {
  if (signals.isGatewayZone) {
    return "GATEWAY"
  }

  if (signals.isCTAZone || (signals.sectorName ?? "").toUpperCase() === "CTA") {
    return "CTA"
  }

  if (signals.isSnapped) {
    return "FOCUS"
  }

  if (signals.hasRecentInteraction) {
    return "ACTIVE"
  }

  return "IDLE"
}

function resolveIntensity(state: ReticleState): number {
  switch (state) {
    case "CTA":
      return 1
    case "GATEWAY":
      return 0.95
    case "ACTIVE":
      return 0.8
    case "FOCUS":
      return 0.65
    case "HOVER":
      return 0.55
    case "IDLE":
    default:
      return 0.25
  }
}

function resolveParallaxStrength(
  mode: ReticleMode,
  state: ReticleState
): number {
  if (mode === "SCAN") {
    return state === "IDLE" ? 0.35 : 0.7
  }

  if (mode === "IR") {
    return 0.08
  }

  // COLOR
  return state === "IDLE" ? 0.12 : 0.22
}

function resolveVisibility(state: ReticleState): boolean {
  return state !== "IDLE" ? true : true
}

export function resolveReticleState(
  signals: ReticleRuntimeSignals
): ReticlePresentation {
  const sector = normalizeSector(signals.sectorName)
  const state = resolveState(signals)

  return {
    mode: signals.mode,
    sector,
    state,
    intensity: resolveIntensity(state),
    parallaxStrength: resolveParallaxStrength(signals.mode, state),
    isVisible: resolveVisibility(state),
  }
}