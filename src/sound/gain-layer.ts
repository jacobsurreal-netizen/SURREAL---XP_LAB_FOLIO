import type { EffectiveChannelGains } from "./audio-runtime-types"

export type GainChannel = "ambient" | "section" | "focus" | "event"

export interface ChannelGainState {
  master: number
  ambient: number
  section: number
  focus: number
  event: number
}

export const DEFAULT_CHANNEL_GAIN_STATE: ChannelGainState = {
  master: 1,
  ambient: 1,
  section: 1,
  focus: 1,
  event: 1,
}

function clampGain(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(1, Math.max(0, value))
}

/**
 * Runtime-owned gain staging — independent from Experience Mix and backends.
 */
export class GainLayer {
  private state: ChannelGainState = { ...DEFAULT_CHANNEL_GAIN_STATE }
  private readonly listeners = new Set<() => void>()

  getState(): Readonly<ChannelGainState> {
    return this.state
  }

  setMasterGain(value: number): void {
    const next = clampGain(value)
    if (next === this.state.master) return
    this.state = { ...this.state, master: next }
    this.notify()
  }

  setChannelGain(channel: GainChannel, value: number): void {
    const next = clampGain(value)
    if (next === this.state[channel]) return
    this.state = { ...this.state, [channel]: next }
    this.notify()
  }

  resolveEffectiveGains(): EffectiveChannelGains {
    const { master, ambient, section, focus, event } = this.state
    return {
      ambient: master * ambient,
      section: master * section,
      focus: master * focus,
      event: master * event,
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  reset(): void {
    this.state = { ...DEFAULT_CHANNEL_GAIN_STATE }
    this.notify()
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
