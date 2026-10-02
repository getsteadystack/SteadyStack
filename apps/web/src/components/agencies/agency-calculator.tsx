"use client";

import { useState } from "react";
import { Calculator, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AgencyCalculator() {
  const [clients, setClients] = useState(15);
  const [retainerPerClient, setRetainerPerClient] = useState(750);
  const [monitorsPerClient, setMonitorsPerClient] = useState(4);

  const totalMonitors = clients * monitorsPerClient;
  const monthlyRevenue = clients * retainerPerClient;
  const annualRevenue = monthlyRevenue * 12;

  // Plan recommendation logic (Agencies think in clients)
  let planName = "Free ($0/mo)";
  let steadyStackCost = 0;
  if (clients <= 2) {
    planName = "Free ($0/mo)";
    steadyStackCost = 0;
  } else if (clients <= 10) {
    planName = "Agency ($39/mo)";
    steadyStackCost = 39;
  } else {
    planName = "Agency Pro ($99/mo)";
    steadyStackCost = 99;
  }

  const netMonthlyProfit = monthlyRevenue - steadyStackCost;
  const marginPercentage = ((netMonthlyProfit / monthlyRevenue) * 100).toFixed(1);

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative border-b border-[#e8e6df]"
      id="calculator"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Calculator className="size-3.5 text-[#23211a]" />
            <span>Interactive ROI Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08]">
            Calculate your agency retainer margin.
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans">
            See how much recurring maintenance revenue you protect by packaging white-label status
            pages and SLA audits into your client contracts.
          </p>
        </div>

        {/* Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
            <h3 className="text-base font-bold text-[#23211a] font-serif flex items-center gap-2">
              <TrendingUp className="size-4 text-[#23211a]" />
              Your Agency Parameters
            </h3>

            {/* Slider 1: Clients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#5c5c5c] font-semibold">Active Client Retainers</span>
                <span className="text-[#23211a] font-bold text-sm bg-[#f4f2eb] px-2.5 py-0.5 rounded border border-[#e8e6df]">
                  {clients} clients
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                step="1"
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279]">
                <span>2 clients</span>
                <span>40 clients</span>
                <span>80 clients</span>
              </div>
            </div>

            {/* Slider 2: Retainer $/mo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#5c5c5c] font-semibold">
                  Avg Monthly Retainer Fee per Client
                </span>
                <span className="text-[#23211a] font-bold text-sm bg-[#f4f2eb] px-2.5 py-0.5 rounded border border-[#e8e6df]">
                  ${retainerPerClient.toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={retainerPerClient}
                onChange={(e) => setRetainerPerClient(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279]">
                <span>$200/mo</span>
                <span>$1,500/mo</span>
                <span>$3,000/mo</span>
              </div>
            </div>

            {/* Slider 3: Monitors per Client */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#5c5c5c] font-semibold">
                  Endpoints Monitored per Client (Store, APIs, DB)
                </span>
                <span className="text-[#23211a] font-bold text-sm bg-[#f4f2eb] px-2.5 py-0.5 rounded border border-[#e8e6df]">
                  {monitorsPerClient} monitors / client
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={monitorsPerClient}
                onChange={(e) => setMonitorsPerClient(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f2eb] rounded-lg appearance-none cursor-pointer accent-[#23211a]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#868279]">
                <span>1 monitor</span>
                <span>5 monitors</span>
                <span>10 monitors</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e8e6df] flex items-center justify-between text-xs font-mono text-[#5c5c5c]">
              <span>Total Fleet Endpoints:</span>
              <span className="text-[#23211a] font-bold">{totalMonitors} live checks</span>
            </div>
          </div>

          {/* Results Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#23211a] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden ring-1 ring-[#23211a]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#868279] font-bold tracking-wider">
                  Agency ROI Breakdown
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold">
                  {marginPercentage}% Margin
                </span>
              </div>

              {/* Big Revenue Stat */}
              <div>
                <div className="text-xs font-mono text-[#868279] uppercase">
                  Monthly Retainer Revenue Protected
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-medium text-[#23211a] mt-1">
                  ${monthlyRevenue.toLocaleString()}
                  <span className="text-xs font-mono text-[#868279] font-normal">/mo</span>
                </div>
                <div className="text-xs text-[#23211a] font-mono mt-0.5 font-semibold">
                  ${annualRevenue.toLocaleString()} annual contracted value
                </div>
              </div>

              {/* Cost Row */}
              <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#5c5c5c]">Recommended Plan:</span>
                  <span className="text-[#23211a] font-bold">{planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5c5c5c]">SteadyStack Cost:</span>
                  <span className="text-[#23211a] font-bold">${steadyStackCost}/mo</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e8e6df]">
                  <span className="text-[#5c5c5c]">Software Cost as % of Revenue:</span>
                  <span className="text-emerald-700 font-bold">
                    {((steadyStackCost / monthlyRevenue) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Guarantee highlights */}
              <div className="space-y-2 font-mono text-xs text-[#5c5c5c]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Includes white-label client status portals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Includes automated monthly SLA PDF exports</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/signup"
                className="w-full flex items-center justify-center h-11 bg-[#23211a] hover:bg-[#373428] text-white text-xs font-semibold rounded-xl transition-all shadow-md font-mono uppercase tracking-wider cursor-pointer"
              >
                Start Free Agency Account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
