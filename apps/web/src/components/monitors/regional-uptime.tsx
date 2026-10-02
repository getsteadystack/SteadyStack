"use client";

import { getRegionByCode } from "@steadystack/shared/regions";
import { Activity } from "lucide-react";

interface RegionalUptimeProps {
  events: Array<{
    id: string;
    status: string;
    latency: number;
    region: string | null;
    timestamp: Date;
  }>;
}

export function RegionalUptime({ events }: RegionalUptimeProps) {
  // Group events by region
  const eventsByRegion = events.reduce(
    (acc, event) => {
      const region = event.region || "default";
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  // Calculate stats for each region
  const regionalStats = Object.entries(eventsByRegion).map(([regionCode, regionEvents]) => {
    const upEvents = regionEvents.filter((e) => e.status === "UP").length;
    const uptime = regionEvents.length > 0 ? (upEvents / regionEvents.length) * 100 : 0;
    const avgLatency =
      regionEvents.length > 0
        ? regionEvents
            .filter((e) => e.status === "UP" && e.latency > 0)
            .reduce((sum, e) => sum + e.latency, 0) /
          regionEvents.filter((e) => e.status === "UP").length
        : 0;

    const region = getRegionByCode(regionCode);

    return {
      code: regionCode,
      name: region?.name || regionCode,
      flag: region?.flag || "🌍",
      uptime: uptime.toFixed(2),
      avgLatency: Math.round(avgLatency),
      totalChecks: regionEvents.length,
    };
  });

  // If no regional data, show message
  if (
    regionalStats.length === 0 ||
    (regionalStats.length === 1 && regionalStats[0].code === "default")
  ) {
    return (
      <div className="border border-border bg-card rounded-2xl p-6 text-center shadow-xs">
        <Activity className="size-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-mono">
          No regional monitoring configured. Enable multi-region monitoring to see uptime by
          location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
        Regional Performance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionalStats
          .filter((stat) => stat.code !== "default")
          .map((stat) => (
            <div
              key={stat.code}
              className="border border-border bg-card rounded-2xl p-5 hover:border-border/80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{stat.flag}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide truncate">
                    {stat.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {stat.totalChecks} checks
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-semibold">
                      Uptime
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        parseFloat(stat.uptime) >= 99
                          ? "text-emerald-600"
                          : parseFloat(stat.uptime) >= 95
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {stat.uptime}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        parseFloat(stat.uptime) >= 99
                          ? "bg-emerald-500"
                          : parseFloat(stat.uptime) >= 95
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${stat.uptime}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-semibold">
                    Avg Latency
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {stat.avgLatency}ms
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
