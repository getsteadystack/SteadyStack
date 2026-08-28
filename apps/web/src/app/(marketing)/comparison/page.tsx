import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  IntervalComparison,
  DowntimeComparison,
  FeatureComparisonTable,
  TimeSavingCalculator,
} from "@/components/landing/timeline-visualization";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SteadyStack vs Competitors: Uptime Monitoring Compared",
  description:
    "Compare SteadyStack vs UptimeRobot, Better Stack, and OpenStatus. 1-minute free checks and multi-region consensus mean 5x faster outage detection.",
  alternates: {
    canonical: "/comparison",
  },
  openGraph: {
    title: "SteadyStack vs Competitors: Uptime Monitoring Compared",
    description:
      "1-minute free checks vs the industry 5-minute standard. 400% faster detection, 5x more checks per day.",
  },
};

export default function ComparisonPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-28 md:py-36 bg-background relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest">
            <Activity className="size-3" />
            Better Than Industry Standard
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.1]">
            5 minutes is{" "}
            <span className="text-primary underline decoration-primary/30 decoration-2 underline-offset-4">
              too long
            </span>
            .
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            The monitoring industry has settled on a 5-minute free tier as &ldquo;standard.&rdquo;
            We think that&apos;s a relic. SteadyStack gives you{" "}
            <span className="text-foreground font-bold">1-minute checks for free</span> — 400%
            faster detection, 5x more data points, and less downtime you have to explain to your
            customers.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 h-10 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-lg border border-primary hover:bg-primary/90 transition-all duration-300"
            >
              Start Free Trial <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center h-10 px-6 text-muted-foreground hover:text-foreground font-semibold text-xs rounded-lg border border-border hover:border-primary/30 transition-all duration-300"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Interval Comparison */}
      <section className="py-20 bg-background relative overflow-hidden border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>The Interval Gap</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              See the difference 240 seconds makes
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              Scroll through the check intervals side by side. SteadyStack&apos;s free 1-minute
              interval means you detect problems before your competitors even run their first check.
            </p>
          </div>
          <IntervalComparison />
        </div>
      </section>

      {/* Real-World Detection Timeline */}
      <section className="py-20 bg-background relative overflow-hidden border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>Real-World Scenarios</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              How downtime plays out
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              When your server goes down, every second counts. See how SteadyStack&apos;s faster
              check interval catches failures up to 4 minutes earlier than the competition.
            </p>
          </div>
          <DowntimeComparison />
        </div>
      </section>

      {/* The Math */}
      <section className="py-20 bg-background relative overflow-hidden border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>The Numbers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              Do the math yourself
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              Adjust the slider to see how SteadyStack&apos;s faster checks compound across your
              monitoring fleet.
            </p>
          </div>
          <TimeSavingCalculator />
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-background relative overflow-hidden border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>Feature Parity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              Full feature comparison
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              SteadyStack doesn&apos;t just win on check intervals. See how we stack up across every
              feature that matters for modern infrastructure monitoring.
            </p>
          </div>
          <FeatureComparisonTable />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest mb-6">
            <Activity className="size-3" />
            Stop Settling for 5 Minutes
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.15]">
            Get 1-minute checks.
            <br />
            <span className="text-primary">Free. Forever.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-8">
            No credit card required. No time limit on the free tier. Just faster monitoring from day
            one.
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
