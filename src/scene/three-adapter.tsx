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

interface ThreeRuntimeAdapterProps {
  progress?: number
  snapshot?: ThreeRuntimeSnapshot
}

type ThreeRuntimeSnapshot = {
  scrollProgress: number
  sectorIndex: number
  sectorName: string
  isSnapped?: boolean
  spectrumMode?: RuntimeSpectrumMode
}

type RuntimeSpectrumMode = 'COLOR' | 'IR' | 'SCAN'

type HeroSpectrumMode = 'COLOR' | 'IR'

function normalizeRuntimeSpectrum(mode: RuntimeSpectrumMode): HeroSpectrumMode {
  if (mode === 'SCAN') {
    return 'IR'
  }

  return mode
}

export function ThreeRuntimeAdapter({
  progress = 0,
  snapshot,
}: ThreeRuntimeAdapterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const progressRef = useRef(progress);
  const snapshotRef = useRef<ThreeRuntimeSnapshot | undefined>(snapshot);
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

  // Sync snapshot prop to ref for use in animation loop
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

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
    const isIRLike = mode === 'IR';
    const isScan = mode === 'SCAN';

    const ambient = ambientLightRef.current;
    const directional = directionalLightRef.current;
    const fog = fogRef.current;

    if (ambient) {
      ambient.color.set(isScan ? '#a855f7' :isIRLike ? '#ff3344' : '#6cfc86');
      ambient.intensity =
  isScan ? 1.4 : isIRLike ? 1.15 : 1.8;
    }

    if (directional) {
      directional.color.set(
  isScan ? '#b478ff' : isIRLike ? '#ff2238' : '#6cfc86'
);

directional.intensity =
  isScan ? 1.1 : isIRLike ? 0.95 : 1.4;
    }

    if (fog) {
      fog.color.set(
  isScan ? '#0a0014' : isIRLike ? '#140203' : '#000000'
);

fog.density =
  isScan ? 0.065 : isIRLike ? 0.055 : 0.045;
    }
  }, [mode]);

  // Parallax tracking
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothedPointerRef = useRef({ x: 0, y: 0 });

  let orbit: OrbitController | null = null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    const animate = () => {
      const delta = clock.getDelta();

      // Traverse scene for update hooks
      scene.traverse((object) => {
        const update = (object.userData as { update?: (delta: number) => void }).update;
        if (typeof update === 'function') {
          update(delta);
        }
      });

      // Orbit controller update
      if (orbit) {
        const time = clock.elapsedTime;
        const maxDim = (camera.userData.maxDim as number) ?? 1;
        const baseRadius = (camera.userData.orbitDistance as number) ?? orbit.radius;

        // Snapshot-aware bridge → orbit offsets + pose
        const scroll = mapSnapshotToOrbit(snapshotRef.current, progressRef.current);
        orbit.setAzimuth(scroll.azimuth);

        // Elevation: convert degrees to height offset via tan(el) * radius
        const elevationRad = THREE.MathUtils.degToRad(scroll.elevationDeg);
        const elevationHeight = Math.tan(elevationRad) * baseRadius;
        orbit.setHeight(scroll.height + elevationHeight);

        // Radius: apply proportional bias from anchor pose
        orbit.setRadius(baseRadius * (1 + scroll.radiusBias));

        // Smooth orbit motion toward current targets
        orbit.tick(delta);

        // Ultra-subtle breathing offsets
        const breathY = Math.sin(time * 0.45) * (maxDim * 0.02);
        const breathZ = Math.cos(time * 0.38) * (maxDim * 0.015);

        // Smoothed pointer parallax
        const lerpFactor = 0.065;
        smoothedPointerRef.current.x += (pointerRef.current.x - smoothedPointerRef.current.x) * lerpFactor;
        smoothedPointerRef.current.y += (pointerRef.current.y - smoothedPointerRef.current.y) * lerpFactor;

        // Compose: orbit base + additive offsets
        orbit.update(camera, {
          dx: smoothedPointerRef.current.x * 0.1,
          dy: breathY + smoothedPointerRef.current.y * 0.05,
          dz: breathZ,
          lookBiasX: smoothedPointerRef.current.x * 0.02 + scroll.lookBiasX * baseRadius,
          lookBiasY: smoothedPointerRef.current.y * 0.01 + scroll.lookBiasY * baseRadius,
        });
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }

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

    // Pointer parallax tracking
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width;
      const localY = (event.clientY - rect.top) / rect.height;

      const targetX = localX * 2 - 1;
      const targetY = -(localY * 2 - 1);

      pointerRef.current.x = Math.max(-0.45, Math.min(0.45, targetX));
      pointerRef.current.y = Math.max(-0.30, Math.min(0.30, targetY));
    };

    const onMouseLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // cleanup
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);

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
