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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              {stat.name}
            </p>
            <div className="p-2 bg-accent rounded-lg border border-border/50 group-hover:border-primary/10 transition-colors">
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5 ${stat.changeColor}`}
          >
            {stat.trend === "up" && <TrendingUp className="size-3.5" />}
            {stat.trend === "down" && <TrendingDown className="size-3.5" />}
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
});
