"use client"

import type { ReticlePresentation } from "../Reticle.types"
import {
  AboutLayer,
  CtaLayer,
  HeroLayer,
  ProjectsLayer,
} from "../layers/index"

export function ReticleScan({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const color = "#8a2be2"
  const activeIntensity = presentation.intensity

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
        style={{
          width: 0,
          height: 0,
          borderLeft: "80px solid transparent",
          borderRight: "80px solid transparent",
          borderBottom: `140px solid ${color}`,
          opacity: presentation.intensity,
        }}
      />
    </div>
  )
}