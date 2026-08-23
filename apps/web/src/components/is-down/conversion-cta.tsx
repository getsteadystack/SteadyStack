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
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-b from-card via-card/90 to-background p-8 md:p-12 shadow-2xl">
      {/* Background Accent Gradients */}
      <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <BellRing className="h-3.5 w-3.5 animate-pulse" />
              <span>Automated Developer Alerting</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Stop checking manually.
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              When <span className="font-semibold text-foreground">{service.name}</span> goes down
              or suffers silent latency degradation, you shouldn't be refreshing status pages,
              searching social feeds, or waiting for angry user reports. Get alerted the exact
              second {service.name} fails.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href={setupUrl as any}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto text-base font-bold px-8 py-6 shadow-xl bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 group",
              )}
            >
              <span>Monitor {service.name} in 1 Click</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Free 50 monitors • 3m standard (1m for first 10) • 2-of-3 Edge Quorum • No credit card
              required
            </p>
          </div>
        </div>

        {/* Value Prop Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/60 text-left">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="p-2 rounded-lg bg-background text-emerald-500 shrink-0 shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">10-Second Edge Intervals</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Continuous HTTP, WebSocket & DNS checks from 15+ global edge nodes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="p-2 rounded-lg bg-background text-cyan-500 shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">4-of-7 Quorum Verification</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Multi-region consensus verification prevents 3 AM wakeups from transient routing
                blips.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="p-2 rounded-lg bg-background text-amber-500 shrink-0 shadow-xs">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Multi-Channel Escalation</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Instant alerts to Slack, Discord, Telegram, SMS, PagerDuty & Webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Code snippet / instant setup preview */}
        <div className="rounded-xl border border-border/60 bg-black/60 p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
          <div className="flex items-center justify-between text-muted-foreground/60 mb-2 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>steadystack.config.ts</span>
            </div>
            <span>Auto-provisioned Monitor</span>
          </div>
          <pre className="text-emerald-400">
            {`import { defineMonitor } from "@steadystack/core";

export default defineMonitor({
  name: "${service.name} API & Health",
  target: "https://${service.domain}",
  interval: "10s",
  consensus: { requiredRegions: 3 },
  alerts: ["slack-dev-ops", "pagerduty-p1", "discord-incidents"],
});`}
          </pre>
        </div>
      </div>
    </section>
  );
}
