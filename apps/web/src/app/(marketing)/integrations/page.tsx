import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import {
  Mail,
  Hash,
  MessageSquare,
  Webhook,
  Send,
  Smartphone,
  BellRing,
  AlarmClockCheck,
  ArrowRight,
  CheckCircle2,
  Construction,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations — Alert Channels | SteadyStack",
  description:
    "All SteadyStack notification channels: Slack, Discord, PagerDuty, Opsgenie, Email, Telegram, SMS, and webhooks. Route quorum-confirmed incidents to the tools your team already uses.",
  alternates: {
    canonical: "/integrations",
  },
  openGraph: {
    title: "SteadyStack Integrations — Alert Channels",
    description:
      "Route quorum-confirmed incidents to Slack, Discord, PagerDuty, Opsgenie, email, and more.",
  },
};

interface ChannelInfo {
  name: string;
  tagline: string;
  description: string;
  status: "live" | "beta";
  plan: "free" | "paid";
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  /** Docs deep link, in UrlObject form (typed routes rejects hash-fragment string literals). */
  setup: { pathname: string; hash?: string };
}

/**
 * Dispatch status mirrors the worker's notification pipeline
 * (apps/worker/src/notification-handler.ts): EMAIL, SLACK, DISCORD,
 * PAGERDUTY and OPSGENIE are delivered by live checks; TELEGRAM, SMS and
 * generic WEBHOOK channels are configurable today with dispatch on the
 * roadmap — kept honest here on purpose.
 */
const CHANNELS: ChannelInfo[] = [
  {
    name: "Slack",
    tagline: "Rich interactive cards",
    description:
      "Interactive blocks with the affected monitor, failing region, quorum breakdown, latency, HTTP status, and a one-click runbook link. Connect via OAuth or an incoming webhook.",
    status: "live",
    plan: "free",
    icon: Hash,
    accent: "text-emerald-400",
    setup: { pathname: "/docs/alert-channels", hash: "slack" },
  },
  {
    name: "Discord",
    tagline: "Rich embeds",
    description:
      "Color-coded embeds for outages and recovery with region-level detail. One-click OAuth install or a classic Discord webhook URL.",
    status: "live",
    plan: "free",
    icon: MessageSquare,
    accent: "text-indigo-400",
    setup: { pathname: "/docs/alert-channels", hash: "discord" },
  },
  {
    name: "Email",
    tagline: "The always-there channel",
    description:
      "Localized alert emails with quorum detail. Workspace owners are emailed on status changes automatically — even with zero rules configured.",
    status: "live",
    plan: "free",
    icon: Mail,
    accent: "text-sky-400",
    setup: { pathname: "/docs/alert-channels", hash: "email" },
  },
  {
    name: "PagerDuty",
    tagline: "Events API v2",
    description:
      "Creates real PagerDuty incidents with dedup keys on quorum-confirmed downtime and auto-resolves them on recovery. No phantom open incidents.",
    status: "live",
    plan: "paid",
    icon: BellRing,
    accent: "text-green-400",
    setup: { pathname: "/docs/alert-channels", hash: "pagerduty-plangated" },
  },
  {
    name: "Opsgenie",
    tagline: "Alert API with alias dedup",
    description:
      "Alerts deduplicate by alias so repeat failures update one alert instead of paging the room. US and EU instances supported.",
    status: "live",
    plan: "paid",
    icon: AlarmClockCheck,
    accent: "text-amber-400",
    setup: { pathname: "/docs/alert-channels", hash: "opsgenie-plangated" },
  },
  {
    name: "Telegram",
    tagline: "Bot API",
    description:
      "Point a bot at any chat or group with a bot token and chat ID. Channel creation available today; live dispatch is on the roadmap.",
    status: "beta",
    plan: "free",
    icon: Send,
    accent: "text-blue-400",
    setup: { pathname: "/docs/alert-channels", hash: "telegram" },
  },
  {
    name: "SMS",
    tagline: "Mobile push fallback",
    description:
      "Text-message alerts for on-call engineers without app access. Channel creation available today; live dispatch is on the roadmap.",
    status: "beta",
    plan: "paid",
    icon: Smartphone,
    accent: "text-fuchsia-400",
    setup: { pathname: "/docs/alert-channels", hash: "sms" },
  },
  {
    name: "Webhooks",
    tagline: "Signed JSON payloads",
    description:
      "HMAC-SHA256-signed JSON payloads to any endpoint — serverless functions, remediation scripts, your own pipeline. Designed for the same contract as our incident webhooks.",
    status: "beta",
    plan: "paid",
    icon: Webhook,
    accent: "text-orange-400",
    setup: { pathname: "/docs/alert-channels", hash: "webhook" },
  },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 md:py-28 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-5 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest">
            <Webhook className="size-3" />
            8 Notification Channels
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Alerts where your team lives
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            Every channel below attaches to any of the five alert triggers —
            status change, latency, SSL expiry, DNS watchdog, domain expiry —
            and fires only when a quorum of regions confirms the failure.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/docs/alert-channels"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              Setup Guide
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-all"
            >
              Start Free
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Channel grid */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 w-full flex-1">
        <div className="grid gap-4 md:grid-cols-2">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isLive = channel.status === "live";
            return (
              <div
                key={channel.name}
                className="group p-6 rounded-xl border border-border/60 bg-muted/[0.15] hover:border-primary/30 hover:bg-muted/[0.3] transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-background/60">
                      <Icon className={`size-5 ${channel.accent}`} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{channel.name}</h2>
                      <p className="text-[11px] text-muted-foreground font-mono">{channel.tagline}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${
                      isLive
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {isLive ? (
                      <>
                        <CheckCircle2 className="size-2.5" /> Live dispatch
                      </>
                    ) : (
                      <>
                        <Construction className="size-2.5" /> Beta
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {channel.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                    {channel.plan === "free" ? "All plans" : "Paid plans"}
                  </span>
                  <Link
                    href={`${channel.setup.pathname}#${channel.setup.hash}` as Route}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-primary hover:underline"
                  >
                    Setup <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* How routing works */}
        <div className="mt-16 p-6 rounded-xl border border-primary/20 bg-primary/[0.04]">
          <h2 className="text-sm font-bold text-foreground mb-2">How routing works</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Channels are delivery targets;{" "}
            <Link href="/docs/alert-rules" className="text-primary hover:underline">
              alert rules
            </Link>{" "}
            connect them to monitors. Create channels once under{" "}
            <span className="text-foreground font-mono text-[11px]">Alerts → Notification Channels</span>,
            then attach them to rules with a trigger condition. Every channel has a{" "}
            <span className="text-foreground">Send Test</span> button that fires a real
            notification — and cleans it up immediately, so no test PagerDuty
            incident lingers. Full walkthrough in the{" "}
            <Link href="/docs/alert-channels" className="text-primary hover:underline">
              alert channels guide
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border bg-muted/[0.1]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Wire up your first channel</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Free tier includes 50 monitors, Slack, Discord, and email alerting with quorum verification.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-lg hover:bg-primary/90 transition-all font-mono uppercase tracking-wider"
            >
              Get Started Free <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/docs/integrations"
              className="inline-flex items-center px-5 py-2.5 border border-border text-foreground font-semibold text-xs rounded-lg hover:border-primary/40 transition-all font-mono"
            >
              Integration Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
