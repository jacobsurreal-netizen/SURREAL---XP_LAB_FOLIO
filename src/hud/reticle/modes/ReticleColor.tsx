"use client"

import type { ReticlePresentation } from "../Reticle.types"
import {
  AboutLayer,
  CtaLayer,
  HeroLayer,
  ProjectsLayer,
} from "../layers/index"

export function ReticleColor({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const color = "#00f0d4"
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
        className="rounded-full border"
        style={{
          width: 180,
          height: 180,
          opacity: presentation.intensity,
          borderColor: color,
          transition: "opacity 0.25s ease-out",
        }}
      />
    </div>
  )
}