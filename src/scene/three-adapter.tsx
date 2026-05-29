'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSpectrumMode } from '@/hooks/use-spectrum-mode';
import { createHeroAsset } from './objects/create-hero-asset';
import { frameObject } from './camera/framing';
import { OrbitController } from './camera/orbit-controller';
import { mapSnapshotToOrbit } from './camera/scroll-camera-bridge';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createPointerTracker } from './input/pointer-tracker';


interface ThreeRuntimeAdapterProps {
  progress?: number
  snapshot?: ThreeRuntimeSnapshot
  captureInstability?: CaptureInstabilityState
}

type CaptureInstabilityState = {
  enabled: boolean
  elapsedSeconds: number
  phase: string
  progress: number
  pressure: number
}

type ThreeRuntimeSnapshot = {
  scrollProgress: number
  sectorIndex: number
  sectorName: string
  isSnapped?: boolean
  spectrumMode?: RuntimeSpectrumMode
}

type RuntimeSpectrumMode = 'COLOR' | 'IR' | 'SCAN'
type HeroSpectrumMode = 'COLOR' | 'IR' | 'SCAN'

export function ThreeRuntimeAdapter({
  progress = 0,
  snapshot,
  captureInstability,
}: ThreeRuntimeAdapterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const progressRef = useRef(progress);
  const snapshotRef = useRef<ThreeRuntimeSnapshot | undefined>(snapshot);
  const captureInstabilityRef = useRef<CaptureInstabilityState | undefined>(captureInstability);
  const heroAssetRef = useRef<THREE.Object3D | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fogRef = useRef<THREE.FogExp2 | null>(null);

  const { mode } = useSpectrumMode();
  const spectrumRef = useRef<RuntimeSpectrumMode>(mode as RuntimeSpectrumMode);

  // Sync progress prop to ref for use in animation loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Parallax and Scroll Orbit tracking
  // Sync snapshot prop to ref for use in animation loop
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    captureInstabilityRef.current = captureInstability;
  }, [captureInstability]);

  // Sync spectrum state to ref for non-reactive scene lifecycle
  useEffect(() => {
    spectrumRef.current = mode as RuntimeSpectrumMode;
  }, [mode]);

  // Apply spectrum changes to already-loaded hero asset
  useEffect(() => {
    const asset = heroAssetRef.current;
    if (!asset) return;

    const applySpectrumMode = (
      asset.userData as { applySpectrumMode?: (mode: HeroSpectrumMode) => void }
    ).applySpectrumMode;

    if (typeof applySpectrumMode === 'function') {
      applySpectrumMode(mode as HeroSpectrumMode);
    }
  }, [mode]);

  useEffect(() => {
  const isIR = mode === 'IR';
  const isScan = mode === 'SCAN';

  const ambient = ambientLightRef.current;
  const directional = directionalLightRef.current;
  const fog = fogRef.current;
  const composer = composerRef.current;

  if (ambient) {
    ambient.color.set(
      isScan ? '#b478ff' : isIR ? '#ff3344' : '#6cfc86'
    );
    ambient.intensity = isScan ? 1.05 : isIR ? 1.15 : 1.8;
  }

  if (directional) {
    directional.color.set(
      isScan ? '#d2a7ff' : isIR ? '#ff2238' : '#6cfc86'
    );
    directional.intensity = isScan ? 0.82 : isIR ? 0.95 : 1.4;
  }

  if (fog) {
    fog.color.set(
      isScan ? '#090014' : isIR ? '#140203' : '#000000'
    );
    fog.density = isScan ? 0.078 : isIR ? 0.055 : 0.045;
  }

  if (composer) {
    const bloomPass = composer.passes.find(
      (pass) => pass instanceof UnrealBloomPass
    ) as UnrealBloomPass | undefined;

    if (bloomPass) {
      bloomPass.strength = isScan ? 0.11 : isIR ? 0.18 : 0.25;
      bloomPass.radius = isScan ? 0.04 : 0.1;
      bloomPass.threshold = isScan ? 0.42 : 0.25;
    }
  }
}, [mode]);

  // Parallax tracking
  const smoothedOrbitRef = useRef(0);

  let orbit: OrbitController | null = null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pointerTracker = createPointerTracker(container);
