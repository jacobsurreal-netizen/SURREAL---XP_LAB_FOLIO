import { AudioChannel } from "./audio-channel"
import { FocusLayerChannel } from "./focus-layer-channel"
import { resolveFolioPlaybackMix, type FolioSectionPlayback } from "./folio-experience-mix"
import type { AmbientLayer, SoundBehaviorState } from "./types"

const AMBIENT_ASSETS: Partial<Record<AmbientLayer, string>> = {
  VOID_PROFILE: "/audio/void_profile_loop_v001.wav",
  IR_PROFILE: "/audio/ir_profile_loop_v001.wav",
}

const SECTION_ASSETS: Partial<Record<FolioSectionPlayback, string>> = {
  EXPLORATION_PROFILE: "/audio/exploration_profile_loop_v001.wav",
  IR_EXPLORATION_PROFILE: "/audio/ir_exploration_profile_loop_v001.wav",
  CTA_PROFILE: "/audio/cta_profile_loop_v001.wav",
}

class AudioRuntime {
  private readonly ambientChannel = new AudioChannel<AmbientLayer>({
    logStyle: "ambient",
    missingAssetLabel: "ambient",
    playbackFailedLabel: "ambient",
    assets: AMBIENT_ASSETS,
    noneValue: "NONE",
  })

  private readonly sectionChannel = new AudioChannel<FolioSectionPlayback>({
    logStyle: "section",
    missingAssetLabel: "section",
    playbackFailedLabel: "section",
    assets: SECTION_ASSETS,
    noneValue: "NONE",
  })

  private readonly focusChannel = new FocusLayerChannel()

  prepareFromUserGesture(): void {
    this.ambientChannel.ensurePlayer()
    this.sectionChannel.ensurePlayer()
    this.focusChannel.ensurePlayers()
  }

  applyState(state: SoundBehaviorState, enabled: boolean): void {
    if (typeof window === "undefined") return

    if (!enabled) {
      this.ambientChannel.setOff()
      this.sectionChannel.setOff()
      this.focusChannel.setOff()
      return
    }

    const mix = resolveFolioPlaybackMix(state)

    this.ambientChannel.applyLayer(mix.ambient)
    this.sectionChannel.applyLayer(mix.section)
    this.focusChannel.applyLayer(mix.focus)
  }

  stop(): void {
    this.ambientChannel.reset()
    this.sectionChannel.reset()
    this.focusChannel.reset()
  }

  dispose(): void {
    this.ambientChannel.dispose()
    this.sectionChannel.dispose()
    this.focusChannel.dispose()
  }
}

export const audioRuntime = new AudioRuntime()
