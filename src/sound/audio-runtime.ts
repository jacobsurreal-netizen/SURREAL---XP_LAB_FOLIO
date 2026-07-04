import { createWebAudioBackend } from "./backends/web-audio"
import { createHtmlAudioBackend } from "./backends/html-audio"
import type { AudioBackend, EffectiveChannelGains } from "./audio-runtime-types"
import {
  buildAudioDebugSnapshot,
  type AudioDebugSnapshot,
} from "./audio-debug-snapshot"
import {
  GainLayer,
  type ChannelGainState,
  type GainChannel,
} from "./gain-layer"
import {
  extractPlaybackIntentGate,
  isPlaybackIntentGateEqual,
} from "./internal/playback-intent-gate"
import type { SoundBehaviorState, SoundBehaviorTrigger } from "./types"

export type { AudioDebugSnapshot } from "./audio-debug-snapshot"

function gainsEqual(a: EffectiveChannelGains, b: EffectiveChannelGains): boolean {
  return (
    a.ambient === b.ambient &&
    a.section === b.section &&
    a.focus === b.focus &&
    a.event === b.event
  )
}

class AudioRuntime {
  private readonly gainLayer = new GainLayer()
  private lastPushedGains: EffectiveChannelGains | null = null
  private lastAppliedGate: ReturnType<typeof extractPlaybackIntentGate> | null =
    null
  private lastAppliedEnabled: boolean | null = null
  private debugSnapshot: AudioDebugSnapshot | null = null
  private readonly debugListeners = new Set<() => void>()

  constructor(private readonly backend: AudioBackend) {
    this.syncGainsToBackend()
  }

  prepareFromUserGesture(): void {
    this.backend.prepareFromUserGesture()
  }

  /**
   * Updates observational debug state on every behavior tick.
   * Independent of whether backend playback is gated.
   */
  observeBehavior(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return
    this.publishDebugSnapshot(state, enabled)
  }

  /**
   * Pushes playback to backend only when intent or enabled state changes.
   */
  applyPlaybackIfNeeded(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return

    const gate = extractPlaybackIntentGate(state)
    const enabledChanged = this.lastAppliedEnabled !== enabled
    const gateChanged =
      this.lastAppliedGate === null ||
      !isPlaybackIntentGateEqual(this.lastAppliedGate, gate)

    if (!enabledChanged && !gateChanged) {
      return
    }

    this.lastAppliedGate = gate
    this.lastAppliedEnabled = enabled
    this.applyState(state, enabled)
  }

  applyState(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return

    this.syncGainsToBackend()

    if (!enabled) {
      this.backend.silenceAll()
      return
    }

    const mix = extractPlaybackIntentGate(state)
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
    if (typeof window === "undefined") return

    if (!enabled) {
      this.backend.silenceAll()
      return
    }

    if (triggerEvents.length === 0) {
      return
    }

    this.syncGainsToBackend()
    this.backend.applyTriggerEvents(triggerEvents, enabled)
  }

  createDebugSnapshot(): Readonly<AudioDebugSnapshot> | null {
    return this.debugSnapshot
  }

  subscribeDebugSnapshot(listener: () => void): () => void {
    this.debugListeners.add(listener)
    listener()
    return () => {
      this.debugListeners.delete(listener)
    }
  }

  setMasterGain(gain: number): void {
    this.gainLayer.setMasterGain(gain)
    this.syncGainsToBackend()
    this.notifyDebugIfSnapshotExists()
  }

  setChannelGain(channel: GainChannel, gain: number): void {
    this.gainLayer.setChannelGain(channel, gain)
    this.syncGainsToBackend()
    this.notifyDebugIfSnapshotExists()
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
    this.lastPushedGains = null
    this.lastAppliedGate = null
    this.lastAppliedEnabled = null
    this.debugSnapshot = null
    this.debugListeners.clear()
  }

  private publishDebugSnapshot(state: SoundBehaviorState, enabled: boolean): void {
    const backend = this.backend.getDiagnostics?.() ?? null
    this.debugSnapshot = buildAudioDebugSnapshot(
      state,
      enabled,
      this.gainLayer.getState(),
      backend
    )
    this.notifyDebugListeners()
  }

  private notifyDebugIfSnapshotExists(): void {
    if (!this.debugSnapshot) return
    this.debugSnapshot = {
      ...this.debugSnapshot,
      gains: this.gainLayer.getState(),
      backend: this.backend.getDiagnostics?.() ?? this.debugSnapshot.backend,
    }
    this.notifyDebugListeners()
  }

  private notifyDebugListeners(): void {
    for (const listener of this.debugListeners) {
      listener()
    }
  }

  private syncGainsToBackend(): void {
    const gains = this.gainLayer.resolveEffectiveGains()
    if (this.lastPushedGains && gainsEqual(this.lastPushedGains, gains)) {
      return
    }
    this.lastPushedGains = { ...gains }
    this.backend.setEffectiveGains(gains)
  }
}

const defaultBackend = createWebAudioBackend()

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

export { createHtmlAudioBackend, createWebAudioBackend }
