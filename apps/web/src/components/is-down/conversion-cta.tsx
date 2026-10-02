import Link from "next/link";
import { ArrowRight, BellRing, ShieldCheck, Zap, Terminal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ServiceDownInfo } from "@/content/is-down-services";

interface ConversionCtaProps {
  service: ServiceDownInfo;
}

export function ConversionCta({ service }: ConversionCtaProps) {
  const setupUrl = `/signup?monitor_name=${encodeURIComponent(service.name)}&monitor_url=${encodeURIComponent(service.domain)}&type=HTTP&interval=10`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#e8e6df] bg-white p-8 md:p-12 shadow-xs font-sans">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd439]/40 bg-[#ffd439]/20 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#23211a]">
              <BellRing className="h-3.5 w-3.5 text-[#23211a]" />
              <span>Automated Developer Alerting</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-[#23211a] leading-tight">
              Stop checking manually.
            </h2>

            <p className="text-base md:text-lg text-[#5c5c5c] max-w-2xl leading-relaxed font-sans">
              When <span className="font-semibold text-[#23211a]">{service.name}</span> goes down or
              suffers silent latency degradation, you shouldn&apos;t be refreshing status pages,
              searching social feeds, or waiting for angry user reports. Get alerted the exact
              second {service.name} fails.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href={setupUrl as any}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto h-12 px-7 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs group",
              )}
            >
              <span>Monitor {service.name} in 1 Click</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-[#868279] font-mono text-center mt-2.5">
              50 free monitors · 60s checks · 2-of-3 Edge Quorum · Zero card required
            </p>
          </div>
        </div>

        {/* Value Prop Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#e8e6df] text-left">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
            <div className="p-2 rounded-lg bg-white border border-[#e8e6df] text-[#23211a] shrink-0 shadow-xs">
              <Zap className="h-4 w-4 text-[#ffd439]" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#23211a]">
                60-Second Intervals
              </h3>
              <p className="text-xs text-[#5c5c5c] font-sans mt-1">
                Continuous HTTP, WebSocket & DNS checks from sovereign global edge nodes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
            <div className="p-2 rounded-lg bg-white border border-[#e8e6df] text-emerald-600 shrink-0 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#23211a]">
                Quorum Consensus
              </h3>
              <p className="text-xs text-[#5c5c5c] font-sans mt-1">
                Multi-region consensus verification prevents false alerts from transient routing
                blips.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
            <div className="p-2 rounded-lg bg-white border border-[#e8e6df] text-[#23211a] shrink-0 shadow-xs">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#23211a]">
                Multi-Channel Alerts
              </h3>
              <p className="text-xs text-[#5c5c5c] font-sans mt-1">
                Instant incident notifications to Slack, Discord, Telegram, SMS, PagerDuty &
                Webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Code snippet / instant setup preview */}
        <div className="rounded-2xl border border-black/[0.1] bg-[#23211a] text-white p-5 font-mono text-xs overflow-x-auto shadow-sm">
          <div className="flex items-center justify-between text-white/50 mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-[#ffd439]" />
              <span className="text-[#ffd439]">steadystack.config.ts</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider">Auto-provisioned Monitor</span>
          </div>
          <pre className="text-emerald-400">
            {`import { defineMonitor } from "@steadystack/core";

export default defineMonitor({
  name: "${service.name} API & Health",
  target: "https://${service.domain}",
  interval: "60s",
  consensus: { requiredRegions: 3 },
  alerts: ["slack-dev-ops", "pagerduty-p1", "discord-incidents"],
});`}
          </pre>
        </div>
      </div>
    </section>
  );
}
