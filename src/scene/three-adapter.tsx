'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeroAsset } from './objects/create-hero-asset';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { engine } from '../template-kit/engine';

export function ThreeRuntimeAdapter() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)

  // Parallax and Scroll Orbit tracking
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothedPointerRef = useRef({ x: 0, y: 0 });
  const smoothedOrbitRef = useRef(0);

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

      // Store base transforms and orbital anchors
      const relativePos = camera.position.clone().sub(center);
      const radius = new THREE.Vector2(relativePos.x, relativePos.z).length();
      const baseAngle = Math.atan2(relativePos.x, relativePos.z);
      
      camera.userData.orbitCenter = center.clone();
      camera.userData.orbitRadius = radius;
      camera.userData.baseAngle = baseAngle;
      camera.userData.baseHeight = relativePos.y;
      camera.userData.maxDim = maxDim;

      console.log('[ThreeRuntimeAdapter] Hero asset framed with cinematic tuning and orbital anchors');
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

      // --- Task: Ultra-subtle Camera Breathing & Scroll Orbit ---
      if (camera.userData.orbitCenter) {
        const time = clock.elapsedTime;
        const center = camera.userData.orbitCenter as THREE.Vector3;
        const radius = camera.userData.orbitRadius as number;
        const baseAngle = camera.userData.baseAngle as number;
        const baseHeight = camera.userData.baseHeight as number;
        const maxDim = camera.userData.maxDim as number;
        
        // 1. Get progress from Page Engine and map to Cinematic Orbit
        const scrollProgress = engine.getSnapshot().scrollProgress;
        
        // Mapping detents: 0.00 -> -0.18, 0.25 -> -0.06, 0.50 -> 0.10, 0.75 -> 0.24
        // We'll interpolate smoothly across the range.
        let targetOrbit = 0;
        if (scrollProgress <= 0.25) {
          const t = scrollProgress / 0.25;
          targetOrbit = -0.18 + t * (-0.06 - (-0.18));
        } else if (scrollProgress <= 0.50) {
          const t = (scrollProgress - 0.25) / 0.25;
          targetOrbit = -0.06 + t * (0.10 - (-0.06));
        } else if (scrollProgress <= 0.75) {
          const t = (scrollProgress - 0.50) / 0.25;
          targetOrbit = 0.10 + t * (0.24 - 0.10);
        } else {
          // Beyond last detent (CTA)
          const t = Math.min(1, (scrollProgress - 0.75) / 0.25);
          targetOrbit = 0.24 + t * 0.12; // Subtle extention
        }

        // Smoothly lerp orbit angle for heavy feel
        smoothedOrbitRef.current += (targetOrbit - smoothedOrbitRef.current) * 0.05;

        // 2. Compute orbital base position
        const currentAngle = baseAngle + smoothedOrbitRef.current;
        const orbX = center.x + Math.sin(currentAngle) * radius;
        const orbZ = center.z + Math.cos(currentAngle) * radius;
        const orbY = center.y + baseHeight;

        // 3. Layer breathing
        const breathY = Math.sin(time * 0.45) * (maxDim * 0.027);
        const breathZ_offset = Math.cos(time * 0.38) * (maxDim * 0.02);
        
        // 4. Layer Pointer Parallax
        const lerpFactor = 0.035;
        smoothedPointerRef.current.x += (pointerRef.current.x - smoothedPointerRef.current.x) * lerpFactor;
        smoothedPointerRef.current.y += (pointerRef.current.y - smoothedPointerRef.current.y) * lerpFactor;

        // Final Composed Position
        camera.position.x = orbX + smoothedPointerRef.current.x * 0.06;
        camera.position.y = orbY + breathY + smoothedPointerRef.current.y * 0.03;
        camera.position.z = orbZ + breathZ_offset;
        
        // Maintain lookAt to avoid orientation drift + subtle parallax bias
        const target = center.clone();
        target.x += smoothedPointerRef.current.x * 0.02;
        target.y += smoothedPointerRef.current.y * 0.01;
        camera.lookAt(target);
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

