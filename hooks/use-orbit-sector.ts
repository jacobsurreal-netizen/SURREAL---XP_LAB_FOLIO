"use client"

import { useOrbit } from "@/src/template-kit/hooks"

/**
 * Back-compat hook used by the app. Internally reads from template-kit engine.
 */
export function useOrbitSector() {
  const orbit = useOrbit()

  // Provide the same shape as the previous hook (minimal breaking changes).
  return {
    sectorIndex: orbit.sectorIndex,
    sectorName: orbit.sectorName,
    progress: orbit.scrollProgress,
    timecodeString: orbit.timecodeString,
    isSnapped: orbit.isSnapped,
    goToSector: orbit.goToSector,
    nextSector: orbit.nextSector,
    prevSector: orbit.prevSector,
  }
}
