"use client";

import { Server, CheckCircle, AlertTriangle, PauseCircle } from "lucide-react";

export function MonitorStats({ monitors = [] }: { monitors: any[] }) {
  const total = monitors.length;
  const operational = monitors.filter((m) => m.status === "UP").length;
  const down = monitors.filter((m) => m.status === "DOWN").length;
  const maintenance = monitors.filter((m) => m.status === "PAUSED").length;

  const stats = [
    {
      label: "Total Targets",
      value: total,
      icon: Server,
      color: "text-foreground",
      iconColor: "text-primary",
    },
    {
      label: "Operational",
      value: operational,
      icon: CheckCircle,
      color: "text-primary",
      iconColor: "text-primary",
    },
    {
      label: "Down / Crit",
      value: down,
      icon: AlertTriangle,
      color: "text-red-500",
      iconColor: "text-red-500",
    },
    {
      label: "Maintenance",
      value: maintenance,
      icon: PauseCircle,
      color: "text-yellow-500",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-2xl p-5 relative group hover:border-foreground/20 hover:shadow-xs transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <div className="p-2 bg-muted rounded-xl border border-border group-hover:border-foreground/20 transition-colors">
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
          </div>
          <p className={`text-3xl font-serif font-semibold tracking-tight ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
