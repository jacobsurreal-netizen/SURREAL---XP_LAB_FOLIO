"use client"

import { useEffect, useState } from "react"

type PointerPresence = {
  isPointerActive: boolean
}

export function usePointerPresence(idleDelay = 1400): PointerPresence {
  const [isPointerActive, setIsPointerActive] = useState(false)

  useEffect(() => {
    let timeoutId: number | null = null

    const markActive = () => {
      setIsPointerActive(true)

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        setIsPointerActive(false)
      }, idleDelay)
    }

    window.addEventListener("mousemove", markActive, { passive: true })
    window.addEventListener("pointerdown", markActive, { passive: true })
    window.addEventListener("wheel", markActive, { passive: true })

    return () => {
      window.removeEventListener("mousemove", markActive)
      window.removeEventListener("pointerdown", markActive)
      window.removeEventListener("wheel", markActive)

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [idleDelay])

  return { isPointerActive }
}