import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { loadGLB } from '../loaders/load-glb';

export const HERO_ASSET_PATH = '/assets/models/svetelny_orb_v_tetrahedronu.glb';

export interface HeroAssetOptions {
  path?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  enableIdleRotation?: boolean;
  camera?: THREE.Camera;
  getCaptureInstability?: () => CaptureInstabilityState | undefined;
}

type CaptureInstabilityState = {
  enabled: boolean;
  elapsedSeconds: number;
  phase: string;
  progress: number;
  pressure: number;
};

export type HeroSpectrumMode = 'COLOR' | 'IR' | 'SCAN';

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
 */
export async function createHeroAsset(options: HeroAssetOptions = {}): Promise<THREE.Object3D> {
  const {
    path = HERO_ASSET_PATH,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    camera,
    enableIdleRotation = true,
    getCaptureInstability,
  } = options;

  try {
    const asset = await loadGLB(path);

    const container = new THREE.Group();
    container.name = 'HeroAssetContainer';

    container.position.set(...position);
    container.rotation.set(...rotation);
    container.scale.setScalar(scale);

    asset.position.set(0, 0, 0);
    asset.rotation.set(0, 0, 0);
    asset.scale.setScalar(0.85);
    container.add(asset);

    let orbMaterial: THREE.MeshStandardMaterial | null = null;
    let orbMesh: THREE.Mesh | null = null;
    let tetraMaterial: THREE.MeshStandardMaterial | null = null;
    let tetraMesh: THREE.Mesh | null = null;

    let scanTetraPoints: THREE.Points | null = null;
    let scanTetraPointsMaterial: THREE.PointsMaterial | null = null;

    asset.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;

      const mesh = child as THREE.Mesh;
      const name = mesh.name.toLowerCase();

      console.log(`[HeroAsset] Mesh found: "${mesh.name}"`);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (!mesh.material || Array.isArray(mesh.material)) return;

      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (name.includes('orb') || name.includes('sphere')) {
        orbMaterial = mat;
        orbMesh = mesh;

        if ('color' in mat) mat.color.set('#03bc7e');
        if ('emissive' in mat) mat.emissive.set('#66f096');
        if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0.8;
      } else if (name.includes('tetra') || name.includes('pyramid')) {
        tetraMaterial = mat;
        tetraMesh = mesh;

        if ('color' in mat) mat.color.set('#090414');
        if ('roughness' in mat) mat.roughness = 0.65;
        if ('metalness' in mat) mat.metalness = 0.52;
      }
    });

    // Microparticles around the object
    const particleCount = 96;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
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

    // Background halo / glow
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
      halo.position.set(0, 0.15, -6.5);
      camera.add(halo);
    } else {
      halo.position.z = -3.8;
      container.add(halo);
    }

    // SCAN proxy tetra shell sampled from tetra surface
    if (tetraMesh) {
      const sampler = new MeshSurfaceSampler(tetraMesh).build();
      const sampleCount = 900;
      const tetraPositions = new Float32Array(sampleCount * 3);
      const tempPosition = new THREE.Vector3();

      for (let i = 0; i < sampleCount; i++) {
        sampler.sample(tempPosition);
        tetraPositions[i * 3 + 0] = tempPosition.x;
        tetraPositions[i * 3 + 1] = tempPosition.y;
        tetraPositions[i * 3 + 2] = tempPosition.z;
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(tetraPositions, 3));

      scanTetraPointsMaterial = new THREE.PointsMaterial({
        color: '#c084fc',
        size: 0.016,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      scanTetraPoints = new THREE.Points(pointsGeometry, scanTetraPointsMaterial);
      scanTetraPoints.visible = false;
      scanTetraPoints.renderOrder = 6;
      (tetraMesh as THREE.Mesh).add(scanTetraPoints);
    }

    const applySpectrumMode = (mode: HeroSpectrumMode) => {
      const isIR = mode === 'IR';
      const isScan = mode === 'SCAN';

      const orbColor = isScan ? '#f3d6ff' : isIR ? '#3a0a12' : '#03bc7e';
      const orbEmissive = isScan ? '#c084fc' : isIR ? '#ff3b4d' : '#66f096';
      const orbEmissiveIntensity = isScan ? 2.2 : isIR ? 1.15 : 0.8;

      const tetraColor = isScan ? '#b478ff' : isIR ? '#140409' : '#090414';
      const particleColor = isScan ? '#c084fc' : isIR ? '#ff3355' : '#6614ff';
      const haloColor = isScan ? '#b478ff' : isIR ? '#ff2a3d' : '#00f0d4';
      const haloOpacity = isScan ? 0.06 : isIR ? 0.22 : 0.15;

      asset.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;

        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (!mesh.material || Array.isArray(mesh.material)) return;

        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (name.includes('orb') || name.includes('sphere')) {
          if ('color' in mat) mat.color.set(orbColor);
          if ('emissive' in mat) mat.emissive.set(orbEmissive);
          if ('emissiveIntensity' in mat) mat.emissiveIntensity = orbEmissiveIntensity;
          if ('roughness' in mat) mat.roughness = isScan ? 1 : 0.45;
          if ('metalness' in mat) mat.metalness = isScan ? 0 : 0.15;

          mat.transparent = true;
          mat.opacity = isScan ? 0.9 : 1;
          mat.wireframe = isScan;
          mat.depthWrite = !isScan;
          mat.needsUpdate = true;
        } else if (name.includes('tetra') || name.includes('pyramid')) {
          if ('color' in mat) mat.color.set(tetraColor);
          if ('emissive' in mat) mat.emissive.set(isScan ? '#8b5cf6' : '#000000');
          if ('emissiveIntensity' in mat) mat.emissiveIntensity = isScan ? 0.08 : 0;
          if ('roughness' in mat) mat.roughness = isScan ? 1 : 0.65;
          if ('metalness' in mat) mat.metalness = isScan ? 0 : 0.52;

          // Keep tetra visible in COLOR/IR, fade it back in SCAN behind particle shell.
          mat.wireframe = false;
          mat.transparent = isScan;
          mat.opacity = isScan ? 0.06 : 1;
          mat.depthWrite = !isScan;
          mat.needsUpdate = true;
        }
      });

      if (scanTetraPoints) {
        scanTetraPoints.visible = isScan;
      }

      if (scanTetraPointsMaterial) {
        scanTetraPointsMaterial.color.set(isScan ? '#d8b4fe' : '#c084fc');
        scanTetraPointsMaterial.opacity = isScan ? 0.88 : 0;
        scanTetraPointsMaterial.size = isScan ? 0.016 : 0.01;
        scanTetraPointsMaterial.needsUpdate = true;
      }

      material.color.set(particleColor);
      material.opacity = isScan ? 0.3 : 0.65;
      material.size = isScan ? 0.005 : 0.008;
      material.needsUpdate = true;

      haloMaterial.color.set(haloColor);
      haloMaterial.opacity = haloOpacity;
      haloMaterial.needsUpdate = true;

      container.userData.spectrumMode = mode;
    };

    applySpectrumMode('COLOR');
    container.userData.applySpectrumMode = applySpectrumMode;

    if (enableIdleRotation) {
      let elapsedTime = 0;

      container.userData.update = (delta: number) => {
        elapsedTime += delta;

        const currentMode = (container.userData.spectrumMode as HeroSpectrumMode) ?? 'COLOR';
        const capture = getCaptureInstability?.();
        const captureEnabled = capture?.enabled === true;
        const capturePressure = captureEnabled ? Math.max(0, Math.min(1, capture.pressure)) : 0;
        const captureTime = capture?.elapsedSeconds ?? elapsedTime;
        const captureProgress = capture?.progress ?? 0;
        const capturePhase = captureEnabled ? capture!.phase : '';

        // Capture acquisition can never fully lock onto the artifact; each phase
        // destabilizes it harder so the scan reads as unresolved rather than clean.
        const capturePhaseInstability = !captureEnabled
          ? 0
          : capturePhase === 'aligning'
            ? 0.7
            : capturePhase === 'unstable'
              ? 1.0
              : capturePhase === 'fail'
                ? 1.45
                : capturePhase === 'insufficient'
                  ? 0.6
                  : 0.28; // boot

        const phaseJitter =
          capturePressure *
          capturePhaseInstability *
          (Math.sin(captureTime * 9.3 + captureProgress * 3.1) * 0.012 +
            Math.sin(captureTime * 14.7) * 0.006);

        if (captureEnabled) {
          const scaleBreath =
            1 +
            Math.sin(captureTime * 3.2 + captureProgress * Math.PI) * 0.006 * capturePressure +
            Math.sin(captureTime * 9.4) * 0.002 * capturePressure;
          container.scale.setScalar(scale * scaleBreath);
        } else {
          container.scale.setScalar(scale);
        }

        // Keep the same motion profile across modes so SCAN only "changes clothes".
        asset.rotation.y = elapsedTime * 0.1 + phaseJitter * 0.9;
        asset.rotation.x = Math.sin(elapsedTime * 0.08) * 1.75 + phaseJitter * 1.4;
        asset.rotation.z = Math.cos(elapsedTime * 0.06) * 1.45 - phaseJitter;

        // Unstable acquisition: subtle drift while capture is active; reset when
        // disabled so diagnosis phases do not leave the GLB off its origin.
        if (captureEnabled) {
          const inst = capturePhaseInstability;
          asset.position.x =
            (Math.sin(captureTime * 21.0) * 0.008 + Math.sin(captureTime * 6.7) * 0.012) * inst;
          asset.position.y =
            (Math.cos(captureTime * 18.3) * 0.006 + Math.sin(captureTime * 3.9) * 0.01) * inst;
          asset.position.z = Math.sin(captureTime * 4.6) * 0.025 * inst;
        } else if (getCaptureInstability?.()) {
          asset.position.set(0, 0, 0);
        }

        const pulseFreq = 0.85;
        const mainPulse = Math.sin(elapsedTime * pulseFreq);
        const tetraPulse = Math.sin(elapsedTime * 1.1);

        if (orbMaterial) {
          const baseIntensity = currentMode === 'SCAN' ? 2.2 : currentMode === 'IR' ? 1.15 : 0.8;
          if (captureEnabled) {
            // Suppress the orb so it stops reading as a hero beauty object, then
            // layer failed-lock flicker + occasional phase-slip dropouts on top.
            const emissiveSuppress =
              capturePhase === 'aligning'
                ? 0.5
                : capturePhase === 'unstable'
                  ? 0.34
                  : capturePhase === 'fail'
                    ? 0.22
                    : capturePhase === 'insufficient'
                      ? 0.46
                      : 0.62; // boot
            const lockFlicker =
              1 + Math.sin(captureTime * 17.0 + captureProgress * 5.0) * 0.2 * capturePressure;
            const phaseSlip = Math.sin(captureTime * 2.3) > 0.82 ? 0.5 : 1;
            orbMaterial.emissiveIntensity = Math.max(
              0.05,
              (baseIntensity * emissiveSuppress + mainPulse * 0.08) * lockFlicker * phaseSlip
            );
          } else {
            orbMaterial.emissiveIntensity = baseIntensity + mainPulse * 0.25;
          }
        }

        if (orbMesh) {
          const orbPulseScale = 1.0 + mainPulse * 0.02;
          orbMesh.scale.setScalar(orbPulseScale);
        }

        const driftPulse = 1.0 + mainPulse * 0.4 + capturePressure * 0.35;
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const off = i * 0.1;
          const x = initialPositions[i * 3];
          const y = initialPositions[i * 3 + 1];
          const z = initialPositions[i * 3 + 2];

          posAttr.setX(i, x + Math.sin(elapsedTime * 0.8 + off) * 0.05 * driftPulse);
          posAttr.setY(i, y + Math.cos(elapsedTime * 0.7 + off) * 0.05 * driftPulse);
          posAttr.setZ(i, z + Math.sin(elapsedTime * 0.9 + off) * 0.05 * driftPulse);
        }
        posAttr.needsUpdate = true;

        if (scanTetraPointsMaterial) {
          if (currentMode === 'SCAN') {
            scanTetraPointsMaterial.opacity = 0.82 + tetraPulse * 0.06;
            scanTetraPointsMaterial.size = 0.016 + ((tetraPulse + 1) * 0.5) * 0.002;
          } else {
            scanTetraPointsMaterial.opacity = 0;
            scanTetraPointsMaterial.size = 0.01;
          }
        }

        const baseHaloOpacity = currentMode === 'SCAN' ? 0.06 : currentMode === 'IR' ? 0.22 : 0.15;
        const haloPulse = Math.sin(elapsedTime * 0.7) * 0.05;
        if (captureEnabled) {
          // Pull the glow/halo down hard so the artifact loses its bloom dominance.
          const haloSuppress =
            capturePhase === 'fail'
              ? 0.22
              : capturePhase === 'unstable'
                ? 0.38
                : capturePhase === 'aligning'
                  ? 0.55
                  : capturePhase === 'insufficient'
                    ? 0.5
                    : 0.7; // boot
          const haloFlicker = 1 + Math.sin(captureTime * 15.0) * 0.28 * capturePressure;
          halo.scale.setScalar((1 + haloPulse * 0.5) * (1 - capturePressure * 0.12));
          haloMaterial.opacity = Math.max(0, baseHaloOpacity * haloSuppress * haloFlicker);
        } else {
          halo.scale.setScalar(1 + haloPulse);
          haloMaterial.opacity =
            currentMode === 'SCAN'
              ? baseHaloOpacity + Math.sin(elapsedTime * 0.7) * 0.015
              : baseHaloOpacity + Math.sin(elapsedTime * 0.7) * 0.04;
        }
      };
    }

    console.log(`[createHeroAsset] Successfully created enhanced hero asset with particles at: ${path}`);
    return container;
  } catch (error) {
    console.error(`[createHeroAsset] Failed to create hero asset from: ${path}`, error);
    throw error;
  }
}
