"use client";

import { useState } from "react";
import { TrendingDown, CheckCircle2, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LtdSavingsCalculator() {
  const [monitorCount, setMonitorCount] = useState<number>(250);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(3);

  // Competitor costs per month for given monitors
  const getBetterStackMonthly = (monitors: number) => {
    if (monitors <= 50) return 29;
    if (monitors <= 250) return 89;
    return 199;
  };

  const getPingdomMonthly = (monitors: number) => {
    if (monitors <= 50) return 45;
    if (monitors <= 250) return 150;
    return 350;
  };

  const getSteadyStackLTD = (monitors: number) => {
    if (monitors <= 150) return 49;
    if (monitors <= 250) return 99;
    return 199;
  };

  const betterStackTotal = getBetterStackMonthly(monitorCount) * 12 * timeHorizonYears;
  const pingdomTotal = getPingdomMonthly(monitorCount) * 12 * timeHorizonYears;
  const steadyStackTotal = getSteadyStackLTD(monitorCount);

  const totalSavings = betterStackTotal - steadyStackTotal;
  const percentSaved = Math.round((totalSavings / betterStackTotal) * 100);

  return (
    <section className="py-20 md:py-28 bg-[#faf8f5] border-b border-[#e8e6df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <TrendingDown className="size-3.5 text-emerald-600" />
            <span>ROI & Savings Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
            See how much you save with a one-time purchase
          </h2>
          <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
            Compare SteadyStack&apos;s one-time founder license against standard recurring SaaS
            monitoring subscriptions over {timeHorizonYears} years.
          </p>
        </div>

        {/* Calculator Interactive Box */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#e8e6df] bg-white p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-[#e8e6df]">
            {/* Left Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="monitor-range"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-[#868279]"
                  >
                    Monitors Needed
                  </label>
                  <span className="text-sm font-bold text-[#23211a] font-mono">
                    {monitorCount} Monitors
                  </span>
                </div>
                <input
                  id="monitor-range"
                  type="range"
                  min={50}
                  max={1500}
                  step={50}
                  value={monitorCount}
                  onChange={(e) => setMonitorCount(Number(e.target.value))}
                  className="w-full accent-[#23211a] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#868279] mt-1">
                  <span>50 (Solo)</span>
                  <span>250 (Agency)</span>
                  <span>1,500 (Fleet Pro)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#868279]">
                    Time Horizon
                  </span>
                  <span className="text-sm font-bold text-[#23211a] font-mono">
                    {timeHorizonYears} {timeHorizonYears === 1 ? "Year" : "Years"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setTimeHorizonYears(years)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer",
                        timeHorizonYears === years
                          ? "bg-[#23211a] text-white border-[#23211a] shadow-xs"
                          : "bg-[#faf8f5] text-[#5c5c5c] border-[#e8e6df] hover:border-black/20",
                      )}
                    >
                      {years} {years === 1 ? "Year" : "Years"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Result Card */}
            <div className="p-6 rounded-2xl bg-[#23211a] text-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#ffd439] uppercase tracking-wider font-bold block mb-1">
                  Total Estimated Savings
                </span>
                <div className="text-4xl sm:text-5xl font-serif font-bold text-white mb-2">
                  ${totalSavings.toLocaleString()}
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  You save <strong className="text-[#ffd439]">{percentSaved}%</strong> compared to
                  paying recurring monthly fees for alternative monitoring suites.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/60">Better Stack ({timeHorizonYears} yrs):</span>
                  <span className="text-white font-semibold">
                    ${betterStackTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Pingdom ({timeHorizonYears} yrs):</span>
                  <span className="text-white font-semibold">${pingdomTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#ffd439] font-bold pt-1 border-t border-white/10">
                  <span>SteadyStack Lifetime:</span>
                  <span>${steadyStackTotal} (Pay Once)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5c5c5c] font-mono">
              💡 Zero hidden maintenance fees. All future edge probes included.
            </div>
            <Link
              href={
                monitorCount <= 150
                  ? "/signup?deal=ltd-tier-1"
                  : monitorCount <= 250
                    ? "/signup?deal=ltd-tier-2"
                    : "/signup?deal=ltd-tier-3"
              }
              className="inline-flex items-center gap-2 text-xs font-bold bg-[#23211a] text-white px-5 py-2.5 rounded-xl hover:bg-[#373428] transition-all"
            >
              <span>
                Lock In ${steadyStackTotal} Lifetime Deal (
                {monitorCount <= 150 ? "Tier 1" : monitorCount <= 250 ? "Tier 2" : "Tier 3"})
              </span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
