import { createHtmlAudioBackend } from "./backends/html-audio"
import type { AudioBackend } from "./audio-runtime-types"
import { resolveFolioPlaybackMix } from "./folio-experience-mix"
import type { SoundBehaviorState, SoundBehaviorTrigger } from "./types"

class AudioRuntime {
  constructor(private readonly backend: AudioBackend) {}

  prepareFromUserGesture(): void {
    this.backend.prepareFromUserGesture()
  }

  applyState(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return

    const mix = resolveFolioPlaybackMix(state)
    this.backend.applyLayerState(
      {
        ambient: mix.ambient,
        section: mix.section,
        focus: mix.focus,
      },
      enabled
    )
  }

  applyTriggerEvents(
    triggerEvents: readonly SoundBehaviorTrigger[],
    enabled: boolean
  ): void {
    this.backend.applyTriggerEvents(triggerEvents, enabled)
  }

  stop(): void {
    this.backend.stop()
  }

  dispose(): void {
    this.backend.dispose()
  }
}

const defaultBackend = createHtmlAudioBackend()

export const audioRuntime = new AudioRuntime(defaultBackend)

/** @deprecated Prefer audioRuntime.applyTriggerEvents — retained for transitional imports. */
export const eventRuntime = {
  prepareFromUserGesture(): void {
    audioRuntime.prepareFromUserGesture()
  },
  applyTriggerEvents(
    triggerEvents: readonly SoundBehaviorTrigger[],
    enabled: boolean
  ): void {
    audioRuntime.applyTriggerEvents(triggerEvents, enabled)
  },
  dispose(): void {
    // Full teardown is owned by audioRuntime.dispose().
  },
}
