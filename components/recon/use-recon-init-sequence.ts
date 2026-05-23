import { useCallback, useEffect, useRef, useState } from "react"

export type ReconInitPhase = "standby" | "booting" | "ready"

export const BOOT_LINES = [
  "LINKING VIEWPORT...",
  "CALIBRATING TELEMETRY...",
  "PROBE CHANNEL OPEN...",
  "SYSTEM READY",
] as const

const BOOT_STEP_MS = 625
const REDUCED_MOTION_BOOT_MS = 300

export function useReconInitSequence() {
  const [initPhase, setInitPhase] = useState<ReconInitPhase>("standby")
  const [bootStep, setBootStep] = useState(0)
  const bootStartedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearBootTimers = useCallback(() => {
    for (const id of timersRef.current) {
      clearTimeout(id)
    }
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }, [])

  const startBoot = useCallback(() => {
    if (bootStartedRef.current) return
    bootStartedRef.current = true
    setInitPhase("booting")
    setBootStep(0)
    window.scrollTo(0, 0)
    clearBootTimers()

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reducedMotion) {
      setBootStep(BOOT_LINES.length - 1)
      schedule(() => {
        setInitPhase("ready")
        window.scrollTo(0, 0)
      }, REDUCED_MOTION_BOOT_MS)
      return
    }

    for (let i = 1; i < BOOT_LINES.length; i++) {
      const step = i
      schedule(() => setBootStep(step), BOOT_STEP_MS * step)
    }

    schedule(() => {
      setInitPhase("ready")
      window.scrollTo(0, 0)
    }, BOOT_STEP_MS * BOOT_LINES.length)
  }, [clearBootTimers, schedule])

  useEffect(() => {
    if (initPhase === "ready") return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)

    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [initPhase])

  useEffect(() => {
    if (initPhase === "ready") {
      window.scrollTo(0, 0)
    }
  }, [initPhase])

  useEffect(() => clearBootTimers, [clearBootTimers])

  return { initPhase, bootStep, startBoot }
}
