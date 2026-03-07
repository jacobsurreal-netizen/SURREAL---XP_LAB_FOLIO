/**
 * Scroll-to-Camera Bridge
 *
 * Pure helper that maps normalized scroll progress (0..1) into
 * small orbit offsets. Keeps the orbit controller as the authority
 * while scroll acts as a subtle viewpoint modulation layer.
 */

export interface ScrollOrbitOffsets {
  /** Azimuth offset in radians */
  azimuth: number;
  /** Vertical offset */
  height: number;
}

export interface ScrollBridgeConfig {
  /** Azimuth range in radians. Default π/2 (90°). Maps progress 0→1 to 0→range. */
  azimuthRange?: number;
  /** Maximum height shift. Default 0.15. Maps as sin curve for smooth start/end. */
  heightAmplitude?: number;
}

/**
 * Read current page scroll progress as a normalized 0..1 value.
 * Returns 0 at top, 1 at bottom. Clamped to safe range.
 */
export function getScrollProgress(): number {
  if (typeof window === 'undefined') return 0;
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / maxScroll));
}

/**
 * Convert normalized progress (0..1) into subtle orbit offsets.
 *
 * Azimuth maps linearly across the configured range.
 * Height follows a sine curve so the shift is zero at start and end,
 * peaking gently in the middle — creating a cinematic arc feel.
 */
export function mapScrollToOrbit(
  progress: number,
  config: ScrollBridgeConfig = {},
): ScrollOrbitOffsets {
  const {
    azimuthRange = Math.PI * 0.5,   // 90° total swing
    heightAmplitude = 0.15,
  } = config;

  return {
    azimuth: progress * azimuthRange,
    height: Math.sin(progress * Math.PI) * heightAmplitude,
  };
}
