"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ProbePoint {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  color: number;
  status: "verified" | "fluke" | "checking";
}

const GLOBAL_PROBES: ProbePoint[] = [
  {
    id: "sjc",
    name: "US-West",
    city: "San Jose",
    lat: 37.33,
    lng: -121.88,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "iad",
    name: "US-East",
    city: "Ashburn",
    lat: 39.04,
    lng: -77.48,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "lhr",
    name: "EU-West",
    city: "London",
    lat: 51.5,
    lng: -0.12,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "fra",
    name: "EU-Central",
    city: "Frankfurt",
    lat: 50.11,
    lng: 8.68,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "nrt",
    name: "Asia-East",
    city: "Tokyo",
    lat: 35.67,
    lng: 139.65,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "sin",
    name: "Asia-SE",
    city: "Singapore",
    lat: 1.35,
    lng: 103.82,
    color: 0x10b981,
    status: "verified",
  },
  {
    id: "syd",
    name: "Oceania",
    city: "Sydney",
    lat: -33.86,
    lng: 151.2,
    color: 0x10b981,
    status: "verified",
  },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface ThreeEdgeGlobeProps {
  className?: string;
  flukeActive?: boolean;
}

export function ThreeEdgeGlobe({ className = "", flukeActive = false }: ThreeEdgeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProbe, setHoveredProbe] = useState<ProbePoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 210;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Globe Root Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 60;

    // 4. Inner Sphere Core with delicate gradient
    const innerSphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 1.5, 48, 48);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: 0xfbfbf9,
      transparent: true,
      opacity: 0.9,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    globeGroup.add(innerSphere);

    // 5. Latitude & Longitude Wireframe Ring Grid
    const wireframeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 24, 18);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xd8d4cb,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeSphere);

    // 6. Surface Points Matrix (Simulated continent / edge cluster points)
    const pointsCount = 650;
    const pointsPositions = new Float32Array(pointsCount * 3);
    const pointsColors = new Float32Array(pointsCount * 3);
    const baseColor = new THREE.Color(0x868279);
    const goldColor = new THREE.Color(0xffd439);

    for (let i = 0; i < pointsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = GLOBE_RADIUS + 0.3;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pointsPositions[i * 3] = x;
      pointsPositions[i * 3 + 1] = y;
      pointsPositions[i * 3 + 2] = z;

      const isGold = Math.random() > 0.85;
      const c = isGold ? goldColor : baseColor;
      pointsColors[i * 3] = c.r;
      pointsColors[i * 3 + 1] = c.g;
      pointsColors[i * 3 + 2] = c.b;
    }

    const surfacePointsGeo = new THREE.BufferGeometry();
    surfacePointsGeo.setAttribute("position", new THREE.BufferAttribute(pointsPositions, 3));
    surfacePointsGeo.setAttribute("color", new THREE.BufferAttribute(pointsColors, 3));
    const surfacePointsMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const surfacePoints = new THREE.Points(surfacePointsGeo, surfacePointsMat);
    globeGroup.add(surfacePoints);

    // 7. Ambient Particle Field
    const ambientCount = 200;
    const ambientPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      const dist = GLOBE_RADIUS + 15 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      ambientPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      ambientPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      ambientPositions[i * 3 + 2] = dist * Math.cos(phi);
    }
    const ambientGeo = new THREE.BufferGeometry();
    ambientGeo.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    const ambientMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0xc4c0b4,
      transparent: true,
      opacity: 0.45,
    });
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat);
    scene.add(ambientParticles);

    // 8. 7 Global Edge Probe Nodes & Pulse Rings
    const nodeMeshes: {
      mesh: THREE.Mesh;
      ring: THREE.Mesh;
      probe: ProbePoint;
    }[] = [];
    const probeRaycastTargets: THREE.Mesh[] = [];

    const nodeGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const ringGeo = new THREE.RingGeometry(2.4, 3.2, 32);

    GLOBAL_PROBES.forEach((probe) => {
      const pos = latLngToVector3(probe.lat, probe.lng, GLOBE_RADIUS + 0.8);
      const isFluke = flukeActive && probe.id === "lhr";
      const nodeColor = isFluke ? 0xf59e0b : 0x10b981;

      const nodeMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { probe };
      globeGroup.add(nodeMesh);
      probeRaycastTargets.push(nodeMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);

      nodeMeshes.push({ mesh: nodeMesh, ring: ringMesh, probe });
    });

    // 9. Signal Light Arcs connecting Probes (Consensus Network Mesh)
    interface ArcRoute {
      curve: THREE.QuadraticBezierCurve3;
      line: THREE.Line;
      particle: THREE.Mesh;
      progress: number;
      speed: number;
    }

    const arcRoutes: ArcRoute[] = [];
    const particleGeo = new THREE.SphereGeometry(0.9, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffd439 });

    const connections: [string, string][] = [
      ["sjc", "iad"],
      ["iad", "lhr"],
      ["lhr", "fra"],
      ["fra", "sin"],
      ["sin", "nrt"],
      ["nrt", "sjc"],
      ["sin", "syd"],
      ["iad", "fra"],
    ];

    connections.forEach(([fromId, toId]) => {
      const fromProbe = GLOBAL_PROBES.find((p) => p.id === fromId);
      const toProbe = GLOBAL_PROBES.find((p) => p.id === toId);
      if (!fromProbe || !toProbe) return;

      const vFrom = latLngToVector3(fromProbe.lat, fromProbe.lng, GLOBE_RADIUS + 0.8);
      const vTo = latLngToVector3(toProbe.lat, toProbe.lng, GLOBE_RADIUS + 0.8);

      // Calculate arched midpoint
      const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
      const distance = vFrom.distanceTo(vTo);
      const altitude = GLOBE_RADIUS + distance * 0.28;
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(vFrom, mid, vTo);
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      const pulseParticle = new THREE.Mesh(particleGeo, particleMat);
      pulseParticle.position.copy(vFrom);
      globeGroup.add(pulseParticle);

      arcRoutes.push({
        curve,
        line,
        particle: pulseParticle,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.006,
      });
    });

    // 10. Drag & Mouse Parallax State
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0.4;
    let currentRotationX = 0.2;
    let currentRotationY = 0.4;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouseVector.x = (clientX / rect.width) * 2 - 1;
      mouseVector.y = -(clientY / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Subtle tilt on hover
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = (e.clientY / window.innerHeight) * 2 - 1;
        targetRotationX = 0.2 + normY * 0.2;
      }

      // Raycast check for hover tooltips
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(probeRaycastTargets);
      if (intersects.length > 0 && intersects[0]) {
        const probe = intersects[0].object.userData.probe as ProbePoint;
        setHoveredProbe(probe);
        setMousePos({ x: clientX, y: clientY });
      } else {
        setHoveredProbe(null);
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 12. Main Animation Loop
    let ringScale = 1;
    let ringGrowing = true;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Natural continuous slow spin unless dragging
      if (!isDragging) {
        targetRotationY += 0.0022;
      }

      // Smooth inertia interpolation
      currentRotationX += (targetRotationX - currentRotationX) * 0.06;
      currentRotationY += (targetRotationY - currentRotationY) * 0.06;

      globeGroup.rotation.x = currentRotationX;
      globeGroup.rotation.y = currentRotationY;

      // Ambient particle slow orbit
      ambientParticles.rotation.y += 0.0006;
      ambientParticles.rotation.x += 0.0003;

      // Pulse beacon rings
      if (ringGrowing) {
        ringScale += 0.015;
        if (ringScale >= 1.6) ringGrowing = false;
      } else {
        ringScale -= 0.015;
        if (ringScale <= 0.9) ringGrowing = true;
      }

      nodeMeshes.forEach(({ ring }) => {
        ring.scale.set(ringScale, ringScale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0.2, 1.8 - ringScale);
      });

      // Animate consensus signal pulses across routes
      arcRoutes.forEach((route) => {
        route.progress += route.speed;
        if (route.progress > 1) route.progress = 0;
        const pos = route.curve.getPoint(route.progress);
        route.particle.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 13. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      innerSphereGeo.dispose();
      innerSphereMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      surfacePointsGeo.dispose();
      surfacePointsMat.dispose();
      ambientGeo.dispose();
      ambientMat.dispose();
      nodeGeo.dispose();
      ringGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [flukeActive]);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Node Tooltip */}
      {hoveredProbe && (
        <div
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-12 rounded-xl border border-[#e8e6df] bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${hoveredProbe.id === "lhr" && flukeActive ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`}
            />
            <span className="text-xs font-mono font-bold text-[#23211a]">
              {hoveredProbe.city} ({hoveredProbe.name})
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#868279]">
            {hoveredProbe.id === "lhr" && flukeActive
              ? "Carrier Fluke Filtered (Quorum Verified)"
              : "Active Probe · 100% Operational"}
          </div>
        </div>
      )}
    </div>
  );
}
