import type { FocusLayer } from "./types"

const FOCUS_PROBE_ASSETS = {
  IR_PROFILE: "/audio/ir_profile_loop_v001.wav",
  SCAN_PROFILE: "/audio/scan_profile_loop_v001.wav",
} as const

type FocusProbeProfile = keyof typeof FOCUS_PROBE_ASSETS

const FOCUS_ACTIVE_LABEL = "IR + SCAN"

type FocusAppliedState = "OFF" | "NONE" | "ACTIVE"

/**
 * Focus layer playback — probe state (IR + SCAN stacked when SCAN mode is active).
 * When state.focusLayer is SCAN_PROFILE, both probe loops run simultaneously.
 */
export class FocusLayerChannel {
  private irPlayer: HTMLAudioElement | null = null
  private scanPlayer: HTMLAudioElement | null = null
  private lastApplied: FocusAppliedState | null = null
  private loggedMissing = new Set<FocusProbeProfile>()

  ensurePlayers(): void {
    if (typeof window === "undefined") return

    if (!this.irPlayer) {
      this.irPlayer = this.createPlayer()
    }
    if (!this.scanPlayer) {
      this.scanPlayer = this.createPlayer()
    }
  }

  applyLayer(focusLayer: FocusLayer): void {
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

    this.ensurePlayers()
    this.startProbeProfile("IR_PROFILE", this.irPlayer)
    this.startProbeProfile("SCAN_PROFILE", this.scanPlayer)
    this.lastApplied = "ACTIVE"
  }

  setOff(): void {
    if (this.lastApplied === "OFF") return
    this.haltAll()
    this.lastApplied = "OFF"
  }

  reset(): void {
    this.haltAll()
    this.lastApplied = null
  }

  dispose(): void {
    this.reset()
    this.irPlayer = null
    this.scanPlayer = null
    this.loggedMissing.clear()
  }

  private createPlayer(): HTMLAudioElement {
    const audio = new Audio()
    audio.loop = true
    audio.preload = "auto"
    audio.volume = 0.5
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
    profile: FocusProbeProfile,
    player: HTMLAudioElement | null
  ): void {
    if (!player) return

    const url = FOCUS_PROBE_ASSETS[profile]
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
}
