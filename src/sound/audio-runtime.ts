import { createHtmlAudioBackend } from "./backends/html-audio"
import type { AudioBackend } from "./audio-runtime-types"
import { resolveFolioPlaybackMix } from "./folio-experience-mix"
import {
  GainLayer,
  type ChannelGainState,
  type GainChannel,
} from "./gain-layer"
import type { SoundBehaviorState, SoundBehaviorTrigger } from "./types"

class AudioRuntime {
  private readonly gainLayer = new GainLayer()

  constructor(private readonly backend: AudioBackend) {
    this.syncGainsToBackend()
  }

  prepareFromUserGesture(): void {
    this.backend.prepareFromUserGesture()
  }

  applyState(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return

    this.syncGainsToBackend()

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
    this.syncGainsToBackend()
    this.backend.applyTriggerEvents(triggerEvents, enabled)
  }

  setMasterGain(gain: number): void {
    this.gainLayer.setMasterGain(gain)
    this.syncGainsToBackend()
  }

  setChannelGain(channel: GainChannel, gain: number): void {
    this.gainLayer.setChannelGain(channel, gain)
    this.syncGainsToBackend()
  }

  getGainState(): Readonly<ChannelGainState> {
    return this.gainLayer.getState()
  }

  subscribeGainState(listener: () => void): () => void {
    return this.gainLayer.subscribe(listener)
  }

  stop(): void {
    this.backend.stop()
  }

  dispose(): void {
    this.backend.dispose()
    this.gainLayer.reset()
  }

  private syncGainsToBackend(): void {
    this.backend.setEffectiveGains(this.gainLayer.resolveEffectiveGains())
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
