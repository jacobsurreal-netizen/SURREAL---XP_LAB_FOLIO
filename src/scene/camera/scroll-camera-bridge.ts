/**
 * Scroll-to-Camera Bridge — Anchor Timeline with Per-Anchor Poses
 *
 * Maps normalized scroll progress (0..1) through a configurable
 * anchor array. Each anchor carries an azimuth and a camera pose.
 * Both azimuth and pose values are interpolated between anchors.
 *
 * Stage C — Step 2:
 * Extended with snapshot-aware bridge mapping.
 *
 * Stage C — Step 3:
 * Extended with sector-aware camera poses.
 */

import * as THREE from "three"
import {
  SECTOR_CAMERA_POSES,
  getSectorCameraPose,
} from "./sector-camera-poses"

// ── Pose types ──────────────────────────────────────────────────

export interface CameraPose {
  /** Elevation offset in degrees (positive = look down from above) */
  elevationDeg: number
  /** Additive radius bias (positive = farther from target) */
  radiusBias: number
  /** Horizontal look-target bias */
  lookBiasX: number
  /** Vertical look-target bias */
  lookBiasY: number
}

export interface CameraAnchor {
  /** Orbit azimuth at this anchor, in degrees */
  azimuthDeg: number
  /** Camera pose at this anchor */
  pose: CameraPose
}

// ── Snapshot types ──────────────────────────────────────────────

export interface RuntimeSnapshot {
  scrollProgress?: number
  sectorIndex?: number
  sectorName?: string
  isSnapped?: boolean
}

// ── Output type ─────────────────────────────────────────────────

export interface ScrollOrbitOffsets {
  /** Azimuth in radians */
  azimuth: number
  /** Vertical height offset (sine arc) */
  height: number
  /** Interpolated elevation in degrees */
  elevationDeg: number
  /** Interpolated radius bias */
  radiusBias: number
  /** Interpolated horizontal look bias */
  lookBiasX: number
  /** Interpolated vertical look bias */
  lookBiasY: number
}

// ── Debug payload ───────────────────────────────────────────────

export interface CameraDebugState {
  visible: boolean
  progress: number
  sectorIndex?: number
  sectorName?: string
  isSnapped?: boolean
  azimuthDeg: number
  height: number
  elevationDeg: number
  radiusBias: number
  lookBiasX: number
  lookBiasY: number
}

type CameraDebugListener = (state: CameraDebugState) => void

// ── Config ──────────────────────────────────────────────────────

export interface ScrollBridgeConfig {
  /** Anchor definitions. Default: derived from sector camera poses. */
  anchors?: CameraAnchor[]
  /** Maximum height shift (sine arc). Default 0.2. */
  heightAmplitude?: number
  /**
   * Sector influence while freely scrolling.
   * Kept intentionally low so timeline remains the main driver.
   */
  sectorInfluence?: number
  /**
   * Sector influence when engine reports snapped state.
   * Still soft — never full override.
   */
  snappedSectorInfluence?: number
}

// ── Helpers ─────────────────────────────────────────────────────

const DEG2RAD = THREE.MathUtils.DEG2RAD
const RAD2DEG = THREE.MathUtils.RAD2DEG

/** Neutral pose — all zeros. */
const NEUTRAL_POSE: CameraPose = {
  elevationDeg: 0,
  radiusBias: 0,
  lookBiasX: 0,
  lookBiasY: 0,
}

/** Default anchors derived from authoritative sector poses. */
const DEFAULT_ANCHORS: CameraAnchor[] = SECTOR_CAMERA_POSES.map((item) => ({
  azimuthDeg: item.azimuthDeg,
  pose: { ...item.pose },
}))

// ── Debug bus ───────────────────────────────────────────────────

let debugVisible = false

let lastDebugState: CameraDebugState = {
  visible: false,
  progress: 0,
  sectorIndex: undefined,
  sectorName: undefined,
  isSnapped: undefined,
  azimuthDeg: 0,
  height: 0,
  elevationDeg: 0,
  radiusBias: 0,
  lookBiasX: 0,
  lookBiasY: 0,
}

const debugListeners = new Set<CameraDebugListener>()

function emitDebugState(state: CameraDebugState) {
  lastDebugState = state
  for (const listener of debugListeners) {
    listener(state)
  }
}

export function subscribeCameraDebug(listener: CameraDebugListener): () => void {
  debugListeners.add(listener)
  listener(lastDebugState)

  return () => {
    debugListeners.delete(listener)
  }
}

export function getCameraDebugState(): CameraDebugState {
  return lastDebugState
}

export function toggleCameraDebug(): boolean {
  debugVisible = !debugVisible

  emitDebugState({
    ...lastDebugState,
    visible: debugVisible,
  })

  return debugVisible
}

// ── Math helpers ────────────────────────────────────────────────

function interpolatePose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    elevationDeg: a.elevationDeg + (b.elevationDeg - a.elevationDeg) * t,
    radiusBias: a.radiusBias + (b.radiusBias - a.radiusBias) * t,
    lookBiasX: a.lookBiasX + (b.lookBiasX - a.lookBiasX) * t,
    lookBiasY: a.lookBiasY + (b.lookBiasY - a.lookBiasY) * t,
  }
}

