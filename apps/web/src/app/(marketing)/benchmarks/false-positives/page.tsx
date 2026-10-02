import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Terminal } from "lucide-react";
import { BenchmarkHero } from "@/components/benchmarks/benchmark-hero";
import { BenchmarkScorecard } from "@/components/benchmarks/benchmark-scorecard";
import { BenchmarkCharts } from "@/components/benchmarks/benchmark-charts";
import { IncidentExplorer } from "@/components/benchmarks/incident-explorer";
import { WhereWeLost } from "@/components/benchmarks/where-we-lost";
import { AlertFatigueCalculator } from "@/components/benchmarks/alert-fatigue-calculator";
import { MethodologySection } from "@/components/benchmarks/methodology-section";
import { ReproduceHarness } from "@/components/benchmarks/reproduce-harness";
import { BENCHMARK_METADATA } from "@/content/benchmarks-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "False-Positive Uptime Benchmark Study | SteadyStack",
  description:
    "30-day benchmark study measuring 1.29M probes across SteadyStack, UptimeRobot, and Pingdom. See real false positive rates and full raw datasets.",
  keywords: [
    "uptime monitoring benchmark",
    "false positive monitoring study",
    "SteadyStack vs UptimeRobot",
    "SteadyStack vs Pingdom",
    "quorum consensus monitoring",
    "synthetic monitoring accuracy",
    "on-call alert fatigue",
    "distributed edge monitoring",
  ],
  alternates: {
    canonical: "https://steadystack.dev/benchmarks/false-positives",
  },
  openGraph: {
    type: "article",
    url: "https://steadystack.dev/benchmarks/false-positives",
    title: "The False-Positive Benchmark Study: 30 Days, 1.29M Checks",
    description:
      "Empirical benchmark study measuring false-positive alerts across SteadyStack (4-of-7 edge quorum), UptimeRobot, and Pingdom over 30 continuous days.",
    siteName: "SteadyStack",
  },
  twitter: {
    card: "summary_large_image",
    title: "The False-Positive Benchmark Study (30 Days, 1.29M Checks)",
    description:
      "We tested SteadyStack, UptimeRobot, and Pingdom against identical endpoints for 30 days. Here is the raw data, methodology, and results — including anywhere we lost.",
  },
};

export default function FalsePositivesBenchmarkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline:
          "The False-Positive Benchmark Study: Measuring Spurious Alerts Across 1.29M Synthetic Checks",
        description:
          "Empirical evaluation comparing false-positive alert rates across 3 major synthetic uptime platforms over 30 continuous days.",
        datePublished: "2026-07-01T00:00:00Z",
        dateModified: "2026-08-15T00:00:00Z",
        author: {
          "@type": "Organization",
          name: "SteadyStack Research Team",
          url: "https://steadystack.dev",
        },
        creator: {
          "@type": "Organization",
          name: "SteadyStack Research Team",
          url: "https://steadystack.dev",
        },
        publisher: {
          "@type": "Organization",
          name: "SteadyStack",
          url: "https://steadystack.dev",
        },
        mainEntityOfPage: "https://steadystack.dev/benchmarks/false-positives",
      },
      {
        "@type": "Dataset",
        name: "30-Day Synthetic Monitoring False-Positive Benchmark Dataset",
        description:
          "Raw JSON and CSV log of 1,296,000 synthetic uptime checks and 69 incident events across 10 identical endpoints tested by SteadyStack, UptimeRobot, and Pingdom.",
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: {
          "@type": "Organization",
          name: "SteadyStack Research Team",
          url: "https://steadystack.dev",
        },
        url: "https://steadystack.dev/benchmarks/false-positives",
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: "https://steadystack.dev/data/false-positive-benchmark-30d.json",
          },
          {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: "https://steadystack.dev/data/false-positive-benchmark-30d.csv",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col w-full min-h-screen">
        {/* Hero Section */}
        <BenchmarkHero />

        {/* Scorecard / Performance Matrix */}
        <BenchmarkScorecard />

        {/* Interactive Charts & Time Series */}
        <BenchmarkCharts />

        {/* Raw Incident Explorer & Ground Truth Ledger */}
        <IncidentExplorer />

        {/* Where We Lost (Transparent Trade-offs) */}
        <WhereWeLost />

        {/* Alert Fatigue & Financial ROI Calculator */}
        <AlertFatigueCalculator />

        {/* Methodology & Fleet Specification */}
        <MethodologySection />

        {/* Reproduce Harness & Dataset Hashes */}
        <ReproduceHarness />

        {/* Bottom CTA Banner */}
        <section className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]">
          <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-20 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
            {/* Soft Warm Radial Glow */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Activity className="size-3.5 text-[#ffd439]" />
              <span>Stop 3 AM Phantom Pages</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-[1.06] mb-6 max-w-3xl text-balance">
              Ready to eliminate false alarms forever?
            </h2>

            <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 font-sans leading-relaxed text-balance">
              Start monitoring your services with multi-region edge quorum consensus (2-of-3 on free
              and 4-of-7 on paid tiers). Zero credit card required.
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
                href="/comparison"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
              >
                <span>Full Feature Matrix</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>50 monitors free forever</span>
              </div>
              <span>·</span>
              <span>No credit card required</span>
              <span>·</span>
              <span>Instant quorum setup</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
