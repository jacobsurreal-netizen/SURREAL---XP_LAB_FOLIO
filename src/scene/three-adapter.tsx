'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeroAsset } from './objects/create-hero-asset';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function ThreeRuntimeAdapter() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)

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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

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

    // torus - COMMENTED OUT AS PER TASK 4c
    /*
    const geometry = new THREE.TorusGeometry(1, 0.35, 16, 100);
    const material = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    */

    // Load and attach hero asset per 4e
    createHeroAsset({
      position: [0, 0, 0],
      scale: 1.5,
      enableIdleRotation: true
    }).then((asset) => {
      scene.add(asset);
      heroAsset = asset;

      // --- Task: Automatic Camera Framing Tuning ---
      const box = new THREE.Box3().setFromObject(asset);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Significantly closer framing (Target ~1.38x maxDim)
      const distance = maxDim * 0.58;

      // Position with vertical bias and lateral composition offset
      camera.position.set(
        center.x + maxDim * 0,  // Slight lateral bias
        center.y + maxDim * -0.13,  // Gentle upward bias
        center.z + distance
      );
      camera.lookAt(center);

      // Store base transform for breathing effect
      camera.userData.basePosition = camera.position.clone();
      camera.userData.baseCenter = center.clone();
      camera.userData.maxDim = maxDim;

      console.log('[ThreeRuntimeAdapter] Hero asset framed with cinematic tuning');
    }).catch((error) => {
      console.error('[ThreeRuntimeAdapter] Hero asset attachment failed', error);
    });

    const clock = new THREE.Clock();

    // animation loop
    const animate = () => {
      const delta = clock.getDelta();

      // Traverse scene for update hooks per 4f
      scene.traverse((object) => {
        const update = (object.userData as { update?: (delta: number) => void }).update;
        if (typeof update === 'function') {
          update(delta);
        }
      });

      // --- Task: Ultra-subtle Camera Breathing ---
      if (camera.userData.basePosition) {
        const time = clock.elapsedTime;
        const basePos = camera.userData.basePosition as THREE.Vector3;
        const maxDim = camera.userData.maxDim as number;

        // Slow organic drift
        const breathY = Math.sin(time * 0.45) * (maxDim * 0.027);
        const breathZ = Math.cos(time * 0.38) * (maxDim * 0.02);

        camera.position.y = basePos.y + breathY;
        camera.position.z = basePos.z + breathZ;

        // --- Layer: Pointer Parallax ---
        // Lerp smoothed values toward target with soft smoothing
        const lerpFactor = 0.065;
        smoothedPointerRef.current.x += (pointerRef.current.x - smoothedPointerRef.current.x) * lerpFactor;
        smoothedPointerRef.current.y += (pointerRef.current.y - smoothedPointerRef.current.y) * lerpFactor;

        // Compose final position from base + breathing + parallax
        camera.position.x = basePos.x + smoothedPointerRef.current.x * 0.06;
        camera.position.y = basePos.y + breathY + smoothedPointerRef.current.y * 0.025;
        camera.position.z = basePos.z + breathZ;

        // Rebuild lookAt target from base center + subtle parallax bias
        if (camera.userData.baseCenter) {
          const baseCenter = camera.userData.baseCenter as THREE.Vector3;
          const target = baseCenter.clone();
          target.x += smoothedPointerRef.current.x * 0.02;
          target.y += smoothedPointerRef.current.y * 0.01;
          camera.lookAt(target);
        }
      }

      /*
      if (torus) {
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
      }
      */

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
      // Smoothly return to center
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

