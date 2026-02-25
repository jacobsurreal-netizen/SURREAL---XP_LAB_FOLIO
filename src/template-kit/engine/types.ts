// ──────────────────────────────────────────────────────────────
// template-kit / engine / types.ts
// Central type definitions for the micro-engine.
// ──────────────────────────────────────────────────────────────

/** System states the engine can occupy */
export const SYSTEM_STATES = [
  "INIT",
  "IDLE",
  "SCAN",
  "FOCUS",
  "CTA",
  "PORTAL_READY",
] as const
export type SystemState = (typeof SYSTEM_STATES)[number]

/** Sector names */
export const SECTOR_NAMES = ["HERO", "ABOUT", "PROJECTS", "CTA"] as const
export type SectorName = (typeof SECTOR_NAMES)[number]

/** Languages */
export const LANGUAGES = ["EN", "CS", "DE", "JP"] as const
export type Language = (typeof LANGUAGES)[number]

/** Spectrum modes */
export const SPECTRUM_MODES = ["COLOR", "IR"] as const
export type SpectrumMode = (typeof SPECTRUM_MODES)[number]

/** Sector definition */
export interface SectorDef {
  name: SectorName
  detentProgress: number
  iconKey: string
}

/** Accessibility flags */
export interface AccessibilityFlags {
  prefersReducedMotion: boolean
}

/** Default engine settings */
export interface EngineDefaults {
  language: Language
  spectrum: SpectrumMode
  snapDuration: number
  snapDurationReduced: number
  idleScrollMs: number
  hudIdleDelayMs: number
  hudActiveOpacity: number
  hudIdleOpacity: number
  hudCtaActiveOpacity: number
  hudCtaIdleOpacity: number
  telemetryThrottleMs: number
}

// ── Command events ──────────────────────────────────────────

export type CommandType =
  | "COMMAND/GO_TO_SECTOR"
  | "COMMAND/NEXT_SECTOR"
  | "COMMAND/PREV_SECTOR"
  | "COMMAND/SET_SPECTRUM"
  | "COMMAND/SET_LANGUAGE"
  | "COMMAND/SET_STATE"

export interface CommandEvent {
  type: CommandType
  payload: unknown
  timestamp: number
}

// ── Telemetry ───────────────────────────────────────────────

export interface TelemetryPayload {
  scrollProgress: number
  sectorIndex: number
  sectorName: SectorName
  timecodeString: string
  isSnapped: boolean
}

export interface TelemetryEvent {
  type: "TELEMETRY/UPDATE"
  payload: TelemetryPayload
  timestamp: number
}

export type EngineEvent = CommandEvent | TelemetryEvent

// ── Full engine snapshot ────────────────────────────────────

export interface EngineSnapshot {
  systemState: SystemState
  sectorIndex: number
  sectorName: SectorName
  scrollProgress: number
  isSnapped: boolean
  spectrum: SpectrumMode
  language: Language
}
