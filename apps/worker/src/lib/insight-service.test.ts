import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import { InsightService, InsightType, InsightSeverity } from "./insight-service";

describe("InsightService", () => {
  let mockPrisma: any;
  let service: InsightService;

  beforeEach(() => {
    mockPrisma = {
      monitorInsight: {
        findFirst: mock(),
        update: mock(),
        create: mock(),
      },
    };
    service = new InsightService(mockPrisma);
  });

  describe("createInsight", () => {
    it("should create a new insight if no recent insight exists", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValue(null);
      mockPrisma.monitorInsight.create.mockResolvedValue({ id: "new-id" });

      const result = await service.createInsight({
        monitorId: "m1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.WARNING,
        message: "Test message",
      });

      expect(mockPrisma.monitorInsight.findFirst).toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.create).toHaveBeenCalledWith({
        data: {
          monitorId: "m1",
          type: InsightType.ANOMALY,
          severity: InsightSeverity.WARNING,
          message: "Test message",
          metadata: undefined,
        },
      });
      expect(result).toEqual({ id: "new-id" });
    });

    it("should update existing insight if recent insight exists", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValue({ id: "existing-id" });
      mockPrisma.monitorInsight.update.mockResolvedValue({ id: "existing-id", message: "New message" });

      const result = await service.createInsight({
        monitorId: "m1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.WARNING,
        message: "New message",
      });

      expect(mockPrisma.monitorInsight.update).toHaveBeenCalled();
      expect(mockPrisma.monitorInsight.create).not.toHaveBeenCalled();

      const updateCall = mockPrisma.monitorInsight.update.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: "existing-id" });
      expect(updateCall.data.message).toBe("New message");
      expect(result).toEqual({ id: "existing-id", message: "New message" });
    });

    it("should use different window for CRITICAL severity", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValue(null);

      const now = Date.now();

      await service.createInsight({
        monitorId: "m1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.CRITICAL,
        message: "Critical",
      });

      const call = mockPrisma.monitorInsight.findFirst.mock.calls[0][0];
      const gt = call.where.createdAt.gt.getTime();

      // CRITICAL window is 60s
      expect(now - gt).toBeCloseTo(60000, -2); // Using negative precision for roughly equal
    });

    it("should use different window for non-CRITICAL severity", async () => {
      mockPrisma.monitorInsight.findFirst.mockResolvedValue(null);

      const now = Date.now();

      await service.createInsight({
        monitorId: "m1",
        type: InsightType.ANOMALY,
        severity: InsightSeverity.WARNING,
        message: "Warning",
      });

      const call = mockPrisma.monitorInsight.findFirst.mock.calls[0][0];
      const gt = call.where.createdAt.gt.getTime();

      // WARNING window is 5m
      expect(now - gt).toBeCloseTo(300000, -2);
    });
  });

  describe("analyzeAndProvideAdvice", () => {
    it("should not do anything if less than 5 events", async () => {
      const createSpy = spyOn(service, "createInsight").mockResolvedValue(undefined as any);

      await service.analyzeAndProvideAdvice("m1", "Monitor 1", [
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
      ]);

      expect(createSpy).not.toHaveBeenCalled();
    });

    it("should not create insight if no degradation", async () => {
      const createSpy = spyOn(service, "createInsight").mockResolvedValue(undefined as any);

      await service.analyzeAndProvideAdvice("m1", "Monitor 1", [
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
      ]);

      expect(createSpy).not.toHaveBeenCalled();
    });

    it("should create ADVICE insight if degradation > 1.5x", async () => {
      const createSpy = spyOn(service, "createInsight").mockResolvedValue(undefined as any);

      // first half avg = 100
      // recent half avg = 200
      await service.analyzeAndProvideAdvice("m1", "Monitor 1", [
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 100 } as any,
        { latency: 200 } as any,
        { latency: 200 } as any,
        { latency: 200 } as any,
      ]);

      expect(createSpy).toHaveBeenCalledWith({
        monitorId: "m1",
        type: InsightType.ADVICE,
        severity: InsightSeverity.WARNING,
        message: expect.stringContaining("50% slower"),
        metadata: { diff: 100, avg: 150 },
      });
    });
  });
});
