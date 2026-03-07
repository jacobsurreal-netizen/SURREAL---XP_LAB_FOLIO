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
  /** Azimuth start angle in radians. Default -0.4. */
  azimuthStart?: number;
  /** Azimuth end angle in radians. Default 0.6. */
  azimuthEnd?: number;
  /** Maximum height shift. Default 0.2. Maps as sin curve for smooth start/end. */
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
 * Azimuth sweeps from azimuthStart to azimuthEnd — an asymmetric range
 * avoids a clinical centered start and creates a more editorial reveal.
 *
 * Height follows a sine curve peaking gently mid-scroll for a cinematic arc.
 */
export function mapScrollToOrbit(
  progress: number,
  config: ScrollBridgeConfig = {},
): ScrollOrbitOffsets {
  const {
    azimuthStart = -0.4,
    azimuthEnd = 0.6,
    heightAmplitude = 0.2,
  } = config;

  return {
    azimuth: azimuthStart + progress * (azimuthEnd - azimuthStart),
    height: Math.sin(progress * Math.PI) * heightAmplitude,
  };
}
