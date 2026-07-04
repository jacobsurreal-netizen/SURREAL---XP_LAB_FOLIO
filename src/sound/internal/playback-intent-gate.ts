import type { FolioPlaybackMix } from "../folio-experience-mix"
import { resolveFolioPlaybackMix } from "../folio-experience-mix"
import type { SoundBehaviorState } from "../types"

/** Transient orchestration slice — not part of the public runtime model. */
type PlaybackIntentGate = Pick<
  FolioPlaybackMix,
  "context" | "ambient" | "section" | "focus"
>

export function extractPlaybackIntentGate(
  state: SoundBehaviorState
): PlaybackIntentGate {
  const mix = resolveFolioPlaybackMix(state)
  return {
    context: mix.context,
    ambient: mix.ambient,
    section: mix.section,
    focus: mix.focus,
  }
}

export function isPlaybackIntentGateEqual(
  a: PlaybackIntentGate,
  b: PlaybackIntentGate
): boolean {
  return (
    a.context === b.context &&
    a.ambient === b.ambient &&
    a.section === b.section &&
    a.focus === b.focus
  )
}
