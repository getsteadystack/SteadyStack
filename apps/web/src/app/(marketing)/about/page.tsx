import type { Metadata } from "next";
import {
  Activity,
  Globe,
  Shield,
  Bell,
  Brain,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PRODUCT_CONFIG } from "@steadystack/shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About SteadyStack | Global Uptime Monitoring for Web Agencies",
  description:
    "SteadyStack was built to make infrastructure monitoring fast, accurate, and multi-tenant for modern web agencies and dev shops.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SteadyStack",
    description:
      "Built to make infrastructure monitoring fast, accurate, and multi-tenant for web agencies.",
  },
};

const values = [
  {
    icon: Brain,
    title: "Detect Outages Faster",
    description:
      "60-second checks on the free plan and 30-second checks on paid tiers across 7 sovereign quorum regions. We catch failures before your clients do.",
  },
  {
    icon: Shield,
    title: "Multi-Region Quorum Verification",
    description:
      "Distributed consensus ensures alerts are mathematically verified. Zero single-probe false alarms, zero wasted midnight callouts.",
  },
  {
    icon: Bell,
    title: "Precision Multi-Channel Routing",
    description:
      "Route critical incidents to Slack, PagerDuty, Discord, SMS, or webhooks with granular threshold policies per client workspace.",
  },
  {
    icon: Globe,
    title: "Global by Default",
    description:
      "7 sovereign edge regions across North America, Europe, and Asia-Pacific, backed by independent out-of-band sentinel nodes.",
  },
  {
    icon: Cpu,
    title: "Engineered for Agencies",
    description:
      "Multi-tenant client workspaces, automated monthly PDF SLA certificates, and recurring retainer margin calculators built right in.",
  },
  {
    icon: Activity,
    title: "White-Label Status Pages",
    description:
      "Modern, branded status pages with custom CNAME subdomains, custom logos, and client-ready incident communication workflows.",
  },
];

const stats = [
  { label: "Quorum Regions", value: "7" },
  { label: "Free Monitors", value: "50" },
  { label: "Check Interval", value: "60s" },
  { label: "False Alarm Rate", value: "0.0%" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a] font-sans">
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-24 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>About SteadyStack</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] max-w-4xl leading-[1.08] text-balance">
            Monitoring infrastructure shouldn&apos;t feel like infrastructure.
          </h1>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl font-sans text-balance">
            SteadyStack was created to solve a simple problem: most monitoring tools are either too
            slow, too noisy, or too complicated for multi-client agencies. We fixed all three.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm w-full sm:w-auto"
            >
              <span>Start Free Monitoring</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/agencies"
              className="inline-flex items-center justify-center h-12 px-6 bg-white hover:bg-[#f0ede6] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl border border-[#e8e6df] transition-all w-full sm:w-auto shadow-xs"
            >
              <span>Agency Platform</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-[#e8e6df] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df]"
              >
                <p className="text-3xl sm:text-4xl font-serif font-medium text-[#23211a] mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>Our Story & Mission</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a]">
              Built by developers who were tired of waiting 5 minutes for alerts
            </h2>
            <div className="space-y-4 text-[#5c5c5c] text-sm sm:text-base leading-relaxed font-sans">
              <p>
                Every monitoring tool on the market had normalized the same flawed standard: a
                5-minute poll interval on the free tier. That meant 10 minutes of blindspot downtime
                before an engineer was even paged. For web development agencies managing client
                stores and critical web apps, that resulted in awkward client calls and lost trust.
              </p>
              <p>
                We built SteadyStack to change that. Our free tier checks endpoints every 60 seconds
                across 3 geographic edge regions with 2-of-3 quorum consensus (and 4-of-7 on paid
                plans). By verifying outages across multiple independent zones before sounding the
                alarm, we mathematically eliminated single-node transit blips and false alarms.
              </p>
              <p>
                With SteadyStack v2.0, we expanded the platform into the premier multi-tenant
                monitoring suite for agencies — packaging isolated client workspaces, white-label
                CNAME status portals, and automated monthly SLA PDF delivery into one cohesive
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-[#e8e6df] bg-[#f5f3ec]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-3xl mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <span>Core Values</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a]">
              The SteadyStack way
            </h2>
            <p className="text-[#5c5c5c] text-base leading-relaxed font-sans">
              Every architectural decision and feature we build is guided by these engineering
              principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs"
                >
                  <div className="size-10 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a] flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-[#23211a]">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Container */}
      <section className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]">
        <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-20 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Activity className="size-3.5 text-[#ffd439]" />
            <span>Ready for Zero False Alarms</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-[1.06] mb-6 max-w-3xl text-balance">
            Monitor the right way with edge quorum consensus.
          </h2>

          <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 font-sans leading-relaxed text-balance">
            50 free monitors with 1-minute check intervals and multi-region consensus. Zero credit
            card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Start Free Monitoring</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/benchmarks/false-positives"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <span>Read Benchmark Study</span>
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
            <span>Instant setup in 60s</span>
          </div>
        </div>
      </section>
    </div>
  );
}
