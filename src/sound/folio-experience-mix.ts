import type {
  AmbientLayer,
  FocusLayer,
  SoundBehaviorState,
} from "./types"

/**
 * FOLIO Experience Mix — playback profiles resolved from generic SoundBehaviorState.
 * Not part of the Sound Behavior Layer; experience-specific orchestration only.
 */

export type FolioExperienceContext =
  | "WORLD"
  | "PROJECT_CARD"
  | "CTA"

export type FolioSectionPlayback =
  | "EXPLORATION_PROFILE"
  | "IR_EXPLORATION_PROFILE"
  | "CTA_PROFILE"
  | "NONE"

export interface FolioPlaybackMix {
  context: FolioExperienceContext
  ambient: AmbientLayer
  section: FolioSectionPlayback
  focus: FocusLayer
}

export function resolveFolioExperienceContext(
  state: SoundBehaviorState
): FolioExperienceContext {
  if (state.eventLayer === "CTA_PROFILE") return "CTA"
  if (state.focusLayer === "SCAN_PROFILE") return "PROJECT_CARD"
  return "WORLD"
}

function resolveWorldSectionPlayback(
  state: SoundBehaviorState
): FolioSectionPlayback {
  if (state.sectionLayer === "NONE") return "NONE"
  if (state.sectionLayer === "EXPLORATION_PROFILE") {
    return state.flags.includes("IR_MODE")
      ? "IR_EXPLORATION_PROFILE"
      : "EXPLORATION_PROFILE"
  }
  return "NONE"
}

/**
 * Maps canonical SoundBehaviorState to FOLIO audible mix (SPEC_015 reference).
 */
export function resolveFolioPlaybackMix(
  state: SoundBehaviorState
): FolioPlaybackMix {
  const context = resolveFolioExperienceContext(state)

  switch (context) {
    case "CTA":
      return {
        context,
        ambient: "NONE",
        section: "CTA_PROFILE",
        focus: "NONE",
      }

    case "PROJECT_CARD":
      return {
        context,
        ambient: "NONE",
        section: "NONE",
        focus: "SCAN_PROFILE",
      }

    case "WORLD":
    default:
      return {
        context,
        ambient: state.ambientLayer,
        section: resolveWorldSectionPlayback(state),
        focus: state.focusLayer,
      }
  }
}
