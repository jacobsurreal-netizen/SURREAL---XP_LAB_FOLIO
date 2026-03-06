'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeroAsset } from './objects/create-hero-asset';

export function ThreeRuntimeAdapter() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // Minimal reference for future hero asset attachment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let heroAsset: THREE.Object3D | null = null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // scene, camera, renderer setup
    const scene = new THREE.Scene();
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

    // Basic light rig per 4d
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
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
      camera.lookAt(asset.position);
      console.log('[ThreeRuntimeAdapter] Hero asset attached successfully');
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

      /*
      if (torus) {
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
      }
      */
      renderer.render(scene, camera);
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
    };
    window.addEventListener('resize', onResize);

    // cleanup
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', onResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

