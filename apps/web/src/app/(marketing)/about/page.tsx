import type { Metadata } from "next";
import { Activity, Globe, Shield, Bell, Brain, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRODUCT_CONFIG } from "@steadystack/shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About SteadyStack | Global Uptime Monitoring",
  description:
    "SteadyStack was built to make infrastructure monitoring fast, accurate, and beautiful. Learn our story and meet the team.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SteadyStack",
    description: "Built to make infrastructure monitoring fast, accurate, and beautiful.",
  },
};

const values = [
  {
    icon: Brain,
    title: "Detect Faster",
    description: `${PRODUCT_CONFIG.DEFAULT_CHECK_INTERVAL_SECONDS}-second check intervals across 7 sovereign quorum regions. We catch failures before your users do.`,
  },
  {
    icon: Shield,
    title: "4-of-7 Quorum Verification",
    description:
      "4-of-7 multi-region consensus verification ensures alerts are real. No noise, no wasted midnight callouts.",
  },
  {
    icon: Bell,
    title: "Alert with Precision",
    description:
      "Route alerts to Slack, PagerDuty, email, or webhooks. Granular thresholds per monitor.",
  },
  {
    icon: Globe,
    title: "Global by Default",
    description:
      "7 sovereign edge regions across North America, Europe, and Asia-Pacific, backed by an independent out-of-band Hetzner sentinel.",
  },
  {
    icon: Cpu,
    title: "Engineered for Scale",
    description:
      "From side projects to enterprise fleets. Our architecture scales horizontally with your needs.",
  },
  {
    icon: Activity,
    title: "Beautiful Status Pages",
    description: "Cyberpunk-themed status pages that your users will actually enjoy checking.",
  },
];

const stats = [
  { label: "Quorum Regions", value: "7" },
  {
    label: "Free Monitors",
    value: "50",
  },
  {
    label: "Check Interval",
    value: `${PRODUCT_CONFIG.DEFAULT_CHECK_INTERVAL_SECONDS}s`,
  },
  { label: "Latency Goal", value: `<${PRODUCT_CONFIG.LATENCY_GOAL_MS}ms` },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-28 md:py-36 bg-background relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest">
            <Activity className="size-3" />
            About SteadyStack
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.1]">
            Monitoring infrastructure shouldn&apos;t feel like infrastructure
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            SteadyStack was created to solve a simple problem: most monitoring tools are either too
            slow, too noisy, or too ugly. We fixed all three.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-background/50">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>Our Story</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-6">
              Built by engineers who were tired of waiting
            </h2>
            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
              <p>
                Every monitoring tool on the market had the same problem: a 5-minute check interval
                on the free tier. That means 10 minutes of undetected downtime before you even get
                an alert. In 2026, that&apos;s unacceptable.
              </p>
              <p>
                We built SteadyStack to do better. Our free tier checks every{" "}
                {PRODUCT_CONFIG.DEFAULT_CHECK_INTERVAL_SECONDS} seconds across 7 sovereign
                Cloudflare edge regions with 4-of-7 quorum consensus (backed by an independent
                out-of-band Hetzner sentinel). We verify failures across multiple nodes before
                alerting — so you never chase a ghost.
              </p>
              <p>
                And we made it look good. Because if you&apos;re going to stare at a dashboard all
                day, it should be a dashboard you actually enjoy looking at.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/[0.02] to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 md:px-12 relative">
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>Core Principles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              The SteadyStack way
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every decision we make is guided by these principles.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-card p-8 flex flex-col gap-4">
                  <div className="size-10 rounded-lg border border-border bg-background flex items-center justify-center">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest mb-6">
            <Activity className="size-3" />
            Get Started
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.15]">
            Ready to monitor the right way?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-8">
            50 free monitors forever with 3-region 2-of-3 quorum consensus. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 h-11 px-8 bg-primary text-primary-foreground font-bold text-sm rounded-lg border border-primary hover:bg-primary/90 transition-all duration-300"
          >
            Start Free Trial <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
