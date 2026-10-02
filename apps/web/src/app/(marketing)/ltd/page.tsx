import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Globe,
  Server,
  FileText,
  Clock,
  Layers,
  Infinity as InfinityIcon,
  HelpCircle,
  TrendingDown,
  DollarSign,
  Award,
  Users,
} from "lucide-react";
import LtdSpotlight from "@/components/landing/ltd-spotlight";
import LtdSavingsCalculator from "@/components/landing/ltd-savings-calculator";
import LtdFaq from "@/components/landing/ltd-faq";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lifetime Deal (LTD) — Pay Once, Monitor Forever | SteadyStack",
  description:
    "Exclusive Founder Lifetime Deal for SteadyStack. Get up to 1,500 edge monitors, 7-region quorum consensus, 100% white-label status portals, and automated monthly SLA reports for a single one-time payment starting at $49.",
  alternates: {
    canonical: "https://steadystack.dev/ltd",
  },
  openGraph: {
    title: "SteadyStack Lifetime Deal (LTD) — Founder Edition",
    description:
      "Eliminate monthly monitoring bills forever. Lifetime access to 7-region quorum uptime monitoring, white-label client portals, and automated SLA PDFs for agencies.",
    url: "https://steadystack.dev/ltd",
    siteName: "SteadyStack",
    type: "website",
  },
};

