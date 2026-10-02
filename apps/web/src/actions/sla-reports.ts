"use server";

import prisma from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { getActiveWorkspace } from "@/actions/team";

export type DailySlaData = {
  date: string;
  uptimePct: number;
  downDuration: number; // in minutes
  checksTotal: number;
  checksUp: number;
  checksDown: number;
};

export type SlaReport = {
  monitorId?: string;
  statusPageId?: string;
  scopeName: string;
  period: string;
  startDate: string;
  endDate: string;
  targetSla: number;
  isSlaMet: boolean;
  aggregate: {
    uptimePct: number;
    totalDowntimeMinutes: number;
    allowedDowntimeMinutes: number;
    remainingErrorBudgetPct: number;
    totalChecks: number;
    totalUp: number;
    totalDown: number;
    totalIncidents: number;
    mttrMinutes: number;
    mttdSeconds: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  services: {
    id: string;
    name: string;
    type: string;
    url: string;
    checks: number;
    uptimePct: number;
    downtimeMinutes: number;
    status: "PASS" | "FAIL";
  }[];
  incidents: {
    id: string;
    startedAt: string;
    resolvedAt?: string | null;
    durationMinutes: number;
    serviceName: string;
    reason: string;
    status: string;
    severity: string;
  }[];
  dailyBreakdown: DailySlaData[];
};

export interface SlaReportOptions {
  monitorId?: string;
  statusPageId?: string;
  clientId?: string;
  range?: "7d" | "30d" | "90d" | "this-month" | "last-month" | "custom";
  startDate?: string | Date;
  endDate?: string | Date;
  targetSla?: number; // e.g. 99.9
  agencyName?: string;
  clientName?: string;
  notes?: string;
}

/**
 * Calculates start and end Date objects based on the requested range or custom bounds.
 */
function resolveDateBounds(options: SlaReportOptions): {
  startUtc: Date;
  endUtc: Date;
  periodLabel: string;
} {
  const now = new Date();
  let startUtc: Date;
  let endUtc: Date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
  );
  let periodLabel: string = options.range || "30d";

  if (options.range === "custom" && options.startDate && options.endDate) {
    const s = new Date(options.startDate);
    const e = new Date(options.endDate);
    startUtc = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
    endUtc = new Date(
      Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 23, 59, 59, 999),
    );
    periodLabel = `${startUtc.toISOString().split("T")[0]} - ${endUtc.toISOString().split("T")[0]}`;
  } else if (options.range === "last-month") {
    const prevMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    startUtc = new Date(Date.UTC(prevMonthDate.getUTCFullYear(), prevMonthDate.getUTCMonth(), 1));
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
    endUtc = new Date(
      Date.UTC(
        prevMonthDate.getUTCFullYear(),
        prevMonthDate.getUTCMonth(),
        lastDay,
        23,
        59,
        59,
        999,
      ),
    );
    periodLabel = "Last Month";
  } else if (options.range === "this-month") {
    startUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    periodLabel = "This Month";
  } else if (options.range === "90d") {
    const d = new Date();
    d.setDate(d.getDate() - 89);
    startUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    periodLabel = "Last 90 Days";
  } else if (options.range === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    startUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    periodLabel = "Last 7 Days";
  } else {
    // Default 30d
    const d = new Date();
    d.setDate(d.getDate() - 29);
    startUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    periodLabel = "Last 30 Days";
  }

  return { startUtc, endUtc, periodLabel };
}

/**
 * Generate a comprehensive SLA report across a monitor, status page, or entire workspace.
 */
