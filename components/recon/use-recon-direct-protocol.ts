import { useCallback, useEffect, useRef, useState } from "react"

export type DirectProtocolPhase =
  | "idle"
  | "viewpoints"
  | "resonance"
  | "decoding"
  | "report"

export const DECODE_LINES = [
  "ALIGNING PARTIAL MODEL...",
  "FILTERING OPTICAL NOISE...",
  "RESOLVING SURFACE TRACE...",
] as const

const HOLD_MS = 2000
const HOLD_REDUCED_MS = 300
const DECODE_STEP_MS = 333
const DECODE_REDUCED_MS = 300

const SECTOR_LABELS = ["OBSERVATION", "ANALYSIS", "GATEWAY"] as const

function clampSectorIndex(index: number) {
  return Math.min(Math.max(0, index), 2)
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

export interface UseReconDirectProtocolOptions {
  sectorIndex: number
}

export function useReconDirectProtocol({ sectorIndex }: UseReconDirectProtocolOptions) {
  const [phase, setPhase] = useState<DirectProtocolPhase>("idle")
  const [visitedSectors, setVisitedSectors] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [resonanceProgress, setResonanceProgress] = useState(0)
  const [decodeStep, setDecodeStep] = useState(0)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const holdRafRef = useRef<number | null>(null)
  const holdStartMsRef = useRef<number | null>(null)
  const holdSessionRef = useRef(0)

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      clearTimeout(id)
    }
    timersRef.current = []
  }, [])

  const cancelHoldAnimation = useCallback(() => {
    if (holdRafRef.current != null) {
      cancelAnimationFrame(holdRafRef.current)
      holdRafRef.current = null
    }
    holdStartMsRef.current = null
  }, [])

  const clearAll = useCallback(() => {
    clearTimers()
    cancelHoldAnimation()
  }, [clearTimers, cancelHoldAnimation])

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timersRef.current.push(id)
    },
    [],
  )

  const startDecoding = useCallback(() => {
    setPhase("decoding")
    setDecodeStep(0)
    clearTimers()

    const reduced = prefersReducedMotion()

    if (reduced) {
      setDecodeStep(DECODE_LINES.length - 1)
      schedule(() => setPhase("report"), DECODE_REDUCED_MS)
      return
    }

    for (let i = 1; i < DECODE_LINES.length; i++) {
      const step = i
      schedule(() => setDecodeStep(step), DECODE_STEP_MS * step)
    }

    schedule(() => setPhase("report"), DECODE_STEP_MS * DECODE_LINES.length)
  }, [clearTimers, schedule])

  const resetProtocolState = useCallback(() => {
    setVisitedSectors([false, false, false])
    setResonanceProgress(0)
    setDecodeStep(0)
  }, [])

  const startProtocol = useCallback(() => {
    clearAll()
    resetProtocolState()
    setPhase("viewpoints")
  }, [clearAll, resetProtocolState])

  const acknowledgeReport = useCallback(() => {
    clearAll()
    resetProtocolState()
    setPhase("idle")
  }, [clearAll, resetProtocolState])

  useEffect(() => {
    if (phase !== "viewpoints") return

    const index = clampSectorIndex(sectorIndex)
    setVisitedSectors((prev) => {
      if (prev[index]) return prev
      const next: [boolean, boolean, boolean] = [...prev]
      next[index] = true
      return next
    })
  }, [phase, sectorIndex])

  useEffect(() => {
    if (phase !== "viewpoints") return
    if (visitedSectors.every(Boolean)) {
      setPhase("resonance")
      setResonanceProgress(0)
    }
  }, [phase, visitedSectors])

  const onResonanceHoldStart = useCallback(() => {
    if (phaseRef.current !== "resonance") return

    cancelHoldAnimation()
    const session = ++holdSessionRef.current
    const duration = prefersReducedMotion() ? HOLD_REDUCED_MS : HOLD_MS
    holdStartMsRef.current = performance.now()

    const tick = (now: number) => {
      if (phaseRef.current !== "resonance" || holdSessionRef.current !== session) return
      const start = holdStartMsRef.current
      if (start == null) return

      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      setResonanceProgress(progress)

      if (progress >= 1) {
        cancelHoldAnimation()
        startDecoding()
        return
      }

      holdRafRef.current = requestAnimationFrame(tick)
    }

    holdRafRef.current = requestAnimationFrame(tick)
  }, [cancelHoldAnimation, startDecoding])

  const onResonanceHoldEnd = useCallback(() => {
    if (phaseRef.current !== "resonance") return

    holdSessionRef.current += 1
    cancelHoldAnimation()
    setResonanceProgress(0)
  }, [cancelHoldAnimation])

  useEffect(() => clearAll, [clearAll])

  const isActive = phase !== "idle"

  return {
    phase,
    isActive,
    visitedSectors,
    sectorLabels: SECTOR_LABELS,
    resonanceProgress,
    decodeStep,
    decodeLines: DECODE_LINES,
    startProtocol,
    acknowledgeReport,
    onResonanceHoldStart,
    onResonanceHoldEnd,
  }
}
