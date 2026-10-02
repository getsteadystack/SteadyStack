"use client";

import { TrendingDown, Scale, CheckCircle2 } from "lucide-react";
import { WHERE_WE_LOST_ANALYSIS } from "@/content/benchmarks-data";

export function WhereWeLost() {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Scale className="size-3.5 text-amber-700" />
            <span>Radical Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] mb-4">
            Where SteadyStack Lost
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl font-sans leading-relaxed text-balance">
            Engineers don&apos;t trust benchmark studies that claim 100% wins across every
            dimension. Every distributed systems architecture involves trade-offs. Here is exactly
            where our competitors outperformed us.
          </p>
        </div>

        {/* 3 Loss Analyses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {WHERE_WE_LOST_ANALYSIS.map((loss, idx) => (
            <div
              key={loss.id}
              className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-black/20 transition-all duration-300"
            >
              <div>
                {/* Header & Delta Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Trade-Off #{idx + 1}: {loss.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800">{loss.delta}</span>
                </div>

                <h3 className="text-lg font-serif font-medium text-[#23211a] mb-3 leading-snug">
                  {loss.title}
                </h3>

                {/* Scenario Description */}
                <div className="mb-4 font-sans">
                  <span className="text-[10px] font-mono uppercase text-[#868279] tracking-wider block mb-1 font-bold">
                    Observed Scenario:
                  </span>
                  <p className="text-xs text-[#5c5c5c] leading-relaxed">{loss.scenario}</p>
                </div>

                {/* Why SteadyStack Lost */}
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 mb-4 font-sans">
                  <span className="text-[10px] font-mono uppercase text-rose-700 font-bold tracking-wider block mb-1 flex items-center gap-1">
                    <TrendingDown className="size-3 text-rose-600" />
                    Why Competitor Won ({loss.competitorWinner}):
                  </span>
                  <p className="text-xs text-[#5c5c5c] leading-relaxed">
                    {loss.whySteadyStackLost}
                  </p>
                </div>

                {/* Architectural Rationale */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 mb-4 font-sans">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold tracking-wider block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    Why We Accept This Trade-Off:
                  </span>
                  <p className="text-xs text-[#5c5c5c] leading-relaxed">
                    {loss.whyWeAcceptThisTradeoff}
                  </p>
                </div>
              </div>

              {/* Takeaway */}
              <div className="pt-4 border-t border-[#e8e6df] text-[11px] font-mono text-[#5c5c5c]">
                <strong className="text-[#23211a] font-bold">Core Principle: </strong>
                {loss.engineeringTakeaway}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
