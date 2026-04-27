import * as THREE from 'three';
import { loadGLB } from '../loaders/load-glb';

export const HERO_ASSET_PATH = "/assets/models/svetelny_orb_v_tetrahedronu.glb";

export interface HeroAssetOptions {
  path?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  enableIdleRotation?: boolean;
  camera?: THREE.Camera;
}

export type HeroSpectrumMode = 'COLOR' | 'IR';

/**
 * Creates a procedural radial soft glow texture for atmospheric effects.
 */
function createGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Texture();

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates and configures the hero asset with microparticles and smooth rolling motion.
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
    camera,
    enableIdleRotation = true,
  } = options;

  try {
    const asset = await loadGLB(path);

    // Create a parent container for local coordinate nesting
    const container = new THREE.Group();
    container.name = 'HeroAssetContainer';

    // Apply main transforms to container
    container.position.set(...position);
    container.rotation.set(...rotation);
    container.scale.setScalar(scale);

    // Initial model adjustment (resetting internal transforms for clean external control)
    asset.position.set(0, 0, 0);
    asset.rotation.set(0, 0, 0);
    asset.scale.setScalar(0.85);
    container.add(asset);

    // Configure shadows and material overrides on the model
    let orbMaterial: THREE.MeshStandardMaterial | null = null;
    let orbMesh: THREE.Mesh | null = null;

    asset.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Console log for mesh identification (minimal)
        console.log(`[HeroAsset] Mesh found: "${mesh.name}"`);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          // --- Task 8a: Orb Material Override ---
          if (name.includes('orb') || name.includes('sphere')) {
            orbMaterial = mat;
            orbMesh = mesh;
            if ('color' in mat) mat.color.set('#03bc7e');
            if ('emissive' in mat) mat.emissive.set('#66f096');
            if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0.8;
          }
          // --- Task 8b: Tetrahedron Material Override ---
          else if (name.includes('tetra') || name.includes('pyramid')) {
            if ('color' in mat) mat.color.set('#090414');
            if ('roughness' in mat) mat.roughness = 0.65;
            if ('metalness' in mat) mat.metalness = 0.52;
          }
        }
      }
    });

    // --- Task B: Microparticles ---
    const particleCount = 96;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random shell/halo distribution
      const r = 1.5 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x6614ff,
      size: 0.008,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    container.add(particles);

    // --- Task: Background Halo/Fog Layer ---
    const haloTexture = createGlowTexture();
    const haloMaterial = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      visible: true,
      color: '#00f0d4',
    });

    const haloGeometry = new THREE.PlaneGeometry(7, 5);
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);

    halo.name = 'HeroBackgroundHalo';

    if (camera) {
      // attach halo to camera space so it stays fixed relative to viewer
      halo.position.set(0, 0.15, -6.5);
      camera.add(halo);
    } else {
      // fallback behavior if camera is not provided
      halo.position.z = -3.8;
      container.add(halo);
    }

    const applySpectrumMode = (mode: HeroSpectrumMode) => {
      const isIR = mode === 'IR';

      const orbColor = isIR ? '#3a0a12' : '#03bc7e';
      const orbEmissive = isIR ? '#ff3b4d' : '#66f096';
      const orbEmissiveIntensity = isIR ? 1.15 : 0.8;

      const tetraColor = isIR ? '#140409' : '#090414';
      const particleColor = isIR ? '#ff3355' : '#6614ff';
      const haloColor = isIR ? '#ff2a3d' : '#00f0d4';
      const haloOpacity = isIR ? 0.22 : 0.15;

      asset.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;

        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (name.includes('orb') || name.includes('sphere')) {
            if ('color' in mat) mat.color.set(orbColor);
            if ('emissive' in mat) mat.emissive.set(orbEmissive);
            if ('emissiveIntensity' in mat) mat.emissiveIntensity = orbEmissiveIntensity;
          } else if (name.includes('tetra') || name.includes('pyramid')) {
            if ('color' in mat) mat.color.set(tetraColor);
          }

          mat.needsUpdate = true;
        }
      });

      material.color.set(particleColor);
      haloMaterial.color.set(haloColor);
      haloMaterial.opacity = haloOpacity;
      haloMaterial.needsUpdate = true;

      container.userData.spectrumMode = mode;
    };

    applySpectrumMode('COLOR');
    container.userData.applySpectrumMode = applySpectrumMode;

    // --- Task C & D: Update Hook ---
    if (enableIdleRotation) {
      let elapsedTime = 0;

      container.userData.update = (delta: number) => {
        elapsedTime += delta;

        // 1. Slow rolling motion for the model
        // combine slow Y with subtle X rolling
        asset.rotation.y = elapsedTime * 0.1;
        asset.rotation.x = Math.sin(elapsedTime * 0.08) * 1.75;
        asset.rotation.z = Math.cos(elapsedTime * 0.06) * 1.45;

        // Shared pulse factor (0.7 to 1.1 rad/sec range)
        const pulseFreq = 0.85;
        const mainPulse = Math.sin(elapsedTime * pulseFreq);

        // Update Orb pulse
        if (orbMaterial) {
          const currentMode = (container.userData.spectrumMode as HeroSpectrumMode) ?? 'COLOR';
          const baseIntensity = currentMode === 'IR' ? 1.15 : 0.8;
          orbMaterial.emissiveIntensity = baseIntensity + mainPulse * 0.25;
        }
        if (orbMesh) {
          // subtle orb scale pulse
          const orbPulseScale = 1.0 + mainPulse * 0.02;
          orbMesh.scale.setScalar(orbPulseScale);
        }

        // 2. Coordinated particle drift with pulse
        const driftPulse = 1.0 + mainPulse * 0.4;
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const off = i * 0.1;
          const x = initialPositions[i * 3];
          const y = initialPositions[i * 3 + 1];
          const z = initialPositions[i * 3 + 2];

          // Base drift + pulse-synced breathing offset
          posAttr.setX(i, x + Math.sin(elapsedTime * 0.8 + off) * 0.05 * driftPulse);
          posAttr.setY(i, y + Math.cos(elapsedTime * 0.7 + off) * 0.05 * driftPulse);
          posAttr.setZ(i, z + Math.sin(elapsedTime * 0.9 + off) * 0.05 * driftPulse);
        }
        posAttr.needsUpdate = true;

        // 3. Synchronized Halo Pulse
        const currentMode = (container.userData.spectrumMode as HeroSpectrumMode) ?? 'COLOR';
        const baseHaloOpacity = currentMode === 'IR' ? 0.22 : 0.15;
        const haloPulse = Math.sin(elapsedTime * 0.7) * 0.05;
        halo.scale.setScalar(1 + haloPulse);
        haloMaterial.opacity = baseHaloOpacity + Math.sin(elapsedTime * 0.7) * 0.04;
      };
    }

    console.log(`[createHeroAsset] Successfully created enhanced hero asset with particles at: ${path}`);
    return container;
  } catch (error) {
    console.error(`[createHeroAsset] Failed to create hero asset from: ${path}`, error);
    throw error;
  }
}
