import type { LoopPlaybackAdapter, PlaybackSessionGuard } from "../playback-adapter"
import { isPlaybackSessionAborted } from "../../playback/session-guard"
import { isHtmlElementAudible } from "./html-audio-playback-state"
import { toHtmlAudioVolume } from "./html-audio-gain"

export class HtmlLoopPlaybackAdapter implements LoopPlaybackAdapter {
  private audio: HTMLAudioElement | null = null
  private gain = 1
  private silenced = false
  private currentAssetUrl: string | null = null

  ensureReady(): void {
    if (typeof window === "undefined") return
    this.silenced = false
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.loop = true
      this.audio.preload = "auto"
      this.applyGain()
    }
  }

  setGain(value: number): void {
    this.gain = value
    this.applyGain()
  }

  isPlayingAsset(assetUrl: string): boolean {
    if (this.silenced || !this.audio) return false
    return (
      this.currentAssetUrl === assetUrl && isHtmlElementAudible(this.audio)
    )
  }

  isPlaying(): boolean {
    if (this.silenced) return false
    return isHtmlElementAudible(this.audio)
  }

  hasActivePlayback(): boolean {
    if (this.silenced) return false
    return isHtmlElementAudible(this.audio)
  }

  async startLoop(
    assetUrl: string,
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean> {
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent) || !this.audio) {
      return false
    }

    if (this.isPlayingAsset(assetUrl)) {
      return true
    }

    this.audio.src = assetUrl
    this.audio.load()
    this.attachEndedGuard(this.audio)

    try {
      await this.audio.play()
      if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
        this.halt()
        return false
      }
      this.currentAssetUrl = assetUrl
      return true
    } catch {
      if (!isSessionCurrent()) {
        return false
      }
      this.halt()
      return false
    }
  }

  stopPlayback(): void {
    this.silenced = true
    this.halt()
  }

  dispose(): void {
    this.stopPlayback()
    this.audio = null
  }

  private halt(): void {
    if (!this.audio) {
      this.currentAssetUrl = null
      return
    }
    this.audio.pause()
    this.audio.currentTime = 0
    this.audio.removeAttribute("src")
    this.audio.load()
    this.currentAssetUrl = null
  }

  private attachEndedGuard(player: HTMLAudioElement): void {
    player.onended = () => {
      if (this.silenced) {
        this.halt()
        return
      }
      this.currentAssetUrl = null
      this.halt()
    }
  }

  private applyGain(): void {
    if (!this.audio) return
    this.audio.volume = toHtmlAudioVolume(this.gain)
  }
}
