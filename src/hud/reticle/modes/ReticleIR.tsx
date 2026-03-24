"use client"

import type { ReticlePresentation } from "../Reticle.types"

export function ReticleIR({
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
        transition: "transform 200ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease-out",
        willChange: "transform",
      }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          opacity: intensity,
          filter: "drop-shadow(0 0 4px #ff2244)",
        }}
      >
        {/* top / bottom arcs */}
        <path
          d="M 55 55 A 65 65 0 0 1 145 55"
          stroke="#ff2244"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 55 145 A 65 65 0 0 0 145 145"
          stroke="#ff2244"
          strokeWidth="2"
          fill="none"
        />

        {/* side micro brackets */}
        <line x1="42" y1="96" x2="42" y2="104" stroke="#ff2244" strokeWidth="1.2" />
        <line x1="158" y1="96" x2="158" y2="104" stroke="#ff2244" strokeWidth="1.2" />

        {/* inner reduced axis */}
        <line x1="82" y1="100" x2="94" y2="100" stroke="#ff2244" strokeWidth="1.5" />
        <line x1="106" y1="100" x2="118" y2="100" stroke="#ff2244" strokeWidth="1.5" />

        {/* center micro ring */}
        <circle
          cx="100"
          cy="100"
          r="10"
          stroke="#ff2244"
          strokeWidth="1"
          fill="none"
          opacity="0.45"
        />
        <circle cx="100" cy="100" r="1.8" fill="#ff2244" />
      </svg>
    </div>
  )
}