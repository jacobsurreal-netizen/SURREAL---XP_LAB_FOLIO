import type { AudioLoopPlaybackUnit } from "../../audio-runtime-types"
import { LoopChannelController } from "../../playback/loop-channel-controller"
import type { LoopChannelKind } from "../../playback/playback-log"
import type { WebAudioContextManager } from "./web-audio-context"
import { WebLoopPlaybackAdapter } from "./web-loop-playback-adapter"

export interface WebAudioLoopUnitConfig<T extends string> {
  channel: LoopChannelKind
  missingAssetLabel: string
  playbackFailedLabel: string
  assets: Partial<Record<T, string>>
  noneValue: T
}

export class WebAudioLoopUnit<T extends string> implements AudioLoopPlaybackUnit<T> {
  private readonly controller: LoopChannelController
  private readonly loggedMissing = new Set<T>()

  constructor(
    context: WebAudioContextManager,
    private readonly config: WebAudioLoopUnitConfig<T>
  ) {
    this.controller = new LoopChannelController({
      channel: config.channel,
      noneLayer: config.noneValue,
      adapter: new WebLoopPlaybackAdapter(context),
      playbackFailedLabel: config.playbackFailedLabel,
    })
  }

  prepareFromUserGesture(): void {
    this.controller.prepareFromUserGesture()
  }

  setEffectiveGain(gain: number): void {
    this.controller.setEffectiveGain(gain)
  }

  update(layer: T): void {
    const assetUrl = this.resolveAssetUrl(layer)
    if (layer !== this.config.noneValue && !assetUrl) {
      if (!this.loggedMissing.has(layer)) {
        console.info(`Missing ${this.config.missingAssetLabel} asset:\n${layer}`)
        this.loggedMissing.add(layer)
      }
      return
    }

    this.controller.update(String(layer), assetUrl)
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

  private resolveAssetUrl(layer: T): string | null {
    if (layer === this.config.noneValue) return null
    return this.config.assets[layer] ?? null
  }
}
