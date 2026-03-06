'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeRuntimeAdapter() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationId = useRef<number | null>(null)
const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

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
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // torus
    const geometry = new THREE.TorusGeometry(1, 0.35, 16, 100);
    const material = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // animation loop
    const animate = () => {
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;
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

