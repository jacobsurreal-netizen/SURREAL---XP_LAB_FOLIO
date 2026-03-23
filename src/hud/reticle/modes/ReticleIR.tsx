"use client"

import type { ReticlePresentation } from "../Reticle.types"
import {
  AboutLayer,
  CtaLayer,
  HeroLayer,
  ProjectsLayer,
} from "../layers/index"

export function ReticleIR({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const color = "#ff2244"
  const activeIntensity = presentation.intensity * 0.85

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <HeroLayer
        active={presentation.sector === "HERO"}
        intensity={activeIntensity}
        color={color}
      />
      <AboutLayer
        active={presentation.sector === "ABOUT"}
        intensity={activeIntensity}
        color={color}
      />
      <ProjectsLayer
        active={presentation.sector === "PROJECTS"}
        intensity={activeIntensity}
        color={color}
      />
      <CtaLayer
        active={presentation.sector === "CTA"}
        intensity={activeIntensity}
        color={color}
      />

      <div
        className="border"
        style={{
          width: 140,
          height: 140,
          opacity: presentation.intensity,
          borderColor: color,
        }}
      />
    </div>
  )
}