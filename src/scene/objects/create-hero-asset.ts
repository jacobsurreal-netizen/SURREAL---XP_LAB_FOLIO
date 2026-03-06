import * as THREE from 'three';
import { loadGLB } from '../loaders/load-glb';

export const HERO_ASSET_PATH = "/assets/models/svetelny_orb_v_tetrahedronu.glb";

export interface HeroAssetOptions {
  path?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  enableIdleRotation?: boolean;
}

/**
 * Creates and configures the hero asset.
 * 
 * @param options - Configuration options for the hero asset.
 * @returns Promise<THREE.Object3D>
 */
export async function createHeroAsset(options: HeroAssetOptions = {}): Promise<THREE.Object3D> {
  const {
    path = HERO_ASSET_PATH,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    enableIdleRotation = false
  } = options;

  try {
    const asset = await loadGLB(path);

    // Apply transforms
    asset.position.set(...position);
    asset.rotation.set(...rotation);
    asset.scale.setScalar(scale);

    // Configure shadows and traverse
    asset.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Handle idle rotation if enabled
    if (enableIdleRotation) {
      asset.userData.update = (delta: number) => {
        asset.rotation.y += delta * 0.5; // rotate slowly on Y axis
      };
    }

    console.log(`[createHeroAsset] Successfully loaded and configured hero asset from: ${path}`);
    return asset;
  } catch (error) {
    console.error(`[createHeroAsset] Failed to create hero asset from: ${path}`, error);
    throw error;
  }
}
