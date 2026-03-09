import * as THREE from 'three';
import type { FramingResult } from './framing';

/**
 * Minimal orbit controller with eased target-state motion.
 *
 * Stores orbit state (target, radius, azimuth, height) and computes
 * camera position each frame. Designed to be initialized from the
 * result of `frameObject()` and extended with smoothing / sector logic.
 */
export class OrbitController {
  /** Point the camera orbits around */
  target = new THREE.Vector3();

  /** Current distance from target */
  radius: number;

  /** Current horizontal angle in radians (0 = positive Z) */
  azimuth = 0;

  /** Current vertical offset above target */
  height = 0;

  /** Target distance from target */
  targetRadius: number;

  /** Target horizontal angle in radians */
  targetAzimuth = 0;

  /** Target vertical offset above target */
  targetHeight = 0;

  /**
   * Damping strengths.
   * Higher = faster catch-up, lower = softer cinematic drift.
   */
  azimuthDamping = 7.5;
  heightDamping = 7.5;
  radiusDamping = 7.5;

  constructor(framing: FramingResult) {
    this.target.copy(framing.center);
    this.radius = framing.distance;
    this.targetRadius = framing.distance;
  }

  // ── Setters for consumers ─────────────────────────────────────

  setAzimuth(radians: number) {
    this.targetAzimuth = radians;
  }

  setHeight(y: number) {
    this.targetHeight = y;
  }

  setTarget(v: THREE.Vector3) {
    this.target.copy(v);
  }

  setRadius(r: number) {
    this.targetRadius = r;
  }

  setDamping(config: {
    azimuth?: number;
    height?: number;
    radius?: number;
  }) {
    if (typeof config.azimuth === 'number') this.azimuthDamping = config.azimuth;
    if (typeof config.height === 'number') this.heightDamping = config.height;
    if (typeof config.radius === 'number') this.radiusDamping = config.radius;
  }

  // ── Per-frame easing ──────────────────────────────────────────

  /**
   * Smoothly move current orbit state toward target orbit state.
   */
  tick(delta: number) {
    this.azimuth = dampAngle(this.azimuth, this.targetAzimuth, this.azimuthDamping, delta);
    this.height = THREE.MathUtils.damp(this.height, this.targetHeight, this.heightDamping, delta);
    this.radius = THREE.MathUtils.damp(this.radius, this.targetRadius, this.radiusDamping, delta);
  }

  // ── Per-frame render update ───────────────────────────────────

  /**
   * Compute camera position from orbit state and apply lookAt.
   *
   * Accepts optional additive offsets so breathing / parallax layers
   * can compose on top without mutating orbit state.
   */
  update(
    camera: THREE.PerspectiveCamera,
    offsets?: { dx?: number; dy?: number; dz?: number; lookBiasX?: number; lookBiasY?: number },
  ) {
    const { dx = 0, dy = 0, dz = 0, lookBiasX = 0, lookBiasY = 0 } = offsets ?? {};

    const r = this.radius + dz;
    const x = this.target.x + Math.sin(this.azimuth) * r + dx;
    const y = this.target.y + this.height + dy;
    const z = this.target.z + Math.cos(this.azimuth) * r;

    camera.position.set(x, y, z);

    // LookAt with optional subtle bias (e.g. pointer parallax)
    const lookTarget = this.target.clone();
    lookTarget.x += lookBiasX;
    lookTarget.y += lookBiasY;
    camera.lookAt(lookTarget);
  }
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const wrappedDelta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  const nextDelta = THREE.MathUtils.damp(0, wrappedDelta, lambda, delta);
  return current + nextDelta;
}