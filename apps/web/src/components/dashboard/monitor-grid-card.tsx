"use client";

import { memo, useState } from "react";
import Link from "next/link";
import {
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  ExternalLink,
  BarChart2,
  Maximize2,
  Minimize2,
  Play,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { checkMonitor } from "@/actions/monitors";
import { useHaptic } from "@/hooks/use-haptic";

interface MonitorGridCardProps {
  monitor: any;
  size: "1x1" | "2x1" | "2x2";
  /** Shared, identity-stable callback; the card supplies its own monitor id. */
  onResize: (monitorId: string, size: "1x1" | "2x1" | "2x2") => void;
  isEditMode: boolean;
  dragHandleProps?: any;
}

export const MonitorGridCard = memo(function MonitorGridCard({
  monitor,
  size,
  onResize,
  isEditMode,
  dragHandleProps,
}: MonitorGridCardProps) {
  const [checking, setChecking] = useState(false);
  const { trigger } = useHaptic();

  const handleRunCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trigger("light"); // Subtle click feedback
    setChecking(true);
    try {
      const result = await checkMonitor(monitor.id);
      if (result.success) {
        trigger("success"); // Premium success tick
        toast.success("Check initiated successfully");
      } else {
        trigger("error"); // Alert error pulse
        toast.error(result.error || "Failed to initiate check");
      }
    } catch {
      trigger("error");
      toast.error("Failed to run check");
    } finally {
      setChecking(false);
    }
  };

  // Uptime/Latency calculations
  const events = monitor.events || [];
  const total = events.length;
  const upCount = events.filter((e: any) => e.status === "UP").length;
  const uptime = total > 0 ? ((upCount / total) * 100).toFixed(1) : "100.0";

  const latencies = events.map((e: any) => e.latency || 0).slice(0, 30);
  const avgLatency =
    latencies.length > 0
      ? Math.round(latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length)
      : 0;

  // Mini Sparkline SVG path generator
  const generateSparkline = () => {
    if (latencies.length === 0) return "";
    const points = [...latencies].reverse();
    const width = size === "2x1" ? 220 : 380;
    const height = 60;
    const padding = 5;

    if (points.length === 1) {
      const y = height / 2;
      return `M ${padding} ${y} H ${width - padding}`;
    }

    const max = Math.max(...points, 100);
    const min = Math.min(...points, 0);
    const range = max - min || 1;

    const pointsList = points.map((l, i) => {
      const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((l - min) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    let path = `M ${pointsList[0].x} ${pointsList[0].y}`;
    for (let i = 1; i < pointsList.length; i++) {
      const p = pointsList[i];
      const prev = pointsList[i - 1];
      const midX = (prev.x + p.x) / 2;
      path += ` Q ${midX} ${prev.y}, ${midX} ${p.y} T ${p.x} ${p.y}`;
    }
    return path;
  };

  const sparklinePath = generateSparkline();
  const sparklineAreaPath = sparklinePath ? `${sparklinePath} V 60 H 5 Z` : "";

  // Status-based colors
  const statusColor =
    monitor.status === "UP"
      ? "emerald"
      : monitor.status === "DOWN"
        ? "red"
        : monitor.status === "MAINTENANCE"
          ? "amber"
          : "gray";

  const statusGlow = {
    emerald:
      "shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
    red: "shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/20 bg-red-500/5 hover:border-red-500/40",
    amber:
      "shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
    gray: "border-zinc-800 bg-zinc-950/20",
  }[statusColor];

  const badgeColor = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    gray: "bg-zinc-800 text-zinc-400 border-zinc-700",
  }[statusColor];

  const dotColor = {
    emerald: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
    red: "bg-red-500 shadow-[0_0_8px_#ef4444]",
    amber: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
    gray: "bg-zinc-500",
  }[statusColor];

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border p-5 backdrop-blur-md transition-all duration-300 ${statusGlow} ${
        size === "1x1"
          ? "col-span-1 row-span-1 min-h-[160px]"
          : size === "2x1"
            ? "col-span-1 md:col-span-2 row-span-1 min-h-[160px]"
            : "col-span-1 md:col-span-2 row-span-2 min-h-[340px]"
      } group`}
    >
      {/* Edit Mode Resize & Drag Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/60 border border-zinc-800 rounded-md p-1 backdrop-blur-sm">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="p-1 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          {/* Resize Controls */}
          {size !== "1x1" && (
            <button
              onClick={() => onResize(monitor.id, "1x1")}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
              title="Resize Standard (1x1)"
            >
              <Minimize2 className="size-3.5" />
            </button>
          )}
          {size !== "2x1" && (
            <button
              onClick={() => onResize(monitor.id, "2x1")}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
              title="Resize Wide (2x1)"
            >
              <Maximize2 className="size-3.5 rotate-90" />
            </button>
          )}
          {size !== "2x2" && (
            <button
              onClick={() => onResize(monitor.id, "2x2")}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
              title="Resize Large (2x2)"
            >
              <Maximize2 className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 max-w-[70%]">
          <Link
            href={`/dashboard/monitors/${monitor.id}`}
            className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            {monitor.name}
            <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </Link>
          <span className="text-[10px] text-zinc-500 font-mono truncate">{monitor.url}</span>
        </div>

        {!isEditMode && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full border ${badgeColor}`}
          >
            <span className={`size-1.5 rounded-full ${dotColor}`}></span>
            {monitor.status}
          </span>
        )}
      </div>

      {/* Standard (1x1) Details */}
      {size === "1x1" && (
        <div className="flex justify-between items-end mt-4">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Uptime
            </span>
            <span className="text-xl font-mono font-extrabold text-zinc-200">{uptime}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Latency
            </span>
            <span className="text-xl font-mono font-extrabold text-zinc-200">{avgLatency}ms</span>
          </div>
        </div>
      )}

      {/* Wide (2x1) Details */}
      {size === "2x1" && (
        <div className="flex items-center justify-between gap-4 mt-2">
          {/* Sparkline chart */}
          <div className="flex-1 max-w-[50%] h-[60px] relative">
            {sparklinePath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 220 60">
                <defs>
                  <linearGradient id={`grad-2x1-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={sparklineAreaPath}
                  fill={`url(#grad-2x1-${monitor.id})`}
                  className={
                    monitor.status === "UP"
                      ? "text-emerald-500"
                      : monitor.status === "DOWN"
                        ? "text-red-500"
                        : "text-amber-500"
                  }
                />
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={`var(--color-status-${statusColor}, currentColor)`}
                  className={
                    monitor.status === "UP"
                      ? "text-emerald-500"
                      : monitor.status === "DOWN"
                        ? "text-red-500"
                        : "text-amber-500"
                  }
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-800 rounded bg-zinc-950/20 text-[9px] text-zinc-600 font-mono">
                No Data
              </div>
            )}
          </div>

          <div className="flex items-end gap-6 text-right">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                Uptime
              </span>
              <span className="text-lg font-mono font-extrabold text-zinc-200">{uptime}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                Avg Response
              </span>
              <span className="text-lg font-mono font-extrabold text-zinc-200">{avgLatency}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Large (2x2) Details */}
      {size === "2x2" && (
        <div className="flex flex-col gap-4 mt-4 flex-1 justify-between">
          {/* Sparkline chart */}
          <div className="flex-1 min-h-[100px] h-full relative">
            {sparklinePath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 380 60">
                <defs>
                  <linearGradient id={`grad-2x2-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={sparklineAreaPath}
                  fill={`url(#grad-2x2-${monitor.id})`}
                  className={
                    monitor.status === "UP"
                      ? "text-emerald-500"
                      : monitor.status === "DOWN"
                        ? "text-red-500"
                        : "text-amber-500"
                  }
                />
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={`var(--color-status-${statusColor}, currentColor)`}
                  className={
                    monitor.status === "UP"
                      ? "text-emerald-500"
                      : monitor.status === "DOWN"
                        ? "text-red-500"
                        : "text-amber-500"
                  }
                  strokeWidth="2.5"
                />
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-800 rounded bg-zinc-950/20 text-xs text-zinc-600 font-mono">
                No history metrics recorded
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-900 pt-3">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                Uptime
              </span>
              <span className="text-base font-mono font-extrabold text-zinc-200">{uptime}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                Avg Latency
              </span>
              <span className="text-base font-mono font-extrabold text-zinc-200">
                {avgLatency}ms
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                Interval
              </span>
              <span className="text-base font-mono font-extrabold text-zinc-200">
                {monitor.interval || 60}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 mt-3 relative z-10">
        <div className="flex gap-2">
          <Link
            href={`/dashboard/monitors/${monitor.id}`}
            className="inline-flex items-center text-[10px] uppercase font-bold text-zinc-400 hover:text-primary tracking-wider"
          >
            <BarChart2 className="size-3.5 mr-1" />
            Insights
          </Link>
        </div>

        {!isEditMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRunCheck}
            disabled={checking}
            className="min-h-[44px] md:h-7 px-4 md:px-2 text-zinc-400 hover:text-primary hover:bg-primary/5 text-[9px] uppercase font-bold tracking-wider flex items-center justify-center"
          >
            {checking ? (
              <Loader2 className="size-3 mr-1 animate-spin" />
            ) : (
              <Play className="size-3 mr-1" />
            )}
            Run Check
          </Button>
        )}
      </div>
    </div>
  );
});
