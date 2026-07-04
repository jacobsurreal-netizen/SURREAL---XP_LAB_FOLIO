import type { EventPlaybackAdapter } from "../backends/playback-adapter"
import { AsyncSession } from "./async-session"
import type { PlaybackState } from "./channel-lifecycle"
import { logEventTrigger } from "./playback-log"

export interface EventTriggerRequest {
  id: string
  assetUrl: string
}

export class EventChannelController {
  private readonly session = new AsyncSession()
  private playbackState: PlaybackState = "STOPPED"

  constructor(private readonly adapter: EventPlaybackAdapter) {}

  getState(): PlaybackState {
    return this.playbackState
  }

  prepareFromUserGesture(): void {
    this.adapter.ensureReady()
  }

  setEffectiveGain(gain: number): void {
    this.adapter.setGain(gain)
  }

  playTriggers(requests: readonly EventTriggerRequest[]): void {
    if (this.playbackState === "OFF") return
    if (requests.length === 0) return

    this.adapter.ensureReady()

    for (const request of requests) {
      const assetName = request.assetUrl.split("/").pop() ?? request.assetUrl
      logEventTrigger(request.id, assetName)
      void this.playOneShot(request.assetUrl)
    }
  }

  setOff(): void {
    this.shutdown("OFF")
  }

  stop(): void {
    this.shutdown("STOPPED")
  }

  dispose(): void {
    this.session.invalidate()
    this.adapter.stopAll()
    this.adapter.dispose()
    this.playbackState = "STOPPED"
  }

  private shutdown(state: PlaybackState): void {
    this.session.invalidate()
    this.adapter.stopAll()
    this.playbackState = state
  }

  private async playOneShot(assetUrl: string): Promise<void> {
    const started = await this.adapter.playOneShot(assetUrl)

    if (!started && process.env.NODE_ENV === "development") {
      console.warn(`[EventRuntime] trigger playback failed:`, assetUrl)
    }
  }
}
