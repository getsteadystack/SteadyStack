"use client";

import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Layers,
  Globe2,
} from "lucide-react";
import {
  intervalComparison,
  downtimeScenarios,
  featureComparisons,
  competitors,
} from "./comparison-data";

function IntervalBar({
  label,
  interval,
  color,
  isSteadyStack,
}: {
  label: string;
  interval: number;
  color: string;
  isSteadyStack: boolean;
}) {
  const maxInterval = 300;
  const widthPct = (interval / maxInterval) * 100;
  const checksPerHour = Math.floor(3600 / interval);
  const checksPerDay = checksPerHour * 24;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSteadyStack
          ? "bg-[#ffd439]/10 border-[#ffd439]/50 shadow-sm"
          : "bg-white border-[#e8e6df] hover:border-[#d4d1c9]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isSteadyStack ? (
            <span className="size-5 rounded-full bg-[#ffd439] text-[#23211a] flex items-center justify-center text-xs font-bold shadow-xs">
              <Zap className="size-3 fill-current" />
            </span>
          ) : (
            <span className="size-5 rounded-full bg-[#f0ede6] text-[#868279] flex items-center justify-center text-xs font-mono">
              •
            </span>
          )}
          <span
            className={`text-sm font-mono font-bold ${
              isSteadyStack ? "text-[#23211a]" : "text-[#5c5c5c]"
            }`}
          >
            {label}
          </span>
          {isSteadyStack && (
            <span className="px-2 py-0.5 rounded-full bg-[#ffd439] text-[#23211a] text-[10px] font-mono font-bold uppercase tracking-wider">
              Fastest Free
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-[#868279]">
          <span className="font-semibold text-[#23211a]">{checksPerHour} checks/hr</span>
          <span>·</span>
          <span>{checksPerDay.toLocaleString()} checks/day</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-7 bg-[#f0ede6] rounded-md relative overflow-hidden border border-[#e8e6df]">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-sm flex items-center justify-end pr-2 ${
              isSteadyStack ? "bg-[#23211a] text-[#ffd439]" : "bg-[#868279]/40 text-[#23211a]"
            }`}
            style={{ width: `${Math.max(12, widthPct)}%` }}
          >
            <span className="text-[11px] font-bold font-mono">{interval}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DowntimeTimeline({ scenario }: { scenario: (typeof downtimeScenarios)[0] }) {
  const totalMinutes = Math.max(scenario.recoveryStart + 3, 20);
  const scale = 100 / totalMinutes;

  const competitorGapStart = Math.max(0, scenario.downtimeStart);
  const competitorGapEnd = Math.min(scenario.competitorDetect, scenario.recoveryStart);
  const competitorUndetectedMinutes = competitorGapEnd - competitorGapStart;

  const steadystackGapStart = Math.max(0, scenario.downtimeStart);
  const steadystackGapEnd = Math.min(scenario.steadystackDetect, scenario.recoveryStart);
  const steadystackUndetectedMinutes = steadystackGapEnd - steadystackGapStart;
  const minutesSaved = competitorUndetectedMinutes - steadystackUndetectedMinutes;

  return (
    <div className="border border-[#e8e6df] bg-white rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#e8e6df]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f0ede6] text-[#23211a] text-[11px] font-mono font-semibold mb-2">
              <span>Incident Simulation</span>
            </div>
            <h3 className="text-xl font-serif font-medium text-[#23211a]">{scenario.name}</h3>
            <p className="text-sm text-[#5c5c5c] mt-1 max-w-2xl leading-relaxed">
              {scenario.description}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
            <TrendingDown className="size-4 text-emerald-600" />
            <span>-{minutesSaved}m Mean Time To Detect</span>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="relative pt-8 pb-4 bg-[#fbfbf9] rounded-xl border border-[#e8e6df] p-4 sm:p-6 overflow-x-auto">
          {/* Time axis */}
          <div className="relative h-28 min-w-[500px]">
            {/* Background minutes ticks */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: Math.ceil(totalMinutes) }, (_, i) => (
                <div key={i} className="flex-1 border-l border-[#e8e6df] first:border-l-0 relative">
                  {i % 2 === 0 && (
                    <span className="absolute -top-6 left-0 text-[10px] font-mono text-[#868279]">
                      T+{i}m
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Competitor detection bar */}
            <div className="absolute top-8 left-0 right-0 h-7">
              <div className="relative h-full">
                {/* Undetected downtime */}
                <div
                  className="absolute h-full bg-rose-500/20 border-y border-rose-500/40 rounded-l"
                  style={{
                    left: `${competitorGapStart * scale}%`,
                    width: `${competitorUndetectedMinutes * scale}%`,
                  }}
                  title="Undetected blindspot window"
                />
                {/* Detected downtime */}
                <div
                  className="absolute h-full bg-rose-500/40 border-y border-rose-500/60 rounded-r"
                  style={{
                    left: `${competitorGapEnd * scale}%`,
                    width: `${Math.max(0, scenario.recoveryStart - competitorGapEnd) * scale}%`,
                  }}
                />
                {/* Detection point */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                  style={{ left: `${scenario.competitorDetect * scale}%` }}
                >
                  <div className="size-3.5 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                </div>
                {/* Recovery marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${scenario.recoveryStart * scale}%` }}
                >
                  <div className="flex items-center gap-1 -translate-x-1/2 mt-7 bg-white px-2 py-0.5 rounded border border-[#e8e6df] shadow-xs">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span className="text-[9px] font-mono font-semibold text-emerald-700">
                      Resolved
                    </span>
                  </div>
                </div>
              </div>
              <span className="absolute -top-5 left-0 text-[10px] font-mono text-rose-600 font-bold uppercase tracking-wider">
                {scenario.competitorLabel} (5-min poll)
              </span>
            </div>

            {/* SteadyStack detection bar */}
            <div className="absolute top-20 left-0 right-0 h-7">
              <div className="relative h-full">
                {/* Undetected downtime */}
                <div
                  className="absolute h-full bg-rose-500/20 border-y border-rose-500/40 rounded-l"
                  style={{
                    left: `${steadystackGapStart * scale}%`,
                    width: `${steadystackUndetectedMinutes * scale}%`,
                  }}
                />
                {/* Detected downtime */}
                <div
                  className="absolute h-full bg-[#23211a]/80 border-y border-[#23211a] rounded-r"
                  style={{
                    left: `${steadystackGapEnd * scale}%`,
                    width: `${Math.max(0, scenario.recoveryStart - steadystackGapEnd) * scale}%`,
                  }}
                />
                {/* Detection point */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                  style={{ left: `${scenario.steadystackDetect * scale}%` }}
                >
                  <div className="size-3.5 rounded-full bg-[#ffd439] border-2 border-[#23211a] shadow-xs" />
                </div>
              </div>
              <span className="absolute -top-5 left-0 text-[10px] font-mono text-[#23211a] font-bold uppercase tracking-wider">
                {scenario.steadystackLabel} (1-min Quorum)
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-4 border-t border-[#e8e6df] text-xs font-mono text-[#5c5c5c]">
            <div className="flex items-center gap-1.5">
              <div className="size-3 bg-rose-500/20 border border-rose-500/40 rounded-xs" />
              <span>Undetected blindspot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 bg-[#23211a]/80 border border-[#23211a] rounded-xs" />
              <span>SteadyStack active alert window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-[#ffd439] border border-[#23211a]" />
              <span>SteadyStack quorum confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-rose-500 border border-white" />
              <span>Competitor first detection</span>
            </div>
          </div>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-5">
            <span className="text-[11px] font-mono text-rose-700 uppercase font-semibold tracking-wider">
              {scenario.competitorLabel} Blindspot
            </span>
            <p className="text-2xl sm:text-3xl font-serif font-medium text-rose-900 mt-1">
              ~{competitorUndetectedMinutes} minutes
            </p>
            <p className="text-xs text-rose-700 mt-1">
              Users experience broken checkout/APIs before engineer is paged.
            </p>
          </div>
          <div className="border border-[#ffd439] bg-[#ffd439]/10 rounded-xl p-5">
            <span className="text-[11px] font-mono text-[#23211a] uppercase font-semibold tracking-wider">
              {scenario.steadystackLabel} Alert
            </span>
            <p className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a] mt-1">
              ~{steadystackUndetectedMinutes} minute
            </p>
            <p className="text-xs text-[#5c5c5c] mt-1">
              Multi-region edge consensus pages on-call before customer complaints spike.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntervalComparison() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntervalBar
          label="SteadyStack Free"
          interval={intervalComparison.steadystack.interval}
          color={intervalComparison.steadystack.color}
          isSteadyStack={true}
        />
        {intervalComparison.competitors.map((c: any) => (
          <IntervalBar
            key={c.label}
            label={c.label}
            interval={c.interval}
            color={c.color}
            isSteadyStack={false}
          />
        ))}
      </div>

      <div className="bg-white border border-[#e8e6df] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#5c5c5c]">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded-full bg-[#ffd439]/30 text-[#23211a] flex items-center justify-center font-bold">
            ✓
          </span>
          <span>
            SteadyStack Free delivers <strong className="text-[#23211a]">1,440 daily checks</strong>{" "}
            per monitor vs. <strong className="text-rose-600">288 checks</strong> on legacy 5-minute
            platforms.
          </span>
        </div>
        <a
          href="#matrix"
          className="inline-flex items-center gap-1 font-semibold text-[#23211a] hover:underline shrink-0"
        >
          <span>View full spec matrix</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

export function DowntimeComparison() {
  const [activeScenario, setActiveScenario] = useState(downtimeScenarios[0].name);

  const scenario =
    downtimeScenarios.find((s: any) => s.name === activeScenario) ?? downtimeScenarios[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Scenario Selector Tabs */}
      <div className="flex gap-2 flex-wrap p-1.5 bg-white border border-[#e8e6df] rounded-xl">
        {downtimeScenarios.map((s: any) => (
          <button
            key={s.name}
            onClick={() => setActiveScenario(s.name)}
            className={`text-xs font-mono font-medium px-4 py-2 rounded-lg transition-all ${
              activeScenario === s.name
                ? "bg-[#23211a] text-white shadow-xs font-semibold"
                : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <DowntimeTimeline scenario={scenario} />
    </div>
  );
}

export function TimeSavingCalculator() {
  const [monitorsCount, setMonitorsCount] = useState(25);
  const dailyChecks = monitorsCount * 1440;
  const competitorChecks = monitorsCount * 288;
  const extraChecks = dailyChecks - competitorChecks;
  const hoursSavedPerYear = Math.round((monitorsCount * 4 * 12 * 2.5) / 60); // approx downtime blindspot reduction

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonitorsCount(parseInt(e.target.value, 10));
  };

  return (
    <div className="border border-[#e8e6df] bg-white rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[#e8e6df] bg-[#fbfbf9] rounded-xl p-5">
          <span className="text-[11px] font-mono text-[#868279] uppercase tracking-wider font-semibold">
            SteadyStack Checks / Day
          </span>
          <p className="text-3xl font-serif font-medium text-[#23211a] mt-1">
            {dailyChecks.toLocaleString()}
          </p>
          <span className="text-xs font-mono text-[#5c5c5c]">across {monitorsCount} endpoints</span>
        </div>
        <div className="border border-[#e8e6df] bg-[#fbfbf9] rounded-xl p-5">
          <span className="text-[11px] font-mono text-rose-700 uppercase tracking-wider font-semibold">
            Industry 5-min Standard
          </span>
          <p className="text-3xl font-serif font-medium text-[#868279] mt-1">
            {competitorChecks.toLocaleString()}
          </p>
          <span className="text-xs font-mono text-[#868279]">across {monitorsCount} endpoints</span>
        </div>
        <div className="border border-[#ffd439] bg-[#ffd439]/10 rounded-xl p-5">
          <span className="text-[11px] font-mono text-[#23211a] uppercase tracking-wider font-semibold">
            Visibility Advantage
          </span>
          <p className="text-3xl font-serif font-medium text-[#23211a] mt-1">
            +{extraChecks.toLocaleString()}
          </p>
          <span className="text-xs font-mono text-[#23211a] font-semibold">
            more health data points daily
          </span>
        </div>
      </div>

      <div className="bg-[#fbfbf9] border border-[#e8e6df] rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-mono font-semibold text-[#23211a]">
            Monitored Services & Fleet Size:{" "}
            <span className="text-sm px-2 py-0.5 rounded bg-[#ffd439] font-bold">
              {monitorsCount} monitors
            </span>
          </label>
          <span className="text-xs font-mono text-[#868279]">Max 50 free</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          value={monitorsCount}
          onChange={handleSliderChange}
          className="w-full accent-[#23211a] h-2 bg-[#e8e6df] rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-[#868279] mt-2">
          <span>5 monitors</span>
          <span>25 monitors</span>
          <span>50 monitors (Free Tier Cap)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs font-mono text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-amber-700 shrink-0" />
          <span>
            With 1-minute checks, your engineering team detects outages on average{" "}
            <strong>2.4 minutes earlier</strong> per event, saving up to{" "}
            <strong>~{hoursSavedPerYear} hours</strong> of cumulative undetected outage exposure
            annually.
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeatureComparisonTable() {
  const [view, setView] = useState<"all" | "battle">("battle");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(featureComparisons.map((f) => f.category)));

  const filtered = featureComparisons.filter((f) => {
    if (view === "battle" && !f.isBattle) return false;
    if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchDesc = f.description?.toLowerCase().includes(q) ?? false;
      const matchCat = f.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div id="matrix" className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="bg-white border border-[#e8e6df] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#868279]" />
          <input
            type="text"
            placeholder="Search 35+ capabilities (e.g. Quorum, Docker, SSL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] placeholder:text-[#868279] focus:outline-none focus:border-[#23211a]"
          />
        </div>

        {/* View & Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-[#f0ede6] rounded-xl border border-[#e8e6df]">
            <button
              onClick={() => setView("battle")}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                view === "battle"
                  ? "bg-[#23211a] text-white font-semibold shadow-xs"
                  : "text-[#5c5c5c] hover:text-[#23211a]"
              }`}
            >
              Key Differentiators
            </button>
            <button
              onClick={() => setView("all")}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                view === "all"
                  ? "bg-[#23211a] text-white font-semibold shadow-xs"
                  : "text-[#5c5c5c] hover:text-[#23211a]"
              }`}
            >
              All Features ({featureComparisons.length})
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#fbfbf9] border border-[#e8e6df] text-xs font-mono text-[#23211a] px-3 py-2 rounded-xl focus:outline-none focus:border-[#23211a]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#e8e6df] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#fbfbf9] border-b border-[#e8e6df]">
                <th className="text-left py-4 px-5 text-xs font-semibold font-sans text-[#5c5c5c] uppercase tracking-wider w-[35%]">
                  Capability / Feature
                </th>
                <th className="text-center py-4 px-4 text-xs font-bold text-[#23211a] uppercase tracking-wider bg-[#ffd439]/20 border-x border-[#ffd439]/40 w-[20%]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="size-3.5 fill-current" />
                    <span>SteadyStack</span>
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-xs font-medium text-[#5c5c5c] uppercase tracking-wider w-[15%]">
                  <a
                    href="https://uptimerobot.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#23211a] transition-colors"
                  >
                    <span>UptimeRobot</span>
                    <ExternalLink className="size-3 text-[#868279]" />
                  </a>
                </th>
                <th className="text-center py-4 px-4 text-xs font-medium text-[#5c5c5c] uppercase tracking-wider w-[15%]">
                  <a
                    href="https://betterstack.com/uptime/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#23211a] transition-colors"
                  >
                    <span>Better Stack</span>
                    <ExternalLink className="size-3 text-[#868279]" />
                  </a>
                </th>
                <th className="text-center py-4 px-4 text-xs font-medium text-[#5c5c5c] uppercase tracking-wider w-[15%]">
                  <a
                    href="https://www.checklyhq.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#23211a] transition-colors"
                  >
                    <span>Checkly</span>
                    <ExternalLink className="size-3 text-[#868279]" />
                  </a>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6df]">
              {filtered.map((feature, idx) => {
                const renderCell = (val: string | boolean, isPrimary: boolean = false) => {
                  if (typeof val === "boolean") {
                    return val ? (
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[#868279]/40 font-mono">—</span>
                    );
                  }

                  const isChecked = val.startsWith("✓");
                  return (
                    <span
                      className={`text-[11px] leading-relaxed block ${
                        isPrimary
                          ? "font-semibold text-[#23211a]"
                          : isChecked
                            ? "text-emerald-800 font-medium"
                            : val.toLowerCase().includes("paid")
                              ? "text-amber-800"
                              : val === "—" || val === "Not published"
                                ? "text-[#868279]/50"
                                : "text-[#5c5c5c]"
                      }`}
                    >
                      {val}
                    </span>
                  );
                };

                return (
                  <tr
                    key={feature.name + idx}
                    className={`transition-colors ${
                      feature.isBattle
                        ? "bg-[#ffd439]/[0.03] hover:bg-[#ffd439]/[0.07]"
                        : "hover:bg-[#fbfbf9]"
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-xs text-[#23211a]">
                          {feature.name}
                        </span>
                        {feature.isBattle && (
                          <span className="px-1.5 py-0.5 rounded bg-[#ffd439] text-[#23211a] text-[9px] font-mono font-bold uppercase tracking-wider">
                            Battle
                          </span>
                        )}
                      </div>
                      {feature.description && (
                        <p className="text-[11px] text-[#868279] font-sans mt-0.5 leading-snug">
                          {feature.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-[#ffd439]/10 border-x border-[#ffd439]/30">
                      {renderCell(feature.steadystack, true)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderCell(feature.uptimerobot ?? feature.competitor1 ?? false)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderCell(feature.betteruptime ?? feature.competitor2 ?? false)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderCell(feature.checkly ?? feature.competitor3 ?? false)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Verification Footnote */}
        <div className="p-4 sm:p-5 bg-[#fbfbf9] border-t border-[#e8e6df] text-xs font-mono text-[#868279] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>
              All provider specifications independently audited against public pricing pages as of
              August 2026.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://uptimerobot.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#23211a] underline"
            >
              UptimeRobot
            </a>
            <span>·</span>
            <a
              href="https://betterstack.com/uptime/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#23211a] underline"
            >
              Better Stack
            </a>
            <span>·</span>
            <a
              href="https://www.checklyhq.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#23211a] underline"
            >
              Checkly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
