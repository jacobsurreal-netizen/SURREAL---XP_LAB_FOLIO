import type { AudioLoopPlaybackUnit } from "../../audio-runtime-types"
import { toHtmlAudioVolume } from "./html-audio-gain"

type LoopUnitLogStyle = "ambient" | "section"

function formatAmbientLogLabel(layer: string): string {
  switch (layer) {
    case "VOID_PROFILE":
      return "VOID"
    case "IR_PROFILE":
      return "IR"
    case "NONE":
      return "NONE"
    default:
      return layer
  }
}

function formatSectionLogLabel(layer: string): string {
  switch (layer) {
    case "EXPLORATION_PROFILE":
      return "EXPLORATION"
    case "IR_EXPLORATION_PROFILE":
      return "IR_EXPLORATION"
    case "CTA_PROFILE":
      return "CTA"
    case "NONE":
      return "NONE"
    default:
      return layer
  }
}

export interface HtmlAudioLoopUnitConfig<T extends string> {
  logStyle: LoopUnitLogStyle
  missingAssetLabel: string
  playbackFailedLabel: string
  assets: Partial<Record<T, string>>
  noneValue: T
}

export class HtmlAudioLoopUnit<T extends string> implements AudioLoopPlaybackUnit<T> {
  private audio: HTMLAudioElement | null = null
  private playing: T | null = null
  private lastApplied: T | "OFF" | null = null
  private loggedMissing = new Set<T>()
  private effectiveGain = 1

  constructor(private readonly config: HtmlAudioLoopUnitConfig<T>) {}

  setEffectiveGain(gain: number): void {
    this.effectiveGain = gain
    this.applyVolume()
  }

  prepareFromUserGesture(): void {
    if (typeof window === "undefined") return
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.loop = true
      this.audio.preload = "auto"
      this.applyVolume()
    }
  }

  update(layer: T): void {
    if (
      layer === this.lastApplied &&
      layer === this.playing &&
      this.audio &&
      !this.audio.paused
    ) {
      return
    }

    if (layer === this.config.noneValue) {
      if (this.lastApplied !== this.config.noneValue) {
        this.logToNone(this.playing)
        this.halt()
        this.playing = null
        this.lastApplied = this.config.noneValue
      }
      return
    }

    const url = this.resolveAssetUrl(layer)
    if (!url) {
      if (!this.loggedMissing.has(layer)) {
        console.info(`Missing ${this.config.missingAssetLabel} asset:\n${layer}`)
        this.loggedMissing.add(layer)
      }
      return
    }

    if (layer === this.playing && this.audio && !this.audio.paused) {
      this.lastApplied = layer
      return
    }

    this.logSwap(this.playing, layer)

    this.prepareFromUserGesture()
    if (!this.audio) return

    this.audio.src = url
    this.audio.load()
    this.playing = layer
    this.lastApplied = layer

    void this.audio.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[AudioRuntime] ${this.config.playbackFailedLabel} playback failed:`,
          error
        )
      }
    })
  }

  setOff(): void {
    if (this.lastApplied === "OFF") return
    this.halt()
    this.playing = null
    this.lastApplied = "OFF"
  }

  stop(): void {
    this.halt()
    this.playing = null
    this.lastApplied = null
  }

  dispose(): void {
    this.stop()
    this.audio = null
    this.loggedMissing.clear()
  }

  private resolveAssetUrl(layer: T): string | null {
    if (layer === this.config.noneValue) return null
    return this.config.assets[layer] ?? null
  }

  private logToNone(previous: T | null): void {
    if (!previous || previous === this.config.noneValue) return

    if (this.config.logStyle === "ambient") {
      console.info(
        `[Audio Runtime]\nAmbient\n${formatAmbientLogLabel(String(previous))} → NONE`
      )
      return
    }

    console.info(
      `[Audio Runtime]\nSection\n${formatSectionLogLabel(String(previous))} → NONE`
    )
  }

  private logSwap(previous: T | null, next: T): void {
    if (this.config.logStyle === "ambient") {
      if (previous && previous !== next) {
        console.info(
          `[Audio Runtime]\nAmbient\n${formatAmbientLogLabel(String(previous))} → ${formatAmbientLogLabel(String(next))}`
        )
      }
      return
    }

    if (previous !== next) {
      console.info(
        `[Audio Runtime]\nSection\n${formatSectionLogLabel(String(previous ?? "NONE"))} → ${formatSectionLogLabel(String(next))}`
      )
    }
  }

  private halt(): void {
    if (!this.audio) return
    this.audio.pause()
    this.audio.currentTime = 0
    this.audio.removeAttribute("src")
    this.audio.load()
  }

  private applyVolume(): void {
    if (!this.audio) return
    this.audio.volume = toHtmlAudioVolume(this.effectiveGain)
  }
}
