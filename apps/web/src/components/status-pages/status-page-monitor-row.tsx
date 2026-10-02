"use client";

import { CheckCircle, AlertTriangle, Clock, Zap, WifiOff } from "lucide-react";
import { useLiveMonitor } from "@/hooks/use-live-monitor";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface MonitorRowProps {
  item: any; // StatusPageMonitor include
  showUptime?: boolean;
  showResponseTime?: boolean;
  barType?: string;
  cardType?: string;
  overrides?: any[];
}

export function StatusPageMonitorRow({
  item,
  showUptime = true,
  showResponseTime = true,
  barType = "absolute",
  cardType = "duration",
  overrides = [],
}: MonitorRowProps) {
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const { monitor } = item;
  const { lastEvent, isConnected } = useLiveMonitor(monitor.id);

  // Monitor-specific metrics overrides
  const visibleLatency = item.showLatency !== false && showResponseTime;
  const visibleUptime = item.showUptime !== false && showUptime;
  const visibleCheckCounts = item.showCheckCounts !== false;

  // Local state to handle real-time updates
  // We initialize from server-provided data, then update with WS data
  const [currentStatus, setCurrentStatus] = useState(monitor.status);
  const [history, setHistory] = useState(monitor.events || []);

  // When a new WS event arrives
  useEffect(() => {
    if (lastEvent) {
      console.log("Live update for", monitor.name, lastEvent);
      setCurrentStatus(lastEvent.status);
      setHistory((prev: any[]) => [lastEvent, ...prev].slice(0, 60)); // Keep last 60
    }
  }, [lastEvent, monitor.name]);

  // Filter overrides for this specific monitor
  const monitorOverrides = overrides.filter((o: any) => o.monitorId === monitor.id);

  // Derive today's status in manual override mode
  const todayStr = new Date().toISOString().split("T")[0];
  const todayOverride = monitorOverrides.find(
    (o: any) => new Date(o.date).toISOString().split("T")[0] === todayStr,
  );
  const derivedStatus = todayOverride
    ? ["UP", "OPERATIONAL"].includes(todayOverride.status)
      ? "UP"
      : "DOWN"
    : "UP";

  const activeStatus = barType === "manual" ? derivedStatus : currentStatus;

  // Manual 60 days computation
  const manualDays = [...Array(60)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (59 - i));
    const dateStr = date.toISOString().split("T")[0];
    const override = monitorOverrides.find(
      (o: any) => new Date(o.date).toISOString().split("T")[0] === dateStr,
    );
    return {
      dateStr,
      override,
    };
  });

  const manualUpCount = manualDays.filter(
    (d: any) => !d.override || ["UP", "OPERATIONAL"].includes(d.override.status),
  ).length;
  const manualUptime = Math.round((manualUpCount / 60) * 100);

  const latestEvent = history[0];
  const upCount = history.filter((e: any) => e.status === "UP").length;
  const totalCount = history.length;
  const uptime = totalCount > 0 ? Math.round((upCount / totalCount) * 100) : 0;
  const displayUptime = barType === "manual" ? manualUptime : uptime;

  return (
    <div className="group border border-border bg-card hover:bg-card/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-border/80 transition-all">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              {item.displayName || monitor.name}
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-1" title="Live Socket Connected">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h3>
            <div
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                activeStatus === "UP"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {activeStatus === "UP" ? tStatus("monitor_operational") : tStatus("monitor_outage")}
            </div>
          </div>
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {visibleLatency && latestEvent && latestEvent.latency && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Zap className="size-3 text-amber-500" /> {latestEvent.latency}ms
              </div>
            )}
            {cardType === "duration"
              ? visibleUptime &&
                (activeStatus === "UP" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-mono font-bold">
                    {displayUptime}%
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 text-sm font-mono font-bold">
                    {tCommon("down")}
                  </span>
                ))
              : visibleCheckCounts && (
                  <span className="text-foreground text-sm font-mono font-bold">
                    {barType === "manual" ? "60 days" : `${totalCount} checks`}
                  </span>
                )}
          </div>
        </div>

        {/* Uptime History Bars */}
        <div className="flex items-center gap-1 h-8 w-full">
          {barType === "manual"
            ? manualDays.map((d: any, i) => {
                let bgClass = "bg-emerald-500 dark:bg-emerald-400";
                let title = `${d.dateStr} - Operational`;

                if (d.override) {
                  const status = d.override.status;
                  const message = d.override.message || "Manual Override";
                  title = `${d.dateStr} - ${status} (${message})`;

                  if (status === "MAINTENANCE") bgClass = "bg-amber-500";
                  else if (status === "DEGRADED" || status === "PARTIAL_OUTAGE")
                    bgClass = "bg-amber-500";
                  else if (status === "MAJOR_OUTAGE" || status === "DOWN") bgClass = "bg-rose-500";
                  else if (status === "PAUSED") bgClass = "bg-muted-foreground/30";
                }

                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-sm transition-all hover:scale-y-110 ${bgClass}`}
                    title={title}
                  />
                );
              })
            : [...Array(60)].map((_, i) => {
                const eventIndex = 59 - i;
                const evt = history[eventIndex];

                let bgClass = "bg-muted-foreground/15"; // No data default
                if (evt) {
                  if (evt.status === "MAINTENANCE") bgClass = "bg-amber-500";
                  else if (evt.status === "UP") bgClass = "bg-emerald-500 dark:bg-emerald-400";
                  else bgClass = "bg-rose-500";
                }

                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-sm transition-all hover:scale-y-110 ${bgClass}`}
                    title={
                      evt
                        ? `${new Date(evt.timestamp).toLocaleString()} - ${evt.status}`
                        : "No Data"
                    }
                  />
                );
              })}
        </div>

        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
          <span>{barType === "manual" ? "60 days ago" : tCommon("checks_ago")}</span>
          <span>{tCommon("now")}</span>
        </div>
      </div>
    </div>
  );
}
