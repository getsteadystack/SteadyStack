import { describe, expect, it } from "bun:test";

describe("Dynamic Thresholding N+1 Simulation Benchmark", () => {
  it("should benchmark sequential vs parallel N+1 queries", async () => {
    // We'll simulate Prisma with an async delay
    const mockDbFindMany = async () => {
      await new Promise(r => setTimeout(r, 2)); // 2ms network latency simulation per query
      return Array(50).fill(0).map(() => ({ latency: Math.random() * 100 }));
    };

    const monitorIds = Array(100).fill(0).map((_, i) => `m-${i}`);

    // Baseline: Sequential N+1 (What's in process-batch currently)
    const startSequential = performance.now();
    for (const monitorId of monitorIds) {
      const lastEvents = await mockDbFindMany();
    }
    const endSequential = performance.now();
    const sequentialTime = endSequential - startSequential;

    // Optimization: Concurrent fetch (Since Prisma doesn't natively support top-N per group limit efficiently)
    const startParallel = performance.now();
    const eventsMap = new Map();
    await Promise.all(
        monitorIds.map(async (id) => {
           eventsMap.set(id, await mockDbFindMany());
        })
    );
    const endParallel = performance.now();
    const parallelTime = endParallel - startParallel;

    console.log(`[Benchmark] Sequential Time: ${sequentialTime.toFixed(2)}ms`);
    console.log(`[Benchmark] Parallel Time: ${parallelTime.toFixed(2)}ms`);

    expect(parallelTime).toBeLessThan(sequentialTime);
  });
});
