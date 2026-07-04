import type { FocusPlaybackAdapter, PlaybackSessionGuard } from "../playback-adapter"
import { isPlaybackSessionAborted } from "../../playback/session-guard"
import {
  isWebSourceActive,
  isWebSourceAudible,
} from "./web-audio-playback-state"
import type { WebAudioContextManager } from "./web-audio-context"

export class WebFocusPlaybackAdapter implements FocusPlaybackAdapter {
  private gainNode: GainNode | null = null
  private irSource: AudioBufferSourceNode | null = null
  private scanSource: AudioBufferSourceNode | null = null
  private silenced = false
  private irSourceLive = false
  private scanSourceLive = false
  private irAssetUrl: string | null = null
  private scanAssetUrl: string | null = null

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

  isPlayingProbes(irAssetUrl: string, scanAssetUrl: string): boolean {
    if (this.silenced) return false
    return (
      this.isProbePlaying("ir", irAssetUrl) &&
      this.isProbePlaying("scan", scanAssetUrl)
    )
  }

  isPlaying(): boolean {
    if (this.silenced) return false
    return (
      isWebSourceAudible(
        this.context,
        this.silenced,
        this.irSourceLive,
        this.irAssetUrl
      ) &&
      isWebSourceAudible(
        this.context,
        this.silenced,
        this.scanSourceLive,
        this.scanAssetUrl
      )
    )
  }

  hasActivePlayback(): boolean {
    if (this.silenced) return false
    return (
      isWebSourceActive(this.silenced, this.irSourceLive, this.irAssetUrl) ||
      isWebSourceActive(this.silenced, this.scanSourceLive, this.scanAssetUrl)
    )
  }

  async startProbes(
    irAssetUrl: string,
    scanAssetUrl: string,
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean> {
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      return false
    }

    if (this.isPlayingProbes(irAssetUrl, scanAssetUrl)) {
      return true
    }

    const irOk = await this.startProbe(irAssetUrl, "ir", isSessionCurrent)
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      this.haltSource("ir")
      return false
    }

    const scanOk = await this.startProbe(scanAssetUrl, "scan", isSessionCurrent)
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      this.haltSource("ir")
      this.haltSource("scan")
      return false
    }

    if (!(irOk && scanOk)) {
      this.haltSource("ir")
      this.haltSource("scan")
      return false
    }

    return true
  }

  stopPlayback(): void {
    this.silenced = true
    this.haltSource("ir")
    this.haltSource("scan")
  }

  dispose(): void {
    this.stopPlayback()
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
  }

  private isProbePlaying(slot: "ir" | "scan", assetUrl: string): boolean {
    const sourceLive = slot === "ir" ? this.irSourceLive : this.scanSourceLive
    const tracked = slot === "ir" ? this.irAssetUrl : this.scanAssetUrl
    return isWebSourceActive(this.silenced, sourceLive, tracked, assetUrl)
  }

  private async startProbe(
    assetUrl: string,
    slot: "ir" | "scan",
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean> {
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      return false
    }

    if (this.isProbePlaying(slot, assetUrl)) {
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

    this.haltSource(slot)

    if (!isSessionCurrent()) {
      return false
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.gainNode)
    source.onended = () => {
      if (slot === "ir" && this.irSource === source) {
        this.irSource = null
        this.irSourceLive = false
        this.irAssetUrl = null
      }
      if (slot === "scan" && this.scanSource === source) {
        this.scanSource = null
        this.scanSourceLive = false
        this.scanAssetUrl = null
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
      if (slot === "ir") {
        this.irSource = source
        this.irSourceLive = true
        this.irAssetUrl = assetUrl
      } else {
        this.scanSource = source
        this.scanSourceLive = true
        this.scanAssetUrl = assetUrl
      }
      return true
    } catch {
      source.disconnect()
      return false
    }
  }

  private haltSource(slot: "ir" | "scan"): void {
    if (slot === "ir") {
      this.irSourceLive = false
    } else {
      this.scanSourceLive = false
    }

    const source = slot === "ir" ? this.irSource : this.scanSource
    if (!source) {
      if (slot === "ir") this.irAssetUrl = null
      else this.scanAssetUrl = null
      return
    }

    source.onended = null

    try {
      source.stop()
    } catch {
      // already stopped
    }

    source.disconnect()

    if (slot === "ir") {
      this.irSource = null
      this.irAssetUrl = null
    } else {
      this.scanSource = null
      this.scanAssetUrl = null
    }
  }
}
