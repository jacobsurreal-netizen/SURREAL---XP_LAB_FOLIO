"use client"

import { useMemo } from "react"

import { useLanguage as useEngineLanguage } from "@/src/template-kit/hooks"
import { dictionary as ENGINE_DICT } from "@/src/template-kit/engine/config"

export type Language = "EN" | "CS" | "DE" | "JP"

export type DictKey =
  | "SYSTEM_LINK"
  | "PROBE_STATE"
  | "SECTOR_LABEL"
  | "PREV_SECTOR"
  | "NEXT_SECTOR"
  | "GO_TO_SECTOR"
  | "SPECTRUM"
  | "SWITCH_SPECTRUM"
  | "LANG"
  | "CYCLE_LANG"
  | "TRANSMISSION_SENT"
  | "CHANNEL_OPEN"
  | "ANOMALY_DETECTED"

/**
 * App-friendly wrapper around the template-kit engine language hook.
 * Provides `t(key)` for HUD microcopy.
 */
export function useLanguage() {
  const { language, setLanguage, cycleLanguage } = useEngineLanguage()
  const lang = ((language as Language) ?? "EN")

  const t = useMemo(() => {
    return (key: string) => {
      const entry = ENGINE_DICT[key]
      return entry?.[lang] ?? entry?.EN ?? key
    }
  }, [lang])

  return {
    lang,
    setLang: (next: Language) => setLanguage(next),
    cycle: cycleLanguage,
    t,
  }
}

/**
 * Back-compat alias (older name).
 */
export function useLanguageToggle() {
  const { lang, setLang, cycle } = useLanguage()
  return { language: lang, setLanguage: setLang, cycleLanguage: cycle }
}
