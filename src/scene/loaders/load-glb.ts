import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Loads a GLB model from a given path.
 * Resolves with the gltf.scene (THREE.Group).
 * 
 * @param path - The runtime path to the .glb file.
 * @returns Promise<THREE.Group>
 */
export async function loadGLB(path: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf: GLTF) => {
        resolve(gltf.scene);
      },
      undefined, // Progress callback not required
      (error: unknown) => {
        console.error(`[loadGLB] Failed to load GLB from path: ${path}`, error);
        reject(error);
      }
    );
  });
}
