"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Spring-eased mouse parallax for HUD depth layers.
 * Returns a normalized offset in range [-1, 1].
 */
export function useMouseParallax(lerp = 0.05) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const smoothRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      setOffset({ x: 0, y: 0 })
      return
    }

    function onMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    function tick() {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * lerp
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * lerp
      setOffset({ x: smoothRef.current.x, y: smoothRef.current.y })
      rafRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [lerp])

  const translate = useCallback(
    (strength: number) =>
      `translate(${offset.x * strength}px, ${offset.y * strength}px)`,
    [offset]
  )

  return { offset, translate }
}
