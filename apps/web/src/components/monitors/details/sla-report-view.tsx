"use client";

import { useQuery } from "@tanstack/react-query";
import { getSlaReport } from "@/actions/sla-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Render the SLA report view for a specific monitor.
 *
 * This function fetches the SLA report data based on the provided monitorId and selected time range. It handles loading and error states, displays summary cards for overall uptime, total downtime, total checks, and SLA status, and renders a daily uptime breakdown chart. The visual representation of the SLA status is determined by comparing the uptime percentage against a threshold.
 *
 * @param monitorId - The ID of the monitor for which the SLA report is generated.
 * @returns A JSX element representing the SLA report view.
 */
export function SlaReportView({ monitorId }: { monitorId: string }) {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const { data, isLoading, error } = useQuery({
    queryKey: ["sla-report", monitorId, range],
    queryFn: () => getSlaReport(monitorId, range),
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl bg-muted/60" />;
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/10 rounded-2xl">
        <CardContent className="flex items-center justify-center p-6 text-red-600 font-mono text-xs">
          Failed to load SLA Report
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { aggregate, dailyBreakdown } = data;
  const isSlaMet = aggregate.uptimePct >= 99.9; // Threshold for visual cue

  // Calculate dynamic Y-axis domain
  const minUptime = Math.min(...dailyBreakdown.map((d) => d.uptimePct));
  const domainMin = Math.max(0, Math.floor(minUptime - 0.5));

  const handleDownloadPdf = () => {
    window.location.href = `/api/reports/sla?monitorId=${monitorId}&range=${range}&format=pdf&targetSla=99.9`;
  };

  const handleDownloadCsv = () => {
    window.location.href = `/api/reports/sla?monitorId=${monitorId}&range=${range}&format=csv&targetSla=99.9`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-serif font-medium text-foreground">SLA & Uptime Report</h3>
          <p className="text-xs text-muted-foreground font-mono">
            Contractual uptime compliance and delivery metrics for this service.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={range} onValueChange={(v: "7d" | "30d") => setRange(v)}>
            <SelectTrigger className="w-[140px] bg-card border-border font-mono text-xs h-8 rounded-xl">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border font-mono text-xs rounded-xl">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="h-8 font-mono text-xs gap-1.5 border-border bg-card text-foreground hover:bg-accent rounded-xl"
          >
            <FileText className="size-3.5 text-muted-foreground" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            className="h-8 font-mono text-xs gap-1.5 border-border bg-card text-foreground hover:bg-accent rounded-xl"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            CSV
          </Button>

          <Link
            href={`/dashboard/reports?scope=monitor:${monitorId}`}
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground pl-2"
          >
            Full Hub
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border bg-card rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
              Overall Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                isSlaMet ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {Number(aggregate?.uptimePct ?? 100).toFixed(3)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Target: 99.90%</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
              Total Downtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono tracking-tight">
              {aggregate?.totalDowntimeMinutes ?? 0}m
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              across {aggregate?.totalDown ?? 0} failures
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "rounded-2xl border transition-colors duration-500 shadow-xs",
            isSlaMet ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
              SLA Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {isSlaMet ? (
              <>
                <CheckCircle2 className="size-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-600 font-mono">PASS</span>
              </>
            ) : (
              <>
                <AlertTriangle className="size-5 text-red-600" />
                <span className="text-lg font-bold text-red-600 font-mono">FAIL</span>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Chart */}
      <Card className="border-border bg-card rounded-2xl shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
            Daily Uptime Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => format(new Date(val as string | number), "MMM d")}
                  stroke="#8c8b85"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#8c8b85"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[domainMin, 100]}
                  tickFormatter={(val) => `${val}%`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const dateStr = format(new Date(label as string | number), "MMM d, yyyy");
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-md font-mono text-xs">
                          <p className="mb-2 font-semibold text-foreground">{dateStr}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "size-2 rounded-full",
                                  data.uptimePct >= 99.9 ? "bg-emerald-600" : "bg-red-600",
                                )}
                              />
                              <p className="text-xs font-bold text-foreground font-mono">
                                {Number(data.uptimePct).toFixed(3)}%
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Downtime: {data.downDuration} min
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Checks: {data.checksTotal} (Down: {data.checksDown})
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={99.9} stroke="#10b981" strokeDasharray="3 3" opacity={0.6} />
                <Bar dataKey="uptimePct" radius={[4, 4, 0, 0]}>
                  {dailyBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.uptimePct >= 99.9 ? "#10b981" : "#ef4444"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
