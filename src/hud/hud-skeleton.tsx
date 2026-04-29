"use client"

import React from "react"
import { HudParallax, HUD_MODES } from "./index"
import type { SpectrumMode } from "@/hooks/use-spectrum-mode"
import { useReticleState } from "./reticle/hooks/useReticleState"
import { ReticleController } from "./reticle/ReticleController"

interface HudSkeletonProps {
  children?: React.ReactNode
  mode: SpectrumMode
}

export function HudSkeleton({ children, mode }: HudSkeletonProps) {
  const hudMode =
    mode === "IR"
      ? HUD_MODES.IR
      : mode === "SCAN"
        ? HUD_MODES.SCAN
        : HUD_MODES.NORMAL

  const reticle = useReticleState(mode)

  return (
    <>
      {children}

      <div className="pointer-events-none fixed inset-0 z-30">
        <HudParallax mode={hudMode} />
        <ReticleController presentation={reticle} />
      </div>
    </>
  )
}
