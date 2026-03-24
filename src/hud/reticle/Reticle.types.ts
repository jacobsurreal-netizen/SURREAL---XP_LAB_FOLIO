export type ReticleMode = "COLOR" | "IR" | "SCAN"

export type ReticleSector = "HERO" | "ABOUT" | "PROJECTS" | "CTA"

export type ReticleState =
  | "IDLE"
  | "HOVER"
  | "FOCUS"
  | "ACTIVE"
  | "CTA"
  | "GATEWAY"

export type ReticleRuntimeSignals = {
  mode: ReticleMode
  sectorName?: string | null
  sectorIndex?: number | null
  isSnapped?: boolean
  hasRecentInteraction?: boolean
  isPointerActive?: boolean
  isCTAZone?: boolean
  isGatewayZone?: boolean
}

export type ReticlePresentation = {
  mode: ReticleMode
  sector: ReticleSector
  state: ReticleState
  intensity: number
  parallaxStrength: number
  isVisible: boolean

  motionX: number
  motionY: number
  motionScale: number
}