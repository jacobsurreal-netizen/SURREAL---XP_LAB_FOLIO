import * as THREE from 'three';

/**
 * Result of framing computation.
 * Stored on camera.userData for downstream consumers (breathing, orbit, parallax).
 */
export interface FramingResult {
  center: THREE.Vector3;
  size: THREE.Vector3;
  maxDim: number;
  distance: number;
}

export interface FramingOptions {
  /** Multiplier applied to maxDimension to determine camera distance. Default 1.8 */
  distanceFactor?: number;
  /** Vertical offset added to camera Y relative to center. Default 0 */
  offsetY?: number;
}

/**
 * Compute a safe camera position that frames the given object.
 *
 * Uses Box3 to measure the real bounds of the object, then places
 * the camera on the positive-Z axis at a conservative distance
 * derived from the largest dimension.
 *
 * The function is asset-agnostic — it works for any reasonable GLB
 * without hardcoded model-specific values.
 */
export function frameObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: FramingOptions = {},
): FramingResult {
  const { distanceFactor = 1.8, offsetY = 0 } = options;

  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Derive distance from the camera's vertical FOV so the object
  // fills roughly 60-70% of the viewport height regardless of FOV.
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const fovDistance = maxDim / (2 * Math.tan(vFov / 2));
  const distance = fovDistance * distanceFactor;

  camera.position.set(
    center.x,
    center.y + offsetY,
    center.z + distance,
  );
  camera.lookAt(center);

  return { center, size, maxDim, distance };
}
