"use client";

import { CheckCircle2, XCircle, AlertTriangle, Zap, Clock, DollarSign, Layers } from "lucide-react";
import { PROVIDER_SUMMARIES } from "@/content/benchmarks-data";

export function BenchmarkScorecard() {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Layers className="size-3.5 text-[#23211a]" />
            <span>Empirical Results Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-4 leading-[1.08]">
            Side-by-Side Performance Comparison
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl font-sans leading-relaxed text-balance">
            Every metric below is calculated across 432,000 synthetic checks per provider over the
            exact same 30-day window against identical server infrastructure.
          </p>
        </div>

        {/* 3 Contenders Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
          {PROVIDER_SUMMARIES.map((p) => {
            const isPG = p.providerName === "SteadyStack";
            const isUR = p.providerName === "UptimeRobot";

            return (
              <div
                key={p.providerName}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 bg-white ${
                  isPG
                    ? "border-[#23211a] shadow-md ring-1 ring-[#23211a]"
                    : "border-[#e8e6df] shadow-xs"
                }`}
              >
                {isPG && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#ffd439] text-[#23211a] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#e2be2b] shadow-xs">
                    Benchmark Winner (0 False Alarms)
                  </div>
                )}

                <div>
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-serif font-medium text-[#23211a]">
                        {p.providerName}
                      </h3>
                      <span className="text-xs text-[#868279] font-mono">{p.logoBadge}</span>
                    </div>
                    {isPG ? (
                      <span className="size-8 rounded-lg bg-[#23211a] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                        SS
                      </span>
                    ) : isUR ? (
                      <span className="size-8 rounded-lg bg-[#f4f2eb] text-[#23211a] border border-[#e8e6df] flex items-center justify-center font-bold text-xs font-mono">
                        UR
                      </span>
                    ) : (
                      <span className="size-8 rounded-lg bg-[#f4f2eb] text-[#23211a] border border-[#e8e6df] flex items-center justify-center font-bold text-xs font-mono">
                        PD
                      </span>
                    )}
                  </div>

                  {/* Primary Metric: Spurious Alerts */}
                  <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] mb-6">
                    <span className="text-[10px] font-mono text-[#868279] uppercase tracking-wider font-bold block mb-1">
                      Spurious Alerts (False Alarms)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-4xl font-serif font-semibold ${
                          isPG ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {p.spuriousAlerts}
                      </span>
                      <span className="text-xs text-[#868279] font-mono">
                        (
                        {p.spuriousAlerts === 0
                          ? "0.00%"
                          : `${(p.spuriousAlertRatePercent * 100).toFixed(3)}%`}{" "}
                        error rate)
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5c5c5c] font-sans block mt-1.5 leading-snug">
                      {isPG
                        ? "4-of-7 Quorum required. All transient network blips rejected."
                        : `${p.spuriousAlerts} phantom pages dispatched to on-call engineers.`}
                    </span>
                  </div>

                  {/* Metric List */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#e8e6df]">
                      <span className="text-[#5c5c5c]">Precision (TP / (TP+FP)):</span>
                      <span className={`font-bold ${isPG ? "text-emerald-600" : "text-[#23211a]"}`}>
                        {p.precisionPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#e8e6df]">
                      <span className="text-[#5c5c5c]">Recall (True Outages):</span>
                      <span className="font-bold text-emerald-600">
                        {p.recallPercent.toFixed(0)}% (4/4)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#e8e6df]">
                      <span className="text-[#5c5c5c]">F₁ Score:</span>
                      <span className={`font-bold ${isPG ? "text-emerald-600" : "text-[#23211a]"}`}>
                        {p.f1Score.toFixed(3)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#e8e6df]">
                      <span className="text-[#5c5c5c]">Mean Time to Verdict:</span>
                      <span className="font-bold text-[#23211a]">
                        {p.meanTimeToVerdictMs < 1000
                          ? `${p.meanTimeToVerdictMs}ms`
                          : `${(p.meanTimeToVerdictMs / 1000).toFixed(1)}s`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#e8e6df]">
                      <span className="text-[#5c5c5c]">First-Webhook Dispatch:</span>
                      <span className="font-bold text-[#23211a]">
                        {(p.firstWebhookLatencyMs / 1000).toFixed(2)}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[#5c5c5c]">Cost / Synthetic Check:</span>
                      <span className="font-bold text-[#23211a]">{p.monthlyCostPerCheck}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Architecture Note */}
                <div className="mt-6 pt-4 border-t border-[#e8e6df] text-[11px] text-[#5c5c5c] font-sans leading-relaxed">
                  <strong className="font-semibold text-[#23211a]">Mechanism: </strong>
                  {p.architectureSummary}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comprehensive Comparison Table */}
        <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs text-left">
          <div className="p-6 border-b border-[#e8e6df] bg-[#fbfbf9]">
            <h3 className="text-xl font-serif font-medium text-[#23211a]">
              Detailed Metric Breakdown
            </h3>
            <p className="text-xs text-[#5c5c5c] font-sans mt-1">
              Comparing statistical accuracy, false discovery rates, verification latencies, and
              operational overhead.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#fbfbf9] text-[#868279] uppercase text-[10px] tracking-wider border-b border-[#e8e6df]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Evaluation Dimension</th>
                  <th className="py-3.5 px-4 font-bold text-[#23211a]">
                    SteadyStack (Edge Quorum)
                  </th>
                  <th className="py-3.5 px-4 font-bold">UptimeRobot (Pro)</th>
                  <th className="py-3.5 px-4 font-bold">Pingdom (Advanced)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Advantage / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e6df]/70 text-[#23211a]">
                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    Total Synthetic Probes
                  </td>
                  <td className="py-3.5 px-4 text-[#23211a] font-bold">432,000</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">432,000</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">432,000</td>
                  <td className="py-3.5 px-4 text-right text-[#868279]">
                    Identical 60s test interval
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors bg-emerald-500/[0.03]">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a] flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    Spurious Alerts (False Positives)
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold text-sm">0 (0.00%)</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">28 false alarms</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">41 false alarms</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                    SteadyStack (100% clean)
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    Precision Rate [TP / (TP + FP)]
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">100.0%</td>
                  <td className="py-3.5 px-4 text-amber-600">12.5%</td>
                  <td className="py-3.5 px-4 text-amber-600">8.9%</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                    SteadyStack +87.5%
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    Recall Rate (True Outages Caught)
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">100.0% (4/4)</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">100.0% (4/4)</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">100.0% (4/4)</td>
                  <td className="py-3.5 px-4 text-right text-[#868279]">
                    All 3 platforms tied (100%)
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    False Discovery Rate (FDR)
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">0.0%</td>
                  <td className="py-3.5 px-4 text-rose-600">87.5%</td>
                  <td className="py-3.5 px-4 text-rose-600">91.1%</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                    SteadyStack (Zero fatigue)
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    Consensus Verdict Latency
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">
                    840ms (Parallel Quorum)
                  </td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">31,400ms (+30s retry)</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">28,200ms (+25s probe 2)</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                    SteadyStack (33x faster)
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors bg-amber-500/[0.03]">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a] flex items-center gap-1.5">
                    <Zap className="size-3.5 text-amber-600 shrink-0" />
                    First-Webhook Alert Latency (Hard Crash)
                  </td>
                  <td className="py-3.5 px-4 text-[#23211a] font-bold">4.12s (Parallel wait)</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">34.80s</td>
                  <td className="py-3.5 px-4 text-amber-700 font-bold">3.21s (Single probe)</td>
                  <td className="py-3.5 px-4 text-right text-amber-700 font-bold">
                    Pingdom won by 910ms*
                  </td>
                </tr>

                <tr className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">
                    Monthly Infrastructure Cost / Check
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">$0.000012 (Edge DO)</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">$0.000080</td>
                  <td className="py-3.5 px-4 text-[#5c5c5c]">$0.000195</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                    SteadyStack (6.6x - 16x cheaper)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#fbfbf9] border-t border-[#e8e6df] text-[11px] text-[#5c5c5c] font-sans flex items-center gap-2">
            <strong className="font-bold text-amber-700 font-mono">* Note:</strong>
            <span>
              On total catastrophic server crashes, Pingdom fired its initial webhook 910ms faster
              because it relied on a single failing probe without waiting for global quorum. See the
              &ldquo;Where We Lost&rdquo; section for a complete engineering breakdown.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
