export interface SectorCameraPose {
  sectorIndex: number
  sectorName: string
  azimuthDeg: number
  pose: {
    elevationDeg: number
    radiusBias: number
    lookBiasX: number
    lookBiasY: number
  }
}

/**
 * Authoritative sector camera poses for Stage C — Step 3.
 *
 * Sector layout:
 * 0 HERO       →   0°
 * 1 ABOUT      →  90°
 * 2 PROJECTS   → 180°
 * 3 CTA        → 270°
 * 4 TAIL_ZONE  → 315°
 */
export const SECTOR_CAMERA_POSES: SectorCameraPose[] = [
  {
    sectorIndex: 0,
    sectorName: "HERO",
    azimuthDeg: 0,
    pose: {
      elevationDeg: 0,
      radiusBias: 0,
      lookBiasX: 0,
      lookBiasY: 0,
    },
  },
  {
    sectorIndex: 1,
    sectorName: "ABOUT",
    azimuthDeg: 90,
    pose: {
      elevationDeg: 28,
      radiusBias: -0.06,
      lookBiasX: 0,
      lookBiasY: 0,
    },
  },
  {
    sectorIndex: 2,
    sectorName: "PROJECTS",
    azimuthDeg: 180,
    pose: {
      elevationDeg: -4,
      radiusBias: 0.02,
      lookBiasX: 0,
      lookBiasY: 0,
    },
  },
  {
    sectorIndex: 3,
    sectorName: "CTA",
    azimuthDeg: 270,
    pose: {
      elevationDeg: 80,
      radiusBias: 0.03,
      lookBiasX: -0.25,
      lookBiasY: 0.05,
    },
  },
  {
    sectorIndex: 4,
    sectorName: "TAIL_ZONE",
    azimuthDeg: 315,
    pose: {
      elevationDeg: 78,
      radiusBias: 0.05,
      lookBiasX: -0.35,
      lookBiasY: 0.05,
    },
  },
]

export function getSectorCameraPose(
  sectorIndex?: number
): SectorCameraPose | undefined {
  if (sectorIndex === undefined) return undefined
  return SECTOR_CAMERA_POSES.find((item) => item.sectorIndex === sectorIndex)
}