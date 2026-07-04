import type { FocusPlaybackAdapter } from "../backends/playback-adapter"
import { AsyncSession } from "./async-session"
import type { PlaybackState } from "./channel-lifecycle"
import { logFocusToActive, logFocusToNone } from "./playback-log"

export interface FocusProbeUrls {
  ir: string
  scan: string
}

export class FocusChannelController {
  private readonly session = new AsyncSession()
  private playbackState: PlaybackState = "STOPPED"

  constructor(
    private readonly adapter: FocusPlaybackAdapter,
    private readonly playbackFailedLabel = "focus"
  ) {}

  getState(): PlaybackState {
    return this.playbackState
  }

  prepareFromUserGesture(): void {
    this.adapter.ensureReady()
  }

  setEffectiveGain(gain: number): void {
    this.adapter.setGain(gain)
  }

  update(active: boolean, probeUrls: FocusProbeUrls | null): void {
    if (!active) {
      this.applyInactive()
      return
    }

    if (!probeUrls) {
      return
    }

    if (this.adapter.isPlayingProbes(probeUrls.ir, probeUrls.scan)) {
      if (this.playbackState !== "PLAYING") {
        this.playbackState = "PLAYING"
      }
      return
    }

    if (this.playbackState !== "PLAYING") {
      logFocusToActive()
    }

    this.adapter.ensureReady()

    const orphanPlayback =
      this.adapter.isPlaying() &&
      !this.adapter.isPlayingProbes(probeUrls.ir, probeUrls.scan)

    if (orphanPlayback) {
      this.adapter.stopPlayback()
      this.adapter.ensureReady()
    }

    const token = this.session.bump()
    void this.startProbes(probeUrls, token)
  }

  setOff(): void {
    this.shutdown("OFF")
  }

  stop(): void {
    this.shutdown("STOPPED")
  }

  dispose(): void {
    this.session.invalidate()
    this.adapter.stopPlayback()
    this.adapter.dispose()
    this.playbackState = "STOPPED"
  }

  private applyInactive(): void {
    if (
      this.playbackState === "STOPPED" &&
      !this.adapter.hasActivePlayback()
    ) {
      return
    }

    const wasAudible =
      this.adapter.hasActivePlayback() || this.playbackState === "PLAYING"

    if (wasAudible) {
      logFocusToNone()
    }

    this.shutdown("STOPPED")
  }

  private shutdown(state: PlaybackState): void {
    this.session.invalidate()
    this.adapter.stopPlayback()
    this.playbackState = state
  }

  private async startProbes(
    probeUrls: FocusProbeUrls,
    token: number
  ): Promise<void> {
    const isSessionCurrent = () => this.session.isCurrent(token)
    const started = await this.adapter.startProbes(
      probeUrls.ir,
      probeUrls.scan,
      isSessionCurrent
    )

    if (!this.session.isCurrent(token)) {
      return
    }

    if (!started) {
      this.adapter.stopPlayback()
      if (process.env.NODE_ENV === "development") {
        console.warn(`[AudioRuntime] ${this.playbackFailedLabel} playback failed`)
      }
      this.playbackState = "STOPPED"
      return
    }

    this.playbackState = "PLAYING"
  }
}
