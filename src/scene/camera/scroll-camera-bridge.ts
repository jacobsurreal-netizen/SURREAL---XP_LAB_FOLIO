/**
 * Scroll-to-Camera Bridge — Anchor Timeline
 *
 * Maps normalized scroll progress (0..1) through a configurable
 * anchor array to produce orbit azimuth and height offsets.
 *
 * Default anchors: 0° → 90° → 180° → 270° → 315° (tail zone).
 * The tail zone beyond 270° is reserved for footer / gateway content.
 *
 * The anchor array can be freely retuned for per-section camera poses
 * without changing the interpolation math.
 */

import * as THREE from 'three';

// ── Public types ────────────────────────────────────────────────

export interface ScrollOrbitOffsets {
  /** Azimuth in radians */
  azimuth: number;
  /** Vertical offset */
  height: number;
}

export interface ScrollBridgeConfig {
  /**
   * Anchor angles in degrees, evenly spaced across scroll progress.
   * Default: [0, 90, 180, 270, 315]
   *
   * progress 0 → first anchor, progress 1 → last anchor.
   * Segments between anchors are equal-length in scroll space.
   */
  anchorsDeg?: number[];
  /** Maximum height shift (sine arc). Default 0.2. */
  heightAmplitude?: number;
}

// ── Helpers ─────────────────────────────────────────────────────

const DEG2RAD = THREE.MathUtils.DEG2RAD;

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
 * Interpolate through an anchor array based on normalized progress.
 *
 * Progress 0 → anchors[0], progress 1 → anchors[last].
 * Between anchors the value is linearly interpolated.
 */
function interpolateAnchors(progress: number, anchors: number[]): number {
  if (anchors.length === 0) return 0;
  if (anchors.length === 1) return anchors[0];

  const clamped = Math.max(0, Math.min(1, progress));
  const segments = anchors.length - 1;
  const scaled = clamped * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const t = scaled - index;

  return anchors[index] + t * (anchors[index + 1] - anchors[index]);
}

// ── Main API ────────────────────────────────────────────────────

const DEFAULT_ANCHORS_DEG = [0, 90, 180, 270, 315];

/**
 * Convert normalized progress (0..1) into orbit offsets using the
 * anchor timeline.
 *
 * Azimuth is interpolated through the anchor array.
 * Height follows a sine arc peaking mid-scroll.
 */
export function mapScrollToOrbit(
  progress: number,
  config: ScrollBridgeConfig = {},
): ScrollOrbitOffsets {
  const {
    anchorsDeg = DEFAULT_ANCHORS_DEG,
    heightAmplitude = 0.2,
  } = config;

  const anchorsRad = anchorsDeg.map((d) => d * DEG2RAD);
  const azimuth = interpolateAnchors(progress, anchorsRad);
  const height = Math.sin(progress * Math.PI) * heightAmplitude;

  return { azimuth, height };
}
