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

function getMobileMatch() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  )
}

export function useReconTelemetry(input: ReconTelemetryInput): ReconTelemetry {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    dpr: 1,
    isMobile: false,
  })
  const [sessionTime, setSessionTime] = useState(0)
  const [pointer, setPointer] = useState<{
    x: number | null
    y: number | null
    active: boolean
  }>({ x: null, y: null, active: false })
  const timerRef = useRef<number | null>(null)
  const pointerFrameRef = useRef<number | null>(null)
  const pendingPointerRef = useRef<{
    x: number | null
    y: number | null
    active: boolean
  } | null>(null)
  const pointerKeyRef = useRef("inactive")

  // Update viewport on resize
  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio,
        isMobile: getMobileMatch(),
      })
    }
    if (typeof window !== "undefined") {
      const widthQuery = window.matchMedia("(max-width: 767px)")
      const pointerQuery = window.matchMedia("(pointer: coarse)")
      window.addEventListener("resize", handleResize)
      widthQuery.addEventListener("change", handleResize)
      pointerQuery.addEventListener("change", handleResize)
      handleResize()
      return () => {
        window.removeEventListener("resize", handleResize)
        widthQuery.removeEventListener("change", handleResize)
        pointerQuery.removeEventListener("change", handleResize)
      }
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

    const schedulePointerUpdate = (nextPointer: {
      x: number | null
      y: number | null
      active: boolean
    }) => {
      pendingPointerRef.current = nextPointer
      if (pointerFrameRef.current !== null) return

      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null
        const pending = pendingPointerRef.current
        if (!pending) return

        const key = pending.active ? `${pending.x}:${pending.y}:active` : "inactive"
        if (key === pointerKeyRef.current) return

        pointerKeyRef.current = key
        setPointer(pending)
      })
    }

    const setPointerInactive = () => {
      schedulePointerUpdate({ x: null, y: null, active: false })
    }

    function handlePointerMove(event: PointerEvent) {
      const w = window.innerWidth
      const h = window.innerHeight
      const x = event.clientX
      const y = event.clientY
      const inside = x >= 0 && y >= 0 && x <= w && y <= h

      if (
        !inside ||
        event.pointerType !== "mouse" ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 767px)").matches
      ) {
        setPointerInactive()
        return
      }

      // Quantize normalized pointer values so telemetry only re-renders when the
      // displayed trace meaningfully changes. CSS parallax remains separately
      // rAF-driven in ReconShell and keeps full pointer responsiveness.
      const normalizedX = Math.round((x / w) * 100) / 100
      const normalizedY = Math.round((y / h) * 100) / 100

      schedulePointerUpdate({
        x: Math.round(normalizedX * w),
        y: Math.round(normalizedY * h),
        active: true,
      })
    }

    function handlePointerLeave() {
      setPointerInactive()
    }

    window.addEventListener("pointermove", handlePointerMove)
    document.documentElement.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave)
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current)
        pointerFrameRef.current = null
      }
      pendingPointerRef.current = null
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
    isMobile: viewport.isMobile,
    sessionTimeSeconds: sessionTime,
    pointerX: pointer.x,
    pointerY: pointer.y,
    pointerNormalizedX,
    pointerNormalizedY,
    pointerActive: pointer.active,
  }
}
