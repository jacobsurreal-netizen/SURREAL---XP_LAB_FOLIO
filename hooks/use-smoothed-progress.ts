"use client"

import { useEffect, useRef, useState } from "react"

type UseSmoothedProgressOptions = {
  /**
   * How quickly the smoothed value catches up to the source.
   * Higher = faster response, lower = softer motion.
   * Recommended starting range: 0.08 – 0.18
   */
  lerpFactor?: number

  /**
   * Snap threshold to prevent endless tiny trailing updates.
   */
  epsilon?: number
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function useSmoothedProgress(
  value: number,
  options: UseSmoothedProgressOptions = {}
) {
  const { lerpFactor = 0.12, epsilon = 0.0005 } = options

  const targetRef = useRef(clamp01(value))
  const currentRef = useRef(clamp01(value))
  const frameRef = useRef<number | null>(null)

  const [smoothedValue, setSmoothedValue] = useState(() => clamp01(value))

  useEffect(() => {
    targetRef.current = clamp01(value)

    if (frameRef.current !== null) return

    const tick = () => {
      const current = currentRef.current
      const target = targetRef.current
      const next = current + (target - current) * lerpFactor

      if (Math.abs(target - next) <= epsilon) {
        currentRef.current = target
        setSmoothedValue(target)
        frameRef.current = null
        return
      }

      currentRef.current = next
      setSmoothedValue(next)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [value, lerpFactor, epsilon])

  return smoothedValue
}