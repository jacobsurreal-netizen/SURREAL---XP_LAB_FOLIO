"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleScan({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const intensity = presentation.intensity
  const color = "#8a2bff"

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* OUTER PULSE */}
      <div
        className="absolute rounded-full"
        style={{
          width: 240,
          height: 240,
          border: `1px solid ${color}`,
          opacity: 0.1 * intensity,
        }}
      />

      {/* TRIANGLE CORE */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderBottom: `28px solid ${color}`,
          opacity: 0.85 * intensity,
        }}
      />

      {/* SCAN DOTS */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2,
            height: 2,
            background: color,
            opacity: 0.6 * intensity,
            transform: `rotate(${i * 60}deg) translate(90px)`,
          }}
        />
      ))}
    </div>
  )
}