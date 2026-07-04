import { collapseActiveProfile } from "./behavior-mapper"
import type { AudioBackendDiagnostics } from "./audio-runtime-types"
import type { FolioPlaybackMix } from "./folio-experience-mix"
import { resolveFolioPlaybackMix } from "./folio-experience-mix"
import type { ChannelGainState } from "./gain-layer"
import type { SoundBehaviorState, SpectrumModeInput } from "./types"

export interface AudioDebugSemanticState {
  activeSection: SoundBehaviorState["activeSection"]
  ambientLayer: SoundBehaviorState["ambientLayer"]
  sectionLayer: SoundBehaviorState["sectionLayer"]
  focusLayer: SoundBehaviorState["focusLayer"]
  eventLayer: SoundBehaviorState["eventLayer"]
  flags: readonly SoundBehaviorState["flags"][number][]
  triggerEvents: readonly SoundBehaviorState["triggerEvents"][number][]
  collapsedProfile: string
  spectrumMode: SpectrumModeInput
}

/** Read-only observational view of runtime ownership — independent of backend apply gating. */
export interface AudioDebugSnapshot {
  soundEnabled: boolean
  audibleMix: FolioPlaybackMix
  gains: Readonly<ChannelGainState>
  semantic: AudioDebugSemanticState
  backend: AudioBackendDiagnostics | null
}

function resolveSpectrumModeFromFlags(
  flags: readonly SoundBehaviorState["flags"][number][]
): SpectrumModeInput {
  if (flags.includes("SCAN_MODE")) return "SCAN"
  if (flags.includes("IR_MODE")) return "IR"
  return "COLOR"
}

export function buildAudioDebugSnapshot(
  state: SoundBehaviorState,
  soundEnabled: boolean,
  gains: Readonly<ChannelGainState>,
  backend: AudioBackendDiagnostics | null = null
): AudioDebugSnapshot {
  return {
    soundEnabled,
    audibleMix: resolveFolioPlaybackMix(state),
    gains,
    backend,
    semantic: {
      activeSection: state.activeSection,
      ambientLayer: state.ambientLayer,
      sectionLayer: state.sectionLayer,
      focusLayer: state.focusLayer,
      eventLayer: state.eventLayer,
      flags: state.flags,
      triggerEvents: state.triggerEvents,
      collapsedProfile: collapseActiveProfile(state),
      spectrumMode: resolveSpectrumModeFromFlags(state.flags),
    },
  }
}