function interpolateAnchors(
  progress: number,
  anchors: CameraAnchor[]
): { azimuth: number; pose: CameraPose } {
  if (anchors.length === 0) {
    return { azimuth: 0, pose: { ...NEUTRAL_POSE } }
  }

  if (anchors.length === 1) {
    return {
      azimuth: anchors[0].azimuthDeg * DEG2RAD,
      pose: { ...anchors[0].pose },
    }
  }

  const clamped = Math.max(0, Math.min(1, progress))
  const segments = anchors.length - 1
  const scaled = clamped * segments
  const index = Math.min(Math.floor(scaled), segments - 1)
  const t = scaled - index

  const a = anchors[index]
  const b = anchors[index + 1]

  const azimuthRad =
    (a.azimuthDeg + t * (b.azimuthDeg - a.azimuthDeg)) * DEG2RAD
  const pose = interpolatePose(a.pose, b.pose, t)

  return { azimuth: azimuthRad, pose }
}

function lerpAngleRad(a: number, b: number, t: number): number {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + delta * t
}

function blendOffsets(
  base: ScrollOrbitOffsets,
  sector: ScrollOrbitOffsets,
  t: number
): ScrollOrbitOffsets {
  if (t <= 0) return base

  const softT = Math.max(0, Math.min(1, t))
  const radiusT = softT * 0.35

  return {
    // Keep azimuth fully driven by scroll timeline.
    // This avoids the visible “15° kick” when sector snap changes.
    azimuth: base.azimuth,

    // Preserve vertical arc from scroll timeline.
    height: base.height,

    // Sector can gently influence elevation.
    elevationDeg:
      base.elevationDeg + (sector.elevationDeg - base.elevationDeg) * softT,

    // Radius influence stays subtle.
    radiusBias:
      base.radiusBias + (sector.radiusBias - base.radiusBias) * radiusT,

    // Look bias is safe and useful for composition.
    lookBiasX:
      base.lookBiasX + (sector.lookBiasX - base.lookBiasX) * softT,
    lookBiasY:
      base.lookBiasY + (sector.lookBiasY - base.lookBiasY) * softT,
  }
}

function createSectorOffsets(
  resolvedProgress: number,
  snapshot?: RuntimeSnapshot,
  heightAmplitude = 0.2
): ScrollOrbitOffsets | null {
  const sectorPose = getSectorCameraPose(snapshot?.sectorIndex)
  if (!sectorPose) return null

  return {
    azimuth: sectorPose.azimuthDeg * DEG2RAD,
    height: Math.sin(resolvedProgress * Math.PI) * heightAmplitude,
    elevationDeg: sectorPose.pose.elevationDeg,
    radiusBias: sectorPose.pose.radiusBias,
    lookBiasX: sectorPose.pose.lookBiasX,
    lookBiasY: sectorPose.pose.lookBiasY,
  }
}

function createCameraDebugState(
  offsets: ScrollOrbitOffsets,
  resolvedProgress: number,
  snapshot?: RuntimeSnapshot
): CameraDebugState {
  return {
    visible: debugVisible,
    progress: resolvedProgress,
    sectorIndex: snapshot?.sectorIndex,
    sectorName: snapshot?.sectorName,
    isSnapped: snapshot?.isSnapped,
    azimuthDeg: offsets.azimuth * RAD2DEG,
    height: offsets.height,
    elevationDeg: offsets.elevationDeg,
    radiusBias: offsets.radiusBias,
    lookBiasX: offsets.lookBiasX,
    lookBiasY: offsets.lookBiasY,
  }
}

// ── Public API ──────────────────────────────────────────────────

export function getScrollProgress(): number {
  if (typeof window === "undefined") return 0

  const scrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight

  if (maxScroll <= 0) return 0

  return Math.max(0, Math.min(1, scrollY / maxScroll))
}

export function mapScrollToOrbit(
  progress: number,
  config: ScrollBridgeConfig = {}
): ScrollOrbitOffsets {
  const { anchors = DEFAULT_ANCHORS, heightAmplitude = 0.2 } = config

  const { azimuth, pose } = interpolateAnchors(progress, anchors)
  const height = Math.sin(progress * Math.PI) * heightAmplitude

  return {
    azimuth,
    height,
    elevationDeg: pose.elevationDeg,
    radiusBias: pose.radiusBias,
    lookBiasX: pose.lookBiasX,
    lookBiasY: pose.lookBiasY,
  }
}

export function mapSnapshotToOrbit(
  snapshot?: RuntimeSnapshot,
  progress?: number,
  config: ScrollBridgeConfig = {}
): ScrollOrbitOffsets {
  const resolvedProgress = snapshot?.scrollProgress ?? progress ?? 0

  const {
    anchors = DEFAULT_ANCHORS,
    heightAmplitude = 0.08,
    sectorInfluence = 0.015,
    snappedSectorInfluence = 0.03,
  } = config

  const baseOffsets = mapScrollToOrbit(resolvedProgress, {
    anchors,
    heightAmplitude,
  })

  const sectorOffsets = createSectorOffsets(
    resolvedProgress,
    snapshot,
    heightAmplitude
  )

  const sectorBlend = snapshot?.isSnapped
  ? snappedSectorInfluence
  : sectorInfluence

const blendedOffsets = sectorOffsets
  ? blendOffsets(baseOffsets, sectorOffsets, sectorBlend)
  : baseOffsets

  const debugState = createCameraDebugState(
    blendedOffsets,
    resolvedProgress,
    snapshot
  )
  emitDebugState(debugState)

  if (snapshot && process.env.NODE_ENV === "development") {
    console.debug("[CameraSnapshot]", {
      sector: snapshot.sectorName,
      index: snapshot.sectorIndex,
      snapped: snapshot.isSnapped,
      progress: resolvedProgress,
      azimuthDeg: debugState.azimuthDeg,
      elevationDeg: blendedOffsets.elevationDeg,
      radiusBias: blendedOffsets.radiusBias,
      lookBiasX: blendedOffsets.lookBiasX,
      lookBiasY: blendedOffsets.lookBiasY,
    })
  }

  return blendedOffsets
}