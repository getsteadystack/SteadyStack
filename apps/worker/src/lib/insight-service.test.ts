import { describe, expect, it, mock, beforeEach } from "bun:test";
import { InsightService, InsightSeverity, InsightType } from "./insight-service";

describe("InsightService", () => {
  let prismaMock: any;
  let insightService: InsightService;

  beforeEach(() => {
    prismaMock = {
      monitorInsight: {
        findFirst: mock(() => Promise.resolve(null)),
        update: mock((args) => Promise.resolve({ ...args.data, id: args.where.id })),
        create: mock((args) => Promise.resolve({ ...args.data, id: "new-id" })),
        findMany: mock(() => Promise.resolve([])),
      },
    };
    insightService = new InsightService(prismaMock);
  });

  it("should create insight if no recent insight exists", async () => {
    await insightService.createInsight({
      monitorId: "m1",
      type: InsightType.ANOMALY,
      severity: InsightSeverity.WARNING,
      message: "Test msg",
    });

    expect(prismaMock.monitorInsight.findFirst).toHaveBeenCalled();
    expect(prismaMock.monitorInsight.create).toHaveBeenCalled();
    expect(prismaMock.monitorInsight.update).not.toHaveBeenCalled();
  });

  it("should update insight if recent insight exists", async () => {
    prismaMock.monitorInsight.findFirst.mockResolvedValueOnce({
      id: "existing-id",
      monitorId: "m1",
      type: InsightType.ANOMALY,
      dismissed: false,
    });

    await insightService.createInsight({
      monitorId: "m1",
      type: InsightType.ANOMALY,
      severity: InsightSeverity.WARNING,
      message: "Test msg updated",
    });

    expect(prismaMock.monitorInsight.findFirst).toHaveBeenCalled();
    expect(prismaMock.monitorInsight.create).not.toHaveBeenCalled();
    expect(prismaMock.monitorInsight.update).toHaveBeenCalled();
  });

  it("preload should populate the cache and avoid findFirst queries", async () => {
    // We will add preload methods and test them here
  });
});
