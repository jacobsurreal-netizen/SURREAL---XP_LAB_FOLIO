export type SoundBehaviorProfile =
  | "VOID_PROFILE"
  | "IR_PROFILE"
  | "EXPLORATION_PROFILE"
  | "SCAN_PROFILE"
  | "CTA_PROFILE"

export type SoundBehaviorSection = "HERO" | "ABOUT" | "PROJECTS" | "CTA"

export type SoundBehaviorTrigger =
  | "IR_ENTER"
  | "IR_EXIT"
  | "IR_INIT_SAMPLE"
  | "SCAN_ENTER"
  | "SCAN_EXIT"
  | "SCAN_INIT_SAMPLE"
  | "CTA_ENTER"
  | "CTA_EXIT"
  | "CTA_SIGNAL_SAMPLE"
  | "SECTOR_CHANGE"

export type SoundBehaviorFlag =
  | "SNAPPED"
  | "SOUND_ENABLED"
  | "SPECTRUM_SHIFT"
  | "IR_MODE"
  | "SCAN_MODE"
  | "POINTER_ACTIVE"
  | "FOCUS_STATE"
  | "CTA_ZONE"

export type SpectrumModeInput = "COLOR" | "IR" | "SCAN"

export type ReticleStateInput =
  | "IDLE"
  | "HOVER"
  | "FOCUS"
  | "ACTIVE"
  | "CTA"
  | "GATEWAY"

export type AmbientLayer = "VOID_PROFILE" | "IR_PROFILE" | "NONE"
export type SectionLayer = "EXPLORATION_PROFILE" | "NONE"
export type FocusLayer = "SCAN_PROFILE" | "NONE"
export type EventLayer = "CTA_PROFILE" | "NONE"

export interface SoundBehaviorInputs {
  sectorName: string
  sectorIndex: number
  isSnapped: boolean
  soundEnabled: boolean
  spectrumMode: SpectrumModeInput
  isSpectrumTransitioning: boolean
  reticleState: ReticleStateInput
  isPointerActive: boolean
}

/**
 * Canonical semantic audio state (SPEC_014).
 * Describes meaning, not playback.
 */
export interface SoundBehaviorState {
  /** Navigation context — not a semantic layer. */
  activeSection: SoundBehaviorSection
  ambientLayer: AmbientLayer
  sectionLayer: SectionLayer
  focusLayer: FocusLayer
  eventLayer: EventLayer
  flags: SoundBehaviorFlag[]
  /** Ephemeral edge events — pulse only, never latched. */
  triggerEvents: SoundBehaviorTrigger[]
}

/**
 * @deprecated Use SoundBehaviorState. Retained for transitional imports.
 */
export type SoundBehaviorSnapshot = SoundBehaviorState

