import { useEffect, useRef, useState } from "react"

export type ReconTelemetryInput = {
  sectorIndex: number
  sectorName: string
  progress: number
}

export type ReconTelemetry = {
  sectorIndex: number
  sectorName: string
  progress: number
  progressPercent: number
  viewportWidth: number
  viewportHeight: number
  devicePixelRatio: number
  isMobile: boolean
  sessionTimeSeconds: number
}

export function useReconTelemetry(input: ReconTelemetryInput): ReconTelemetry {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  })
  const [sessionTime, setSessionTime] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Update viewport on resize
  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio,
      })
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      handleResize()
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Session timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSessionTime((t) => t + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const isMobile = viewport.width < 768

  return {
    sectorIndex: input.sectorIndex,
    sectorName: input.sectorName,
    progress: input.progress,
    progressPercent: Math.round(input.progress * 100),
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    devicePixelRatio: viewport.dpr,
    isMobile,
    sessionTimeSeconds: sessionTime,
  }
}
