"use client";

import { Fullscreen, Download } from "lucide-react";
import { useRef } from "react";

export function MonitorCharts({ monitor }: { monitor: any }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `monitor_latency_${monitor.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 50 events for history
  const history = monitor.events || [];
  const displayEvents = [...history].slice(0, 50).reverse();

  // Uptime Bar Config
  const bars = Array.from({ length: 50 }).map((_, i) => {
    const offset = 50 - displayEvents.length;
    if (i < offset) return { status: "unknown" };
    const event = displayEvents[i - offset];
    return { status: event.status };
  });

  // Dynamic Response Time Chart Config
  // We Map 50 points. X=0 to 500 (width). Y=0 to 150 (height).
  // Normalize latency: Find max latency in set.
  const latencies = displayEvents.map((e) => e.latency || 0);
  const maxLatency = Math.max(...latencies, 100); // Min max is 100ms to avoid flat line at 0
  const points = latencies.map((l, i) => {
    const x = (i / (latencies.length - 1 || 1)) * 478; // 478 is approx width of viewBox
    const y = 150 - (l / maxLatency) * 120; // 150 height, reserve 30px padding top
    return { x, y };
  });

  // SVG Path Generation
  let pathD = "";
  if (points.length > 1) {
    const parts = [`M ${points[0].x} ${points[0].y}`];
    // Simple line for now, or bezier if we want smooth
    for (let i = 1; i < points.length; i++) {
      // Basic smoothing (catmull-rom or similar would be better but this is raw TSX)
      // Let's just do straight lines or simple quadratic
      const p = points[i];
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      parts.push(` Q ${midX} ${prev.y}, ${midX} ${p.y} T ${p.x} ${p.y}`);
    }
    pathD = parts.join("");
  } else if (points.length === 1) {
    pathD = `M 0 ${points[0].y} H 478`;
  }

  const avgLatency =
    latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  const areaPath = pathD ? `${pathD} V 150 H 0 Z` : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Uptime Bar Chart */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-foreground text-sm font-bold font-mono uppercase tracking-wider">
            Uptime History
          </h3>
          <span className="bg-accent/60 border border-border rounded-lg text-[10px] font-bold text-muted-foreground px-2.5 py-1 font-mono uppercase">
            Last 24 Hours
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-foreground text-3xl font-bold font-mono tracking-tight">
            {displayEvents.length > 0
              ? (
                  (displayEvents.filter((e) => e.status === "UP").length / displayEvents.length) *
                  100
                ).toFixed(0)
              : "100"}
            %
          </p>
          <p className="text-muted-foreground text-xs font-mono">Current Average</p>
        </div>

        <div className="grid min-h-[140px] grid-flow-col gap-1 items-end pt-4">
          {bars.map((bar, i) => (
            <div
              key={i}
              className={`w-full rounded-t-sm transition-all hover:opacity-80 ${
                bar.status === "UP"
                  ? "bg-emerald-500/30 hover:bg-emerald-500/50 h-full"
                  : bar.status === "DOWN"
                    ? "bg-red-500/50 hover:bg-red-500/70 h-2/5"
                    : "bg-muted h-full opacity-40" // Unknown/Empty
              }`}
            ></div>
          ))}
        </div>

        <div className="flex justify-between mt-2 pt-2 border-t border-border/40">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider font-mono">
            Oldest
          </p>
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider font-mono">
            Now
          </p>
        </div>
      </div>

      {/* Response Time - Dynamic SVG */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-foreground text-sm font-bold font-mono uppercase tracking-wider">
            Response Time (ms)
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={downloadSVG}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Export SVG"
            >
              <Download className="size-3.5" />
            </button>
            <button className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Fullscreen className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-foreground text-3xl font-bold font-mono tracking-tight">
            {avgLatency}ms
          </p>
          <p className="text-muted-foreground text-xs font-mono">Last 50 Events Average</p>
        </div>
        <div className="flex flex-1 flex-col pt-4 min-h-[140px]">
          {latencies.length > 0 ? (
            <svg
              ref={svgRef}
              fill="none"
              height="100%"
              preserveAspectRatio="none"
              viewBox="0 0 478 150"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={pathD} stroke="#10b981" strokeLinecap="round" strokeWidth="2"></path>
              <path d={areaPath} fill="url(#latency_grad)"></path>
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="latency_grad"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="150"
                >
                  <stop stopColor="#10b981" stopOpacity="0.2"></stop>
                  <stop offset="1" stopColor="#10b981" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-border bg-accent/20 rounded-xl">
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                No data available
              </p>
            </div>
          )}
          <div className="flex justify-between mt-2 pt-2 border-t border-border/40">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider font-mono">
              Oldest
            </p>
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider font-mono">
              Now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
