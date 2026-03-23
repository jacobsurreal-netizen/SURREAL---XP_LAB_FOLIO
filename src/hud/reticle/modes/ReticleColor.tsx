"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleColor ({ presentation }: { presentation: ReticlePresentation }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div
        className="rounded-full border"
        style={{
          width: 180,
          height: 180,
          opacity: presentation.intensity,
          borderColor: "#00f0d4",
        }}
      />
    </div>
  )
}