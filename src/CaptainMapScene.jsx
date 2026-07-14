import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const createTextSprite = (label) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const radius = 18;
  const x = 20;
  const y = 18;
  const width = 216;
  const height = 56;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(6, 20, 34, 0.78)';
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.86)';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e6f7ff';
  ctx.font = '700 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 47);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.9, 0.7, 1);
  return sprite;
};

const disposeObject = (object) => {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    const materials = child.material
      ? Array.isArray(child.material) ? child.material : [child.material]
      : [];

    materials.forEach((material) => {
      if (material.map) material.map.dispose();
      material.dispose();
    });
  });
};

const getScrollProgress = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
};

const CaptainMapScene = ({ sections, activeSection, onNavigate, isMobile }) => {
  const hostRef = useRef(null);
  const markersRef = useRef([]);
  const activeRef = useRef(activeSection);
  const navigateRef = useRef(onNavigate);
  const mobileRef = useRef(isMobile);

  useEffect(() => {
    activeRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    mobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const reduceMotion = prefersReducedMotion();
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04101f, 0.038);

    const renderer = new THREE.WebGLRenderer({
      antialias: !mobileRef.current,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileRef.current ? 1 : 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.domElement.className = 'captain-map-canvas';
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 80);
    camera.position.set(0, 5.4, 10.5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x9bdff4, 1.05));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
    keyLight.position.set(-4, 8, 6);
    scene.add(keyLight);

    const waterGeometry = new THREE.PlaneGeometry(
      26,
      18,
      mobileRef.current ? 18 : 44,
      mobileRef.current ? 12 : 32
    );
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b3552,
      emissive: 0x02111f,
      roughness: 0.72,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.25;
    scene.add(water);

    const routePoints = sections.map((section) => new THREE.Vector3(section.x, 0.05, section.z));
    const routeMaterial = new THREE.LineBasicMaterial({
      color: 0x77e6f2,
      transparent: true,
      opacity: 0.55,
    });
    const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), routeMaterial);
    scene.add(routeLine);

    const markerGroup = new THREE.Group();
    markersRef.current = sections.map((section) => {
      const marker = new THREE.Group();
      marker.userData.sectionId = section.id;

      const buoy = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, mobileRef.current ? 12 : 20, mobileRef.current ? 8 : 14),
        new THREE.MeshStandardMaterial({
          color: 0x67e8f9,
          emissive: 0x0e7490,
          emissiveIntensity: 0.35,
          roughness: 0.45,
        })
      );
      const label = createTextSprite(section.label);
      label.position.set(0, 0.5, 0);

      marker.add(buoy, label);
      marker.position.set(section.x, 0.18, section.z);
      markerGroup.add(marker);
      return marker;
    });
    scene.add(markerGroup);

    const boat = new THREE.Group();
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.16, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xf3fbff, roughness: 0.38 })
    );
    hull.position.y = 0.18;

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.5 })
    );
    mast.position.y = 0.68;

    const sail = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.78, 3),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x083344,
        emissiveIntensity: 0.18,
        roughness: 0.42,
      })
    );
    sail.position.set(0.12, 0.72, 0.02);
    sail.rotation.z = -0.18;
    boat.add(hull, mast, sail);
    scene.add(boat);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerTarget = { x: 0, y: 0 };
    let animationFrame = 0;
    let elapsed = 0;

    const updateBoatPosition = () => {
      const scaled = getScrollProgress() * (routePoints.length - 1);
      const index = Math.min(routePoints.length - 2, Math.floor(scaled));
      const local = scaled - index;
      const current = routePoints[index];
      const next = routePoints[index + 1] || current;

      boat.position.lerpVectors(current, next, local);
      boat.position.y = 0.28 + (reduceMotion ? 0 : Math.sin(elapsed * 1.8) * 0.035);
      boat.lookAt(next.x, boat.position.y, next.z);
    };

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      elapsed += 0.016;

      if (!reduceMotion) {
        const position = water.geometry.attributes.position;
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          position.setZ(
            i,
            Math.sin(x * 1.2 + elapsed) * 0.045 + Math.cos(y * 1.5 + elapsed * 0.8) * 0.035
          );
        }
        position.needsUpdate = true;
        camera.position.x += (pointerTarget.x * 0.45 - camera.position.x) * 0.025;
        camera.position.y += (5.4 + pointerTarget.y * 0.18 - camera.position.y) * 0.025;
      }

      markersRef.current.forEach((marker) => {
        const isActive = marker.userData.sectionId === activeRef.current;
        marker.scale.setScalar(isActive ? 1.12 : 1);
        marker.children[0].material.emissiveIntensity = isActive ? 0.75 : 0.35;
      });

      updateBoatPosition();
      camera.lookAt(0, 0.05, 0);
      renderer.render(scene, camera);
    };

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileRef.current ? 1 : 1.5));
      renderer.setSize(host.clientWidth, host.clientHeight);
    };

    const setPointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerTarget.x = pointer.x;
      pointerTarget.y = pointer.y;
    };

    const click = (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerGroup.children, true);
      const marker = hits[0]?.object?.parent;
      const sectionId = marker?.userData?.sectionId || marker?.parent?.userData?.sectionId;
      if (sectionId && navigateRef.current) navigateRef.current(sectionId, event);
    };

    renderer.domElement.addEventListener('pointermove', setPointer, { passive: true });
    renderer.domElement.addEventListener('click', click);
    window.addEventListener('resize', resize);

    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointermove', setPointer);
      renderer.domElement.removeEventListener('click', click);
      disposeObject(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [sections]);

  return <div className="captain-map-scene" ref={hostRef} aria-hidden="true" />;
};

export default CaptainMapScene;
