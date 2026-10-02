import { Activity, ArrowRight, ShieldCheck, Zap, Globe, Lock, Cpu, Server } from "lucide-react";
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
  title: "SteadyStack vs Competitors | Synthetic Monitoring Comparison",
  description:
    "Compare SteadyStack against UptimeRobot, Better Stack, and Checkly. See why 1-minute free multi-region quorum consensus eliminates blindspots and false alarms.",
  alternates: {
    canonical: "https://steadystack.dev/comparison",
  },
  openGraph: {
    title: "SteadyStack vs Competitors | Synthetic Monitoring Comparison",
    description:
      "1-minute free checks and multi-region quorum consensus vs the industry 5-minute standard. 400% faster outage detection.",
    type: "website",
    url: "https://steadystack.dev/comparison",
  },
};

export default function ComparisonPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#fbfbf9] text-[#23211a]">
      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-24 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <span className="size-2 rounded-full bg-[#ffd439]" />
            <span>Honest Engineering Benchmark · August 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] max-w-4xl leading-[1.08] text-balance">
            5 minutes is too long for an outage.
          </h1>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl font-sans text-balance">
            Legacy monitoring platforms normalized a 5-minute free poll interval. SteadyStack gives
            you{" "}
            <strong className="text-[#23211a] font-semibold">
              1-minute multi-region quorum checks for free
            </strong>{" "}
            — catching failures up to 400% faster with zero phantom alarm noise.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#23211a] hover:bg-black text-[#ffd439] font-semibold text-sm rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Start Free Monitoring</span>
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#matrix"
              className="inline-flex items-center justify-center h-12 px-6 bg-white hover:bg-[#f0ede6] text-[#23211a] font-medium text-sm rounded-xl border border-[#e8e6df] transition-all w-full sm:w-auto shadow-xs"
            >
              <span>Explore 35+ Feature Matrix</span>
            </a>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-6 pt-8 border-t border-[#e8e6df] text-left">
            <div className="p-4 rounded-xl bg-white border border-[#e8e6df] shadow-xs">
              <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                Interval
              </span>
              <p className="text-xl font-serif font-medium text-[#23211a] mt-0.5">60 Seconds</p>
              <p className="text-[11px] text-[#5c5c5c] mt-0.5">Free on first 10 monitors</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e6df] shadow-xs">
              <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                Consensus
              </span>
              <p className="text-xl font-serif font-medium text-[#23211a] mt-0.5">2-of-3 Quorum</p>
              <p className="text-[11px] text-[#5c5c5c] mt-0.5">Multi-region edge consensus</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e6df] shadow-xs">
              <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                Capacity
              </span>
              <p className="text-xl font-serif font-medium text-[#23211a] mt-0.5">50 Monitors</p>
              <p className="text-[11px] text-[#5c5c5c] mt-0.5">Free forever, commercial use</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e6df] shadow-xs">
              <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                Telemetry
              </span>
              <p className="text-xl font-serif font-medium text-[#23211a] mt-0.5">
                Zero Secret IPs
              </p>
              <p className="text-[11px] text-[#5c5c5c] mt-0.5">Authenticated WAF headers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interval Comparison Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>01 · The Frequency Gap</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              See the difference 240 seconds makes
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              When an API gateway fails or an SSL cert expires, 5 minutes is an eternity.
              SteadyStack&apos;s 1-minute cadence delivers 5x more observability samples with zero
              gap in visibility.
            </p>
          </div>
          <IntervalComparison />
        </div>
      </section>

      {/* Real-World Detection Scenarios Timeline */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df] bg-[#f5f3ec]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>02 · Incident Timelines</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              How downtime plays out in production
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              Explore four real-world production incident scenarios. See exactly when SteadyStack
              confirms the outage via multi-region quorum versus when legacy single-probe monitors
              finally notice.
            </p>
          </div>
          <DowntimeComparison />
        </div>
      </section>

      {/* The Fleet Compounding Math */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>03 · Mathematical Compounding</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              Do the math for your infrastructure
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              Adjust the slider to simulate your active endpoint count. See how faster check cadence
              multiplies visibility across your microservices.
            </p>
          </div>
          <TimeSavingCalculator />
        </div>
      </section>

      {/* Why Quorum Consensus Matters */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>Architectural Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              Speed means nothing if your pager cries wolf
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              Most platforms don&apos;t offer 1-minute checks on free plans because single-probe
              architectures generate massive false positive storms during ISP hiccups. SteadyStack
              solved this with distributed edge consensus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/40 border border-rose-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase font-semibold text-rose-700 tracking-wider">
                  Legacy Architecture
                </span>
                <h3 className="text-xl font-serif font-medium text-rose-950 mt-2 mb-3">
                  Single-Probe Polling
                </h3>
                <p className="text-xs text-rose-900/80 leading-relaxed mb-4">
                  A single server in AWS us-east-1 pings your site. If that single datacenter
                  experiences a transient BGP route flap, your on-call engineer gets woken up at 3
                  AM for a false alarm.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-rose-800 pt-4 border-t border-rose-200">
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Single point of synthetic
                  failure
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">✕</span> False positives from regional
                  transit issues
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Static IPs that get blocked by
                  Cloudflare WAFs
                </li>
              </ul>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#ffd439]/10 border border-[#ffd439] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase font-semibold text-[#23211a] tracking-wider">
                  SteadyStack Architecture
                </span>
                <h3 className="text-xl font-serif font-medium text-[#23211a] mt-2 mb-3">
                  Multi-Region Edge Quorum
                </h3>
                <p className="text-xs text-[#5c5c5c] leading-relaxed mb-4">
                  Every check executes simultaneously from independent global edge regions (US, EU,
                  APAC). An alert only fires when a strict quorum (2-of-3 on Free, 4-of-7 on Paid)
                  independently confirms downtime.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-[#23211a] pt-4 border-t border-[#ffd439]/40">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> Mathematically impossible
                  single-node false alarm
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> Multi-ASN independent
                  routing validation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> Cryptographic WAF
                  allowlisting (Zero spoofing)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Feature Comparison Matrix */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>04 · Deep Technical Parity</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              Full 35+ capability feature matrix
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              SteadyStack is engineered for developers, agencies, and enterprise site reliability
              teams. Compare our protocol support, consensus guarantees, and developer tooling side
              by side.
            </p>
          </div>
          <FeatureComparisonTable />
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]">
        <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-20 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          {/* Soft Warm Radial Glow */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Activity className="size-3.5 text-[#ffd439]" />
            <span>Stop Settling for 5 Minutes</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-[1.06] mb-6 max-w-3xl text-balance">
            Faster checks. Zero false alerts. Free forever.
          </h2>

          <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 font-sans leading-relaxed text-balance">
            Monitor up to 50 endpoints with 1-minute check intervals and multi-region edge
            consensus. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Start Free Monitoring</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/benchmarks/false-positives"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <span>View False-Positive Study</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>50 monitors free forever</span>
            </div>
            <span>·</span>
            <span>Zero credit card required</span>
            <span>·</span>
            <span>Instant setup in 60 seconds</span>
          </div>
        </div>
      </section>
    </div>
  );
}
