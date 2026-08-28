import { InsightService, InsightType, InsightSeverity } from "./src/lib/insight-service";

async function runBenchmarkMock() {
  const monitorsCount = 1000;
  let findFirstCalls = 0;
  let updateCalls = 0;
  let createCalls = 0;
  let findManyCalls = 0;

  const dbDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const prismaMock = {
    monitorInsight: {
      findFirst: async () => {
        findFirstCalls++;
        await dbDelay(2); // simulate 2ms network roundtrip
        return null;
      },
      findMany: async () => {
        findManyCalls++;
        await dbDelay(5);
        return [];
      },
      update: async (args: any) => {
        updateCalls++;
        await dbDelay(3);
        return { ...args.data, id: args.where.id };
      },
      create: async (args: any) => {
        createCalls++;
        await dbDelay(3);
        return { ...args.data, id: "new-id" };
      }
    }
  };

  const service = new InsightService(prismaMock as any);
  const monitorIds = Array.from({ length: monitorsCount }, (_, i) => `m${i}`);

  // 1. Baseline
  console.log("Starting Baseline Benchmark (N+1) with 1000 items...");
  const startBaseline = performance.now();
  for (const monitorId of monitorIds) {
    await service.createInsight({
      monitorId,
      type: InsightType.ANOMALY,
      severity: InsightSeverity.WARNING,
      message: "Test insight",
    });
  }
  const endBaseline = performance.now();
  console.log(`Baseline time: ${(endBaseline - startBaseline).toFixed(2)}ms`);
  console.log(`DB calls: findFirst=${findFirstCalls}, create=${createCalls}`);

  // Reset counters
  findFirstCalls = 0;
  createCalls = 0;
  findManyCalls = 0;

  const optimizedService = new InsightService(prismaMock as any);

  // 2. Preload
  console.log("\nStarting Preload Benchmark...");
  const startPreload = performance.now();

  let activeInsightsCache: Map<string, any> | undefined;
  if (optimizedService.preloadActiveInsights) {
    activeInsightsCache = await optimizedService.preloadActiveInsights(monitorIds);
  }

  for (const monitorId of monitorIds) {
    await optimizedService.createInsight({
      monitorId,
      type: InsightType.ANOMALY,
      severity: InsightSeverity.WARNING,
      message: "Test insight",
    }, activeInsightsCache);
  }
  const endPreload = performance.now();

  console.log(`Optimized time: ${(endPreload - startPreload).toFixed(2)}ms`);
  console.log(`DB calls: findMany=${findManyCalls}, findFirst=${findFirstCalls}, create=${createCalls}`);

  const baselineDuration = endBaseline - startBaseline;
  const optimizedDuration = endPreload - startPreload;
  const improvement = ((baselineDuration - optimizedDuration) / baselineDuration) * 100;

  console.log(`\nPerformance Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmarkMock().catch(console.error);
