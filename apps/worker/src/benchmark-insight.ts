import { MonitorStatus } from "./constants";

// Mock prisma and insightService
const prisma = {
  monitorEvent: {
    findMany: async () => {
      // Simulate DB delay
      await new Promise((r) => setTimeout(r, 20));
      return [];
    },
  },
};
const insightService = {
  analyzeAndProvideAdvice: async () => {
    // Simulate insight delay
    await new Promise((r) => setTimeout(r, 10));
  },
};

async function runBenchmark() {
  console.log("Starting benchmark...");
  // Create some dummy monitors
  const monitors = Array.from({ length: 100 }).map((_, i) => ({
    id: `m_${i}`,
    name: `Monitor ${i}`,
  }));

  // Predictably trigger the 10% chance
  const triggeredMonitors = monitors.filter((_, i) => i % 10 === 0);

  // Baseline: Sequential N+1 (simulating the 10% chance)
  const startSeq = performance.now();
  for (const monitor of triggeredMonitors) {
    try {
      const recentEvents = await prisma.monitorEvent.findMany();
      await insightService.analyzeAndProvideAdvice();
    } catch (e) {}
  }
  const endSeq = performance.now();

  // Optimization: Concurrent Promise.all for insights
  const startConc = performance.now();

  // In the real code, we want to accumulate insight tasks and await them at the end of the batch
  const insightPromises: Promise<void>[] = [];

  for (const monitor of triggeredMonitors) {
    insightPromises.push(
      (async () => {
        try {
          const recentEvents = await prisma.monitorEvent.findMany();
          await insightService.analyzeAndProvideAdvice();
        } catch (e) {}
      })(),
    );
  }
  await Promise.all(insightPromises);
  const endConc = performance.now();

  console.log(`Baseline (Sequential N+1 for insights): ${(endSeq - startSeq).toFixed(2)}ms`);
  console.log(
    `Optimized (Concurrent Insights via Promise.all): ${(endConc - startConc).toFixed(2)}ms`,
  );

  process.exit(0);
}

runBenchmark().catch(console.error);
