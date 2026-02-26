// ──────────────────────────────────────────────────────────────
// template-kit / engine / config.ts
// Single source-of-truth configuration for the engine.
// ──────────────────────────────────────────────────────────────

import type { SectorDef, EngineDefaults, Language, SpectrumMode } from "./types"
import { SYSTEM_STATES } from "./types"

export const sectors: readonly SectorDef[] = [
  { name: "HERO", detentProgress: 0.0, iconKey: "M12 2L22 20H2L12 2Z" },
  { name: "ABOUT", detentProgress: 0.25, iconKey: "M12 4a8 8 0 100 16 8 8 0 000-16z" },
  { name: "PROJECTS", detentProgress: 0.5, iconKey: "M4 4h16v16H4V4z" },
  { name: "CTA", detentProgress: 0.75, iconKey: "M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7l3-7z" },
] as const

export const defaultSettings: EngineDefaults = {
  language: "EN" as Language,
  spectrum: "COLOR" as SpectrumMode,
  snapDuration: 600,
  snapDurationReduced: 150,
  idleScrollMs: 120,
  hudIdleDelayMs: 4500,
  hudActiveOpacity: 1,
  hudIdleOpacity: 0.5,
  hudCtaActiveOpacity: 0.6,
  hudCtaIdleOpacity: 0.25,
  telemetryThrottleMs: 60, // ~16 fps
}

export const accessibility = {
  prefersReducedMotion: false, // hydrated at runtime
}

export const stateDefinitions = SYSTEM_STATES

// ── Spectrum CSS variable maps ──────────────────────────────

export const spectrumTokens: Record<SpectrumMode, Record<string, string>> = {
  COLOR: {
    "--hud-ink": "rgba(64, 235, 255, 0.30)",
    "--hud-accent": "#40ebff",
    "--hud-accent-dim": "rgba(64, 235, 255, 0.15)",
    "--hud-grid": "rgba(64, 235, 255, 0.04)",
    "--hud-glow": "rgba(64, 235, 255, 0.20)",
    "--hud-text": "rgba(203, 235, 229, 0.80)",
    "--hud-text-dim": "rgba(203, 235, 229, 0.35)",
    "--world-tint": "transparent",
    "--world-bg": "#040b0a",
    "--world-radial": "rgba(64, 235, 255, 0.03)",
  },
  IR: {
    "--hud-ink": "rgba(255, 200, 180, 0.45)",
    "--hud-accent": "#d44a3a",
    "--hud-accent-dim": "rgba(212, 74, 58, 0.25)",
    "--hud-grid": "rgba(212, 74, 58, 0.06)",
    "--hud-glow": "rgba(212, 74, 58, 0.15)",
    "--hud-text": "rgba(240, 210, 200, 0.8)",
    "--hud-text-dim": "rgba(240, 210, 200, 0.35)",
    "--world-tint": "rgba(180, 40, 30, 0.08)",
    "--world-bg": "#0a0606",
    "--world-radial": "rgba(212, 74, 58, 0.04)",
  },
}

// ── i18n dictionary ────────────────────────────────────────

export const dictionary: Record<string, Record<Language, string>> = {
  SYSTEM_LINK: { 
    EN: "STABLE", 
    CS: "STABILNÍ", 
    DE: "STABIL", 
    JP: "\u5B89\u5B9A" 
  },
  PROBE_STATE: { 
    EN: "IDLE", 
    CS: "KLID", 
    DE: "LEERLAUF", 
    JP: "\u5F85\u6A5F" 
  },
  
  SECTOR_LABEL: { EN: "SECTOR", CS: "SEKTOR", DE: "SEKTOR", JP: "\u30BB\u30AF\u30BF\u30FC" },
  SPECTRUM: { EN: "SPECTRUM", CS: "SPEKTRUM", DE: "SPEKTRUM", JP: "\u30B9\u30DA\u30AF\u30C8\u30EB" },
  LANG: { EN: "LANG", CS: "JAZYK", DE: "SPRACHE", JP: "\u8A00\u8A9E" },
  TRANSMISSION_SENT: { EN: "TRANSMISSION_SENT", CS: "PRENOS_ODESLAN", DE: "UBERTRAGUNG_GESENDET", JP: "\u9001\u4FE1\u5B8C\u4E86" },
  CHANNEL_OPEN: { EN: "CHANNEL_OPEN", CS: "KANAL_OTEVRENY", DE: "KANAL_OFFEN", JP: "\u30C1\u30E3\u30CD\u30EB\u958B" },
  ANOMALY_DETECTED: { EN: "ANOMALY_DETECTED", CS: "ANOMALIE_DETEKOVANA", DE: "ANOMALIE_ERKANNT", JP: "\u7570\u5E38\u691C\u51FA" },
  PREV_SECTOR: { EN: "Previous sector", CS: "P\u0159edchoz\u00ED sektor", DE: "Vorheriger Sektor", JP: "\u524D\u306E\u30BB\u30AF\u30BF\u30FC" },
  NEXT_SECTOR: { EN: "Next sector", CS: "Dal\u0161\u00ED sektor", DE: "N\u00E4chster Sektor", JP: "\u6B21\u306E\u30BB\u30AF\u30BF\u30FC" },
  GO_TO_SECTOR: { EN: "Go to", CS: "P\u0159ej\u00EDt na", DE: "Gehe zu", JP: "\u79FB\u52D5" },
  SWITCH_SPECTRUM: { EN: "Switch spectrum mode", CS: "P\u0159epnout spektr\u00E1ln\u00ED m\u00F3d", DE: "Spektralmodus wechseln", JP: "\u30B9\u30DA\u30AF\u30C8\u30EB\u30E2\u30FC\u30C9\u5207\u66FF" },
  CYCLE_LANG: { EN: "Cycle language", CS: "P\u0159epnout jazyk", DE: "Sprache wechseln", JP: "\u8A00\u8A9E\u5207\u66FF" },
}
