import type { EventPlaybackAdapter } from "../playback-adapter"
import type { WebAudioContextManager } from "./web-audio-context"

export class WebEventPlaybackAdapter implements EventPlaybackAdapter {
  private gainNode: GainNode | null = null
  private readonly active = new Set<AudioBufferSourceNode>()
  private gain = 1
  private silenced = false

  constructor(private readonly context: WebAudioContextManager) {}

  ensureReady(): void {
    this.silenced = false
    this.context.prepareFromUserGesture()
    if (!this.gainNode) {
      this.gainNode = this.context.createGainNode()
    }
  }

  setGain(value: number): void {
    this.gain = value
    if (this.gainNode) {
      this.gainNode.gain.value = value
    }
  }

  async playOneShot(assetUrl: string): Promise<boolean> {
    if (this.silenced) return false

    const buffer = await this.context.loadBuffer(assetUrl)
    if (!buffer || this.silenced) return false

    const ctx = this.context.ensureContext()
    if (!ctx || !this.gainNode || this.silenced) return false

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = false
    source.connect(this.gainNode)

    this.active.add(source)

    source.onended = () => {
      this.releaseSource(source)
    }

    try {
      source.start(0)
      if (this.silenced) {
        this.releaseSource(source, true)
        return false
      }
      return true
    } catch {
      this.releaseSource(source)
      return false
    }
  }

  stopAll(): void {
    this.silenced = true
    for (const source of [...this.active]) {
      this.releaseSource(source, true)
    }
  }

  dispose(): void {
    this.stopAll()
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
  }

  private releaseSource(source: AudioBufferSourceNode, stop = false): void {
    if (!this.active.has(source)) return

    if (stop) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }

    source.disconnect()
    this.active.delete(source)
  }
}
