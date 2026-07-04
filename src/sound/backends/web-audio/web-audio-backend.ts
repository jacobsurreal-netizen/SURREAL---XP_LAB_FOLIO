import type { AudioBackend, EffectiveChannelGains, LayerPlaybackState } from "../../audio-runtime-types"
import type { FolioSectionPlayback } from "../../folio-experience-mix"
import {
  FOLIO_AMBIENT_ASSETS,
  FOLIO_SECTION_ASSETS,
  listFolioSustainedAssetUrls,
  listFolioTriggerAssetUrls,
} from "../../folio-audio-palette"
import type { AmbientLayer, SoundBehaviorTrigger } from "../../types"
import { calibrateWebAudioGain } from "./web-audio-gain"
import { WebAudioContextManager } from "./web-audio-context"
import { WebAudioEventUnit } from "./web-audio-event-unit"
import { WebAudioFocusUnit } from "./web-audio-focus-unit"
import { WebAudioLoopUnit } from "./web-audio-loop-unit"

export class WebAudioBackend implements AudioBackend {
  private readonly context = new WebAudioContextManager()

  private readonly ambientUnit = new WebAudioLoopUnit<AmbientLayer>(this.context, {
    channel: "ambient",
    missingAssetLabel: "ambient",
    playbackFailedLabel: "ambient",
    assets: FOLIO_AMBIENT_ASSETS,
    noneValue: "NONE",
  })

  private readonly sectionUnit = new WebAudioLoopUnit<FolioSectionPlayback>(this.context, {
    channel: "section",
    missingAssetLabel: "section",
    playbackFailedLabel: "section",
    assets: FOLIO_SECTION_ASSETS,
    noneValue: "NONE",
  })

  private readonly focusUnit = new WebAudioFocusUnit(this.context)
  private readonly eventUnit = new WebAudioEventUnit(this.context)

  setEffectiveGains(gains: EffectiveChannelGains): void {
    this.ambientUnit.setEffectiveGain(calibrateWebAudioGain(gains.ambient))
    this.sectionUnit.setEffectiveGain(calibrateWebAudioGain(gains.section))
    this.focusUnit.setEffectiveGain(calibrateWebAudioGain(gains.focus))
    this.eventUnit.setEffectiveGain(calibrateWebAudioGain(gains.event))
  }

  prepareFromUserGesture(): void {
    this.context.prepareFromUserGesture()
    this.context.preloadBuffers(listFolioSustainedAssetUrls())
    this.context.preloadBuffers(listFolioTriggerAssetUrls())
    this.ambientUnit.prepareFromUserGesture()
    this.sectionUnit.prepareFromUserGesture()
    this.focusUnit.prepareFromUserGesture()
    this.eventUnit.prepareFromUserGesture()
  }

  silenceAll(): void {
    this.ambientUnit.setOff()
    this.sectionUnit.setOff()
    this.focusUnit.setOff()
    this.eventUnit.setOff()
  }

  applyLayerState(state: LayerPlaybackState, enabled: boolean): void {
    if (typeof window === "undefined") return

    if (!enabled) {
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
    this.eventUnit.stop()
  }

  dispose(): void {
    this.ambientUnit.dispose()
    this.sectionUnit.dispose()
    this.focusUnit.dispose()
    this.eventUnit.dispose()
    this.context.dispose()
  }

  getDiagnostics() {
    const diagnostics = this.context.getDiagnostics()
    return {
      backendId: "web-audio" as const,
      ...diagnostics,
    }
  }
}

export function createWebAudioBackend(): AudioBackend {
  return new WebAudioBackend()
}
