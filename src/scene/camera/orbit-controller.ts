import * as THREE from 'three';
import type { FramingResult } from './framing';

/**
 * Minimal orbit controller skeleton.
 *
 * Stores orbit state (target, radius, azimuth, height) and computes
 * camera position each frame. Designed to be initialized from the
 * result of `frameObject()` and extended later with scroll hooks,
 * magnetic snap, and sector transitions.
 */
export class OrbitController {
  /** Point the camera orbits around */
  target = new THREE.Vector3();

  /** Distance from target */
  radius: number;

  /** Horizontal angle in radians (0 = positive Z) */
  azimuth = 0;

  /** Vertical offset above target */
  height = 0;

  constructor(framing: FramingResult) {
    this.target.copy(framing.center);
    this.radius = framing.distance;
  }

  // ── Setters for future consumers ──────────────────────────────

  setAzimuth(radians: number) {
    this.azimuth = radians;
  }

  setHeight(y: number) {
    this.height = y;
  }

  setTarget(v: THREE.Vector3) {
    this.target.copy(v);
  }

  setRadius(r: number) {
    this.radius = r;
  }

  // ── Per-frame update ──────────────────────────────────────────

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
