import { FOLIO_TRIGGER_ASSETS } from "../../folio-audio-palette"
import type { SoundBehaviorTrigger } from "../../types"

export class HtmlAudioEventUnit {
  private loggedMissing = new Set<SoundBehaviorTrigger>()
  private loggedUnmapped = new Set<SoundBehaviorTrigger>()

  prepareFromUserGesture(): void {}

  playTriggers(triggerEvents: readonly SoundBehaviorTrigger[]): void {
    if (typeof window === "undefined" || triggerEvents.length === 0) return

    for (const trigger of triggerEvents) {
      this.playTrigger(trigger)
    }
  }

  dispose(): void {
    this.loggedMissing.clear()
    this.loggedUnmapped.clear()
  }

  private playTrigger(trigger: SoundBehaviorTrigger): void {
    const url = FOLIO_TRIGGER_ASSETS[trigger]
    if (!url) {
      if (!this.loggedUnmapped.has(trigger)) {
        console.info(`[Event Runtime]\nNo event asset mapped:\n${trigger}`)
        this.loggedUnmapped.add(trigger)
      }
      return
    }

    const assetName = url.split("/").pop() ?? url
    console.info(`[Event Runtime]\nTrigger ${trigger} → ${assetName}`)

    const audio = new Audio(url)
    audio.loop = false
    audio.preload = "auto"
    audio.volume = 0.5

    void audio.play().catch((error) => {
      if (!this.loggedMissing.has(trigger)) {
        console.info(`[Event Runtime]\nMissing event asset:\n${trigger}`)
        this.loggedMissing.add(trigger)
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(`[EventRuntime] trigger ${trigger} playback failed:`, error)
      }
    })
  }
}
