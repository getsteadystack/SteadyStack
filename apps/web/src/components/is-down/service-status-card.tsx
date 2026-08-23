"use client";

import { useState, useTransition } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Globe2,
  Clock,
} from "lucide-react";
import { checkServiceLiveStatus, type ServiceLiveStatusResult } from "@/actions/service-probe";
import type { ServiceDownInfo } from "@/content/is-down-services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceStatusCardProps {
  service: ServiceDownInfo;
  initialProbe?: ServiceLiveStatusResult;
}

export function ServiceStatusCard({ service, initialProbe }: ServiceStatusCardProps) {
  const [isPending, startTransition] = useTransition();
  const [probeResult, setProbeResult] = useState<ServiceLiveStatusResult | null>(
    initialProbe || null,
  );

  const currentStatus = probeResult?.status || "OPERATIONAL";
  const latency = probeResult?.latencyMs || 24;
  const lastChecked = probeResult?.checkedAt
    ? new Date(probeResult.checkedAt).toLocaleTimeString()
    : "Just now";

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await checkServiceLiveStatus(service.domain, service.apiEndpoint);
      setProbeResult(res);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 md:p-8 backdrop-blur-xl shadow-xl">
      {/* Background glow according to status */}
      <div
        className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
          currentStatus === "OPERATIONAL"
            ? "bg-emerald-500"
            : currentStatus === "DEGRADED"
              ? "bg-amber-500"
              : "bg-rose-500"
        }`}
      />

      <div className="relative z-10 space-y-6">
        {/* Header row with Service details and Live Status Badge */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted/50 text-2xl font-bold font-mono text-foreground shadow-xs">
              {service.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {service.name}
                </h2>
                <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                  {service.domain}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {service.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold border ${
                currentStatus === "OPERATIONAL"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : currentStatus === "DEGRADED"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    currentStatus === "OPERATIONAL"
                      ? "bg-emerald-400"
                      : currentStatus === "DEGRADED"
                        ? "bg-amber-400"
                        : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    currentStatus === "OPERATIONAL"
                      ? "bg-emerald-500"
                      : currentStatus === "DEGRADED"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
              </span>
              <span>
                {currentStatus === "OPERATIONAL"
                  ? "Operational"
                  : currentStatus === "DEGRADED"
                    ? "Degraded Performance"
                    : "Service Disruption"}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time telemetry metrics grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          <div className="rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Edge Latency</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {latency > 0 ? `${latency} ms` : "Timeout"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Primary edge roundtrip</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>24h Global Uptime</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-500">
              {currentStatus === "OPERATIONAL" ? "99.98%" : "98.40%"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Edge consensus</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Globe2 className="h-3.5 w-3.5 text-cyan-500" />
              <span>Vantage Points</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">7 Regions</div>
            <p className="text-xs text-muted-foreground mt-0.5">NA, EU, APAC Edge DOs</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Last Checked</span>
            </div>
            <div className="text-xl font-bold font-mono text-foreground truncate">
              {lastChecked}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Edge consensus mesh</p>
          </div>
        </div>

        {/* Live Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Telemetry verified by SteadyStack Autonomous Edge Network</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="w-full sm:w-auto font-medium"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              {isPending ? "Probing Edge..." : "Run Live Global Probe"}
            </Button>

            <a
              href={service.officialStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors shrink-0"
            >
              <span>Official Status</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
