import { createPrisma } from "@steadystack/db";
import { InsightService, InsightType, InsightSeverity } from "./src/lib/insight-service";

async function runBenchmark() {
  process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres"; // Assuming standard local DB for benchmark if available, or just mock it. Wait, the DB probably needs a real connection or mock. Let's try.

  const prisma = createPrisma(process.env.DATABASE_URL);
  const service = new InsightService(prisma as any);

  // Setup: create some dummy monitors
  const monitorIds: string[] = [];
  try {
    for (let i = 0; i < 50; i++) {
      const m = await prisma.monitor
        .create({
          data: {
            name: `Bench Monitor ${i}`,
            url: "https://example.com",
            userId: "bench-user",
            workspaceId: "bench-workspace",
          },
        })
        .catch((e) => {
          return prisma.monitor.findFirst({ where: { name: `Bench Monitor ${i}` } });
        });
      if (m) {
        monitorIds.push(m.id);
      }
    }

    console.log(`Created ${monitorIds.length} monitors for benchmarking.`);

    // Baseline Benchmark (No preload)
    console.log("Starting Baseline Benchmark (N+1)...");
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

    // Cleanup insights
    await prisma.monitorInsight.deleteMany({
      where: { monitorId: { in: monitorIds } },
    });
  } finally {
    await prisma.monitor.deleteMany({
      where: { id: { in: monitorIds } },
    });
  }
}

runBenchmark().catch(console.error);
