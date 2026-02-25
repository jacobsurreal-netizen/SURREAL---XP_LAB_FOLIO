"use client"

import { useEffect } from "react"

interface UseKeyboardControlsOptions {
  goToSector: (index: number) => void
  sectorIndex: number
  toggleSpectrum: () => void
  cycleLang: () => void
}

/**
 * Global keyboard controls for the Spatial System Shell.
 *
 * Navigation:
 *   Left / A  = previous sector (wrap)
 *   Right / D = next sector (wrap)
 *   1-4       = jump to sector
 *
 * Toggles:
 *   I = spectrum (COLOR/IR)
 *   L = cycle language
 *   Escape = clear focus, return to idle
 */
export function useKeyboardControls({
  goToSector,
  sectorIndex,
  toggleSpectrum,
  cycleLang,
}: UseKeyboardControlsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A": {
          e.preventDefault()
          goToSector(((sectorIndex - 1) % 4 + 4) % 4)
          break
        }
        case "ArrowRight":
        case "d":
        case "D": {
          e.preventDefault()
          goToSector((sectorIndex + 1) % 4)
          break
        }
        case "1":
          e.preventDefault()
          goToSector(0)
          break
        case "2":
          e.preventDefault()
          goToSector(1)
          break
        case "3":
          e.preventDefault()
          goToSector(2)
          break
        case "4":
          e.preventDefault()
          goToSector(3)
          break
        case "i":
        case "I":
          e.preventDefault()
          toggleSpectrum()
          break
        case "l":
        case "L":
          e.preventDefault()
          cycleLang()
          break
        case "Escape": {
          e.preventDefault()
          // Clear focus, return to idle
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToSector, sectorIndex, toggleSpectrum, cycleLang])
}
