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

  if (
    signals.isCTAZone ||
    (signals.sectorName ?? "").toUpperCase() === "CTA"
  ) {
    return "CTA"
  }

  if (signals.isSnapped) {
    return "FOCUS"
  }

  if (signals.isPointerActive) {
    return "HOVER"
  }

  if (signals.hasRecentInteraction) {
    return "ACTIVE"
  }

  return "IDLE"
}

function resolveIntensity(
  mode: ReticleMode,
  state: ReticleState
): number {
  let baseIntensity: number

  switch (state) {
    case "CTA":
      baseIntensity = 1
      break
    case "GATEWAY":
      baseIntensity = 0.95
      break
    case "ACTIVE":
      baseIntensity = 0.78
      break
    case "FOCUS":
      baseIntensity = 0.7
      break
    case "HOVER":
      baseIntensity = 0.58
      break
    case "IDLE":
    default:
      baseIntensity = 0.22
      break
  }

  if (mode === "IR") {
    return baseIntensity * 0.8
  }

  if (mode === "SCAN") {
    return Math.min(baseIntensity * 1.15, 1)
  }

  return baseIntensity
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

  return state === "IDLE" ? 0.12 : 0.22
}

function resolveVisibility(_state: ReticleState): boolean {
  return true
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
    intensity: resolveIntensity(signals.mode, state),
    parallaxStrength: resolveParallaxStrength(signals.mode, state),
    isVisible: resolveVisibility(state),
  }
}