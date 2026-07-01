import type { AudioBackend, EffectiveChannelGains, LayerPlaybackState } from "../../audio-runtime-types"
import type { FolioSectionPlayback } from "../../folio-experience-mix"
import {
  FOLIO_AMBIENT_ASSETS,
  FOLIO_SECTION_ASSETS,
} from "../../folio-audio-palette"
import type { AmbientLayer, SoundBehaviorTrigger } from "../../types"
import { HtmlAudioEventUnit } from "./html-audio-event-unit"
import { HtmlAudioFocusUnit } from "./html-audio-focus-unit"
import { HtmlAudioLoopUnit } from "./html-audio-loop-unit"

export class HtmlAudioBackend implements AudioBackend {
  private readonly ambientUnit = new HtmlAudioLoopUnit<AmbientLayer>({
    logStyle: "ambient",
    missingAssetLabel: "ambient",
    playbackFailedLabel: "ambient",
    assets: FOLIO_AMBIENT_ASSETS,
    noneValue: "NONE",
  })

  private readonly sectionUnit = new HtmlAudioLoopUnit<FolioSectionPlayback>({
    logStyle: "section",
    missingAssetLabel: "section",
    playbackFailedLabel: "section",
    assets: FOLIO_SECTION_ASSETS,
    noneValue: "NONE",
  })

  private readonly focusUnit = new HtmlAudioFocusUnit()
  private readonly eventUnit = new HtmlAudioEventUnit()

  setEffectiveGains(gains: EffectiveChannelGains): void {
    this.ambientUnit.setEffectiveGain(gains.ambient)
    this.sectionUnit.setEffectiveGain(gains.section)
    this.focusUnit.setEffectiveGain(gains.focus)
    this.eventUnit.setEffectiveGain(gains.event)
  }

  prepareFromUserGesture(): void {
    this.ambientUnit.prepareFromUserGesture()
    this.sectionUnit.prepareFromUserGesture()
    this.focusUnit.prepareFromUserGesture()
    this.eventUnit.prepareFromUserGesture()
  }

  applyLayerState(state: LayerPlaybackState, enabled: boolean): void {
    if (typeof window === "undefined") return

    if (!enabled) {
      this.ambientUnit.setOff()
      this.sectionUnit.setOff()
      this.focusUnit.setOff()
      return
    }

    this.ambientUnit.update(state.ambient)
    this.sectionUnit.update(state.section)
    this.focusUnit.update(state.focus)
  }

  applyTriggerEvents(
    triggerEvents: readonly SoundBehaviorTrigger[],
    enabled: boolean
  ): void {
    if (!enabled || triggerEvents.length === 0) return
    this.eventUnit.playTriggers(triggerEvents)
  }

  stop(): void {
    this.ambientUnit.stop()
    this.sectionUnit.stop()
    this.focusUnit.stop()
  }

  dispose(): void {
    this.ambientUnit.dispose()
    this.sectionUnit.dispose()
    this.focusUnit.dispose()
    this.eventUnit.dispose()
  }
}

export function createHtmlAudioBackend(): AudioBackend {
  return new HtmlAudioBackend()
}
