"use client";

import {
  Activity,
  ShieldCheck,
  Download,
  Share2,
  Check,
  ExternalLink,
  Terminal,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { BENCHMARK_METADATA } from "@/content/benchmarks-data";

export function BenchmarkHero() {
  const [copiedCitation, setCopiedCitation] = useState(false);

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(BENCHMARK_METADATA.citationMarkdown);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-[#e8e6df] bg-[#fbfbf9] text-[#23211a]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        {/* Badges / Header Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold tracking-wide uppercase shadow-xs">
            <Activity className="size-3.5 text-emerald-600" />
            <span>30-Day Empirical Study</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold shadow-xs">
            <ShieldCheck className="size-3.5" />
            <span>1,296,000 Verified Probes</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#5c5c5c] text-[11px] font-mono shadow-xs">
            <Sparkles className="size-3 text-[#ffd439]" />
            <span>Independent Ground-Truth Study</span>
          </span>
        </div>

        {/* Main Headline (Twin.so Serif Style) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] max-w-4xl leading-[1.08] mb-6 text-balance">
          The False-Positive <br className="hidden sm:inline" />
          <span className="italic font-normal">Benchmark Study</span>
        </h1>

        {/* Subtitle / Positioning */}
        <p className="text-[#5c5c5c] text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10 font-sans text-balance">
          We ran <strong className="text-[#23211a]">SteadyStack</strong>,{" "}
          <strong className="text-[#23211a]">UptimeRobot</strong>, and{" "}
          <strong className="text-[#23211a]">Pingdom</strong> against 10 identical endpoints for 30
          days. We counted every single spurious alert, measured detection latency, published the
          methodology, and released the complete dataset —{" "}
          <span className="font-semibold text-[#23211a]">
            including the 3 scenarios where we lost.
          </span>
        </p>

        {/* Executive Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-4xl mb-10 text-left">
          <div className="p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider font-bold">
              Spurious Alerts (SteadyStack)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-serif font-semibold text-emerald-600">
                0
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">0.00% error</span>
            </div>
            <span className="text-[10px] text-[#868279] mt-1 font-mono">vs 28 (UR) & 41 (PD)</span>
          </div>

          <div className="p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider font-bold">
              Consensus Speed
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-serif font-semibold text-[#23211a]">
                840
              </span>
              <span className="text-xs font-semibold text-[#868279] font-mono">ms</span>
            </div>
            <span className="text-[10px] text-[#868279] mt-1 font-mono">
              Parallel 4-of-7 Quorum
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider font-bold">
              True Recall Rate
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-serif font-semibold text-emerald-600">
                100%
              </span>
              <span className="text-xs font-semibold text-[#868279] font-mono">4 / 4</span>
            </div>
            <span className="text-[10px] text-[#868279] mt-1 font-mono">All outages caught</span>
          </div>

          <div className="p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider font-bold">
              Raw Probes Analyzed
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-serif font-semibold text-[#23211a]">
                1.29M
              </span>
              <span className="text-xs font-semibold text-[#868279] font-mono">checks</span>
            </div>
            <span className="text-[10px] text-[#868279] mt-1 font-mono">30 days @ 60s cadence</span>
          </div>
        </div>

        {/* CTA Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#incident-explorer"
            className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[#23211a] text-white font-mono font-semibold text-xs uppercase tracking-wider shadow-md hover:bg-[#373428] transition-all cursor-pointer"
          >
            Explore Raw Incident Log
          </a>

          <a
            href="/data/false-positive-benchmark-30d.json"
            download="false-positive-benchmark-30d.json"
            className="h-11 px-5 inline-flex items-center gap-2 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#23211a] font-mono font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="size-3.5 text-[#23211a]" />
            Download Dataset (JSON)
          </a>

          <a
            href="/data/false-positive-benchmark-30d.csv"
            download="false-positive-benchmark-30d.csv"
            className="h-11 px-5 inline-flex items-center gap-2 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#23211a] font-mono font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="size-3.5 text-emerald-600" />
            Download CSV
          </a>

          <button
            type="button"
            onClick={handleCopyCitation}
            className="h-11 px-4 inline-flex items-center gap-2 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#5c5c5c] hover:text-[#23211a] font-mono text-xs transition-all shadow-xs cursor-pointer"
            title="Copy academic / markdown citation"
          >
            {copiedCitation ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Citation Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span>Cite Study</span>
              </>
            )}
          </button>
        </div>

        {/* Trust & Open Source Note */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-[#868279] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-600" />
            SHA-256 Verified Dataset
          </span>
          <span>•</span>
          <Link
            href="https://github.com/getsteadystack/SteadyStack"
            target="_blank"
            className="hover:text-[#23211a] transition-colors flex items-center gap-1 font-semibold"
          >
            <Terminal className="size-3 text-[#23211a]" />
            github.com/getsteadystack/SteadyStack
            <ExternalLink className="size-2.5 opacity-60" />
          </Link>
        </div>
      </div>
    </section>
  );
}
