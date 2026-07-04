import type { EventPlaybackUnit } from "../../audio-runtime-types"
import { FOLIO_TRIGGER_ASSETS } from "../../folio-audio-palette"
import type { SoundBehaviorTrigger } from "../../types"
import { EventChannelController } from "../../playback/event-channel-controller"
import type { WebAudioContextManager } from "./web-audio-context"
import { WebEventPlaybackAdapter } from "./web-event-playback-adapter"

export class WebAudioEventUnit implements EventPlaybackUnit {
  private readonly controller: EventChannelController
  private readonly loggedUnmapped = new Set<SoundBehaviorTrigger>()

  constructor(context: WebAudioContextManager) {
    this.controller = new EventChannelController(new WebEventPlaybackAdapter(context))
  }

  prepareFromUserGesture(): void {
    this.controller.prepareFromUserGesture()
  }

  setEffectiveGain(gain: number): void {
    this.controller.setEffectiveGain(gain)
  }

  playTriggers(triggerEvents: readonly SoundBehaviorTrigger[]): void {
    if (typeof window === "undefined" || triggerEvents.length === 0) return

    const requests = triggerEvents
      .map((trigger) => {
        const assetUrl = FOLIO_TRIGGER_ASSETS[trigger]
        if (!assetUrl) {
          if (!this.loggedUnmapped.has(trigger)) {
            console.info(`[Event Runtime]\nNo event asset mapped:\n${trigger}`)
            this.loggedUnmapped.add(trigger)
          }
          return null
        }
        return { id: trigger, assetUrl }
      })
      .filter((request): request is { id: SoundBehaviorTrigger; assetUrl: string } =>
        Boolean(request)
      )

    this.controller.playTriggers(requests)
  }

  setOff(): void {
    this.controller.setOff()
  }

  stop(): void {
    this.controller.stop()
  }

  dispose(): void {
    this.controller.dispose()
    this.loggedUnmapped.clear()
  }
}
