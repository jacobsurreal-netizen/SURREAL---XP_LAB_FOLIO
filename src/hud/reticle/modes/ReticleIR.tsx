"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleIR ({ presentation }: { presentation: ReticlePresentation }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div
        className="border"
        style={{
          width: 140,
          height: 140,
          opacity: presentation.intensity,
          borderColor: "#ff2244",
        }}
      />
    </div>
  )
}