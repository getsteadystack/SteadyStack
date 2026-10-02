"use server";

import prisma from "@steadystack/db";

export type LatencyDataPoint = {
  timestamp: string; // ISO string for client serialization
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
};

export async function getMonitorLatencyHistory(
  monitorId: string,
  timeRange: "24h" = "24h",
): Promise<LatencyDataPoint[]> {
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const aggregates = await prisma.latencyAggregate.findMany({
    where: {
      monitorId: monitorId,
      timestamp: {
        gte: past24h,
      },
      granularity: "ONE_MINUTE", // Assuming we want high-res data, fallback to HOURLY if volume is huge
    },
    orderBy: {
      timestamp: "asc",
    },
    select: {
      timestamp: true,
      avgLatency: true,
      minLatency: true,
      maxLatency: true,
      p95Latency: true,
    },
  });

  if (aggregates.length > 0) {
    // Transform for client
    return aggregates.map((agg) => ({
      timestamp: agg.timestamp.toISOString(),
      avgLatency: agg.avgLatency,
      minLatency: agg.minLatency,
      maxLatency: agg.maxLatency,
      p95Latency: agg.p95Latency,
    }));
  }

  // Fallback: Query raw MonitorEvents for the last 24 hours (helpful in local dev where aggregates aren't cron-created)
  const events = await prisma.monitorEvent.findMany({
    where: {
      monitorId: monitorId,
      timestamp: {
        gte: past24h,
      },
      status: "UP", // Only average/min/max of successful checks
    },
    orderBy: {
      timestamp: "asc",
    },
    select: {
      timestamp: true,
      latency: true,
    },
  });

  const groups = new Map<string, number[]>();
  for (const event of events) {
    const date = new Date(event.timestamp);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const key = date.toISOString();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(event.latency);
  }

  const result: LatencyDataPoint[] = [];
  for (const [timestamp, lats] of groups.entries()) {
    const len = lats.length;
    lats.sort((a, b) => a - b);

    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += lats[i] as number;
    }

    const avg = sum / len;
    const min = lats[0] as number;
    const max = lats[len - 1] as number;
    const p95 = lats[Math.floor(len * 0.95)] ?? avg;

    result.push({
      timestamp,
      avgLatency: avg,
      minLatency: min,
      maxLatency: max,
      p95Latency: p95,
    });
  }
  return result;
}
