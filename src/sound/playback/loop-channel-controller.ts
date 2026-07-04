import type { LoopPlaybackAdapter } from "../backends/playback-adapter"
import { AsyncSession } from "./async-session"
import type { PlaybackState } from "./channel-lifecycle"
import { logLoopSwap, logLoopToNone, type LoopChannelKind } from "./playback-log"

export interface LoopChannelControllerConfig {
  channel: LoopChannelKind
  noneLayer: string
  adapter: LoopPlaybackAdapter
  playbackFailedLabel: string
}

export class LoopChannelController {
  private readonly session = new AsyncSession()
  private playbackState: PlaybackState = "STOPPED"
  private currentLayer: string | null = null

  constructor(private readonly config: LoopChannelControllerConfig) {}

  getState(): PlaybackState {
    return this.playbackState
  }

  prepareFromUserGesture(): void {
    this.config.adapter.ensureReady()
  }

  setEffectiveGain(gain: number): void {
    this.config.adapter.setGain(gain)
  }

  update(layer: string, assetUrl: string | null): void {
    if (layer === this.config.noneLayer) {
      this.applyNone()
      return
    }

    if (!assetUrl) {
      return
    }

    if (
      layer === this.currentLayer &&
      this.config.adapter.isPlayingAsset(assetUrl)
    ) {
      if (this.playbackState !== "PLAYING") {
        this.playbackState = "PLAYING"
      }
      return
    }

    if (this.currentLayer !== null && this.currentLayer !== layer) {
      logLoopSwap(this.config.channel, this.currentLayer, layer)
    }

    this.config.adapter.ensureReady()

    const layerChanged =
      this.currentLayer !== null && this.currentLayer !== layer
    const orphanPlayback =
      this.config.adapter.isPlaying() &&
      !this.config.adapter.isPlayingAsset(assetUrl)

    if ((layerChanged || orphanPlayback) && this.config.adapter.isPlaying()) {
      this.config.adapter.stopPlayback()
      this.config.adapter.ensureReady()
    }

    const token = this.session.bump()
    void this.startLayer(layer, assetUrl, token)
  }

  setOff(): void {
    this.shutdown("OFF", null)
  }

  stop(): void {
    this.shutdown("STOPPED", null)
  }

  dispose(): void {
    this.session.invalidate()
    this.config.adapter.stopPlayback()
    this.config.adapter.dispose()
    this.playbackState = "STOPPED"
    this.currentLayer = null
  }

  private applyNone(): void {
    if (
      this.playbackState === "STOPPED" &&
      this.currentLayer === this.config.noneLayer &&
      !this.config.adapter.hasActivePlayback()
    ) {
      return
    }

    const wasAudible =
      this.config.adapter.hasActivePlayback() ||
      (this.playbackState === "PLAYING" && this.currentLayer !== null)

    if (wasAudible && this.currentLayer !== this.config.noneLayer) {
      logLoopToNone(this.config.channel, this.currentLayer)
    }

    this.shutdown("STOPPED", this.config.noneLayer)
  }

  private shutdown(state: PlaybackState, layerMarker: string | null): void {
    this.session.invalidate()
    this.config.adapter.stopPlayback()
    this.playbackState = state
    this.currentLayer = layerMarker
  }

  private async startLayer(
    layer: string,
    assetUrl: string,
    token: number
  ): Promise<void> {
    const isSessionCurrent = () => this.session.isCurrent(token)
    const started = await this.config.adapter.startLoop(assetUrl, isSessionCurrent)

    if (!this.session.isCurrent(token)) {
      return
    }

    if (!started) {
      this.config.adapter.stopPlayback()
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[AudioRuntime] ${this.config.playbackFailedLabel} playback failed:`,
          assetUrl
        )
      }
      this.playbackState = "STOPPED"
      this.currentLayer = null
      return
    }

    this.currentLayer = layer
    this.playbackState = "PLAYING"
  }
}
