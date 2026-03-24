"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleScan({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const intensity = presentation.intensity

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        style={{
          opacity: intensity,
          filter: "drop-shadow(0 0 8px #8a2bff)",
        }}
      >
        {/* outer scanning circle */}
        <circle
          cx="120"
          cy="120"
          r="90"
          stroke="#8a2bff"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="12 8"
          opacity="0.5"
        />

        {/* triangle core */}
        <polygon
          points="120,70 165,150 75,150"
          stroke="#8a2bff"
          strokeWidth="2"
          fill="none"
        />

        {/* inner triangle (offset for depth feeling) */}
        <polygon
          points="120,90 150,145 90,145"
          stroke="#8a2bff"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* scan axis vertical */}
        <line
          x1="120"
          y1="30"
          x2="120"
          y2="210"
          stroke="#8a2bff"
          strokeWidth="1"
          opacity="0.25"
        />

        {/* scan axis horizontal */}
        <line
          x1="30"
          y1="120"
          x2="210"
          y2="120"
          stroke="#8a2bff"
          strokeWidth="1"
          opacity="0.25"
        />

        {/* micro tracking dots */}
        <circle cx="120" cy="120" r="2" fill="#8a2bff" />
        <circle cx="120" cy="60" r="1.5" fill="#8a2bff" opacity="0.6" />
        <circle cx="180" cy="120" r="1.5" fill="#8a2bff" opacity="0.6" />
        <circle cx="120" cy="180" r="1.5" fill="#8a2bff" opacity="0.6" />
        <circle cx="60" cy="120" r="1.5" fill="#8a2bff" opacity="0.6" />

        {/* inner ring */}
        <circle
          cx="120"
          cy="120"
          r="40"
          stroke="#8a2bff"
          strokeWidth="1"
          fill="none"
          opacity="0.35"
        />
      </svg>
    </div>
  )
}