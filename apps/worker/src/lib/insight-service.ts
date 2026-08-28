import type { PrismaClient, MonitorEvent } from "@steadystack/db";

export enum InsightType {
  ANOMALY = "ANOMALY",
  ADVICE = "ADVICE",
  PREDICTION = "PREDICTION",
}

export enum InsightSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export interface InsightMetadata {
  zScore?: number;
  score?: number;
  latency?: number;
  region?: string;
  diff?: number;
  avg?: number;
  baselineMean?: number;
  impactedRegions?: string[];
  [key: string]: unknown;
}

export class InsightService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Preload active insights for a batch of monitors to avoid N+1 queries during creation.
   * Returns a Map of cached insights created in the last 5 minutes.
   */
  async preloadActiveInsights(monitorIds: string[]): Promise<Map<string, any>> {
    const cache = new Map<string, any>();
    if (monitorIds.length === 0) return cache;

    // Use the maximum window to ensure we cover all types (5 minutes)
    const maxWindowMs = 5 * 60 * 1000;

    const recentInsights = await this.prisma.monitorInsight.findMany({
      where: {
        monitorId: { in: monitorIds },
        dismissed: false,
        createdAt: { gt: new Date(Date.now() - maxWindowMs) },
      },
    });

    for (const insight of recentInsights) {
      const cacheKey = `${insight.monitorId}_${insight.type}`;
      // In case of multiple, just keep the most recent one
      const existing = cache.get(cacheKey);
      if (!existing || new Date(insight.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
         cache.set(cacheKey, insight);
      }
    }
    return cache;
  }

  /**
   * Component: Intelligent Insight Generator
   * Responsible for creating or updating actionable hints and performance anomalies.
   */
  async createInsight(data: {
    monitorId: string;
    type: InsightType;
    severity: InsightSeverity;
    message: string;
    metadata?: InsightMetadata;
  }, activeInsightsCache?: Map<string, any>) {
    // Limit spam: Only create if no active insight of same type in last 5 minutes
    // unless severity is CRITICAL.
    const windowMs = data.severity === InsightSeverity.CRITICAL ? 60 * 1000 : 5 * 60 * 1000;
    const thresholdTime = Date.now() - windowMs;

    let recent: any = null;
    const cacheKey = `${data.monitorId}_${data.type}`;

    if (activeInsightsCache && activeInsightsCache.has(cacheKey)) {
      const cachedInsight = activeInsightsCache.get(cacheKey);
      // Check if the cached insight is within the required window
      if (cachedInsight && new Date(cachedInsight.createdAt).getTime() > thresholdTime) {
        recent = cachedInsight;
      }
    } else if (!activeInsightsCache) {
      // Fallback for isolated calls where preload wasn't used
      recent = await this.prisma.monitorInsight.findFirst({
        where: {
          monitorId: data.monitorId,
          type: data.type as any,
          dismissed: false,
          createdAt: { gt: new Date(thresholdTime) },
        },
      });
    }

    if (recent) {
      // Update message if it's more specific or just refresh the timestamp
      const updated = await this.prisma.monitorInsight.update({
        where: { id: recent.id },
        data: {
          message: data.message,
          createdAt: new Date(), // Push to top
          metadata: data.metadata ? (data.metadata as any) : undefined,
        },
      });

      if (activeInsightsCache) {
        activeInsightsCache.set(cacheKey, updated);
      }

      return updated;
    }

    const insight = await this.prisma.monitorInsight.create({
      data: {
        monitorId: data.monitorId,
        type: data.type as any,
        severity: data.severity as any,
        message: data.message,
        metadata: data.metadata ? (data.metadata as any) : undefined,
      },
    });

    if (activeInsightsCache) {
      activeInsightsCache.set(cacheKey, insight);
    }

    console.log(`[Insight] Created ${data.type} for monitor ${data.monitorId}: ${data.message}`);
    return insight;
  }

  /**
   * Phase 2: Heuristic Analysis
   * Analyze recent events to provide contextual advice.
   */
  async analyzeAndProvideAdvice(monitorId: string, monitorName: string, recentEvents: MonitorEvent[], activeInsightsCache?: Map<string, any>) {
    if (recentEvents.length < 5) return;

    const latencies = recentEvents.map((e) => e.latency);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    // 1. Detect Latency Drift (Advice)
    const firstHalf = latencies.slice(0, Math.floor(latencies.length / 2));
    const recentHalf = latencies.slice(Math.floor(latencies.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;

    if (recentAvg > firstAvg * 1.5) {
      await this.createInsight({
        monitorId,
        type: InsightType.ADVICE,
        severity: InsightSeverity.WARNING,
        message: `Performance Degradation: ${monitorName} is 50% slower than its 24h baseline. Check for server-side resource exhaustion.`,
        metadata: { diff: recentAvg - firstAvg, avg },
      }, activeInsightsCache);
    }

    // 2. Detect High Failure Rate in specific region if possible (Handled in index.ts for efficiency)
  }
}
