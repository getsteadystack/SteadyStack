"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DAILY_ALERT_SERIES, FAILURE_MODE_DISTRIBUTION } from "@/content/benchmarks-data";
import { BarChart3 } from "lucide-react";

export function BenchmarkCharts() {
  const [activeTab, setActiveTab] = useState<"cumulative" | "failure_modes" | "daily">(
    "cumulative",
  );

  // Compute cumulative series for 30-day timeline
  const cumulativeData = useMemo(() => {
    let pgSum = 0;
    let urSum = 0;
    let pdSum = 0;

    return DAILY_ALERT_SERIES.map((item) => {
      pgSum += item.steadystackSpurious;
      urSum += item.uptimerobotSpurious;
      pdSum += item.pingdomSpurious;

      return {
        date: item.date,
        day: item.day,
        "SteadyStack (Edge Quorum)": pgSum,
        "UptimeRobot (Pro)": urSum,
        "Pingdom (Advanced)": pdSum,
        trueOutages: item.trueOutages,
      };
    });
  }, []);

  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df] relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header with Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
              <BarChart3 className="size-3.5 text-[#23211a]" />
              <span>Visual Data Analysis</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08]">
              30-Day Alert Distribution Trends
            </h2>
            <p className="text-[#5c5c5c] text-base sm:text-lg max-w-xl mt-3 font-sans leading-relaxed">
              Compare spurious alert accumulation, failure mode vulnerabilities, and daily incident
              volatility.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-white border border-[#e8e6df] shrink-0 self-start md:self-auto shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("cumulative")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTab === "cumulative"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]"
              }`}
            >
              Cumulative Spurious Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("failure_modes")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTab === "failure_modes"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]"
              }`}
            >
              By Failure Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("daily")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTab === "daily"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]"
              }`}
            >
              Daily Spikes
            </button>
          </div>
        </div>

        {/* Chart Canvas Card */}
        <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 md:p-8 shadow-xs text-left">
          {activeTab === "cumulative" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-serif font-medium text-[#23211a]">
                    Cumulative Spurious Alerts (30 Days)
                  </h3>
                  <p className="text-xs text-[#5c5c5c] font-sans mt-0.5">
                    Accumulation of false pages dispatched to engineering teams over 720 hours.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-600" />
                    SteadyStack: <strong className="text-emerald-700">0</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-sky-500" />
                    UptimeRobot: <strong className="text-sky-700">28</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-amber-500" />
                    Pingdom: <strong className="text-amber-700">41</strong>
                  </span>
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cumulativeData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="pgGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="urGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="pdGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#868279"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#868279" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-[#e8e6df] bg-white p-3.5 shadow-lg font-mono text-xs text-[#23211a]">
                              <p className="font-bold text-[#23211a] mb-2 text-sm font-serif">
                                {label} (Day {payload[0]?.payload?.day})
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-6 text-emerald-700 font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-emerald-600" />
                                    SteadyStack:
                                  </span>
                                  <span>0 false alerts</span>
                                </div>
                                <div className="flex items-center justify-between gap-6 text-sky-700 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-sky-500" />
                                    UptimeRobot:
                                  </span>
                                  <span>
                                    {payload.find((p) => p.dataKey === "UptimeRobot (Pro)")?.value}{" "}
                                    alerts
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-6 text-amber-700 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-amber-500" />
                                    Pingdom:
                                  </span>
                                  <span>
                                    {payload.find((p) => p.dataKey === "Pingdom (Advanced)")?.value}{" "}
                                    alerts
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Pingdom (Advanced)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pdGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="UptimeRobot (Pro)"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#urGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="SteadyStack (Edge Quorum)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#pgGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "failure_modes" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-serif font-medium text-[#23211a]">
                  Spurious Alert Triggers by Network Failure Mode
                </h3>
                <p className="text-xs text-[#5c5c5c] font-sans mt-0.5">
                  Which transient network edge events caused monitoring platforms to falsely page
                  on-call engineers.
                </p>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={FAILURE_MODE_DISTRIBUTION}
                    margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" vertical={false} />
                    <XAxis
                      dataKey="mode"
                      stroke="#868279"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#868279" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = FAILURE_MODE_DISTRIBUTION.find((f) => f.mode === label);
                          return (
                            <div className="rounded-xl border border-[#e8e6df] bg-white p-3.5 shadow-lg font-mono text-xs max-w-xs text-[#23211a]">
                              <p className="font-bold text-[#23211a] text-sm mb-1 font-serif">
                                {label}
                              </p>
                              <p className="text-[11px] text-[#5c5c5c] font-sans mb-3">
                                {item?.description}
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-emerald-700 font-bold">
                                  <span>SteadyStack:</span>
                                  <span>
                                    {payload.find((p) => p.dataKey === "steadystack")?.value}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sky-700 font-semibold">
                                  <span>UptimeRobot:</span>
                                  <span>
                                    {payload.find((p) => p.dataKey === "uptimerobot")?.value}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-amber-700 font-semibold">
                                  <span>Pingdom:</span>
                                  <span>{payload.find((p) => p.dataKey === "pingdom")?.value}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                      }}
                    />
                    <Bar
                      dataKey="steadystack"
                      name="SteadyStack (Edge Quorum)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="uptimerobot"
                      name="UptimeRobot (Pro)"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pingdom"
                      name="Pingdom (Advanced)"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "daily" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-serif font-medium text-[#23211a]">
                  Daily False Alarm Volatility (Day 1 - 30)
                </h3>
                <p className="text-xs text-[#5c5c5c] font-sans mt-0.5">
                  Daily spurious alert count per platform, showing sporadic on-call interruptions.
                </p>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={DAILY_ALERT_SERIES}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#868279"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#868279" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-[#e8e6df] bg-white p-3.5 shadow-lg font-mono text-xs text-[#23211a]">
                              <p className="font-bold text-[#23211a] mb-2 text-sm font-serif">
                                {label}
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-emerald-700 font-bold">
                                  <span>SteadyStack False Alerts:</span>
                                  <span>0</span>
                                </div>
                                <div className="flex items-center justify-between text-sky-700 font-semibold">
                                  <span>UptimeRobot False Alerts:</span>
                                  <span>
                                    {
                                      payload.find((p) => p.dataKey === "uptimerobotSpurious")
                                        ?.value
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-amber-700 font-semibold">
                                  <span>Pingdom False Alerts:</span>
                                  <span>
                                    {payload.find((p) => p.dataKey === "pingdomSpurious")?.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                      }}
                    />
                    <Bar
                      dataKey="steadystackSpurious"
                      name="SteadyStack (Edge Quorum)"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="uptimerobotSpurious"
                      name="UptimeRobot (Pro)"
                      fill="#0ea5e9"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="pingdomSpurious"
                      name="Pingdom (Advanced)"
                      fill="#f59e0b"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
