import type { FolioSectionPlayback } from "./folio-experience-mix"
import type { AmbientLayer, SoundBehaviorTrigger } from "./types"

export const FOLIO_AMBIENT_ASSETS: Partial<Record<AmbientLayer, string>> = {
  VOID_PROFILE: "/audio/void_profile_loop_v001.wav",
  IR_PROFILE: "/audio/ir_profile_loop_v001.wav",
}

export const FOLIO_SECTION_ASSETS: Partial<Record<FolioSectionPlayback, string>> = {
  EXPLORATION_PROFILE: "/audio/exploration_profile_loop_v001.wav",
  IR_EXPLORATION_PROFILE: "/audio/ir_exploration_profile_loop_v001.wav",
  CTA_PROFILE: "/audio/cta_profile_loop_v001.wav",
}

export const FOLIO_FOCUS_PROBE_ASSETS = {
  IR_PROFILE: "/audio/ir_profile_loop_v001.wav",
  SCAN_PROFILE: "/audio/scan_profile_loop_v001.wav",
} as const

export type FolioFocusProbeProfile = keyof typeof FOLIO_FOCUS_PROBE_ASSETS

export const FOLIO_TRIGGER_ASSETS: Partial<Record<SoundBehaviorTrigger, string>> = {
  SCAN_ENTER: "/audio/scan_enter.wav",
  SCAN_EXIT: "/audio/scan_exit.wav",
  SCAN_INIT_SAMPLE: "/audio/scan_init.wav",
  IR_ENTER: "/audio/ir_enter.wav",
  IR_EXIT: "/audio/ir_exit.wav",
  IR_INIT_SAMPLE: "/audio/ir_init.wav",
  CTA_ENTER: "/audio/cta_enter.wav",
  CTA_EXIT: "/audio/cta_exit.wav",
  CTA_SIGNAL_SAMPLE: "/audio/cta_signal.wav",
  SECTOR_CHANGE: "/audio/sector_change.wav",
}

function collectUniqueUrls(values: readonly (string | undefined)[]): string[] {
  const urls = new Set<string>()
  for (const url of values) {
    if (url) urls.add(url)
  }
  return [...urls]
}

/** Sustained loop assets — ambient, section, and focus probes. */
export function listFolioSustainedAssetUrls(): readonly string[] {
  return collectUniqueUrls([
    ...Object.values(FOLIO_AMBIENT_ASSETS),
    ...Object.values(FOLIO_SECTION_ASSETS),
    ...Object.values(FOLIO_FOCUS_PROBE_ASSETS),
  ])
}

/** One-shot trigger assets. */
export function listFolioTriggerAssetUrls(): readonly string[] {
  return collectUniqueUrls(Object.values(FOLIO_TRIGGER_ASSETS))
}

/** All FOLIO palette assets, deduplicated. */
export function listFolioAssetUrls(): readonly string[] {
  return collectUniqueUrls([
    ...listFolioSustainedAssetUrls(),
    ...listFolioTriggerAssetUrls(),
  ])
}