export default function LtdPage() {
  const comparisonRows = [
    {
      feature: "Active Edge Monitors",
      tier1: "150 Monitors",
      tier2: "250 Monitors",
      tier3: "1,500 Monitors",
    },
    {
      feature: "Check Frequency",
      tier1: "60 seconds",
      tier2: "30 seconds",
      tier3: "10 seconds (High Frequency)",
    },
    {
      feature: "Edge Quorum Consensus",
      tier1: "3 Regions (2-of-3)",
      tier2: "7 Regions (4-of-7)",
      tier3: "7 Regions (4-of-7)",
    },
    {
      feature: "Global Edge Probe Regions",
      tier1: "3 Core Regions",
      tier2: "All 7 Edge Regions",
      tier3: "All 7 Edge Regions + Priority Queue",
    },
    {
      feature: "White-Label Status Portals",
      tier1: "3 Portals",
      tier2: "10 Portals",
      tier3: "100 Portals (Unlimited CNAMEs)",
    },
    {
      feature: "Custom Domains (CNAME + SSL)",
      tier1: "Yes (3 Domains)",
      tier2: "Yes (10 Domains)",
      tier3: "Yes (Unlimited)",
    },
    {
      feature: "Team Seats",
      tier1: "3 Seats",
      tier2: "10 Seats",
      tier3: "50 Seats + RBAC Permissions",
    },
    {
      feature: "Automated Monthly Client SLA PDFs",
      tier1: "Manual Export",
      tier2: "Automated Dispatch",
      tier3: "Automated Multi-Client Dispatch + Custom Logo",
    },
    {
      feature: "Telemetry & Metric Retention",
      tier1: "30 Days",
      tier2: "45 Days",
      tier3: "365 Days (1 Full Year)",
    },
    {
      feature: "Manual Run-Checks Limit",
      tier1: "5 per 5-min window",
      tier2: "10 per 5-min window",
      tier3: "Unlimited (0 rate limit)",
    },
    {
      feature: "Alert Channels (Slack, Discord, Webhooks, Email)",
      tier1: "10 Channels",
      tier2: "25 Channels",
      tier3: "250 Channels",
    },
    {
      feature: "Future Core Roadmap Upgrades",
      tier1: "Included",
      tier2: "Included",
      tier3: "Included + Priority Beta Access",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a]">
      {/* Editorial Hero */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#e8e6df] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Live Scarcity Counter */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-xs whitespace-nowrap">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffd439] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffd439]" />
            </span>
            <span>Founder Cohort 1 • Limited Lifetime Launch</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.06] text-balance max-w-4xl mx-auto">
            The only uptime monitoring deal you will ever need.
          </h1>

          <p className="text-[#5c5c5c] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 text-balance">
            Never pay $60 to $200 every single month for basic pingers. Lock in 7-region quorum
            verification, white-label client portals, and automated SLA reports for life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/signup?deal=ltd-tier-3"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#23211a] text-white text-sm font-semibold px-6 py-4 shadow-md hover:bg-[#373428] transition-all"
            >
              <span>Claim Founder Lifetime Deal ($199)</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/redeem"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8e6df] bg-white text-[#23211a] text-sm font-semibold px-6 py-4 hover:bg-[#f4f2eb] transition-all"
            >
              <span>Already purchased? Redeem Code</span>
            </Link>
          </div>

          {/* Social Proof Trust Bar */}
          <div className="pt-8 border-t border-[#e8e6df] flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono text-[#5c5c5c]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>60-Day 100% Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-[#ffd439]" />
              <span>Cloudflare Edge-Quorum Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="size-4 text-[#23211a]" />
              <span>Stackable Codes (Up to Tier 3)</span>
            </div>
          </div>
        </div>
      </section>

      {/* LTD Pricing Section */}
      <LtdSpotlight />

      {/* Interactive Savings Calculator */}
      <LtdSavingsCalculator />

      {/* Detailed Feature Comparison Matrix */}
      <section className="py-20 md:py-28 bg-[#fbfbf9] border-b border-[#e8e6df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Layers className="size-3.5 text-[#ffd439]" />
              <span>Tier Comparison Matrix</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
              Compare Lifetime Deal Tiers
            </h2>
            <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
              Every tier includes commercial rights, zero recurring costs, and lifetime access to
              our edge-native quorum engine.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="rounded-3xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e8e6df] bg-[#faf8f5]">
                    <th className="p-4 sm:p-6 text-xs font-mono font-bold text-[#868279] uppercase tracking-wider w-1/3">
                      Features & Limits
                    </th>
                    <th className="p-4 sm:p-6 text-xs font-mono font-bold text-[#23211a] uppercase tracking-wider text-center">
                      Tier 1 ($49)
                    </th>
                    <th className="p-4 sm:p-6 text-xs font-mono font-bold text-[#23211a] uppercase tracking-wider text-center">
                      Tier 2 ($99)
                    </th>
                    <th className="p-4 sm:p-6 text-xs font-mono font-bold text-[#23211a] uppercase tracking-wider text-center bg-[#ffd439]/10">
                      Tier 3 ($199) ★
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e6df] text-xs sm:text-sm font-sans">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfbf9]/60 transition-colors">
                      <td className="p-4 sm:p-6 font-semibold text-[#23211a]">{row.feature}</td>
                      <td className="p-4 sm:p-6 text-center text-[#5c5c5c]">{row.tier1}</td>
                      <td className="p-4 sm:p-6 text-center text-[#5c5c5c] font-medium">
                        {row.tier2}
                      </td>
                      <td className="p-4 sm:p-6 text-center font-bold text-[#23211a] bg-[#ffd439]/5">
                        {row.tier3}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Action Row */}
            <div className="p-6 bg-[#faf8f5] border-t border-[#e8e6df] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/signup?deal=ltd-tier-1"
                className="py-3 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#23211a] font-semibold text-xs text-center transition-all shadow-xs"
              >
                Get Tier 1 ($49)
              </Link>
              <Link
                href="/signup?deal=ltd-tier-2"
                className="py-3 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#23211a] font-semibold text-xs text-center transition-all shadow-xs"
              >
                Get Tier 2 ($99)
              </Link>
              <Link
                href="/signup?deal=ltd-tier-3"
                className="py-3 rounded-xl bg-[#23211a] hover:bg-[#373428] text-white font-semibold text-xs text-center transition-all shadow-md"
              >
                Get Tier 3 ($199)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <LtdFaq />

      {/* Bottom CTA Banner (Matching Landing CTA Style) */}
      <section className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]">
        <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-20 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          {/* Soft Warm Radial Glow */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>60-Day Money-Back Guarantee</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-[1.06] mb-6 max-w-3xl text-balance">
            Ready to permanently eliminate monitoring overhead?
          </h2>

          <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 font-sans leading-relaxed text-balance">
            Join agencies and engineering teams who have replaced recurring monthly SaaS bills with
            SteadyStack&apos;s edge quorum monitoring platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
            <Link
              href="/signup?deal=ltd-tier-3"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Get Founder Lifetime Deal ($199)</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/redeem"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <span>Redeem License Code</span>
            </Link>
          </div>

          {/* Bottom Trust Line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>100% Risk-Free Refund Policy</span>
            </div>
            <span>·</span>
            <span>Stackable Codes</span>
            <span>·</span>
            <span>All Future Edge Regions Included</span>
          </div>
        </div>
      </section>
    </div>
  );
}
