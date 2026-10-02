"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  DollarSign,
  Clock,
  Users,
  Moon,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import Link from "next/link";

export function AlertFatigueCalculator() {
  const [endpointsCount, setEndpointsCount] = useState<number>(25);
  const [engineersCount, setEngineersCount] = useState<number>(6);
  const [hourlyRate, setHourlyRate] = useState<number>(95);
  const [interruptionMins, setInterruptionMins] = useState<number>(45);

  const calculations = useMemo(() => {
    const falseAlertsPerEndpointYear = 28; // conservative midpoint
    const totalFalseAlertsPerYear = Math.round(endpointsCount * falseAlertsPerEndpointYear);

    // Productivity loss in hours (context switch + investigation + sleep recovery)
    const hoursWastedPerYear = Math.round(totalFalseAlertsPerYear * (interruptionMins / 60));
    const annualWastedCost = Math.round(hoursWastedPerYear * hourlyRate);

    // Hours wasted per engineer
    const hoursPerEngineer = (hoursWastedPerYear / engineersCount).toFixed(1);

    // Sleep interruption risk factor
    const nightAlertsPerYear = Math.round(totalFalseAlertsPerYear * 0.35); // 35% occur off-hours / night

    let burnoutRisk = "Moderate";
    let burnoutColor = "text-amber-700";
    if (totalFalseAlertsPerYear > 500) {
      burnoutRisk = "Severe (Critical Churn Risk)";
      burnoutColor = "text-rose-700";
    } else if (totalFalseAlertsPerYear > 200) {
      burnoutRisk = "High (Alert Fatigue)";
      burnoutColor = "text-rose-600";
    } else if (totalFalseAlertsPerYear < 80) {
      burnoutRisk = "Low";
      burnoutColor = "text-emerald-700";
    }

    return {
      totalFalseAlertsPerYear,
      hoursWastedPerYear,
      annualWastedCost,
      hoursPerEngineer,
      nightAlertsPerYear,
      burnoutRisk,
      burnoutColor,
    };
  }, [endpointsCount, engineersCount, hourlyRate, interruptionMins]);

  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Calculator className="size-3.5 text-[#23211a]" />
            <span>ROI &amp; Fatigue Modeling</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] mb-4">
            Calculate Your Team&apos;s False-Alert Cost
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl font-sans leading-relaxed text-balance">
            Every false alarm costs on-call engineer focus, disrupts sleep, and causes teams to mute
            paging channels. Model the real annual cost across your engineering organization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          {/* Sliders Form Panel */}
          <div className="lg:col-span-7 rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Slider 1: Monitored Endpoints */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#23211a] flex items-center gap-1.5 font-serif">
                  <span>Monitored HTTP / API Endpoints:</span>
                </label>
                <span className="font-mono text-sm font-bold text-[#23211a] px-2.5 py-0.5 rounded-lg bg-[#f4f2eb] border border-[#e8e6df]">
                  {endpointsCount} endpoints
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={endpointsCount}
                onChange={(e) => setEndpointsCount(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279] mt-1">
                <span>5 (Startup)</span>
                <span>100 (Scale-up)</span>
                <span>250+ (Enterprise)</span>
              </div>
            </div>

            {/* Slider 2: On-Call Engineers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#23211a] flex items-center gap-1.5 font-serif">
                  <Users className="size-3.5 text-[#868279]" />
                  <span>On-Call Rotation Size:</span>
                </label>
                <span className="font-mono text-sm font-bold text-[#23211a] px-2.5 py-0.5 rounded-lg bg-[#f4f2eb] border border-[#e8e6df]">
                  {engineersCount} engineers
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={engineersCount}
                onChange={(e) => setEngineersCount(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279] mt-1">
                <span>1 engineer</span>
                <span>15 engineers</span>
                <span>30 engineers</span>
              </div>
            </div>

            {/* Slider 3: Engineering Hourly Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#23211a] flex items-center gap-1.5 font-serif">
                  <DollarSign className="size-3.5 text-[#868279]" />
                  <span>Blended Hourly Engineering Rate:</span>
                </label>
                <span className="font-mono text-sm font-bold text-[#23211a] px-2.5 py-0.5 rounded-lg bg-[#f4f2eb] border border-[#e8e6df]">
                  ${hourlyRate}/hr
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="250"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279] mt-1">
                <span>$40/hr</span>
                <span>$95/hr (Avg Senior)</span>
                <span>$250/hr (Staff/Contract)</span>
              </div>
            </div>

            {/* Slider 4: Context Switch & Disruption Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#23211a] flex items-center gap-1.5 font-serif">
                  <Clock className="size-3.5 text-[#868279]" />
                  <span>Time Lost per False Alarm (Context Switch):</span>
                </label>
                <span className="font-mono text-sm font-bold text-[#23211a] px-2.5 py-0.5 rounded-lg bg-[#f4f2eb] border border-[#e8e6df]">
                  {interruptionMins} mins
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={interruptionMins}
                onChange={(e) => setInterruptionMins(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279] mt-1">
                <span>15 mins (Quick blip)</span>
                <span>45 mins (Avg investigate + reset)</span>
                <span>90 mins (Night wake-up)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-5 rounded-2xl border border-[#23211a] bg-white p-6 sm:p-8 shadow-md relative ring-1 ring-[#23211a] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e8e6df] mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#868279]">
                  Annual Impact Projection
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Based on 30D Study
                </span>
              </div>

              {/* Big Dollar Metric */}
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase text-[#868279] tracking-wider font-bold block mb-1">
                  Wasted Engineering Payroll / Year
                </span>
                <div className="text-4xl sm:text-5xl font-serif font-semibold text-[#23211a]">
                  ${calculations.annualWastedCost.toLocaleString()}
                </div>
                <span className="text-xs text-[#5c5c5c] mt-1 block font-mono">
                  ({calculations.hoursWastedPerYear.toLocaleString()} lost engineering hours)
                </span>
              </div>

              {/* Breakdown Stats */}
              <div className="space-y-3 font-mono text-xs mb-8">
                <div className="flex items-center justify-between py-2 border-b border-[#e8e6df]">
                  <span className="text-[#5c5c5c]">Estimated False Alarms / Yr:</span>
                  <span className="font-bold text-rose-700">
                    {calculations.totalFalseAlertsPerYear.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#e8e6df]">
                  <span className="text-[#5c5c5c] flex items-center gap-1">
                    <Moon className="size-3 text-[#868279]" />3 AM Nighttime Interruptions:
                  </span>
                  <span className="font-bold text-[#23211a]">
                    {calculations.nightAlertsPerYear.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#e8e6df]">
                  <span className="text-[#5c5c5c]">Lost Time / Engineer / Yr:</span>
                  <span className="font-bold text-[#23211a]">
                    {calculations.hoursPerEngineer} hrs
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-[#5c5c5c] flex items-center gap-1">
                    <Flame className="size-3 text-amber-600" />
                    On-Call Burnout Risk:
                  </span>
                  <span className={`font-bold ${calculations.burnoutColor}`}>
                    {calculations.burnoutRisk}
                  </span>
                </div>
              </div>
            </div>

            {/* SteadyStack Value Pitch */}
            <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                SteadyStack 4-of-7 Quorum Solution
              </div>
              <p className="text-[11px] text-[#5c5c5c] font-sans leading-relaxed mb-3">
                Mathematically eliminates false alarms across your {endpointsCount} endpoints,
                recovering ${calculations.annualWastedCost.toLocaleString()} in annual focus.
              </p>
              <Link
                href="/signup"
                className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#23211a] hover:bg-[#373428] text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Eliminate False Alarms Today</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
