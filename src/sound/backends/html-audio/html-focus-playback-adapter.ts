import type { FocusPlaybackAdapter, PlaybackSessionGuard } from "../playback-adapter"
import { isPlaybackSessionAborted } from "../../playback/session-guard"
import { isHtmlElementAudible } from "./html-audio-playback-state"
import { toHtmlAudioVolume } from "./html-audio-gain"

export class HtmlFocusPlaybackAdapter implements FocusPlaybackAdapter {
  private irPlayer: HTMLAudioElement | null = null
  private scanPlayer: HTMLAudioElement | null = null
  private gain = 1
  private silenced = false
  private irAssetUrl: string | null = null
  private scanAssetUrl: string | null = null

  ensureReady(): void {
    if (typeof window === "undefined") return
    this.silenced = false
    if (!this.irPlayer) {
      this.irPlayer = this.createPlayer()
    }
    if (!this.scanPlayer) {
      this.scanPlayer = this.createPlayer()
    }
  }

  setGain(value: number): void {
    this.gain = value
    this.applyGain(this.irPlayer)
    this.applyGain(this.scanPlayer)
  }

  isPlayingProbes(irAssetUrl: string, scanAssetUrl: string): boolean {
    if (this.silenced) return false
    return (
      this.isPlayerPlayingAsset(this.irPlayer, irAssetUrl, this.irAssetUrl) &&
      this.isPlayerPlayingAsset(this.scanPlayer, scanAssetUrl, this.scanAssetUrl)
    )
  }

  isPlaying(): boolean {
    if (this.silenced) return false
    return (
      isHtmlElementAudible(this.irPlayer) &&
      isHtmlElementAudible(this.scanPlayer)
    )
  }

  hasActivePlayback(): boolean {
    if (this.silenced) return false
    return (
      isHtmlElementAudible(this.irPlayer) ||
      isHtmlElementAudible(this.scanPlayer)
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

    const irOk = await this.startPlayer(
      this.irPlayer,
      irAssetUrl,
      "ir",
      isSessionCurrent
    )
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      this.haltPlayer(this.irPlayer, "ir")
      return false
    }

    const scanOk = await this.startPlayer(
      this.scanPlayer,
      scanAssetUrl,
      "scan",
      isSessionCurrent
    )
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
      this.haltPlayer(this.irPlayer, "ir")
      this.haltPlayer(this.scanPlayer, "scan")
      return false
    }

    if (!(irOk && scanOk)) {
      this.haltPlayer(this.irPlayer, "ir")
      this.haltPlayer(this.scanPlayer, "scan")
      return false
    }

    return true
  }

  stopPlayback(): void {
    this.silenced = true
    this.haltPlayer(this.irPlayer, "ir")
    this.haltPlayer(this.scanPlayer, "scan")
  }

  dispose(): void {
    this.stopPlayback()
    this.irPlayer = null
    this.scanPlayer = null
  }

  private createPlayer(): HTMLAudioElement {
    const audio = new Audio()
    audio.loop = true
    audio.preload = "auto"
    this.applyGain(audio)
    return audio
  }

  private async startPlayer(
    player: HTMLAudioElement | null,
    assetUrl: string,
    slot: "ir" | "scan",
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean> {
    if (isPlaybackSessionAborted(this.silenced, isSessionCurrent) || !player) {
      return false
    }

    const trackedUrl = slot === "ir" ? this.irAssetUrl : this.scanAssetUrl
    if (this.isPlayerPlayingAsset(player, assetUrl, trackedUrl)) {
      return true
    }

    player.src = assetUrl
    player.load()
    this.attachEndedGuard(player, slot)

    try {
      await player.play()
      if (isPlaybackSessionAborted(this.silenced, isSessionCurrent)) {
        this.haltPlayer(player, slot)
        return false
      }
      if (slot === "ir") {
        this.irAssetUrl = assetUrl
      } else {
        this.scanAssetUrl = assetUrl
      }
      return true
    } catch {
      if (!isSessionCurrent()) {
        return false
      }
      this.haltPlayer(player, slot)
      return false
    }
  }

  private isPlayerPlayingAsset(
    player: HTMLAudioElement | null,
    assetUrl: string,
    trackedUrl: string | null
  ): boolean {
    return trackedUrl === assetUrl && isHtmlElementAudible(player)
  }

  private haltPlayer(player: HTMLAudioElement | null, slot: "ir" | "scan"): void {
    if (!player) {
      if (slot === "ir") this.irAssetUrl = null
      else this.scanAssetUrl = null
      return
    }
    player.onended = null
    player.pause()
    player.currentTime = 0
    player.removeAttribute("src")
    player.load()
    if (slot === "ir") this.irAssetUrl = null
    else this.scanAssetUrl = null
  }

  private attachEndedGuard(player: HTMLAudioElement, slot: "ir" | "scan"): void {
    player.onended = () => {
      if (this.silenced) {
        this.haltPlayer(player, slot)
        return
      }
      this.haltPlayer(player, slot)
    }
  }

  private applyGain(player: HTMLAudioElement | null): void {
    if (!player) return
    player.volume = toHtmlAudioVolume(this.gain)
  }
}
