import type { AudioPlaybackUnit } from "../../audio-runtime-types"
import {
  FOLIO_FOCUS_PROBE_ASSETS,
  type FolioFocusProbeProfile,
} from "../../folio-audio-palette"
import { FocusChannelController } from "../../playback/focus-channel-controller"
import type { FocusLayer } from "../../types"
import type { WebAudioContextManager } from "./web-audio-context"
import { WebFocusPlaybackAdapter } from "./web-focus-playback-adapter"

export class WebAudioFocusUnit implements AudioPlaybackUnit {
  private readonly controller: FocusChannelController
  private readonly loggedMissing = new Set<FolioFocusProbeProfile>()

  constructor(context: WebAudioContextManager) {
    this.controller = new FocusChannelController(new WebFocusPlaybackAdapter(context))
  }

  prepareFromUserGesture(): void {
    this.controller.prepareFromUserGesture()
  }

  setEffectiveGain(gain: number): void {
    this.controller.setEffectiveGain(gain)
  }

  update(focusLayer: FocusLayer): void {
    const active = focusLayer === "SCAN_PROFILE"
    if (!active) {
      this.controller.update(false, null)
      return
    }

    const ir = FOLIO_FOCUS_PROBE_ASSETS.IR_PROFILE
    const scan = FOLIO_FOCUS_PROBE_ASSETS.SCAN_PROFILE

    if (!ir || !this.ensureProbeAsset("IR_PROFILE", ir)) {
      this.controller.update(false, null)
      return
    }

    if (!scan || !this.ensureProbeAsset("SCAN_PROFILE", scan)) {
      this.controller.update(false, null)
      return
    }

    this.controller.update(true, { ir, scan })
  }

  setOff(): void {
    this.controller.setOff()
  }

  stop(): void {
    this.controller.stop()
  }

  dispose(): void {
    this.controller.dispose()
    this.loggedMissing.clear()
  }

  private ensureProbeAsset(profile: FolioFocusProbeProfile, url: string): boolean {
    if (url) return true
    if (!this.loggedMissing.has(profile)) {
      console.info(`Missing focus asset:\n${profile}`)
      this.loggedMissing.add(profile)
    }
    return false
  }
}
