export type {
  AmbientLayer,
  EventLayer,
  FocusLayer,
  SectionLayer,
  SoundBehaviorFlag,
  SoundBehaviorInputs,
  SoundBehaviorProfile,
  SoundBehaviorSection,
  SoundBehaviorSnapshot,
  SoundBehaviorState,
  SoundBehaviorTrigger,
} from "./types"

export type {
  AudioBackend,
  AudioBackendDiagnostics,
  AudioLoopPlaybackUnit,
  AudioPlaybackUnit,
  EffectiveChannelGains,
  EventPlaybackUnit,
  HtmlAudioBackendDiagnostics,
  LayerPlaybackState,
  WebAudioBackendDiagnostics,
} from "./audio-runtime-types"

export type { ChannelGainState, GainChannel } from "./gain-layer"
export { DEFAULT_CHANNEL_GAIN_STATE } from "./gain-layer"

export {
  collapseActiveProfile,
  computeEdgeTriggers,
  mapSoundBehavior,
  normalizeSection,
  resolveActiveProfile,
  resolveAmbientLayer,
  resolveEventLayer,
  resolveFlags,
  resolveFocusLayer,
  resolveSectionLayer,
} from "./behavior-mapper"

export { audioRuntime, createHtmlAudioBackend, createWebAudioBackend } from "./audio-runtime"
export type { AudioDebugSnapshot } from "./audio-runtime"
export { eventRuntime } from "./event-runtime"
export {
  useSoundBehaviorSnapshot,
  useSoundBehaviorState,
} from "./use-sound-behavior"
export { useAudioRuntime } from "./use-audio-runtime"
export { SoundDebugHUD } from "./sound-debug-hud"
export {
  getSoundDebugState,
  initSoundDebugFromStorage,
  subscribeSoundDebug,
  toggleSoundDebug,
} from "./sound-debug-store"

