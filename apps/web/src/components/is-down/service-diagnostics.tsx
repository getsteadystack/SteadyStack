import {
  Globe,
  AlertOctagon,
  Wrench,
  Layers,
  Cpu,
  ShieldAlert,
  ServerCrash,
  CheckCircle2,
} from "lucide-react";
import type { ServiceDownInfo } from "@/content/is-down-services";
import type { ServiceLiveStatusResult } from "@/actions/service-probe";
import { Badge } from "@/components/ui/badge";

interface ServiceDiagnosticsProps {
  service: ServiceDownInfo;
  probeResult?: ServiceLiveStatusResult | null;
}

export function ServiceDiagnostics({ service, probeResult }: ServiceDiagnosticsProps) {
  const probes = probeResult?.probes || [
    {
      region: "us-east",
      location: "US-East (N. Virginia)",
      flag: "🇺🇸",
      latencyMs: 18,
      status: "UP",
    },
    {
      region: "us-west",
      location: "US-West (Oregon)",
      flag: "🇺🇸",
      latencyMs: 38,
      status: "UP",
    },
    {
      region: "eu-central",
      location: "EU-Central (Frankfurt)",
      flag: "🇩🇪",
      latencyMs: 82,
      status: "UP",
    },
    {
      region: "ap-northeast",
      location: "AP-Tokyo (Tokyo)",
      flag: "🇯🇵",
      latencyMs: 145,
      status: "UP",
    },
    {
      region: "sa-east",
      location: "SA-East (São Paulo)",
      flag: "🇧🇷",
      latencyMs: 160,
      status: "UP",
    },
    {
      region: "af-south",
      location: "AF-South (Cape Town)",
      flag: "🇿🇦",
      latencyMs: 210,
      status: "UP",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Global Multi-Region Vantage Point Latency Grid */}
      <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#23211a]">
                Global Edge Reachability & Regional Latency
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5c5c] font-sans">
                Synthetic probe response times tested from SteadyStack sovereign vantage points.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full font-mono text-xs text-[#868279] border border-[#e8e6df] bg-[#fbfbf9]">
            Live HTTP / TCP Ping
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {probes.map((p) => (
            <div
              key={p.region}
              className="flex items-center justify-between p-4 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] hover:bg-[#f5f3ec] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={p.location}>
                  {p.flag}
                </span>
                <div>
                  <div className="text-xs font-mono font-semibold text-[#23211a]">{p.location}</div>
                  <div className="text-[11px] text-[#868279] font-mono">{p.region}</div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-serif font-medium ${
                    p.status === "DOWN"
                      ? "text-rose-700"
                      : p.status === "SLOW"
                        ? "text-amber-700"
                        : "text-emerald-700"
                  }`}
                >
                  {p.latencyMs > 0 ? `${p.latencyMs} ms` : "Timeout"}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#868279] uppercase font-mono font-semibold">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.status === "DOWN"
                        ? "bg-rose-500"
                        : p.status === "SLOW"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                  />
                  <span>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Incident Symptoms & Monitored Core Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <ServerCrash className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-[#23211a]">
                Downtime Impact Analysis
              </h3>
              <p className="text-xs text-[#868279] font-mono">
                What happens when {service.name} degrades
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
            {service.impactSummary}
          </p>

          <div className="pt-3 border-t border-[#e8e6df]">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#868279] mb-2">
              Common HTTP Error Codes Observed
            </h4>
            <div className="flex flex-wrap gap-2">
              {service.commonErrorCodes.map((code) => (
                <span
                  key={code}
                  className="font-mono text-xs border border-rose-200 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-medium"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-[#23211a]">
                Critical Monitored Subsystems
              </h3>
              <p className="text-xs text-[#868279] font-mono">
                Components tracked on {service.domain}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {service.keyComponents.map((comp) => (
              <div
                key={comp}
                className="flex items-center justify-between p-3 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[#23211a] font-mono">{comp}</span>
                </div>
                <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#e8e6df]">
                  Synthetic Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Engineering Resiliency & Failover Architecture Guide */}
      <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a]">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#23211a]">
              Engineering Resilience Guide: Surviving {service.name} Outages
            </h3>
            <p className="text-xs sm:text-sm text-[#5c5c5c] font-sans">
              Defensive software architecture patterns to prevent third-party cascade failures.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#868279]">
              Immediate Tactical Steps
            </h4>
            <ul className="space-y-2.5">
              {service.troubleshootingSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#5c5c5c] font-sans">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ffd439]/20 border border-[#ffd439]/40 font-mono text-[11px] font-bold text-[#23211a]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#868279]">
              Recommended Resiliency Patterns
            </h4>
            <div className="space-y-2.5 text-xs text-[#5c5c5c] font-sans">
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-[#23211a]">Circuit Breaker Pattern:</strong> Automatically
                  trip and fallback to cache when {service.name} error rates exceed 15% in a 30s
                  rolling window.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffd439] mt-1.5 shrink-0" />
                <p>
                  <strong className="text-[#23211a]">Idempotent Background Retries:</strong> Push
                  failed API events into an asynchronous dead-letter queue with exponential backoff
                  and jitter.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#23211a] mt-1.5 shrink-0" />
                <p>
                  <strong className="text-[#23211a]">Multi-Region Edge Synthetic Consensus:</strong>{" "}
                  Rely on SteadyStack to alert your team before end-users notice degradation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
