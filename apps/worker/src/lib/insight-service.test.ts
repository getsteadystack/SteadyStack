import { mock, describe, it, expect, beforeEach } from "bun:test";

mock.module("@steadystack/db", () => ({
  LatencyGranularity: { ONE_MINUTE: "ONE_MINUTE" },
}));

import { InsightService, InsightType, InsightSeverity } from "./insight-service";

const getMockPrisma = () =>
  ({
    monitorInsight: {
      findFirst: mock(async () => null),
      create: mock(async (args: any) => ({ id: "insight-new", ...args.data })),
      update: mock(async (args: any) => ({ id: args.where.id, ...args.data })),
    },
  }) as any;

describe("InsightService", () => {
  let mockPrisma: any;
  let service: InsightService;

  beforeEach(() => {
    mockPrisma = getMockPrisma();
    service = new InsightService(mockPrisma);
  });

  describe("createInsight", () => {
    it("should create a new insight if no recent active insight exists", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValueOnce(null);

      const result = await service.createInsight({
        monitorId: "mon-1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.INFO,
        message: "Test message",
        metadata: { diff: 10 },
      });

      expect(mockPrisma.monitorInsight.findFirst).toHaveBeenCalledTimes(1);
      const findArgs = mockPrisma.monitorInsight.findFirst.mock.calls[0][0];
      expect(findArgs.where.monitorId).toBe("mon-1");
      expect(findArgs.where.type).toBe(InsightType.ANOMALY);

      expect(mockPrisma.monitorInsight.create).toHaveBeenCalledTimes(1);
      const createArgs = mockPrisma.monitorInsight.create.mock.calls[0][0];
      expect(createArgs.data.message).toBe("Test message");
      expect(createArgs.data.metadata.diff).toBe(10);
      expect(result.id).toBe("insight-new");
    });

    it("should update existing insight if a recent active one exists within window", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValueOnce({ id: "insight-existing" });

      const result = await service.createInsight({
        monitorId: "mon-1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.INFO,
        message: "Updated message",
      });

      expect(mockPrisma.monitorInsight.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.monitorInsight.create).not.toHaveBeenCalled();

      expect(mockPrisma.monitorInsight.update).toHaveBeenCalledTimes(1);
      const updateArgs = mockPrisma.monitorInsight.update.mock.calls[0][0];
      expect(updateArgs.where.id).toBe("insight-existing");
      expect(updateArgs.data.message).toBe("Updated message");
      expect(updateArgs.data.createdAt).toBeInstanceOf(Date);
      expect(result.id).toBe("insight-existing");
    });

    it("should use a 1-minute window for CRITICAL severity and 5-minute for others", async () => {
      const now = Date.now();

      // Test non-critical (5 mins)
      await service.createInsight({
        monitorId: "mon-1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.WARNING,
        message: "Warning message",
      });

      let findArgs = mockPrisma.monitorInsight.findFirst.mock.calls[0][0];
      let timeDiff = now - findArgs.where.createdAt.gt.getTime();
      // Should be roughly 5 minutes (300,000 ms)
      expect(timeDiff).toBeGreaterThanOrEqual(299000);
      expect(timeDiff).toBeLessThanOrEqual(301000);

      // Test critical (1 min)
      await service.createInsight({
        monitorId: "mon-1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.CRITICAL,
        message: "Critical message",
      });

      findArgs = mockPrisma.monitorInsight.findFirst.mock.calls[1][0];
      timeDiff = now - findArgs.where.createdAt.gt.getTime();
      // Should be roughly 1 minute (60,000 ms)
      expect(timeDiff).toBeGreaterThanOrEqual(59000);
      expect(timeDiff).toBeLessThanOrEqual(61000);
    });
  });

  describe("analyzeAndProvideAdvice", () => {
    it("should do nothing if recentEvents length is less than 5", async () => {
      const events = Array(4).fill({ latency: 100 });
      await service.analyzeAndProvideAdvice("mon-1", "Monitor 1", events as any);

      expect(mockPrisma.monitorInsight.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.create).not.toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.update).not.toHaveBeenCalled();
    });

    it("should not create advice if recent latency is not significantly higher (> 1.5x)", async () => {
      // 6 events, first half avg: 100, recent half avg: 140 (1.4x, which is <= 1.5x)
      const events = [
        { latency: 100 },
        { latency: 100 },
        { latency: 100 },
        { latency: 140 },
        { latency: 140 },
        { latency: 140 },
      ];

      await service.analyzeAndProvideAdvice("mon-1", "Monitor 1", events as any);

      expect(mockPrisma.monitorInsight.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.create).not.toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.update).not.toHaveBeenCalled();
    });

    it("should create ADVICE insight if recent latency is > 1.5x of first half", async () => {
      // 6 events, first half avg: 100, recent half avg: 160 (1.6x, which is > 1.5x)
      const events = [
        { latency: 100 },
        { latency: 100 },
        { latency: 100 },
        { latency: 160 },
        { latency: 160 },
        { latency: 160 },
      ];

      await service.analyzeAndProvideAdvice("mon-1", "Monitor 1", events as any);

      expect(mockPrisma.monitorInsight.findFirst).toHaveBeenCalledTimes(1);

      const createArgs = mockPrisma.monitorInsight.create.mock.calls[0][0];
      expect(createArgs.data.type).toBe(InsightType.ADVICE);
      expect(createArgs.data.severity).toBe(InsightSeverity.WARNING);
      expect(createArgs.data.message).toContain("Performance Degradation: Monitor 1 is 50% slower");
      expect(createArgs.data.metadata.diff).toBe(60); // 160 - 100
      expect(createArgs.data.metadata.avg).toBe(130); // (100*3 + 160*3) / 6
    });
  });
});