export async function getComprehensiveSlaReport(
  options: SlaReportOptions = {},
): Promise<SlaReport> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const targetSla = options.targetSla ?? 99.9;
  const { startUtc, endUtc, periodLabel } = resolveDateBounds(options);

  // 1. Resolve Monitors in Scope
  let monitors: {
    id: string;
    name: string;
    type: string;
    url: string;
    interval: number;
  }[] = [];
  let scopeName = "All Workspace Monitors";

  if (options.monitorId) {
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: options.monitorId,
        ...(userId ? { userId } : {}),
      },
      select: { id: true, name: true, type: true, url: true, interval: true },
    });

    if (monitor) {
      monitors = [monitor];
      scopeName = monitor.name;
    }
  } else if (options.clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: options.clientId,
        ...(userId ? { userId } : {}),
      },
      select: {
        name: true,
        monitors: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            interval: true,
          },
        },
      },
    });

    if (client) {
      scopeName = client.name;
      monitors = client.monitors;
    }
  } else if (options.statusPageId) {
    const statusPage = await prisma.statusPage.findFirst({
      where: {
        id: options.statusPageId,
        ...(userId ? { userId } : {}),
      },
      select: {
        title: true,
        monitors: {
          select: {
            monitor: {
              select: {
                id: true,
                name: true,
                type: true,
                url: true,
                interval: true,
              },
            },
          },
        },
      },
    });

    if (statusPage) {
      scopeName = statusPage.title;
      monitors = statusPage.monitors.map((m) => m.monitor);
    }
  } else if (userId) {
    const active = await getActiveWorkspace();
    monitors = await prisma.monitor.findMany({
      where: active?.id ? { organizationId: active.id } : { userId, organizationId: null },
      select: { id: true, name: true, type: true, url: true, interval: true },
      orderBy: { name: "asc" },
    });
  }

  const monitorIds = monitors.map((m) => m.id);

  if (monitorIds.length === 0) {
    return {
      scopeName,
      period: periodLabel,
      startDate: startUtc.toISOString().split("T")[0]!,
      endDate: endUtc.toISOString().split("T")[0]!,
      targetSla,
      isSlaMet: true,
      aggregate: {
        uptimePct: 100,
        totalDowntimeMinutes: 0,
        allowedDowntimeMinutes: 0,
        remainingErrorBudgetPct: 100,
        totalChecks: 0,
        totalUp: 0,
        totalDown: 0,
        totalIncidents: 0,
        mttrMinutes: 0,
        mttdSeconds: 60,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
      },
      services: [],
      incidents: [],
      dailyBreakdown: [],
    };
  }

  // 2. Fetch Historical Daily Summaries
  const summaries = await prisma.dailyMonitorSummary.findMany({
    where: {
      monitorId: { in: monitorIds },
      date: { gte: startUtc, lte: endUtc },
    },
    orderBy: { date: "asc" },
  });

  // 3. Fetch Live Monitor Events for today / unsummarized window
  const todayUtc = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()),
  );
  const liveEvents = await prisma.monitorEvent.findMany({
    where: {
      monitorId: { in: monitorIds },
      timestamp: {
        gte: todayUtc > startUtc ? todayUtc : startUtc,
        lte: endUtc,
      },
    },
    select: {
      monitorId: true,
      status: true,
      latency: true,
      errorReason: true,
      timestamp: true,
    },
  });

  // 4. Fetch Incidents during the window
  const incidentsRaw = await prisma.incident.findMany({
    where: {
      monitorId: { in: monitorIds },
      startedAt: { lte: endUtc },
      OR: [{ resolvedAt: null }, { resolvedAt: { gte: startUtc } }],
    },
    include: {
      monitor: { select: { name: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  // 5. Aggregate per-monitor metrics
  const monitorStatsMap = new Map<
    string,
    {
      checksUp: number;
      checksDown: number;
      checksTotal: number;
      downtimeMinutes: number;
      latencies: number[];
    }
  >();

  for (const m of monitors) {
    monitorStatsMap.set(m.id, {
      checksUp: 0,
      checksDown: 0,
      checksTotal: 0,
      downtimeMinutes: 0,
      latencies: [],
    });
  }

  // Group summaries by date for workspace daily breakdown
  const dailyMap = new Map<
    string,
    {
      date: string;
      checksUp: number;
      checksDown: number;
      checksTotal: number;
      downDuration: number;
    }
  >();

  for (const s of summaries) {
    const stats = monitorStatsMap.get(s.monitorId);
    if (stats) {
      stats.checksUp += s.checksUp;
      stats.checksDown += s.checksDown;
      stats.checksTotal += s.checksTotal;
      stats.downtimeMinutes += s.downDuration;
      if (s.avgLatency > 0) stats.latencies.push(s.avgLatency);
    }

    const dateKey = s.date.toISOString().split("T")[0]!;
    const d = dailyMap.get(dateKey) || {
      date: s.date.toISOString(),
      checksUp: 0,
      checksDown: 0,
      checksTotal: 0,
      downDuration: 0,
    };
    d.checksUp += s.checksUp;
    d.checksDown += s.checksDown;
    d.checksTotal += s.checksTotal;
    d.downDuration += s.downDuration;
    dailyMap.set(dateKey, d);
  }

  // Merge live events for today
  if (liveEvents.length > 0) {
    const todayKey = todayUtc.toISOString().split("T")[0]!;
    const todayDaily = dailyMap.get(todayKey) || {
      date: todayUtc.toISOString(),
      checksUp: 0,
      checksDown: 0,
      checksTotal: 0,
      downDuration: 0,
    };

    for (const e of liveEvents) {
      const stats = monitorStatsMap.get(e.monitorId);
      const isUp = e.status === "UP";
      if (stats) {
        if (isUp) stats.checksUp += 1;
        else {
          stats.checksDown += 1;
          stats.downtimeMinutes += 1;
        }
        stats.checksTotal += 1;
        if (e.latency > 0) stats.latencies.push(e.latency);
      }

      if (isUp) todayDaily.checksUp += 1;
      else {
        todayDaily.checksDown += 1;
        todayDaily.downDuration += 1;
      }
      todayDaily.checksTotal += 1;
    }

    dailyMap.set(todayKey, todayDaily);
  }

  // 6. Build Daily Breakdown Array
  const dailyBreakdown: DailySlaData[] = Array.from(dailyMap.values())
    .map((d) => {
      const valid = d.checksUp + d.checksDown;
      const uptimePct = valid > 0 ? (d.checksUp / valid) * 100 : 100;
      return {
        date: d.date,
        uptimePct,
        downDuration: d.downDuration,
        checksTotal: d.checksTotal,
        checksUp: d.checksUp,
        checksDown: d.checksDown,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 7. Calculate Services Breakdown List
  const services = monitors.map((m) => {
    const s = monitorStatsMap.get(m.id)!;
    const valid = s.checksUp + s.checksDown;
    const uptimePct = valid > 0 ? (s.checksUp / valid) * 100 : 100;
    return {
      id: m.id,
      name: m.name,
      type: m.type,
      url: m.url,
      checks: s.checksTotal,
      uptimePct,
      downtimeMinutes: s.downtimeMinutes,
      status: (uptimePct >= targetSla ? "PASS" : "FAIL") as "PASS" | "FAIL",
    };
  });

  // 8. Overall Aggregate Calculations
  const totalUp = Array.from(monitorStatsMap.values()).reduce((sum, s) => sum + s.checksUp, 0);
  const totalDown = Array.from(monitorStatsMap.values()).reduce((sum, s) => sum + s.checksDown, 0);
  const totalChecks = Array.from(monitorStatsMap.values()).reduce(
    (sum, s) => sum + s.checksTotal,
    0,
  );
  const totalDowntimeMinutes = Array.from(monitorStatsMap.values()).reduce(
    (sum, s) => sum + s.downtimeMinutes,
    0,
  );

  const overallUptimePct = totalUp + totalDown > 0 ? (totalUp / (totalUp + totalDown)) * 100 : 100;
  const isSlaMet = overallUptimePct >= targetSla;

  // Total monitored minutes in the period
  const totalPeriodMinutes = Math.max(
    1,
    Math.round((endUtc.getTime() - startUtc.getTime()) / (1000 * 60)),
  );
  const allowedDowntimeMinutes = (totalPeriodMinutes * (100 - targetSla)) / 100;
  const avgDowntimeMinutes =
    monitors.length > 0 ? totalDowntimeMinutes / monitors.length : totalDowntimeMinutes;
  const remainingErrorBudgetPct =
    allowedDowntimeMinutes > 0
      ? ((allowedDowntimeMinutes - avgDowntimeMinutes) / allowedDowntimeMinutes) * 100
      : avgDowntimeMinutes === 0
        ? 100
        : -100;

  // 9. Latency Calculations
  const allLatencies = Array.from(monitorStatsMap.values())
    .flatMap((s) => s.latencies)
    .sort((a, b) => a - b);
  const avgLatencyMs =
    allLatencies.length > 0
      ? Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length)
      : 0;
  const p95LatencyMs =
    allLatencies.length > 0
      ? allLatencies[Math.floor(allLatencies.length * 0.95)] || avgLatencyMs
      : 0;
  const p99LatencyMs =
    allLatencies.length > 0
      ? allLatencies[Math.floor(allLatencies.length * 0.99)] || p95LatencyMs
      : 0;

  // 10. Incidents Processing & MTTR
  const incidents = incidentsRaw.map((inc) => {
    const end = inc.resolvedAt ? new Date(inc.resolvedAt).getTime() : Date.now();
    const durationMinutes = Math.max(
      1,
      Math.round((end - new Date(inc.startedAt).getTime()) / (1000 * 60)),
    );
    return {
      id: inc.id,
      startedAt: new Date(inc.startedAt).toISOString().replace("T", " ").substring(0, 16) + " UTC",
      resolvedAt: inc.resolvedAt ? new Date(inc.resolvedAt).toISOString() : null,
      durationMinutes,
      serviceName: inc.monitor.name,
      reason: inc.description || inc.title || "Health check threshold breached",
      status: inc.status,
      severity: inc.severity,
    };
  });

  const resolvedIncidents = incidents.filter((i) => i.resolvedAt !== null);
  const mttrMinutes =
    resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((sum, i) => sum + i.durationMinutes, 0) / resolvedIncidents.length
      : totalDowntimeMinutes > 0 && incidents.length > 0
        ? totalDowntimeMinutes / incidents.length
        : 0;

  // MTTD estimate based on check interval (average 45s)
  const avgInterval =
    monitors.reduce((sum, m) => sum + (m.interval || 60), 0) / (monitors.length || 1);
  const mttdSeconds = Math.round(avgInterval * 0.75);

  return {
    monitorId: options.monitorId,
    statusPageId: options.statusPageId,
    scopeName,
    period: periodLabel,
    startDate: startUtc.toISOString().split("T")[0]!,
    endDate: endUtc.toISOString().split("T")[0]!,
    targetSla,
    isSlaMet,
    aggregate: {
      uptimePct: overallUptimePct,
      totalDowntimeMinutes: Math.round(avgDowntimeMinutes),
      allowedDowntimeMinutes,
      remainingErrorBudgetPct,
      totalChecks,
      totalUp,
      totalDown,
      totalIncidents: incidents.length,
      mttrMinutes,
      mttdSeconds,
      avgLatencyMs,
      p95LatencyMs,
      p99LatencyMs,
    },
    services,
    incidents,
    dailyBreakdown,
  };
}

/**
 * Backwards compatible helper for existing monitor detail callers.
 */
export async function getSlaReport(
  monitorId: string,
  range: "7d" | "30d" = "7d",
): Promise<SlaReport> {
  return getComprehensiveSlaReport({
    monitorId,
    range,
  });
}
