'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeroAsset } from './objects/create-hero-asset';
import { frameObject } from './camera/framing';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface ThreeRuntimeAdapterProps {
  progress?: number;
}

export function ThreeRuntimeAdapter({ progress = 0 }: ThreeRuntimeAdapterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)
  const progressRef = useRef(progress);

  // Sync progress prop to ref for use in animation loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Parallax tracking
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothedPointerRef = useRef({ x: 0, y: 0 });

  // Minimal reference for future hero asset attachment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let heroAsset: THREE.Object3D | null = null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // scene, camera, renderer setup
    const scene = new THREE.Scene();

    // Task 7b: Ambient Fog
    scene.fog = new THREE.FogExp2(0x000000, 0.045);
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 5);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(0x000000); // Removed for transparency

    // Enable shadows per 4d suggestion
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Task 7a: Bloom Postprocessing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.25, // strength
      0.1, // radius
      0.25,  // threshold
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Basic light rig per 4d
    const ambientLight = new THREE.AmbientLight(0x6cfc86, 1.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x6cfc86, 1.4);
    directionalLight.position.set(4, 6, 4);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load and attach hero asset
    createHeroAsset({
      position: [0, 0, 0],
      scale: 1.5,
      enableIdleRotation: true
    }).then((asset) => {
      scene.add(asset);
      heroAsset = asset;

      // --- Camera Framing via reusable helper ---
      const framing = frameObject(camera, asset, {
        distanceFactor: 1.8,
        offsetY: 0,
      });

      // Store base transform for breathing, orbit, and parallax effects
      camera.userData.basePosition = camera.position.clone();
      camera.userData.baseCenter = framing.center.clone();
      camera.userData.maxDim = framing.maxDim;
      camera.userData.orbitDistance = framing.distance;

      console.log('[ThreeRuntimeAdapter] Hero asset framed via frameObject helper');
    }).catch((error) => {
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

      if (camera.userData.basePosition) {
        const time = clock.elapsedTime;
        const baseCenter = camera.userData.baseCenter as THREE.Vector3;
        const maxDim = camera.userData.maxDim as number;
        const orbitDistance = camera.userData.orbitDistance as number;

        // --- Task: Scroll-driven Camera Orbit ---
        // Progress (0 to 1) rotates the camera around the Y axis
        const orbitAngle = progressRef.current * Math.PI * 0.5; // 90 degree orbit swing
        
        // --- Task: Ultra-subtle Camera Breathing ---
        const breathY = Math.sin(time * 0.45) * (maxDim * 0.02);
        const breathZ = Math.cos(time * 0.38) * (maxDim * 0.015);

        // --- Layer: Pointer Parallax ---
        const lerpFactor = 0.065;
        smoothedPointerRef.current.x += (pointerRef.current.x - smoothedPointerRef.current.x) * lerpFactor;
        smoothedPointerRef.current.y += (pointerRef.current.y - smoothedPointerRef.current.y) * lerpFactor;

        // Compose spherical coordinates for orbit
        const radius = orbitDistance + breathZ;
        const targetPosX = baseCenter.x + radius * Math.sin(orbitAngle) + smoothedPointerRef.current.x * 0.1;
        const targetPosY = baseCenter.y + breathY + smoothedPointerRef.current.y * 0.05;
        const targetPosZ = baseCenter.z + radius * Math.cos(orbitAngle);

        camera.position.set(targetPosX, targetPosY, targetPosZ);
        
        // Rebuild lookAt target from base center + subtle parallax bias
        const target = baseCenter.clone();
        target.x += smoothedPointerRef.current.x * 0.02;
        target.y += smoothedPointerRef.current.y * 0.01;
        camera.lookAt(target);
      }

      // Use composer instead of renderer
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

      // Update composer size
      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', onResize);

    // --- Task: Pointer Parallax Tracking ---
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width;
      const localY = (event.clientY - rect.top) / rect.height;

      // Normalize to -1 to 1 and clamp to safe ranges
      const targetX = (localX * 2 - 1);
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
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

