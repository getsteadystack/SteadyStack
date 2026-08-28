"use client";

import { useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { intervalComparison, downtimeScenarios, featureComparisons } from "./comparison-data";

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

  return (
    <div className="flex items-center gap-4 group">
      <div className="w-32 shrink-0 flex items-center gap-2">
        {isSteadyStack && <Zap className="size-3 text-primary" />}
        <span
          className={`text-xs font-mono font-bold ${
            isSteadyStack ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-8 bg-black/40 border border-border/50 relative overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-700 ease-out flex items-center justify-end pr-2`}
            style={{ width: `${widthPct}%` }}
          >
            <span className="text-[10px] font-bold font-mono text-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              {interval}s
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-24 shrink-0">
          {checksPerHour} checks/hr
        </span>
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

  return (
    <div className="border border-border/50 bg-black/20 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">{scenario.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">{scenario.description}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pt-6 pb-2">
          {/* Time axis */}
          <div className="relative h-20">
            {/* Background minutes */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: Math.ceil(totalMinutes) }, (_, i) => (
                <div key={i} className="flex-1 border-l border-border/20 first:border-l-0 relative">
                  {i % 2 === 0 && (
                    <span className="absolute -top-4 left-0 text-[8px] font-mono text-muted-foreground/50">
                      {i}m
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Competitor detection bar */}
            <div className="absolute top-6 left-0 right-0 h-7">
              <div className="relative h-full">
                {/* Undetected downtime */}
                <div
                  className="absolute h-full bg-red-500/20 border-y border-red-500/30"
                  style={{
                    left: `${competitorGapStart * scale}%`,
                    width: `${competitorUndetectedMinutes * scale}%`,
                  }}
                />
                {/* Detected downtime */}
                <div
                  className="absolute h-full bg-red-500/40 border-y border-red-500/50"
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
                  <div className="size-3 rounded-full bg-red-500 border-2 border-red-500/30" />
                </div>
                {/* Recovery marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${scenario.recoveryStart * scale}%` }}
                >
                  <div className="flex items-center gap-1 -translate-x-1/2 mt-5">
                    <CheckCircle2 className="size-3 text-green-500" />
                    <span className="text-[8px] font-mono text-green-500">Recovery</span>
                  </div>
                </div>
              </div>
              <span className="absolute -top-5 left-0 text-[9px] font-mono text-red-500/80 font-bold uppercase tracking-wider">
                {scenario.competitorLabel}
              </span>
            </div>

            {/* SteadyStack detection bar */}
            <div className="absolute top-14 left-0 right-0 h-7">
              <div className="relative h-full">
                {/* Undetected downtime */}
                <div
                  className="absolute h-full bg-red-500/20 border-y border-red-500/30"
                  style={{
                    left: `${steadystackGapStart * scale}%`,
                    width: `${steadystackUndetectedMinutes * scale}%`,
                  }}
                />
                {/* Detected downtime */}
                <div
                  className="absolute h-full bg-primary/30 border-y border-primary/40"
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
                  <div className="size-3 rounded-full bg-primary border-2 border-primary/30 animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-5 left-0 text-[9px] font-mono text-primary font-bold uppercase tracking-wider">
                {scenario.steadystackLabel}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 bg-red-500/40 border border-red-500/50" />
              <span className="text-[9px] font-mono text-muted-foreground">Downtime window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 bg-primary/30 border border-primary/40" />
              <span className="text-[9px] font-mono text-muted-foreground">
                Detected early by SteadyStack
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500" />
              <span className="text-[9px] font-mono text-muted-foreground">Competitor detects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-primary" />
              <span className="text-[9px] font-mono text-muted-foreground">
                SteadyStack detects
              </span>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="border border-red-500/10 bg-red-500/5 p-3">
            <span className="text-[9px] font-mono text-red-500/70 uppercase tracking-wider">
              {scenario.competitorLabel}
            </span>
            <p className="text-lg font-bold font-mono text-red-500 mt-1">
              ~{competitorUndetectedMinutes}m
            </p>
            <span className="text-[9px] font-mono text-red-500/50">undetected downtime</span>
          </div>
          <div className="border border-primary/10 bg-primary/5 p-3">
            <span className="text-[9px] font-mono text-primary/70 uppercase tracking-wider">
              {scenario.steadystackLabel}
            </span>
            <p className="text-lg font-bold font-mono text-primary mt-1">
              ~{steadystackUndetectedMinutes}m
            </p>
            <span className="text-[9px] font-mono text-primary/50">undetected downtime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntervalComparison() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="size-4 text-primary" />
        <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
          Check Interval Comparison
        </span>
      </div>
      <div className="flex flex-col gap-2">
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
      <p className="text-[10px] text-muted-foreground font-mono mt-1 leading-relaxed">
        SteadyStack gives you{" "}
        <span className="text-primary font-bold">1-minute checks for free</span> — that&apos;s{" "}
        <span className="text-primary font-bold">400% faster</span> than the industry standard
        5-minute tier. Over 24 hours, you get{" "}
        <span className="text-primary font-bold">1440 checks</span> vs the standard{" "}
        <span className="text-red-500/80 font-bold">288</span>.
      </p>
    </div>
  );
}

export function DowntimeComparison() {
  const [activeScenario, setActiveScenario] = useState(downtimeScenarios[0].name);

  const scenario =
    downtimeScenarios.find((s: any) => s.name === activeScenario) ?? downtimeScenarios[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="size-4 text-primary" />
        <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
          Real-World Detection Timeline
        </span>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-2 flex-wrap">
        {downtimeScenarios.map((s: any) => (
          <button
            key={s.name}
            onClick={() => setActiveScenario(s.name)}
            className={`text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1.5 border transition-all ${
              activeScenario === s.name
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
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

export function FeatureComparisonTable() {
  const [view, setView] = useState<"all" | "battle">("battle");

  const filtered =
    view === "battle" ? featureComparisons.filter((f) => f.isBattle) : featureComparisons;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
            Side-by-Side Feature Comparison
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView("battle")}
            className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 border transition-all ${
              view === "battle"
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-muted-foreground border-border/50"
            }`}
          >
            Key Differences
          </button>
          <button
            onClick={() => setView("all")}
            className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 border transition-all ${
              view === "all"
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-muted-foreground border-border/50"
            }`}
          >
            All Features
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Feature
              </th>
              <th className="text-center py-3 px-3 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border-x border-border/30">
                SteadyStack
              </th>
              <th className="text-center py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <a
                  href="https://uptimerobot.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-border hover:decoration-primary"
                  title="Verify UptimeRobot pricing & plan specs"
                >
                  UptimeRobot
                  <ExternalLink className="size-2.5 text-muted-foreground/70" />
                </a>
              </th>
              <th className="text-center py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <a
                  href="https://betterstack.com/uptime/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-border hover:decoration-primary"
                  title="Verify Better Stack pricing & plan specs"
                >
                  Better Uptime
                  <ExternalLink className="size-2.5 text-muted-foreground/70" />
                </a>
              </th>
              <th className="text-center py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <a
                  href="https://www.openstatus.dev/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-border hover:decoration-primary"
                  title="Verify OpenStatus pricing & plan specs"
                >
                  OpenStatus
                  <ExternalLink className="size-2.5 text-muted-foreground/70" />
                </a>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((feature, idx) => {
              const renderCell = (val: string | boolean) => {
                if (typeof val === "boolean") {
                  return val ? (
                    <CheckCircle2 className="size-3.5 text-primary mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/30 mx-auto">—</span>
                  );
                }
                return (
                  <span
                    className={`${
                      val.toLowerCase().includes("paid") &&
                      !val.toLowerCase().includes("steadystack")
                        ? "text-yellow-500/80"
                        : val.toLowerCase().includes("steadystack")
                          ? "text-primary font-bold"
                          : val === "false" || val === "—"
                            ? "text-muted-foreground/30"
                            : "text-foreground"
                    }`}
                  >
                    {val}
                  </span>
                );
              };

              return (
                <tr
                  key={feature.name}
                  className={`border-b border-border/30 transition-colors ${
                    feature.isBattle
                      ? "bg-primary/[0.02] hover:bg-primary/[0.04]"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <td className="py-2.5 px-3 text-foreground font-bold text-[11px]">
                    {feature.name}
                    {feature.isBattle && (
                      <span className="ml-2 text-[8px] text-primary/50 font-bold uppercase tracking-widest bg-primary/10 px-1 py-0.5">
                        Battle
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center bg-primary/[0.03] border-x border-border/20">
                    {renderCell(feature.steadystack)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {renderCell(feature.competitor1 ?? false)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {renderCell(feature.competitor2 ?? false)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {renderCell(feature.competitor3 ?? false)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-[10px] font-mono text-muted-foreground">
        <span className="font-bold text-foreground">Last verified August 2026.</span> Specs verified
        against official provider documentation:{" "}
        <a
          href="https://uptimerobot.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          UptimeRobot
        </a>
        ,{" "}
        <a
          href="https://www.checklyhq.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Checkly
        </a>
        ,{" "}
        <a
          href="https://betterstack.com/uptime/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Better Stack
        </a>
        , and{" "}
        <a
          href="https://www.openstatus.dev/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          OpenStatus
        </a>
        .
      </div>
    </div>
  );
}

export function TimeSavingCalculator() {
  const [dailyChecks, setDailyChecks] = useState(1440);
  const competitorChecks = Math.round((dailyChecks / 300) * 60);
  const extraChecks = dailyChecks - competitorChecks;
  const extraPercent = Math.round((extraChecks / competitorChecks) * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checks = parseInt(e.target.value);
    setDailyChecks(checks);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="size-4 text-primary" />
        <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
          The Math: Why 1 Minute Beats 5
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border/50 bg-black/20 p-4">
          <span className="text-[9px] font-mono text-primary/70 uppercase tracking-wider">
            SteadyStack Free (1min)
          </span>
          <p className="text-3xl font-bold font-mono text-primary mt-1">{dailyChecks}</p>
          <span className="text-[10px] font-mono text-muted-foreground">checks per day</span>
        </div>
        <div className="border border-border/50 bg-black/20 p-4">
          <span className="text-[9px] font-mono text-red-500/70 uppercase tracking-wider">
            Industry Standard (5min)
          </span>
          <p className="text-3xl font-bold font-mono text-red-500/80 mt-1">{competitorChecks}</p>
          <span className="text-[10px] font-mono text-muted-foreground">checks per day</span>
        </div>
        <div className="border border-primary/10 bg-primary/5 p-4">
          <span className="text-[9px] font-mono text-primary/70 uppercase tracking-wider">
            You Gain
          </span>
          <p className="text-3xl font-bold font-mono text-primary mt-1">+{extraPercent}%</p>
          <span className="text-[10px] font-mono text-primary/60">
            more visibility ({extraChecks} extra checks/day)
          </span>
        </div>
      </div>

      <div className="border border-border/50 bg-black/20 p-4">
        <label className="text-[10px] font-mono text-muted-foreground">
          Adjust monitors:{" "}
          <span className="text-primary font-bold">
            {Math.round((dailyChecks / 1440) * 50)} monitors
          </span>
        </label>
        <input
          type="range"
          min="288"
          max="2880"
          value={dailyChecks}
          onChange={handleSliderChange}
          className="w-full mt-2 accent-primary h-1.5 bg-border/50 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-none"
        />
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground/50 mt-1">
          <span>10 monitors</span>
          <span>50 monitors</span>
          <span>100 monitors</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
        With SteadyStack&apos;s{" "}
        <span className="text-primary font-bold">1-minute free interval</span>, you get{" "}
        <span className="text-primary font-bold">{extraPercent}% more data points</span> compared to
        the industry 5-minute standard. That&apos;s{" "}
        <span className="text-primary font-bold">{extraChecks}</span> extra opportunities to detect
        failure per day — translating to{" "}
        <span className="text-primary font-bold">~2 minutes faster</span> mean time to detection on
        every incident. Over a year on a single monitor, that&apos;s over{" "}
        <span className="text-primary font-bold">24 hours</span> of downtime you won&apos;t have to
        explain to your customers.
      </p>
    </div>
  );
}
