"use client";

import { BookOpen, Server, Cpu, Database } from "lucide-react";
import { BENCHMARK_ENDPOINTS } from "@/content/benchmarks-data";

export function MethodologySection() {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <BookOpen className="size-3.5 text-[#23211a]" />
            <span>Scientific Rigor</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] mb-4">
            Experimental Methodology &amp; Setup
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl font-sans leading-relaxed text-balance">
            How we designed the 30-day benchmark fleet, calibrated ground truth measurement, and
            validated mathematical error bounds without bias.
          </p>
        </div>

        {/* 3 Steps / Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs">
            <div className="size-10 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] text-[#23211a] flex items-center justify-center mb-4">
              <Server className="size-5" />
            </div>
            <h3 className="text-base font-serif font-medium text-[#23211a] mb-2">
              1. The 10-Endpoint Target Fleet
            </h3>
            <p className="text-xs text-[#5c5c5c] font-sans leading-relaxed">
              We deployed 10 geographically isolated server endpoints across Cloudflare Workers, AWS
              us-east-1, Hetzner Frankfurt, Fly.io Singapore, and GCP. Endpoints were calibrated to
              exercise edge HTTP/2, TLS 1.3 session resumption, chunked streaming, and dynamic
              Geo-DNS resolution.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs">
            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4">
              <Database className="size-5" />
            </div>
            <h3 className="text-base font-serif font-medium text-[#23211a] mb-2">
              2. Ingress Ground-Truth Audit
            </h3>
            <p className="text-xs text-[#5c5c5c] font-sans leading-relaxed">
              Every server endpoint streamed raw kernel and NGINX/Envoy ingress logs into an
              immutable ClickHouse cluster. An alert was classified as a{" "}
              <strong className="text-[#23211a]">Spurious Alert (False Positive)</strong> if and
              only if server ingress logs proved the endpoint was responding 200 OK to other traffic
              during that minute.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs">
            <div className="size-10 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] text-[#23211a] flex items-center justify-center mb-4">
              <Cpu className="size-5" />
            </div>
            <h3 className="text-base font-serif font-medium text-[#23211a] mb-2">
              3. Controlled Fault Injection
            </h3>
            <p className="text-xs text-[#5c5c5c] font-sans leading-relaxed">
              Over the 30-day run, we injected 4 real catastrophic server outages (5m, 12m, 2m, 45m)
              alongside realistic transient network noise: 12-second single-AS BGP route flaps,
              200ms 503 micro-bursts, and localized DNS TTL cache drops.
            </p>
          </div>
        </div>

        {/* Endpoints Roster Table */}
        <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs mb-16 text-left">
          <div className="p-6 border-b border-[#e8e6df] bg-[#fbfbf9]">
            <h3 className="text-xl font-serif font-medium text-[#23211a]">
              Benchmark Endpoint Fleet Specification
            </h3>
            <p className="text-xs text-[#5c5c5c] font-sans mt-0.5">
              The 10 production endpoints monitored simultaneously by SteadyStack, UptimeRobot, and
              Pingdom at 60-second intervals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#fbfbf9] text-[#868279] uppercase text-[10px] tracking-wider border-b border-[#e8e6df]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Endpoint ID</th>
                  <th className="py-3.5 px-4 font-bold">Target Name</th>
                  <th className="py-3.5 px-4 font-bold">Hosting Infra</th>
                  <th className="py-3.5 px-4 font-bold">Protocol / Stack</th>
                  <th className="py-3.5 px-4 font-bold">Testing Purpose</th>
                  <th className="py-3.5 px-4 font-bold text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e6df]/70 text-[#23211a]">
                {BENCHMARK_ENDPOINTS.map((ep) => (
                  <tr key={ep.id} className="hover:bg-[#fbfbf9] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#23211a]">{ep.id}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-[#23211a]">{ep.name}</td>
                    <td className="py-3.5 px-4 text-[#5c5c5c]">{ep.provider}</td>
                    <td className="py-3.5 px-4 text-[#5c5c5c]">{ep.protocol}</td>
                    <td className="py-3.5 px-4 font-sans text-xs text-[#5c5c5c] max-w-xs">
                      {ep.purpose}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">
                      {ep.baselineLatencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mathematical Definitions Box */}
        <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 shadow-xs text-left">
          <h3 className="text-xl font-serif font-medium text-[#23211a] mb-6">
            Statistical Accuracy Formulations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
              <span className="text-[11px] font-bold text-[#23211a] block mb-1">Precision [P]</span>
              <div className="text-[#23211a] font-bold text-sm my-2">P = TP / (TP + FP)</div>
              <p className="text-[11px] text-[#5c5c5c] font-sans leading-relaxed">
                Percentage of alerts dispatched that corresponded to real, verified outages.
                SteadyStack scored 100%, UptimeRobot 12.5%, Pingdom 8.9%.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
              <span className="text-[11px] font-bold text-[#23211a] block mb-1">
                False Discovery Rate [FDR]
              </span>
              <div className="text-rose-700 font-bold text-sm my-2">FDR = FP / (TP + FP)</div>
              <p className="text-[11px] text-[#5c5c5c] font-sans leading-relaxed">
                Probability that an alert received by an on-call engineer is a false alarm.
                SteadyStack = 0.0%, Pingdom = 91.1%.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
              <span className="text-[11px] font-bold text-[#23211a] block mb-1">
                4-of-7 Quorum Bound
              </span>
              <div className="text-emerald-700 font-bold text-sm my-2">
                &sum; Votes &ge; 4 (n=7)
              </div>
              <p className="text-[11px] text-[#5c5c5c] font-sans leading-relaxed">
                Requires minimum 4 sovereign Cloudflare POPs (weur, enam, wnam, apac, eeur, apac-ne,
                apac-se) to record failure before incident dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
