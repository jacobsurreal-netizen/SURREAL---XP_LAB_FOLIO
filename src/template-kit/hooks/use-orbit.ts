"use client"

import { engine } from "../engine"
import { useEngineSnapshot } from "./use-engine-snapshot"

function formatTimecode(progress: number): string {
  const total = progress * 3600
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = Math.floor(total % 60)
  const f = Math.floor((total % 1) * 24)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${f
    .toString()
    .padStart(2, "0")}`
}

export function useOrbit() {
  const snap = useEngineSnapshot()
  return {
    scrollProgress: snap.scrollProgress,
    sectorIndex: snap.sectorIndex,
    sectorName: snap.sectorName,
    timecodeString: formatTimecode(snap.scrollProgress),
    isSnapped: snap.isSnapped,
    goToSector: (index: number) => engine.dispatch("COMMAND/GO_TO_SECTOR", index),
    nextSector: () => engine.dispatch("COMMAND/NEXT_SECTOR"),
    prevSector: () => engine.dispatch("COMMAND/PREV_SECTOR"),
  }
}
