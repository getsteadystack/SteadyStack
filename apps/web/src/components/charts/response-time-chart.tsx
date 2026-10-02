"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserPreferences } from "@/hooks/use-user-preferences";

type LatencyDataPoint = {
  timestamp: string;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
};

interface ResponseTimeChartProps {
  data: LatencyDataPoint[];
  isLoading?: boolean;
  className?: string;
}

export function ResponseTimeChart({ data, isLoading, className }: ResponseTimeChartProps) {
  // Get user preferences for timezone
  const { data: preferences } = useUserPreferences();
  const timeZone = preferences?.timezone || "UTC";

  // Determine chart color based on overall health (latest or average)
  const chartColor = useMemo(() => {
    if (!data.length) return "#10b981"; // Emerald-500

    // Calculate simple average of the dataset for color determination
    const totalLatency = data.reduce((sum, item) => sum + item.avgLatency, 0);
    const avg = totalLatency / data.length;

    if (avg > 1000) return "#ef4444"; // Red-500
    if (avg > 500) return "#f59e0b"; // Amber-500
    return "#10b981"; // Emerald-500
  }, [data]);

  const formatTime = (timeStr: string | number | undefined) => {
    if (!timeStr) return "";
    try {
      return new Date(timeStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      });
    } catch (e) {
      return format(new Date(timeStr), "HH:mm");
    }
  };

  const formatTooltipTime = (timeStr: string | number | undefined) => {
    if (!timeStr) return "";
    try {
      return new Date(timeStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      });
    } catch {
      return format(new Date(timeStr), "MMM d, HH:mm");
    }
  };

  if (isLoading) {
    return (
      <Card
        className={cn(
          "flex min-h-[350px] items-center justify-center border-border bg-card rounded-2xl shadow-xs",
          className,
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card
        className={cn(
          "flex min-h-[350px] items-center justify-center border-border bg-card rounded-2xl shadow-xs",
          className,
        )}
      >
        <p className="text-xs text-muted-foreground font-mono">
          No traffic data available for this period.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-border bg-card rounded-2xl shadow-xs", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold font-mono uppercase tracking-wider text-foreground">
          Response Time
          <span className="text-xs font-normal text-muted-foreground font-mono lowercase">
            (24h)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e8e6df"
                opacity={0.8}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#8c8b85"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={50}
                dy={10}
              />
              <YAxis
                stroke="#8c8b85"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ms`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-md font-mono text-xs">
                        <p className="mb-2 font-semibold text-foreground">
                          {formatTooltipTime(label)}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2 rounded-full"
                              style={{ backgroundColor: chartColor }}
                            />
                            <span className="text-xs font-bold text-foreground">
                              {Number(payload[0].value).toFixed(0)} ms
                            </span>
                            <span className="text-[10px] text-muted-foreground">(avg)</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: chartColor, opacity: 0.3 }}
              />
              <Area
                type="monotone"
                dataKey="avgLatency"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
