"use client";

import { CheckCircle, ExternalLink } from "lucide-react";
import { toggleMonitor } from "@/actions/monitors";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect, useTransition } from "react";
import { AVAILABLE_REGIONS } from "@steadystack/shared";
import { useHaptic } from "@/hooks/use-haptic";

export function MonitorDetailHeader({ monitor }: { monitor: any }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const latestTimestamp = monitor.events?.[0]?.timestamp
    ? new Date(monitor.events[0].timestamp).getTime()
    : monitor.lastCheck
      ? new Date(monitor.lastCheck).getTime()
      : null;

  const hasEvents = latestTimestamp != null;
  const isUp = monitor.status === "UP" && hasEvents;
  const isDown = monitor.status === "DOWN";
  const isPaused = monitor.status === "PAUSED";
  // If status is "UP" but no events, it's pending first check
  const isPending = monitor.status === "UP" && !hasEvents;

  const [isLoading, startTransition] = useTransition();
  const { trigger } = useHaptic();

  const handleToggle = (enabled: boolean) => {
    trigger("medium"); // Medium vibration trigger on toggling state
    startTransition(async () => {
      const result = await toggleMonitor(monitor.id, enabled);
      if (result.success) {
        trigger("success"); // Success vibration
        toast.success(enabled ? "Monitoring resumed" : "Monitoring paused");
      } else {
        trigger("error"); // Error vibration
        toast.error(result.error || "Failed to update monitor");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-serif font-medium text-foreground tracking-tight">
                {monitor.name}
              </h1>
              {isUp && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Operational
                </span>
              )}
              {isDown && (
                <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-destructive animate-pulse"></span>
                  {(monitor.events?.[0]?.errorReason || "Critical Down").split("\n")[0]}
                </span>
              )}
              {isPaused && (
                <span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground"></span>
                  Paused
                </span>
              )}
              {isPending && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Initializing
                </span>
              )}
            </div>
            {monitor.type === "HEARTBEAT" ? (
              <div className="flex flex-col gap-1.5 mt-1">
                <p className="text-muted-foreground text-xs font-mono">
                  Webhook URL:{" "}
                  <code className="text-foreground select-all bg-muted px-2 py-0.5 border border-border rounded-md">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/api/heartbeat/${monitor.heartbeatToken}`
                      : `/api/heartbeat/${monitor.heartbeatToken}`}
                  </code>
                </p>
                <p className="text-[11px] text-muted-foreground leading-normal max-w-md">
                  💡 Send a GET or POST request to this URL from your server cron job to report
                  healthy heartbeat checks.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs font-mono">
                Target: <code className="text-foreground font-medium">{monitor.url}</code>
              </p>
            )}
            {monitor.runbookUrl && (
              <a
                href={monitor.runbookUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline w-fit transition-colors"
              >
                <ExternalLink className="size-3" />
                Remediation Runbook
              </a>
            )}
          </div>

          <div className="flex items-center justify-end flex-1 pl-4 md:pl-0">
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Monitoring State
              </p>
              <label className="relative flex h-[28px] w-[50px] cursor-pointer items-center rounded-full border border-border bg-muted p-1 active:scale-95 transition-transform shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={!isPaused}
                  disabled={isLoading}
                  onChange={(e) => handleToggle(e.target.checked)}
                />
                <span className="absolute inset-0 rounded-full transition-colors peer-checked:bg-foreground"></span>
                <span className="h-5 w-5 rounded-full bg-background shadow-md transition-transform peer-checked:translate-x-[22px]"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Last checked card */}
      <div className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <span className="flex size-2">
            <span
              className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${hasEvents ? "bg-emerald-500" : "bg-amber-500"}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${hasEvents ? "bg-emerald-500" : "bg-amber-500"}`}
            ></span>
          </span>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider font-mono">
            Last Heartbeat Check
          </p>
          <p className="text-foreground text-2xl font-serif font-medium mt-1">
            {hasEvents && latestTimestamp != null
              ? (() => {
                  const diff = Math.max(0, Math.floor((now - latestTimestamp) / 1000));
                  if (diff < 3) return "Just now";
                  if (diff < 60) return `${diff} seconds ago`;
                  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                  return `${Math.floor(diff / 3600)} hours ago`;
                })()
              : "Pending..."}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs font-mono">
          <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
          {(() => {
            let regionCount = 3;
            if (monitor.checkRegions) {
              try {
                const parsed = JSON.parse(monitor.checkRegions);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  regionCount = parsed.length;
                }
              } catch {}
            }
            const quorumRule =
              regionCount >= 7 ? "4-of-7" : regionCount >= 3 ? "2-of-3" : "Multi-Node";
            return `${quorumRule} Quorum (${regionCount} Edge Regions)`;
          })()}
        </div>
      </div>
    </div>
  );
}
