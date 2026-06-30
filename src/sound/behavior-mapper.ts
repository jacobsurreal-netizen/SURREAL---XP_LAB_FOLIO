import type {
  AmbientLayer,
  EventLayer,
  FocusLayer,
  SectionLayer,
  SoundBehaviorFlag,
  SoundBehaviorInputs,
  SoundBehaviorProfile,
  SoundBehaviorSection,
  SoundBehaviorState,
  SoundBehaviorTrigger,
} from "./types"

export function normalizeSection(sectorName: string): SoundBehaviorSection {
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

function isCtaZone(inputs: SoundBehaviorInputs): boolean {
  return (
    normalizeSection(inputs.sectorName) === "CTA" || inputs.reticleState === "CTA"
  )
}

export function resolveAmbientLayer(inputs: SoundBehaviorInputs): AmbientLayer {
  if (isCtaZone(inputs)) return "NONE"
  return inputs.spectrumMode === "IR" ? "IR_PROFILE" : "VOID_PROFILE"
}

export function resolveSectionLayer(inputs: SoundBehaviorInputs): SectionLayer {
  const section = normalizeSection(inputs.sectorName)
  if (section === "ABOUT" || section === "PROJECTS") {
    return "EXPLORATION_PROFILE"
  }
  return "NONE"
}

export function resolveFocusLayer(inputs: SoundBehaviorInputs): FocusLayer {
  return inputs.spectrumMode === "SCAN" ? "SCAN_PROFILE" : "NONE"
}

export function resolveEventLayer(inputs: SoundBehaviorInputs): EventLayer {
  return isCtaZone(inputs) ? "CTA_PROFILE" : "NONE"
}

/**
 * Consumer convenience — collapses layered state into a single profile.
 * Not a replacement for the canonical layered model (SPEC_014).
 */
export function collapseActiveProfile(state: SoundBehaviorState): SoundBehaviorProfile {
  if (state.focusLayer === "SCAN_PROFILE") return "SCAN_PROFILE"
  if (state.eventLayer === "CTA_PROFILE") return "CTA_PROFILE"
  if (state.sectionLayer === "EXPLORATION_PROFILE") return "EXPLORATION_PROFILE"
  if (state.ambientLayer === "IR_PROFILE") return "IR_PROFILE"
  return "VOID_PROFILE"
}

/** @deprecated Use collapseActiveProfile(mapSoundBehavior(...)) */
export function resolveActiveProfile(
  inputs: SoundBehaviorInputs
): SoundBehaviorProfile {
  return collapseActiveProfile(mapSoundBehavior(inputs))
}

export function resolveFlags(inputs: SoundBehaviorInputs): SoundBehaviorFlag[] {
  const flags: SoundBehaviorFlag[] = []

  if (inputs.isSnapped) flags.push("SNAPPED")
  if (inputs.soundEnabled) flags.push("SOUND_ENABLED")
  if (inputs.isSpectrumTransitioning) flags.push("SPECTRUM_SHIFT")
  if (inputs.spectrumMode === "IR") flags.push("IR_MODE")
  if (inputs.spectrumMode === "SCAN") flags.push("SCAN_MODE")
  if (inputs.isPointerActive) flags.push("POINTER_ACTIVE")
  if (inputs.reticleState === "FOCUS") flags.push("FOCUS_STATE")
  if (isCtaZone(inputs)) flags.push("CTA_ZONE")

  return flags
}

export function computeEdgeTriggers(
  previous: SoundBehaviorInputs | null,
  current: SoundBehaviorInputs
): SoundBehaviorTrigger[] {
  if (!previous) return []

  const triggers: SoundBehaviorTrigger[] = []

  if (previous.spectrumMode !== "SCAN" && current.spectrumMode === "SCAN") {
    triggers.push("SCAN_ENTER", "SCAN_INIT_SAMPLE")
  }

  if (previous.spectrumMode === "SCAN" && current.spectrumMode !== "SCAN") {
    triggers.push("SCAN_EXIT")
  }

  const prevIr = previous.spectrumMode === "IR"
  const currIr = current.spectrumMode === "IR"
  if (!prevIr && currIr) {
    triggers.push("IR_ENTER", "IR_INIT_SAMPLE")
  }
  if (prevIr && !currIr && current.spectrumMode !== "SCAN") {
    triggers.push("IR_EXIT")
  }

  const prevCta = isCtaZone(previous)
  const currCta = isCtaZone(current)
  if (!prevCta && currCta) {
    triggers.push("CTA_ENTER")
  }
  if (prevCta && !currCta) {
    triggers.push("CTA_EXIT")
  }

  if (previous.sectorName !== current.sectorName) {
    triggers.push("SECTOR_CHANGE")
  }

  return triggers
}

export function mapSoundBehavior(
  inputs: SoundBehaviorInputs,
  triggerEvents: SoundBehaviorTrigger[] = []
): SoundBehaviorState {
  return {
    activeSection: normalizeSection(inputs.sectorName),
    ambientLayer: resolveAmbientLayer(inputs),
    sectionLayer: resolveSectionLayer(inputs),
    focusLayer: resolveFocusLayer(inputs),
    eventLayer: resolveEventLayer(inputs),
    flags: resolveFlags(inputs),
    triggerEvents,
  }
}

