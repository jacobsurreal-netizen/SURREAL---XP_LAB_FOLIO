import type { LoopPlaybackAdapter, PlaybackSessionGuard } from "../playback-adapter"
import { isPlaybackSessionAborted } from "../../playback/session-guard"
import {
  isWebSourceActive,
  isWebSourceAudible,
} from "./web-audio-playback-state"
import type { WebAudioContextManager } from "./web-audio-context"

export class WebLoopPlaybackAdapter implements LoopPlaybackAdapter {
  private gainNode: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private silenced = false
  private sourceLive = false
  private currentAssetUrl: string | null = null

  constructor(private readonly context: WebAudioContextManager) {}

  ensureReady(): void {
    this.silenced = false
    this.context.prepareFromUserGesture()
    if (!this.gainNode) {
      this.gainNode = this.context.createGainNode()
    }
  }

  setGain(value: number): void {
    if (!this.gainNode) return
    this.gainNode.gain.value = value
  }

  isPlayingAsset(assetUrl: string): boolean {
    return isWebSourceActive(
      this.silenced,
      this.sourceLive,
      this.currentAssetUrl,
      assetUrl
    )
  }

  isPlaying(): boolean {
    return isWebSourceAudible(
      this.context,
      this.silenced,
      this.sourceLive,
      this.currentAssetUrl
    )
  }

  hasActivePlayback(): boolean {
    return isWebSourceActive(
      this.silenced,
      this.sourceLive,
      this.currentAssetUrl
    )
  }

  async startLoop(
    assetUrl: string,
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean> {
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      return false
    }

    if (this.isPlayingAsset(assetUrl)) {
      return true
    }

    const buffer = await this.context.loadBuffer(assetUrl)
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent) || !buffer) {
      return false
    }

    const ctx = this.context.ensureContext()
    if (
      !ctx ||
      !this.gainNode ||
      isPlaybackSessionAborted(this.silenced, isSessionCurrent)
    ) {
      return false
    }

    if (!this.isPlayingAsset(assetUrl)) {
      this.haltSource()
    }

    if (!isSessionCurrent()) {
      return false
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.gainNode)
    source.onended = () => {
      if (this.source === source) {
        this.source = null
        this.sourceLive = false
        this.currentAssetUrl = null
      }
      source.disconnect()
    }

    try {
      source.start(0)
      if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
        try {
          source.stop()
        } catch {
          // already stopped
        }
        source.disconnect()
        return false
      }
      this.source = source
      this.sourceLive = true
      this.currentAssetUrl = assetUrl
      return true
    } catch {
      source.disconnect()
      return false
    }
  }

  stopPlayback(): void {
    this.silenced = true
    this.haltSource()
  }

  dispose(): void {
    this.stopPlayback()
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
  }

  private haltSource(): void {
    this.sourceLive = false

    if (!this.source) {
      this.currentAssetUrl = null
      return
    }

    this.source.onended = null

    try {
      this.source.stop()
    } catch {
      // already stopped
    }

    this.source.disconnect()
    this.source = null
    this.currentAssetUrl = null
  }
}
