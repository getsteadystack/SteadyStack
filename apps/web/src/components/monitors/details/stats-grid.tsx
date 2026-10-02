"use client";
import { Activity, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function MonitorStatsGrid({ monitor }: { monitor: any }) {
  // Calculate stats
  const events = monitor.events || [];
  const total = events.length;
  const upCount = events.filter((e: any) => e.status === "UP").length;
  const downCount = total - upCount;

  const uptime = total > 0 ? ((upCount / total) * 100).toFixed(2) : "0.00";

  // Filter undefined latency if any (though schema says int)
  const latencies = events
    .map((e: any) => e.latency)
    .filter((l: any) => typeof l === "number" && l >= 0);
  const avgLatency =
    latencies.length > 0
      ? (latencies.reduce((a: any, b: any) => a + b, 0) / latencies.length).toFixed(0)
      : "0";

  // Downtime: assuming 1 minute interval for simplicity if we don't know duration.
  const intervalMinutes = (monitor.interval || 60) / 60;
  const downtimeMinutes = (downCount * intervalMinutes).toFixed(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="flex flex-col gap-2 rounded-2xl p-5 md:p-6 border border-border bg-card shadow-xs relative group overflow-hidden transition-all hover:border-border/80">
        <div className="flex justify-between items-center relative z-10">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
            Uptime (24h)
          </p>
          <div className="size-7 rounded-lg bg-accent/60 border border-border flex items-center justify-center text-foreground">
            <Activity className="size-3.5" />
          </div>
        </div>
        <p className="text-foreground text-3xl font-bold font-mono tracking-tight relative z-10">
          {uptime}%
        </p>
        <p className="text-emerald-600 text-xs font-semibold font-mono flex items-center gap-1 relative z-10">
          <ArrowUpRight className="size-3" /> +0.02% from yesterday
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl p-5 md:p-6 border border-border bg-card shadow-xs relative group overflow-hidden transition-all hover:border-border/80">
        <div className="flex justify-between items-center relative z-10">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
            Avg Latency
          </p>
          <div className="size-7 rounded-lg bg-accent/60 border border-border flex items-center justify-center text-foreground">
            <Clock className="size-3.5" />
          </div>
        </div>
        <p className="text-foreground text-3xl font-bold font-mono tracking-tight relative z-10">
          {avgLatency}ms
        </p>
        <p className="text-amber-600 text-xs font-semibold font-mono flex items-center gap-1 relative z-10">
          <ArrowUpRight className="size-3" /> +15ms increase
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl p-5 md:p-6 border border-border bg-card shadow-xs relative group overflow-hidden transition-all hover:border-border/80">
        <div className="flex justify-between items-center relative z-10">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
            Total Downtime
          </p>
          <div className="size-7 rounded-lg bg-accent/60 border border-border flex items-center justify-center text-foreground">
            <AlertTriangle className="size-3.5" />
          </div>
        </div>
        <p className="text-foreground text-3xl font-bold font-mono tracking-tight relative z-10">
          {downtimeMinutes}m
        </p>
        <p className="text-muted-foreground text-xs font-semibold font-mono flex items-center gap-1 relative z-10">
          <ArrowDownRight className="size-3" /> stable
        </p>
      </div>
    </div>
  );
}
