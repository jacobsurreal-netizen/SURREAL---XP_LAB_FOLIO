/**
 * Scroll-to-Camera Bridge — Anchor Timeline with Per-Anchor Poses
 *
 * Maps normalized scroll progress (0..1) through a configurable
 * anchor array. Each anchor carries an azimuth and a camera pose.
 * Both azimuth and pose values are interpolated between anchors.
 *
 * Default anchors: 0° → 90° → 180° → 270° → 315° (tail zone).
 */

import * as THREE from 'three';

// ── Pose types ──────────────────────────────────────────────────

export interface CameraPose {
  /** Elevation offset in degrees (positive = look down from above) */
  elevationDeg: number;
  /** Additive radius bias (positive = farther from target) */
  radiusBias: number;
  /** Horizontal look-target bias */
  lookBiasX: number;
  /** Vertical look-target bias */
  lookBiasY: number;
}

export interface CameraAnchor {
  /** Orbit azimuth at this anchor, in degrees */
  azimuthDeg: number;
  /** Camera pose at this anchor */
  pose: CameraPose;
}

// ── Output type ─────────────────────────────────────────────────

export interface ScrollOrbitOffsets {
  /** Azimuth in radians */
  azimuth: number;
  /** Vertical height offset (sine arc) */
  height: number;
  /** Interpolated elevation in degrees */
  elevationDeg: number;
  /** Interpolated radius bias */
  radiusBias: number;
  /** Interpolated horizontal look bias */
  lookBiasX: number;
  /** Interpolated vertical look bias */
  lookBiasY: number;
}

// ── Config ──────────────────────────────────────────────────────

export interface ScrollBridgeConfig {
  /** Anchor definitions. Default: 5 anchors with neutral poses. */
  anchors?: CameraAnchor[];
  /** Maximum height shift (sine arc). Default 0.2. */
  heightAmplitude?: number;
}

// ── Helpers ─────────────────────────────────────────────────────

const DEG2RAD = THREE.MathUtils.DEG2RAD;

/** Neutral pose — all zeros. */
const NEUTRAL_POSE: CameraPose = {
  elevationDeg: 0,
  radiusBias: 0,
  lookBiasX: 0,
  lookBiasY: 0,
};

/** Default anchor set with per-section camera poses. */
const DEFAULT_ANCHORS: CameraAnchor[] = [
  // HERO — centered, neutral base composition
  { azimuthDeg: 0,   pose: { elevationDeg: 0,   radiusBias: 0,     lookBiasX: 0, lookBiasY: 0 } },
  // ABOUT — cinematic upward lift, slightly closer
  { azimuthDeg: 90,  pose: { elevationDeg: 28,  radiusBias: -0.06, lookBiasX: 0, lookBiasY: 0 } },
  // PROJECTS — near horizontal, slightly low angle
  { azimuthDeg: 180, pose: { elevationDeg: -4,  radiusBias: 0.02,  lookBiasX: 0, lookBiasY: 0 } },
  // CTA — strong top-down angle
  { azimuthDeg: 270, pose: { elevationDeg: 80,  radiusBias: 0.03,  lookBiasX: 0, lookBiasY: 0 } },
  // Tail zone — hold elevated, slightly farther
  { azimuthDeg: 315, pose: { elevationDeg: 78,  radiusBias: 0.05,  lookBiasX: 0, lookBiasY: 0 } },
];

/**
 * Linearly interpolate between two poses.
 */
function interpolatePose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    elevationDeg: a.elevationDeg + (b.elevationDeg - a.elevationDeg) * t,
    radiusBias:   a.radiusBias   + (b.radiusBias   - a.radiusBias)   * t,
    lookBiasX:    a.lookBiasX    + (b.lookBiasX     - a.lookBiasX)    * t,
    lookBiasY:    a.lookBiasY    + (b.lookBiasY     - a.lookBiasY)    * t,
  };
}

/**
 * Given normalized progress (0..1) and an anchor array, find the
 * current segment and return interpolated azimuth (radians) + pose.
 */
function interpolateAnchors(
  progress: number,
  anchors: CameraAnchor[],
): { azimuth: number; pose: CameraPose } {
  if (anchors.length === 0) return { azimuth: 0, pose: { ...NEUTRAL_POSE } };
  if (anchors.length === 1) {
    return { azimuth: anchors[0].azimuthDeg * DEG2RAD, pose: { ...anchors[0].pose } };
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const segments = anchors.length - 1;
  const scaled = clamped * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const t = scaled - index;

  const a = anchors[index];
  const b = anchors[index + 1];

  const azimuthRad = (a.azimuthDeg + t * (b.azimuthDeg - a.azimuthDeg)) * DEG2RAD;
  const pose = interpolatePose(a.pose, b.pose, t);

  return { azimuth: azimuthRad, pose };
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Read current page scroll progress as a normalized 0..1 value.
 */
export function getScrollProgress(): number {
  if (typeof window === 'undefined') return 0;
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / maxScroll));
}

/**
 * Convert normalized progress (0..1) into orbit offsets + pose values.
 */
export function mapScrollToOrbit(
  progress: number,
  config: ScrollBridgeConfig = {},
): ScrollOrbitOffsets {
  const {
    anchors = DEFAULT_ANCHORS,
    heightAmplitude = 0.2,
  } = config;

  const { azimuth, pose } = interpolateAnchors(progress, anchors);
  const height = Math.sin(progress * Math.PI) * heightAmplitude;

  return {
    azimuth,
    height,
    elevationDeg: pose.elevationDeg,
    radiusBias: pose.radiusBias,
    lookBiasX: pose.lookBiasX,
    lookBiasY: pose.lookBiasY,
  };
}
