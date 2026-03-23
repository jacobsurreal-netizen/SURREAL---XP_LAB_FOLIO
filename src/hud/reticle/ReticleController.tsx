"use client"

import type { ReticlePresentation } from "./Reticle.types"
import { ReticleColor, ReticleIR, ReticleScan } from "./modes"

interface Props {
  presentation: ReticlePresentation
}

export function ReticleController({ presentation }: Props) {
  const { mode } = presentation

  switch (mode) {
    case "IR":
      return <ReticleIR presentation={presentation} />

    case "SCAN":
      return <ReticleScan presentation={presentation} />

    case "COLOR":
    default:
      return <ReticleColor presentation={presentation} />
  }
}