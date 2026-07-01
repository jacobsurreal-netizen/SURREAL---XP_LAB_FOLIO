import type { AudioPlaybackUnit } from "../../audio-runtime-types"
import {
  FOLIO_FOCUS_PROBE_ASSETS,
  type FolioFocusProbeProfile,
} from "../../folio-audio-palette"
import type { FocusLayer } from "../../types"
import { toHtmlAudioVolume } from "./html-audio-gain"

const FOCUS_ACTIVE_LABEL = "IR + SCAN"

type FocusAppliedState = "OFF" | "NONE" | "ACTIVE"

export class HtmlAudioFocusUnit implements AudioPlaybackUnit {
  private irPlayer: HTMLAudioElement | null = null
  private scanPlayer: HTMLAudioElement | null = null
  private lastApplied: FocusAppliedState | null = null
  private loggedMissing = new Set<FolioFocusProbeProfile>()
  private effectiveGain = 1

  setEffectiveGain(gain: number): void {
    this.effectiveGain = gain
    this.applyVolume(this.irPlayer)
    this.applyVolume(this.scanPlayer)
  }

  prepareFromUserGesture(): void {
    if (typeof window === "undefined") return

    if (!this.irPlayer) {
      this.irPlayer = this.createPlayer()
    }
    if (!this.scanPlayer) {
      this.scanPlayer = this.createPlayer()
    }
  }

  update(focusLayer: FocusLayer): void {
    const shouldPlay = focusLayer === "SCAN_PROFILE"

    if (shouldPlay && this.isActiveAndPlaying()) {
      this.lastApplied = "ACTIVE"
      return
    }

    if (!shouldPlay) {
      if (this.lastApplied === "ACTIVE") {
        console.info(`[Audio Runtime]\nFocus\n${FOCUS_ACTIVE_LABEL} → NONE`)
        this.haltAll()
        this.lastApplied = "NONE"
      }
      return
    }

    if (this.lastApplied !== "ACTIVE") {
      console.info(`[Audio Runtime]\nFocus\nNONE → ${FOCUS_ACTIVE_LABEL}`)
    }

    this.prepareFromUserGesture()
    this.startProbeProfile("IR_PROFILE", this.irPlayer)
    this.startProbeProfile("SCAN_PROFILE", this.scanPlayer)
    this.lastApplied = "ACTIVE"
  }

  setOff(): void {
    if (this.lastApplied === "OFF") return
    this.haltAll()
    this.lastApplied = "OFF"
  }

  stop(): void {
    this.haltAll()
    this.lastApplied = null
  }

  dispose(): void {
    this.stop()
    this.irPlayer = null
    this.scanPlayer = null
    this.loggedMissing.clear()
  }

  private createPlayer(): HTMLAudioElement {
    const audio = new Audio()
    audio.loop = true
    audio.preload = "auto"
    this.applyVolume(audio)
    return audio
  }

  private isActiveAndPlaying(): boolean {
    return (
      this.lastApplied === "ACTIVE" &&
      this.isPlayerPlaying(this.irPlayer) &&
      this.isPlayerPlaying(this.scanPlayer)
    )
  }

  private isPlayerPlaying(player: HTMLAudioElement | null): boolean {
    return Boolean(player && !player.paused && player.src)
  }

  private startProbeProfile(
    profile: FolioFocusProbeProfile,
    player: HTMLAudioElement | null
  ): void {
    if (!player) return

    const url = FOLIO_FOCUS_PROBE_ASSETS[profile]
    if (!url) {
      if (!this.loggedMissing.has(profile)) {
        console.info(`Missing focus asset:\n${profile}`)
        this.loggedMissing.add(profile)
      }
      return
    }

    if (player.src.endsWith(url) && !player.paused) {
      return
    }

    player.src = url
    player.load()

    void player.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[AudioRuntime] focus ${profile} playback failed:`, error)
      }
    })
  }

  private haltPlayer(player: HTMLAudioElement | null): void {
    if (!player) return
    player.pause()
    player.currentTime = 0
    player.removeAttribute("src")
    player.load()
  }

  private haltAll(): void {
    this.haltPlayer(this.irPlayer)
    this.haltPlayer(this.scanPlayer)
  }

  private applyVolume(player: HTMLAudioElement | null): void {
    if (!player) return
    player.volume = toHtmlAudioVolume(this.effectiveGain)
  }
}
