"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Tracks user inactivity (scroll / mousemove / click / touchstart).
 * After `idleDelay` ms of silence the HUD fades to `idleOpacity`.
 * On any interaction it briefly brightens to `activeOpacity` then
 * returns to idle after the delay elapses again.
 *
 * The CTA sector (sectorIndex === 3) pushes the idle opacity even
 * lower to keep the viewport especially quiet.
 */
export function useHudInactivity(sectorIndex: number) {
  const IDLE_DELAY = 4500 // ~4.5 seconds
  const ACTIVE_OPACITY = 1
  const IDLE_OPACITY = 0.5
  const CTA_IDLE_OPACITY = 0.25
  const CTA_ACTIVE_OPACITY = 0.6

  const [opacity, setOpacity] = useState(ACTIVE_OPACITY)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCta = sectorIndex === 3

  const goIdle = useCallback(() => {
    setOpacity(isCta ? CTA_IDLE_OPACITY : IDLE_OPACITY)
  }, [isCta])

  const wake = useCallback(() => {
    setOpacity(isCta ? CTA_ACTIVE_OPACITY : ACTIVE_OPACITY)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(goIdle, IDLE_DELAY)
  }, [goIdle, isCta])

  // Sector change -- recalculate immediately
  useEffect(() => {
    wake()
  }, [sectorIndex, wake])

  // Global interaction listeners
  useEffect(() => {
    const events: Array<keyof WindowEventMap> = [
      "scroll",
      "mousemove",
      "pointerdown",
      "touchstart",
      "keydown",
    ]

    for (const ev of events) {
      window.addEventListener(ev, wake, { passive: true })
    }

    // Start idle timer on mount
    idleTimer.current = setTimeout(goIdle, IDLE_DELAY)

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, wake)
      }
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [wake, goIdle])

  return opacity
}
