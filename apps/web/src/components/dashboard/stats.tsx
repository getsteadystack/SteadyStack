"use client";

import { memo } from "react";
import { Wifi, CheckCircle, Zap, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardStatsData {
  activeMonitors: number;
  globalUptime: number;
  avgLatency: number;
  activeAlerts: number;
}

export const DashboardStats = memo(function DashboardStats({
  stats: data,
}: {
  stats: DashboardStatsData;
}) {
  const stats = [
    {
      name: "Active Monitors",
      value: data.activeMonitors.toString(),
      change: "Live",
      trend: "up",
      icon: Wifi,
      iconColor: "text-primary",
      changeColor: "text-emerald-500",
    },
    {
      name: "Global Uptime",
      value: `${data.globalUptime}%`,
      change: "Last 24h",
      trend: "up",
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      changeColor: "text-emerald-500",
    },
    {
      name: "Avg Response Time",
      value: `${data.avgLatency}ms`,
      change: "Last 24h",
      trend: "down", // actually good
      icon: Zap,
      iconColor: "text-amber-500",
      changeColor: "text-amber-500",
    },
    {
      name: "Active Alerts",
      value: data.activeAlerts.toString(),
      change: data.activeAlerts > 0 ? "Action Required" : "All Systems Operational",
      trend: data.activeAlerts > 0 ? "down" : "neutral",
      icon: AlertTriangle,
      iconColor: data.activeAlerts > 0 ? "text-red-500" : "text-emerald-500",
      changeColor: data.activeAlerts > 0 ? "text-red-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 relative overflow-hidden group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
              {stat.name}
            </p>
            <div className="p-2 bg-muted rounded-xl border border-border group-hover:border-foreground/20 transition-colors">
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-3xl font-serif font-semibold text-foreground tracking-tight">
            {stat.value}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/60 ${stat.changeColor}`}
            >
              {stat.trend === "up" && <TrendingUp className="size-3" />}
              {stat.trend === "down" && <TrendingDown className="size-3" />}
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});
