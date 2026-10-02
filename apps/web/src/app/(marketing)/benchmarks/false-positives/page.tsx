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
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest mb-6">
              <Activity className="size-3" />
              Stop 3 AM Phantom Pages
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              Ready to eliminate false alarms forever?
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-8">
              Start monitoring your services with multi-region edge quorum consensus (2-of-3 on free
              and 4-of-7 on paid tiers). Zero credit card required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="h-11 px-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm rounded-lg border border-primary hover:bg-primary/90 transition-all duration-300 shadow-md"
              >
                Start Free Monitoring <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/comparison"
                className="h-11 px-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-xs rounded-lg border border-border hover:border-primary/30 transition-all duration-300"
              >
                Full Feature Matrix
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
