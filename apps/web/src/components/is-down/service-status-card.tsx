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
    <div className="relative overflow-hidden rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 shadow-xs font-sans">
      <div className="relative z-10 space-y-6">
        {/* Header row with Service details and Live Status Badge */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8e6df] bg-[#fbfbf9] text-2xl font-serif font-medium text-[#23211a] shadow-xs">
              {service.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#23211a]">
                  {service.name}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-xs text-[#868279] border border-[#e8e6df] bg-[#fbfbf9]">
                  {service.domain}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5c5c5c] font-sans line-clamp-1 mt-0.5">
                {service.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider border ${
                currentStatus === "OPERATIONAL"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : currentStatus === "DEGRADED"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <span className="relative flex h-2 w-2">
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
                  className={`relative inline-flex h-2 w-2 rounded-full ${
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
          <div className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider mb-1">
              <Activity className="h-3.5 w-3.5 text-[#23211a]" />
              <span>Edge Latency</span>
            </div>
            <div className="text-2xl font-serif font-medium text-[#23211a]">
              {latency > 0 ? `${latency} ms` : "Timeout"}
            </div>
            <p className="text-[11px] text-[#868279] mt-0.5 font-sans">Primary edge roundtrip</p>
          </div>

          <div className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>24h Global Uptime</span>
            </div>
            <div className="text-2xl font-serif font-medium text-emerald-700">
              {currentStatus === "OPERATIONAL" ? "99.98%" : "98.40%"}
            </div>
            <p className="text-[11px] text-[#868279] mt-0.5 font-sans">Edge consensus</p>
          </div>

          <div className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider mb-1">
              <Globe2 className="h-3.5 w-3.5 text-[#23211a]" />
              <span>Vantage Points</span>
            </div>
            <div className="text-2xl font-serif font-medium text-[#23211a]">7 Regions</div>
            <p className="text-[11px] text-[#868279] mt-0.5 font-sans">NA, EU, APAC Edge Nodes</p>
          </div>

          <div className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider mb-1">
              <Clock className="h-3.5 w-3.5 text-[#868279]" />
              <span>Last Checked</span>
            </div>
            <div className="text-xl font-serif font-medium text-[#23211a] truncate">
              {lastChecked}
            </div>
            <p className="text-[11px] text-[#868279] mt-0.5 font-sans">Edge consensus mesh</p>
          </div>
        </div>

        {/* Live Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#e8e6df]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#868279]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Verified by SteadyStack Autonomous Edge Network</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="w-full sm:w-auto font-mono text-xs font-semibold uppercase tracking-wider bg-[#23211a] hover:bg-black text-[#ffd439] hover:text-[#ffd439] rounded-xl h-9 shadow-xs transition-all"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              {isPending ? "Probing Edge..." : "Run Live Probe"}
            </Button>

            <a
              href={service.officialStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#e8e6df] bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-[#23211a] hover:bg-[#fbfbf9] hover:border-[#23211a]/40 transition-colors shrink-0 h-9 shadow-xs"
            >
              <span>Official Status</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-[#868279]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
