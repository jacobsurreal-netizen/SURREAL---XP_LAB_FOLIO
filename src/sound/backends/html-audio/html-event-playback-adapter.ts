import type { EventPlaybackAdapter } from "../playback-adapter"
import { toHtmlAudioVolume } from "./html-audio-gain"

export class HtmlEventPlaybackAdapter implements EventPlaybackAdapter {
  private readonly active = new Set<HTMLAudioElement>()
  private gain = 1
  private silenced = false

  ensureReady(): void {
    this.silenced = false
  }

  setGain(value: number): void {
    this.gain = value
    for (const audio of this.active) {
      audio.volume = toHtmlAudioVolume(this.gain)
    }
  }

  async playOneShot(assetUrl: string): Promise<boolean> {
    if (typeof window === "undefined" || this.silenced) return false

    const audio = new Audio(assetUrl)
    audio.loop = false
    audio.preload = "auto"
    audio.volume = toHtmlAudioVolume(this.gain)

    this.active.add(audio)

    const cleanup = () => {
      this.active.delete(audio)
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
    }

    audio.addEventListener("ended", cleanup, { once: true })
    audio.addEventListener("error", cleanup, { once: true })

    try {
      await audio.play()
      if (this.silenced) {
        cleanup()
        return false
      }
      return true
    } catch {
      cleanup()
      return false
    }
  }

  stopAll(): void {
    this.silenced = true
    for (const audio of [...this.active]) {
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute("src")
      audio.load()
      this.active.delete(audio)
    }
  }

  dispose(): void {
    this.stopAll()
  }
}
