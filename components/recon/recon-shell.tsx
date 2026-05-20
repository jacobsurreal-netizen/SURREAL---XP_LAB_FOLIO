"use client"

import { WorldLayer } from "@/components/world-layer"
import { ThreeRuntimeAdapter } from "@/src/scene/three-adapter"
import { SoundLayer } from "@/components/sound-layer"
import { ReconHUD } from "./recon-hud"
import { ReconOpticalOverlay } from "./recon-optical-overlay"
import { useEffect, useState } from "react"

interface ReconShellProps {
  children: React.ReactNode
}

export function ReconShell({ children }: ReconShellProps) {
  const [progress, setProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches)
      }
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const currentScroll = window.scrollY
          const newProgress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0
          setProgress(newProgress)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Desktop/mobile sector logic
  const mode = "COLOR"
  let sectorIndex = 0
  if (progress >= 0.333 && progress < 0.666) sectorIndex = 1
  if (progress >= 0.666) sectorIndex = 2
  const SECTOR_NAMES = ["OBSERVATION", "ANALYSIS", "GATEWAY"]
  const sectorName = SECTOR_NAMES[sectorIndex]

  return (
    <>
      <div className="fixed inset-0 z-30 w-screen h-screen overflow-hidden bg-black pointer-events-none">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={progress} sector={sectorName} mode={mode} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeRuntimeAdapter
            progress={progress}
            snapshot={{
              scrollProgress: progress,
              sectorIndex,
              sectorName,
              isSnapped: true,
              spectrumMode: mode,
            }}
          />
        </div>
        <ReconOpticalOverlay />
        <ReconHUD
          sectorIndex={sectorIndex}
          isMobile={isMobile}
          sectorName={sectorName}
          progress={progress}
        />
        <SoundLayer />
      </div>
      <div className="relative z-0 w-full overflow-x-hidden min-h-screen pointer-events-none">
        {children}
      </div>
    </>
  )
}
