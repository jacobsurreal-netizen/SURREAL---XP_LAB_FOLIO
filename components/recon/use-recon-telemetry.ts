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
  pointerX: number | null
  pointerY: number | null
  pointerNormalizedX: number | null
  pointerNormalizedY: number | null
  pointerActive: boolean
}

export function useReconTelemetry(input: ReconTelemetryInput): ReconTelemetry {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  })
  const [sessionTime, setSessionTime] = useState(0)
  const [pointer, setPointer] = useState<{
    x: number | null
    y: number | null
    active: boolean
  }>({ x: null, y: null, active: false })
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

  // Pointer trace (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return

    function handlePointerMove(event: PointerEvent) {
      const w = window.innerWidth
      const h = window.innerHeight
      const x = event.clientX
      const y = event.clientY
      const inside = x >= 0 && y >= 0 && x <= w && y <= h

      if (!inside) {
        setPointer({ x: null, y: null, active: false })
        return
      }

      setPointer({ x, y, active: true })
    }

    function handlePointerLeave() {
      setPointer({ x: null, y: null, active: false })
    }

    window.addEventListener("pointermove", handlePointerMove)
    document.documentElement.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave)
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
  const pointerNormalizedX =
    pointer.x != null && viewport.width > 0 ? pointer.x / viewport.width : null
  const pointerNormalizedY =
    pointer.y != null && viewport.height > 0 ? pointer.y / viewport.height : null

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
    pointerX: pointer.x,
    pointerY: pointer.y,
    pointerNormalizedX,
    pointerNormalizedY,
    pointerActive: pointer.active,
  }
}
