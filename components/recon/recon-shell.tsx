"use client"

import { WorldLayer } from "@/components/world-layer"
import { ThreeRuntimeAdapter } from "@/src/scene/three-adapter"
import { SoundLayer } from "@/components/sound-layer"
import { ReconHUD } from "./recon-hud"
import { useEffect, useState } from "react"

interface ReconShellProps {
  children: React.ReactNode
}

export function ReconShell({ children }: ReconShellProps) {
  const [progress, setProgress] = useState(0)

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
    // Initial call
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const mode = "COLOR"

  // Map progress (0 -> 1) to exactly 3 sectors (0, 1, 2)
  let sectorIndex = 0
  if (progress >= 0.333 && progress < 0.666) sectorIndex = 1
  if (progress >= 0.666) sectorIndex = 2

  const SECTOR_NAMES = ["OBSERVATION", "ANALYSIS", "GATEWAY"]
  const sectorName = SECTOR_NAMES[sectorIndex]

  return (
    <>
      {/* Fixed full-viewport shell */}
      <div className="fixed inset-0 z-30 w-screen h-screen overflow-hidden bg-black pointer-events-none">
        {/* Layer 0: World Foundation */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldLayer progress={progress} sector={sectorName} mode={mode} />
        </div>

        {/* Layer 10: Three Stage */}
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

        {/* Layer 30: Recon HUD */}
        <ReconHUD sectorIndex={sectorIndex} />

        {/* Layer 99: Audio Observer (Non-visual) */}
        <SoundLayer />
      </div>

      {/* Scrollable Content (pending actual flow) */}
      <div className="relative z-0 w-full overflow-x-hidden min-h-screen pointer-events-none">
        {children}
      </div>
    </>
  )
}
