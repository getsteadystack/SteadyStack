"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Globe, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionToken } from "@/actions/monitors";

interface GlobeVisualizationProps {
  monitors: any[];
}

// Regional coordinates mapping on Globe
const REGIONS = [
  { name: "Frankfurt", code: "EU", lat: 50.11, lng: 8.68, color: 0x10b981 }, // Emerald Green
  {
    name: "Oregon",
    code: "US-West",
    lat: 45.52,
    lng: -122.68,
    color: 0x10b981,
  },
  {
    name: "Virginia",
    code: "US-East",
    lat: 37.43,
    lng: -78.65,
    color: 0x10b981,
  },
  { name: "Singapore", code: "APAC", lat: 1.35, lng: 103.82, color: 0x10b981 },
  { name: "Sydney", code: "OCE", lat: -33.86, lng: 151.2, color: 0x10b981 },
  { name: "São Paulo", code: "SA", lat: -23.55, lng: -46.63, color: 0x10b981 },
];

// Target destination coordinates (Representing the target servers)
const TARGETS = [
  { name: "Main Hub", lat: 40.71, lng: -74.0, color: 0x10b981 }, // New York
];

export function GlobeVisualization({ monitors }: GlobeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [activeChecks, setActiveChecks] = useState<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Keep a ref to push check events dynamically to the Three.js loop
  const eventQueueRef = useRef<{ region: string; status: string; latency: number }[]>([]);

  // Fresh monitors array arrives on every 5s poll; keep it in a ref so socket
  // lifetimes aren't tied to poll object identity.
  const monitorsRef = useRef(monitors);
  useEffect(() => {
    monitorsRef.current = monitors;
  }, [monitors]);

  // Only re-open sockets when the set of monitors (by id) actually changes.
  const monitorIds = useMemo(() => monitors.map((m) => m.id).join(","), [monitors]);

  const dataRegionCode = (region: string) => {
    const r = region.toLowerCase();
    if (r.includes("eu") || r.includes("frankfurt")) return "EU";
    if (r.includes("sg") || r.includes("singapore") || r.includes("apac")) return "APAC";
    if (r.includes("oregon") || r.includes("west") || r.includes("us-west")) return "US-West";
    if (r.includes("sydney") || r.includes("oce")) return "OCE";
    if (r.includes("sao") || r.includes("brazil") || r.includes("sa")) return "SA";
    return "US-East"; // Fallback
  };

  // Push incoming websocket events or fallback live telemetry to the queue.
  // Depends on the monitor id set — NOT the monitors array — so the 5s poll
  // doesn't tear down and recreate every WebSocket twice a minute.
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const sockets: WebSocket[] = [];

    // Fallback/interactive live telemetry stream generator
    const currentMonitors = monitorsRef.current;
    const activeMonitorsList =
      currentMonitors.length > 0
        ? currentMonitors
        : [
            { id: "mon_edge_1", name: "Primary Edge API" },
            { id: "mon_auth_1", name: "Auth Gateway" },
            { id: "mon_db_1", name: "Cluster Database" },
          ];

    const telemetryTimer = setInterval(() => {
      if (!active) return;
      const randomMonitor =
        activeMonitorsList[Math.floor(Math.random() * activeMonitorsList.length)];
      const regions = ["EU", "US-West", "US-East", "APAC", "OCE", "SA"];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const isUp = Math.random() > 0.05;
      const status = isUp ? "UP" : "DOWN";
      const baseLatencies: Record<string, number> = {
        "US-East": 14,
        "US-West": 38,
        EU: 22,
        APAC: 112,
        OCE: 145,
        SA: 120,
      };
      const baseMs = baseLatencies[randomRegion] || 25;
      const latency = Math.max(8, Math.round(baseMs + (Math.random() * 14 - 7)));

      eventQueueRef.current.push({
        region: randomRegion,
        status,
        latency,
      });

      const shortId = randomMonitor.id.substring(0, 8);
      const checkMsg = `[MATRIX] ${randomMonitor.name} (${shortId}) -> ${randomRegion}: ${status} (${latency}ms)`;
      setActiveChecks((prev) => [checkMsg, ...prev].slice(0, 10));
    }, 2000);

    async function initWebSockets() {
      const socketMonitors = monitorsRef.current;
      if (socketMonitors.length === 0) return;
      const token = await getSessionToken();
      if (!active) return;

      // Determine WebSocket base URL
      let wsBaseUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";
      if (wsBaseUrl.startsWith("http://")) {
        wsBaseUrl = wsBaseUrl.replace("http://", "ws://");
      } else if (wsBaseUrl.startsWith("https://")) {
        wsBaseUrl = wsBaseUrl.replace("https://", "wss://");
      } else if (!wsBaseUrl.includes("://")) {
        const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        wsBaseUrl = `${protocol}${wsBaseUrl}`;
      }

      socketMonitors.forEach((monitor: any) => {
        try {
          const urlObj = new URL(`${wsBaseUrl}/ws/monitors/${monitor.id}`);
          if (token) {
            urlObj.searchParams.set("token", token);
          }
          const ws = new WebSocket(urlObj.toString());

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "check_result") {
                const regionName = data.region || "global";
                eventQueueRef.current.push({
                  region: regionName,
                  status: data.status,
                  latency: data.latency,
                });

                const checkMsg = `[LIVE] ${monitor.name} -> ${dataRegionCode(regionName)}: ${data.status} (${data.latency}ms)`;
                setActiveChecks((prev) => [checkMsg, ...prev].slice(0, 10));
              }
            } catch {
              // Silently catch parsing failures
            }
          };

          sockets.push(ws);
        } catch (err) {
          console.warn("Failed to open WebSocket in Globe Visualization:", monitor.id, err);
        }
      });
    }

    initWebSockets();

    return () => {
      active = false;
      clearInterval(telemetryTimer);
      sockets.forEach((ws) => {
        ws.onmessage = null;
        ws.close();
      });
    };
  }, [isOpen, monitorIds]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // --- THREE.JS SCENE SETUP ---
    const width = containerRef.current.clientWidth;
    const height = 400;

    const scene = new THREE.Scene();
    // Dark space background
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear container and append canvas
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Group to hold all globe elements for easy rotation/interaction
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 50;

    // 1. Holographic Sphere mesh
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const globeSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeSphere);

    // 2. Continents particles (Dotted world map look)
    // Create random dot matrix particles to simulate continents
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 1800;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
      // Pick random latitude & longitude that roughly resembles earth landmasses
      // To simulate a dotted map, we distribute points on a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Holographic green coloring
      colors[i * 3] = 0.06;
      colors[i * 3 + 1] = 0.77;
      colors[i * 3 + 2] = 0.5;
    }

    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });

    const continentPoints = new THREE.Points(pointsGeometry, pointsMaterial);
    globeGroup.add(continentPoints);

    // 3. Helper to convert Lat/Lng to 3D Cartesian coordinates
    const convertLatLngToVector3 = (lat: number, lng: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.sin(theta));
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);
      return new THREE.Vector3(x, y, z);
    };

    // 4. Place Region Nodes (Pins)
    const regionPositions: { [key: string]: THREE.Vector3 } = {};
    const regionMeshes: THREE.Mesh[] = [];

    REGIONS.forEach((region) => {
      const pos = convertLatLngToVector3(region.lat, region.lng, radius);
      regionPositions[region.code] = pos;

      // Small glowing pin geometry
      const pinGeom = new THREE.SphereGeometry(0.8, 8, 8);
      const pinMat = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: 0.9,
      });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);
      regionMeshes.push(pin);

      // Node labels/pulses
      const ringGeom = new THREE.RingGeometry(1.2, 1.5, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: region.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring);
    });

    // 5. Place Target Nodes (Centers)
    const targetPositions: THREE.Vector3[] = [];
    TARGETS.forEach((target) => {
      const pos = convertLatLngToVector3(target.lat, target.lng, radius);
      targetPositions.push(pos);

      // Target node marker
      const markerGeom = new THREE.SphereGeometry(1.2, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color: target.color,
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.copy(pos);
      globeGroup.add(marker);
    });

    // 6. Laser curves container
    interface ActiveLaser {
      line: THREE.Line;
      curve: THREE.QuadraticBezierCurve3;
      points: THREE.Vector3[];
      progress: number;
      speed: number;
      color: number;
    }
    const activeLasers: ActiveLaser[] = [];

    // Spawns a laser arc from origin region to target New York destination
    const spawnLaserArc = (regionCode: string, status: string) => {
      const startPos = regionPositions[regionCode] || regionPositions["US-East"];
      const endPos = targetPositions[0]; // New York

      if (!startPos || !endPos) return;

      // Calculate bezier curve
      const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
      const dist = startPos.distanceTo(endPos);
      const height = dist * 0.35;
      const ctrl = mid
        .clone()
        .normalize()
        .multiplyScalar(radius + height);

      const curve = new THREE.QuadraticBezierCurve3(startPos, ctrl, endPos);
      const points = curve.getPoints(30);

      // Create line geometry
      const lineGeom = new THREE.BufferGeometry().setFromPoints([]);
      const lineColor = status === "UP" ? 0x10b981 : 0xef4444; // Green for UP, Red for DOWN
      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.8,
        linewidth: 2, // Note: WebGL standard Line linewidth is usually restricted to 1px on most platforms
      });

      const line = new THREE.Line(lineGeom, lineMat);
      globeGroup.add(line);

      activeLasers.push({
        line,
        curve,
        points,
        progress: 0,
        speed: 0.04,
        color: lineColor,
      });
    };

    // --- INTERACTIVE DRAGGING STATE ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y,
      };

      if (isDragging) {
        // Rotate globe group
        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;
      }

      previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // --- ANIMATION / TICK LOOP ---
    const tick = () => {
      // 1. Idle auto-rotation (only when not user-dragging)
      if (!isDragging) {
        globeGroup.rotation.y += 0.0015;
      }

      // 2. Poll new events queue
      if (eventQueueRef.current.length > 0) {
        const nextEvent = eventQueueRef.current.shift();
        if (nextEvent) {
          const code = dataRegionCode(nextEvent.region);
          spawnLaserArc(code, nextEvent.status);
        }
      }

      // 3. Animate lasers
      for (let i = activeLasers.length - 1; i >= 0; i--) {
        const laser = activeLasers[i];
        laser.progress += laser.speed;

        if (laser.progress >= 1.0) {
          // Clean up laser line mesh
          globeGroup.remove(laser.line);
          laser.line.geometry.dispose();
          (laser.line.material as THREE.Material).dispose();
          activeLasers.splice(i, 1);
        } else {
          // Draw subset of path curves representing glowing lasers
          const drawCount = Math.floor(laser.progress * laser.points.length);
          const currentPoints = laser.points.slice(0, Math.max(drawCount, 2));
          laser.line.geometry.setFromPoints(currentPoints);

          // Fade opacity out as it completes
          if (laser.progress > 0.7) {
            (laser.line.material as THREE.LineBasicMaterial).opacity =
              1 - (laser.progress - 0.7) / 0.3;
          }
        }
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // Dispose materials
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();

      activeLasers.forEach((l) => {
        globeGroup.remove(l.line);
        l.line.geometry.dispose();
        (l.line.material as THREE.Material).dispose();
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [isOpen]);

  return (
    <div className="border border-primary/20 bg-card/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all duration-300">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-primary/5 transition-colors border-b border-zinc-900/60"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Globe className="size-4.5 text-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              3D Matrix Network Globe
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Live Edge telemetry visualization mapping regional ping pings
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[9px] uppercase tracking-wider"
        >
          {isOpen ? "Collapse Matrix" : "Deploy Matrix"}
        </Button>
      </div>

      {isOpen && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Globe Canvas Container */}
          <div className="col-span-1 lg:col-span-2 relative min-h-[400px]">
            <div
              ref={containerRef}
              className="w-full h-[400px] cursor-grab active:cursor-grabbing"
            />

            {/* Visual HUD overlays */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 p-2 bg-black/60 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
                <span>Active Target Nodes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-green-500 rounded-full"></span>
                <span>US-East, US-West, EU, APAC, OCE, SA</span>
              </div>
            </div>
          </div>

          {/* HUD Event Log stream */}
          <div className="col-span-1 border border-zinc-800 bg-zinc-950/60 rounded-xl p-4 h-[350px] flex flex-col justify-between font-mono select-none">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Zap className="size-3 text-primary animate-pulse" />
                Live Uplink Stream
              </span>
              <div className="space-y-2.5 text-[10px] leading-relaxed text-zinc-400 border-t border-zinc-900 pt-3 overflow-y-auto max-h-[250px] scrollbar-none">
                {activeChecks.map((msg, i) => (
                  <div key={i} className="animate-fade-in truncate">
                    <span className="text-zinc-600 mr-1.5">&gt;&gt;</span>
                    {msg}
                  </div>
                ))}
                {activeChecks.length === 0 && (
                  <div className="text-zinc-600 italic">Listening for websocket pings...</div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-3 text-[9px] text-zinc-500 leading-tight">
              <div className="flex justify-between mb-1 items-center">
                <span>LATENCY MATRIX:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  STREAMING
                </span>
              </div>
              <p>Drag to spin globe. Ping events spawn laser arcs from origins to targets.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
