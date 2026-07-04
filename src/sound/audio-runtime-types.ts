import type { FolioSectionPlayback } from "./folio-experience-mix"
import type { AmbientLayer, FocusLayer, SoundBehaviorTrigger } from "./types"

/** Per-channel effective gain (master × channel) passed to the backend. */
export interface EffectiveChannelGains {
  ambient: number
  section: number
  focus: number
  event: number
}

/** Resolved layer targets passed from Experience Mix to a playback backend. */
export interface LayerPlaybackState {
  ambient: AmbientLayer
  section: FolioSectionPlayback
  focus: FocusLayer
}

/** Shared lifecycle for sustained playback units (ambient, section, focus). */
export interface AudioPlaybackUnit {
  prepareFromUserGesture(): void
  setEffectiveGain(gain: number): void
  setOff(): void
  stop(): void
  dispose(): void
}

export interface AudioLoopPlaybackUnit<T extends string> extends AudioPlaybackUnit {
  update(layer: T): void
}

/** One-shot event channel — same lifecycle surface as sustained units for silence. */
export interface EventPlaybackUnit {
  prepareFromUserGesture(): void
  setEffectiveGain(gain: number): void
  setOff(): void
  stop(): void
  dispose(): void
  playTriggers(triggerEvents: readonly SoundBehaviorTrigger[]): void
}

/** Backend contract — WebAudio production default; HtmlAudio fallback. */
export interface WebAudioBackendDiagnostics {
  backendId: "web-audio"
  contextState: AudioContextState | "none"
  residentUrlCount: number
  failedUrls: readonly string[]
  pendingLoadCount: number
}

export interface HtmlAudioBackendDiagnostics {
  backendId: "html-audio"
}

export type AudioBackendDiagnostics =
  | WebAudioBackendDiagnostics
  | HtmlAudioBackendDiagnostics

export interface AudioBackend {
  prepareFromUserGesture(): void
  setEffectiveGains(gains: EffectiveChannelGains): void
  /** Full lifecycle shutdown — stop playback, release objects, invalidate async sessions. */
  silenceAll(): void
  applyLayerState(state: LayerPlaybackState, enabled: boolean): void
  applyTriggerEvents(
    triggerEvents: readonly SoundBehaviorTrigger[],
    enabled: boolean
  ): void
  stop(): void
  dispose(): void
  getDiagnostics?(): AudioBackendDiagnostics
}
