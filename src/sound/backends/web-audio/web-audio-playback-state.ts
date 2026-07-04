import type { WebAudioContextManager } from "./web-audio-context"

/** Source is scheduled and tied to the requested asset — safe no-op guard for start(). */
export function isWebSourceActive(
  silenced: boolean,
  sourceLive: boolean,
  trackedAssetUrl: string | null,
  assetUrl?: string
): boolean {
  if (silenced || !sourceLive || !trackedAssetUrl) return false
  if (assetUrl !== undefined && trackedAssetUrl !== assetUrl) return false
  return true
}

/** Source is active and the audio context can currently produce sound. */
export function isWebSourceAudible(
  context: WebAudioContextManager,
  silenced: boolean,
  sourceLive: boolean,
  trackedAssetUrl: string | null
): boolean {
  if (!isWebSourceActive(silenced, sourceLive, trackedAssetUrl)) return false

  const ctx = context.ensureContext()
  return ctx?.state === "running"
}
