// ──────────────────────────────────────────────────────────────
// template-kit / engine / core.ts
// Singleton client-side engine: state machine, event
// dispatcher, orbit snap, spectrum, language, telemetry.
// FIX: useSyncExternalStore requires stable getSnapshot() reference
// and subscribe(cb) where cb is a void listener.
// ──────────────────────────────────────────────────────────────

import type {
  SystemState,
  SectorName,
  SpectrumMode,
  Language,
  EngineEvent,
  CommandEvent,
  TelemetryPayload,
  EngineSnapshot,
} from "./types"
import { SECTOR_NAMES } from "./types"
import {
  sectors,
  defaultSettings,
  spectrumTokens,
  dictionary,
  storageNamespace,
} from "./config"

// ── helpers ─────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function nearestDetentIndex(progress: number): number {
  let best = 0
  let bestDist = Math.abs(progress - sectors[0].detentProgress)
  for (let i = 1; i < sectors.length; i++) {
    const dist = Math.abs(progress - sectors[i].detentProgress)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

function formatTimecode(progress: number): string {
  const total = progress * 3600
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = Math.floor(total % 60)
  const f = Math.floor((total % 1) * 24)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}:${f.toString().padStart(2, "0")}`
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function snapDuration(): number {
  return prefersReducedMotion()
    ? defaultSettings.snapDurationReduced
    : defaultSettings.snapDuration
}

// ── Storage helpers ─────────────────────────────────────────

const STORAGE_KEYS = {
  spectrum: `${storageNamespace}-spectrum`,
  lang: `${storageNamespace}-lang`,
} as const

function loadStored<T>(key: string, valid: readonly string[], fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (v && (valid as readonly string[]).includes(v)) return v as T
  } catch {
    /* SSR */
  }
  return fallback
}

function saveStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* noop */
  }
}

// ── Engine singleton ────────────────────────────────────────

class Engine {
  // ---- state ----
  private _systemState: SystemState = "INIT"
  private _sectorIndex = 0
  private _scrollProgress = 0
  private _isSnapped = true
  private _spectrum: SpectrumMode = defaultSettings.spectrum
  private _language: Language = defaultSettings.language

  // ---- internal refs ----
  private _idleTimer: ReturnType<typeof setTimeout> | null = null
  private _snapRaf: number | null = null
  private _isSnapping = false
  private _lastTelemetryTs = 0
  private _initialized = false

  // ---- subscribers (useSyncExternalStore wants void listeners) ----
  private _snapshotListeners = new Set<() => void>()
  private _eventSink: ((e: EngineEvent) => void) | null = null

  // ---- cached snapshot (stable reference between changes) ----
  private _cachedSnapshot: EngineSnapshot = {
    systemState: this._systemState,
    sectorIndex: this._sectorIndex,
    sectorName: SECTOR_NAMES[this._sectorIndex],
    scrollProgress: this._scrollProgress,
    isSnapped: this._isSnapped,
    spectrum: this._spectrum,
    language: this._language,
  }

  // ========================================================
  // Init (call once from React mount)
  // ========================================================

  init() {
    if (this._initialized) return
    this._initialized = true

    // Hydrate persisted values
    this._spectrum = loadStored(
      STORAGE_KEYS.spectrum,
      ["COLOR", "IR"],
      defaultSettings.spectrum
    )
    this._language = loadStored(
      STORAGE_KEYS.lang,
      ["EN", "CS", "DE", "JP"],
      defaultSettings.language
    )

    // Apply spectrum tokens immediately
    this.applySpectrumCSS()

    // DEV/Fast Refresh safety: prevent duplicate listeners
    window.removeEventListener("scroll", this.handleScroll)
    window.addEventListener("scroll", this.handleScroll, { passive: true })
    this.handleScroll()

    this._systemState = "IDLE"
    this.notify()
  }

  destroy() {
    window.removeEventListener("scroll", this.handleScroll)
    if (this._idleTimer) clearTimeout(this._idleTimer)
    if (this._snapRaf) cancelAnimationFrame(this._snapRaf)
    this._initialized = false
  }

  // ========================================================
  // Public snapshot API (stable reference)
  // ========================================================

  getSnapshot(): EngineSnapshot {
    return this._cachedSnapshot
  }

  // ========================================================
  // Dispatch – single entry point for all commands
  // ========================================================

  dispatch(type: CommandEvent["type"], payload?: unknown) {
    const event: CommandEvent = { type, payload, timestamp: Date.now() }
    this._eventSink?.(event)

    switch (type) {
      case "COMMAND/GO_TO_SECTOR":
        this.goToSector(payload as number)
        break
      case "COMMAND/NEXT_SECTOR":
        this.goToSector((this._sectorIndex + 1) % sectors.length)
        break
      case "COMMAND/PREV_SECTOR":
        this.goToSector((this._sectorIndex - 1 + sectors.length) % sectors.length)
        break
      case "COMMAND/SET_SPECTRUM":
        this.setSpectrum(payload as SpectrumMode)
        break
      case "COMMAND/SET_LANGUAGE":
        this.setLanguage(payload as Language)
        break
      case "COMMAND/SET_STATE":
        this._systemState = payload as SystemState
        this.notify()
        break
    }
  }

  // ========================================================
  // Subscribe / event sink
  // ========================================================

  subscribe(cb: () => void): () => void {
    this._snapshotListeners.add(cb)
    return () => {
      this._snapshotListeners.delete(cb)
    }
  }

  onEngineEvent(cb: (e: EngineEvent) => void) {
    this._eventSink = cb
  }

  // ========================================================
  // i18n helper (reads from config dictionary)
  // ========================================================

  t(key: string): string {
    const entry = dictionary[key]
    if (!entry) return key
    return entry[this._language] ?? entry.EN ?? key
  }

  // ========================================================
  // Orbit scroll snap
  // ========================================================

  private handleScroll = () => {
    if (this._isSnapping) {
      this.cancelSnap()
    }

    const max = document.documentElement.scrollHeight - window.innerHeight
    this._scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
    this._isSnapped = false

    const idx = nearestDetentIndex(this._scrollProgress)
    this._sectorIndex = idx

    this.notify()
    this.emitTelemetryThrottled()

    // Reset idle timer for magnetic snap
    if (this._idleTimer) clearTimeout(this._idleTimer)
    this._idleTimer = setTimeout(() => {
      if (this._isSnapping) return
      const target = nearestDetentIndex(this._scrollProgress)
      this.snapTo(target)
    }, defaultSettings.idleScrollMs)
  }

  private snapTo(targetIndex: number) {
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max <= 0) return

    const startScroll = window.scrollY
    const targetScroll = sectors[targetIndex].detentProgress * max
    const delta = targetScroll - startScroll

    if (Math.abs(delta) < 2) {
      this._scrollProgress = sectors[targetIndex].detentProgress
      this._sectorIndex = targetIndex
      this._isSnapped = true
      this.notify()
      return
    }

    this._isSnapping = true
    const startTime = performance.now()
    const duration = snapDuration()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(t)
      const currentScroll = startScroll + delta * eased
      window.scrollTo(0, currentScroll)

      this._scrollProgress = max > 0 ? currentScroll / max : 0
      this._sectorIndex = nearestDetentIndex(this._scrollProgress)
      this.notify()

      if (t < 1) {
        this._snapRaf = requestAnimationFrame(animate)
      } else {
        window.scrollTo(0, targetScroll)
        this._scrollProgress = sectors[targetIndex].detentProgress
        this._sectorIndex = targetIndex
        this._isSnapping = false
        this._isSnapped = true
        this._snapRaf = null
        this.notify()
      }
    }

    this._snapRaf = requestAnimationFrame(animate)
  }

  private cancelSnap() {
    if (this._snapRaf !== null) {
      cancelAnimationFrame(this._snapRaf)
      this._snapRaf = null
    }
    this._isSnapping = false
    this._isSnapped = false
  }

  goToSector(index: number) {
    const wrapped = ((index % sectors.length) + sectors.length) % sectors.length
    this.cancelSnap()
    if (this._idleTimer) clearTimeout(this._idleTimer)
    this.snapTo(wrapped)
  }

  // ========================================================
  // Spectrum
  // ========================================================

  private setSpectrum(mode: SpectrumMode) {
    this._spectrum = mode
    saveStored(STORAGE_KEYS.spectrum, mode)
    this.applySpectrumCSS()
    this.notify()
  }

  toggleSpectrum() {
    this.dispatch(
      "COMMAND/SET_SPECTRUM",
      this._spectrum === "COLOR" ? "IR" : "COLOR"
    )
  }

  private applySpectrumCSS() {
    const root = document.documentElement
    const tokens = spectrumTokens[this._spectrum]
    root.setAttribute("data-spectrum", this._spectrum.toLowerCase())
    for (const [key, val] of Object.entries(tokens)) {
      root.style.setProperty(key, val)
    }
  }

  // ========================================================
  // Language
  // ========================================================

  private setLanguage(lang: Language) {
    this._language = lang
    saveStored(STORAGE_KEYS.lang, lang)
    this.notify()
  }

  cycleLanguage() {
    const all = ["EN", "CS", "DE", "JP"] as Language[]
    const idx = all.indexOf(this._language)
    this.dispatch("COMMAND/SET_LANGUAGE", all[(idx + 1) % all.length])
  }

  // ========================================================
  // Telemetry
  // ========================================================

  private emitTelemetryThrottled() {
    const now = Date.now()
    if (now - this._lastTelemetryTs < defaultSettings.telemetryThrottleMs) return
    this._lastTelemetryTs = now

    const payload: TelemetryPayload = {
      scrollProgress: this._scrollProgress,
      sectorIndex: this._sectorIndex,
      sectorName: SECTOR_NAMES[this._sectorIndex],
      timecodeString: formatTimecode(this._scrollProgress),
      isSnapped: this._isSnapped,
    }

    this._eventSink?.({ type: "TELEMETRY/UPDATE", payload, timestamp: now })
  }

  // ========================================================
  // Internal notify (rebuild cached snapshot + ping listeners)
  // ========================================================

  private notify(): void
  private notify() {
    this._cachedSnapshot = {
      systemState: this._systemState,
      sectorIndex: this._sectorIndex,
      sectorName: SECTOR_NAMES[this._sectorIndex],
      scrollProgress: this._scrollProgress,
      isSnapped: this._isSnapped,
      spectrum: this._spectrum,
      language: this._language,
    }

    for (const cb of this._snapshotListeners) cb()
  }
}

// ── Singleton export ────────────────────────────────────────

export const engine = new Engine()