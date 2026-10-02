"use client";

import { useState } from "react";
import { Terminal, Copy, Check, ExternalLink, ShieldCheck, Database, FileCode } from "lucide-react";
import Link from "next/link";
import { BENCHMARK_METADATA } from "@/content/benchmarks-data";

export function ReproduceHarness() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const reproduceCommand = `# 1. Clone repository & install dependencies
git clone https://github.com/getsteadystack/SteadyStack.git
cd steadystack && bun install

# 2. Run standalone benchmark verification script against raw dataset
bun scripts/verify-benchmark.js

# 3. Query the public API directly
curl -s https://steadystack.dev/api/benchmarks/false-positives | jq .summary`;

  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Terminal className="size-3.5 text-[#23211a]" />
            <span>Zero Black Boxes</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] mb-4">
            Reproduce the Results Locally
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl font-sans leading-relaxed text-balance">
            Engineers don&apos;t believe marketing claims — they verify math. Clone the repository,
            inspect the raw ClickHouse ingress logs, and run the calculation script on your own
            machine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          {/* Terminal Block (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#373428] bg-[#23211a] p-5 sm:p-6 shadow-md relative overflow-hidden text-white">
            {/* Terminal Window Chrome */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-white/50 ml-2">
                  bash - verification-harness
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText("cli", reproduceCommand)}
                className="flex items-center gap-1 text-[11px] font-mono text-white/70 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedCmd === "cli" ? (
                  <>
                    <Check className="size-3 text-[#ffd439]" />
                    <span className="text-[#ffd439]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <pre className="font-mono text-xs text-white/90 overflow-x-auto leading-relaxed whitespace-pre">
              {reproduceCommand}
            </pre>
          </div>

          {/* Dataset Downloads & SHA-256 (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* SHA-256 Box */}
            <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#23211a] mb-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                Immutable Dataset Hash (SHA-256)
              </div>
              <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] font-mono text-[11px] text-[#5c5c5c] break-all mb-3 flex items-center justify-between gap-2">
                <span>{BENCHMARK_METADATA.groundTruthAuditHashSha256}</span>
                <button
                  type="button"
                  onClick={() => copyText("sha", BENCHMARK_METADATA.groundTruthAuditHashSha256)}
                  className="p-1 text-[#868279] hover:text-[#23211a] shrink-0 cursor-pointer"
                  title="Copy SHA-256 hash"
                >
                  {copiedCmd === "sha" ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#5c5c5c] font-sans leading-relaxed">
                Cryptographic checksum of the raw JSON test ledger. Run{" "}
                <code className="text-[#23211a] font-mono font-bold bg-[#f4f2eb] px-1 py-0.5 rounded border border-[#e8e6df]">
                  sha256sum false-positive-benchmark-30d.json
                </code>{" "}
                to confirm zero post-hoc modifications.
              </p>
            </div>

            {/* Download Links */}
            <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-[#23211a] block">
                Direct Raw Dataset Downloads:
              </span>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/data/false-positive-benchmark-30d.json"
                  download="false-positive-benchmark-30d.json"
                  className="p-3 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] hover:bg-white flex flex-col items-center justify-center text-center gap-1.5 transition-colors group shadow-2xs"
                >
                  <FileCode className="size-4 text-[#23211a] group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs font-bold text-[#23211a]">dataset.json</span>
                  <span className="text-[10px] text-[#868279]">Full JSON (69 Incidents)</span>
                </a>

                <a
                  href="/data/false-positive-benchmark-30d.csv"
                  download="false-positive-benchmark-30d.csv"
                  className="p-3 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] hover:bg-white flex flex-col items-center justify-center text-center gap-1.5 transition-colors group shadow-2xs"
                >
                  <Database className="size-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs font-bold text-[#23211a]">dataset.csv</span>
                  <span className="text-[10px] text-[#868279]">Spreadsheet Export</span>
                </a>
              </div>

              <Link
                href="https://github.com/getsteadystack/SteadyStack/blob/master/scripts/verify-benchmark.js"
                target="_blank"
                className="w-full py-2.5 px-3 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f4f2eb] text-[#23211a] flex items-center justify-center gap-1.5 text-xs font-mono font-semibold transition-colors shadow-xs"
              >
                <span>View Verification Script on GitHub</span>
                <ExternalLink className="size-3 text-[#868279]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
