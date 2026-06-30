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

export { audioRuntime } from "./audio-runtime"
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

