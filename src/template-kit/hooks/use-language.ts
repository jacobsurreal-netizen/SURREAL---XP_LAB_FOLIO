"use client"

import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

export type Language = "EN" | "CS" | "DE" | "JP"

const LANG_ORDER: readonly Language[] = ["EN", "CS", "DE", "JP"] as const

export function useLanguage() {
  const snap = useEngineSnapshot()
  const language = snap.language as Language

  const setLanguage = (next: Language) => engine.dispatch("COMMAND/SET_LANGUAGE", next)

  const cycleLanguage = () => {
    const idx = LANG_ORDER.indexOf(language)
    const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length]
    engine.dispatch("COMMAND/SET_LANGUAGE", next)
  }

  return {
    language,
    setLanguage,
    cycleLanguage,
  }
}
