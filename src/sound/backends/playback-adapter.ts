export type PlaybackSessionGuard = () => boolean

/** Backend primitive — loop playback only. No lifecycle rules. */
export interface LoopPlaybackAdapter {
  ensureReady(): void
  setGain(value: number): void
  startLoop(assetUrl: string, isSessionCurrent: PlaybackSessionGuard): Promise<boolean>
  stopPlayback(): void
  isPlaying(): boolean
  isPlayingAsset(assetUrl: string): boolean
  hasActivePlayback(): boolean
  dispose(): void
}

/** Backend primitive — dual-probe focus stack. */
export interface FocusPlaybackAdapter {
  ensureReady(): void
  setGain(value: number): void
  startProbes(
    irAssetUrl: string,
    scanAssetUrl: string,
    isSessionCurrent: PlaybackSessionGuard
  ): Promise<boolean>
  stopPlayback(): void
  isPlaying(): boolean
  isPlayingProbes(irAssetUrl: string, scanAssetUrl: string): boolean
  hasActivePlayback(): boolean
  dispose(): void
}

/** Backend primitive — one-shot event playback. */
export interface EventPlaybackAdapter {
  ensureReady(): void
  setGain(value: number): void
  playOneShot(assetUrl: string): Promise<boolean>
  stopAll(): void
  dispose(): void
}
