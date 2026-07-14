import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getScrollProgress = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
};

const createLabelSprite = (label, mobile) => {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(4, 16, 30, 0.82)';
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.95)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(36, 28, 312, 72, 22);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ecfeff';
  ctx.font = '800 30px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 192, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  }));
  sprite.scale.set(mobile ? 1.65 : 2.25, mobile ? 0.55 : 0.75, 1);
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

const findSectionId = (object) => {
  let current = object;
  while (current) {
    if (current.userData?.sectionId) return current.userData.sectionId;
    current = current.parent;
  }
  return null;
};

const createIsland = (section, index, mobile) => {
  const group = new THREE.Group();
  group.userData.sectionId = section.id;
  group.position.set(section.x, 0, section.z);

  const radius = mobile ? 0.34 : 0.48;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.28, radius * 1.52, 0.22, 7),
    new THREE.MeshStandardMaterial({
      color: index === 2 ? 0x1f766f : 0x134e4a,
      roughness: 0.82,
      metalness: 0.02,
    })
  );
  base.position.y = 0.08;
  base.castShadow = true;
  base.receiveShadow = true;

  const peak = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.9, mobile ? 0.7 : 0.95, 5),
    new THREE.MeshStandardMaterial({
      color: index === 2 ? 0x67e8f9 : 0xf5f5dc,
      emissive: index === 2 ? 0x0e7490 : 0x082f49,
      emissiveIntensity: index === 2 ? 0.22 : 0.05,
      roughness: 0.65,
    })
  );
  peak.position.y = mobile ? 0.54 : 0.67;
  peak.castShadow = true;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.55, 0.018, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.55,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.16;

  const label = createLabelSprite(section.label, mobile);
  label.position.y = mobile ? 1.12 : 1.46;

  group.add(base, peak, ring, label);
  return group;
};

const createBoat = (mobile) => {
  const boat = new THREE.Group();
  const scale = mobile ? 0.82 : 1;

  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(1.2 * scale, 0.24 * scale, 1.95 * scale),
    new THREE.MeshStandardMaterial({
      color: 0xf8fbff,
      roughness: 0.36,
      metalness: 0.03,
    })
  );
  hull.position.y = 0.22 * scale;
  hull.castShadow = true;

  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(0.61 * scale, 0.72 * scale, 4),
    new THREE.MeshStandardMaterial({
      color: 0xdff7ff,
      roughness: 0.4,
    })
  );
  bow.position.set(0, 0.22 * scale, -1.08 * scale);
  bow.rotation.y = Math.PI / 4;
  bow.rotation.x = Math.PI / 2;
  bow.castShadow = true;

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028 * scale, 0.036 * scale, 1.45 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.45 })
  );
  mast.position.y = 0.98 * scale;
  mast.castShadow = true;

  const sail = new THREE.Mesh(
    new THREE.ConeGeometry(0.56 * scale, 1.28 * scale, 3),
    new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x083344,
      emissiveIntensity: 0.25,
      roughness: 0.38,
      side: THREE.DoubleSide,
    })
  );
  sail.position.set(0.24 * scale, 0.95 * scale, 0.02);
  sail.rotation.z = -0.2;
  sail.castShadow = true;

  const wakeMaterial = new THREE.LineBasicMaterial({
    color: 0xbdefff,
    transparent: true,
    opacity: 0.42,
  });
  const wakeLeft = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.28 * scale, 0.08, 0.95 * scale),
      new THREE.Vector3(-1.25 * scale, 0.06, 2.05 * scale),
    ]),
    wakeMaterial
  );
  const wakeRight = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.28 * scale, 0.08, 0.95 * scale),
      new THREE.Vector3(1.25 * scale, 0.06, 2.05 * scale),
    ]),
    wakeMaterial.clone()
  );

  boat.add(hull, bow, mast, sail, wakeLeft, wakeRight);
  return boat;
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
    const mobile = mobileRef.current;
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x061426, mobile ? 12 : 16, mobile ? 25 : 32);

    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'captain-map-canvas';
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 90);
    camera.position.set(0, mobile ? 5.1 : 4.35, mobile ? 13.5 : 12.4);
    camera.lookAt(0, 0.2, -0.7);

    scene.add(new THREE.HemisphereLight(0xa5f3fc, 0x061426, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(-5, 9, 7);
    keyLight.castShadow = !mobile;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const waterGeometry = new THREE.PlaneGeometry(
      34,
      26,
      mobile ? 18 : 42,
      mobile ? 14 : 32
    );
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b3754,
      emissive: 0x03101c,
      roughness: 0.48,
      metalness: 0.16,
      transparent: true,
      opacity: 0.96,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.18;
    water.receiveShadow = true;
    scene.add(water);

    const routePoints = sections.map((section) => new THREE.Vector3(section.x, 0.16, section.z));
    const curve = new THREE.CatmullRomCurve3(routePoints);
    const routeTube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, mobile ? 42 : 72, 0.025, 6, false),
      new THREE.MeshBasicMaterial({
        color: 0x8ff3ff,
        transparent: true,
        opacity: 0.66,
      })
    );
    scene.add(routeTube);

    const markerGroup = new THREE.Group();
    markersRef.current = sections.map((section, index) => {
      const island = createIsland(section, index, mobile);
      markerGroup.add(island);
      return island;
    });
    scene.add(markerGroup);

    const boat = createBoat(mobile);
    scene.add(boat);

    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 8, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x0f3654,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      })
    );
    horizon.position.set(0, 3.2, -8.4);
    scene.add(horizon);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerTarget = { x: 0, y: 0 };
    let animationFrame = 0;
    let elapsed = 0;

    const updateBoatPosition = () => {
      const point = curve.getPointAt(getScrollProgress());
      const next = curve.getPointAt(Math.min(getScrollProgress() + 0.015, 1));

      boat.position.copy(point);
      boat.position.y = 0.36 + (reduceMotion ? 0 : Math.sin(elapsed * 1.9) * 0.06);
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
            Math.sin(x * 1.1 + elapsed) * 0.11 + Math.cos(y * 1.7 + elapsed * 0.85) * 0.08
          );
        }
        position.needsUpdate = true;

        camera.position.x += (pointerTarget.x * 0.8 - camera.position.x) * 0.025;
        camera.position.y += ((mobile ? 5.1 : 4.35) + pointerTarget.y * 0.24 - camera.position.y) * 0.025;
      }

      markersRef.current.forEach((marker) => {
        const isActive = marker.userData.sectionId === activeRef.current;
        marker.scale.setScalar(isActive ? 1.18 : 1);
        marker.children[2].material.opacity = isActive ? 0.92 : 0.55;
      });

      updateBoatPosition();
      camera.lookAt(0, 0.2, -0.7);
      renderer.render(scene, camera);
    };

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
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
      const sectionId = hits[0] ? findSectionId(hits[0].object) : null;
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