pointerTracker.attach();

    // scene, camera, renderer setup
    const scene = new THREE.Scene();

    // Task 7b: Ambient Fog
    const fog = new THREE.FogExp2(0x000000, 0.045);
    scene.fog = fog;
    fogRef.current = fog;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 5);

    // Important:
    // add camera to scene so camera-attached halo/fog can render as part of scene graph
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Bloom postprocessing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.25,
      0.1,
      0.25
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Basic light rig
    const ambientLight = new THREE.AmbientLight(0x6cfc86, 1.8);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0x6cfc86, 1.4);
    directionalLight.position.set(4, 6, 4);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Load and attach hero asset
    createHeroAsset({
      position: [0, 0, 0],
      scale: 1.5,
      enableIdleRotation: true,
      camera,
      getCaptureInstability: () => captureInstabilityRef.current,
    })
      .then((asset) => {
        scene.add(asset);
        heroAssetRef.current = asset;

        const applySpectrumMode = (
          asset.userData as { applySpectrumMode?: (mode: HeroSpectrumMode) => void }
        ).applySpectrumMode;

        if (typeof applySpectrumMode === 'function') {
          applySpectrumMode(spectrumRef.current as HeroSpectrumMode);
        }

        // Camera framing + orbit controller
        const framing = frameObject(camera, asset, {
          distanceFactor: 1.8,
          offsetY: 0.25,
        });

        orbit = new OrbitController(framing);

        // Camera easing defaults
        orbit.setDamping({
          azimuth: 7.5,
          height: 7.5,
          radius: 7.5,
        });

        // Preserve userData for any downstream consumers that read it
        camera.userData.baseCenter = framing.center.clone();
        camera.userData.maxDim = framing.maxDim;
        camera.userData.orbitDistance = framing.distance;

        console.log('[ThreeRuntimeAdapter] Orbit controller initialized from framing');
      })
      .catch((error) => {
        console.error('[ThreeRuntimeAdapter] Hero asset attachment failed', error);
      });

const clock = new THREE.Clock();

// animation loop
const updatePhase = (delta: number, time: number) => {
  // Traverse scene for update hooks
  scene.traverse((object) => {
    const update = (object.userData as { update?: (delta: number) => void }).update;
    if (typeof update === 'function') {
      update(delta);
    }
  });

  // Orbit controller update
  if (orbit) {
    const maxDim = (camera.userData.maxDim as number) ?? 1;
    const baseRadius = (camera.userData.orbitDistance as number) ?? orbit.radius;

    const scroll = mapSnapshotToOrbit(snapshotRef.current, progressRef.current);
    orbit.setAzimuth(scroll.azimuth);

    const elevationRad = THREE.MathUtils.degToRad(scroll.elevationDeg);
    const elevationHeight = Math.tan(elevationRad) * baseRadius;
    orbit.setHeight(scroll.height + elevationHeight);

    orbit.setRadius(baseRadius * (1 + scroll.radiusBias));

    orbit.tick(delta);

    const breathY = Math.sin(time * 0.45) * (maxDim * 0.02);
    const breathZ = Math.cos(time * 0.38) * (maxDim * 0.015);

    const smoothedPointer = pointerTracker.update(0.065);

    orbit.update(camera, {
      dx: smoothedPointer.x * 0.1,
      dy: breathY + smoothedPointer.y * 0.05,
      dz: breathZ,
      lookBiasX: smoothedPointer.x * 0.02 + scroll.lookBiasX * baseRadius,
      lookBiasY: smoothedPointer.y * 0.01 + scroll.lookBiasY * baseRadius,
    });
  }
};

const renderPhase = () => {
  if (composerRef.current) {
    composerRef.current.render();
  } else {
    renderer.render(scene, camera);
  }
};

const animate = () => {
  const delta = clock.getDelta();
  const time = clock.elapsedTime;

  updatePhase(delta, time);
  renderPhase();

  animationId.current = requestAnimationFrame(animate);
};

animate();

    // resize handler
    const onResize = () => {
      if (!container || !rendererRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);

      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', onResize);


    // cleanup
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', onResize);
      pointerTracker.dispose();

      heroAssetRef.current = null;

      ambientLightRef.current = null;
      directionalLightRef.current = null;
      fogRef.current = null;

      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
