import type { FolioSectionPlayback } from "./folio-experience-mix"
import type { AmbientLayer, FocusLayer, SoundBehaviorTrigger } from "./types"

/** Resolved layer targets passed from Experience Mix to a playback backend. */
export interface LayerPlaybackState {
  ambient: AmbientLayer
  section: FolioSectionPlayback
  focus: FocusLayer
}

/** Shared lifecycle for sustained playback units (ambient, section, focus). */
export interface AudioPlaybackUnit {
  prepareFromUserGesture(): void
  setOff(): void
  stop(): void
  dispose(): void
}

export interface AudioLoopPlaybackUnit<T extends string> extends AudioPlaybackUnit {
  update(layer: T): void
}

/** Backend contract — HTMLAudio today, WebAudio in M3. */
export interface AudioBackend {
  prepareFromUserGesture(): void
  applyLayerState(state: LayerPlaybackState, enabled: boolean): void
  applyTriggerEvents(
    triggerEvents: readonly SoundBehaviorTrigger[],
    enabled: boolean
  ): void
  stop(): void
  dispose(): void
}
