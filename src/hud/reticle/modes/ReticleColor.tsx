"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleColor({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const intensity = presentation.intensity

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{
        transform: `translate3d(${presentation.motionX}px, ${presentation.motionY}px, 0) scale(${presentation.motionScale})`,
        transformOrigin: "50% 50%",
        transition: "transform 160ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease-out",
        willChange: "transform",
      }}
    >
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        style={{
          opacity: intensity,
          filter: "drop-shadow(0 0 6px #00f0d4)",
        }}
      >
        {/* outer ring */}
        <circle
          cx="110"
          cy="110"
          r="80"
          stroke="#00f0d4"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />

        {/* segmented ring */}
        <circle
          cx="110"
          cy="110"
          r="80"
          stroke="#00f0d4"
          strokeWidth="2"
          fill="none"
          strokeDasharray="40 20"
        />

        {/* center cross */}
        <line x1="110" y1="95" x2="110" y2="125" stroke="#00f0d4" strokeWidth="1" />
        <line x1="95" y1="110" x2="125" y2="110" stroke="#00f0d4" strokeWidth="1" />

        {/* center dot */}
        <circle cx="110" cy="110" r="2" fill="#00f0d4" />

        {/* subtle inner circle */}
        <circle
          cx="110"
          cy="110"
          r="35"
          stroke="#00f0d4"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}