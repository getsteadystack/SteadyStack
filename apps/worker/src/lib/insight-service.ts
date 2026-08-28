import type { PrismaClient } from "@steadystack/db";

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
   * Component: Intelligent Insight Generator
   * Responsible for creating or updating actionable hints and performance anomalies.
   */
  async createInsight(data: {
    monitorId: string;
    type: InsightType;
    severity: InsightSeverity;
    message: string;
    metadata?: InsightMetadata;
  }) {
    // Limit spam: Only create if no active insight of same type in last 5 minutes
    // unless severity is CRITICAL.
    const windowMs = data.severity === InsightSeverity.CRITICAL ? 60 * 1000 : 5 * 60 * 1000;

    const recent = await this.prisma.monitorInsight.findFirst({
      where: {
        monitorId: data.monitorId,
        type: data.type as any,
        dismissed: false,
        createdAt: { gt: new Date(Date.now() - windowMs) },
      },
    });

    if (recent) {
      // Update message if it's more specific or just refresh the timestamp
      return this.prisma.monitorInsight.update({
        where: { id: recent.id },
        data: {
          message: data.message,
          createdAt: new Date(), // Push to top
          metadata: data.metadata ? (data.metadata as any) : undefined,
        },
      });
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

    console.log(`[Insight] Created ${data.type} for monitor ${data.monitorId}: ${data.message}`);
    return insight;
  }

  /**
   * Phase 2: Heuristic Analysis
   * Analyze recent events to provide contextual advice.
   */
  async analyzeAndProvideAdvice(monitorId: string, monitorName: string, recentEvents: any[]) {
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
      });
    }

    // 2. Detect High Failure Rate in specific region if possible (Handled in index.ts for efficiency)
  }
}
