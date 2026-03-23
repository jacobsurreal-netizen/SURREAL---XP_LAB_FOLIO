"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleScan ({ presentation }: { presentation: ReticlePresentation }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "80px solid transparent",
          borderRight: "80px solid transparent",
          borderBottom: "140px solid #8a2be2",
          opacity: presentation.intensity,
        }}
      />
    </div>
  )
}