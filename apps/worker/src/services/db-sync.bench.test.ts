import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";

const items = Array.from({ length: 50 }).map((_, i) => ({
  monitorId: `monitor-${i}`,
  status: "UP",
  latency: 100,
  errorReason: null,
  timestamp: new Date().toISOString(),
}));

mock.module("../lib/fallback-queue", () => {
  let popBatchCalled = false;
  return {
    FallbackQueue: class {
      constructor() {}
      async getQueueLength() {
        return 50;
      }
      async popBatch() {
        if (!popBatchCalled) {
          popBatchCalled = true;
          return items;
        }
        return [];
      }
    },
  };
});

import { syncFallbackToDatabase } from "./db-sync";

describe("db-sync benchmark", () => {
  test("measure performance of syncFallbackToDatabase", async () => {
    const NUM_ITEMS = 50;

    const mockEnv = {
      UPSTASH_REDIS_REST_URL: "http://localhost",
      UPSTASH_REDIS_REST_TOKEN: "token",
    };

    let transactionCount = 0;
    let opsCount = 0;
    let createdEvents = 0;
    const mockPrisma = {
      $transaction: async (ops: any[]) => {
        transactionCount++;
        opsCount += ops.length;
        if (ops[0]?.type === "createMany") {
          createdEvents += ops[0].data.length;
        } else if (ops[0]?.type === "create") {
          createdEvents += 1;
        } else if (ops.length > 0 && ops[0].data && Array.isArray(ops[0].data)) {
          // for raw array updates maybe
        }

        // Simulate DB latency
        await new Promise((r) => setTimeout(r, 2));
      },
      monitorEvent: {
        create: (args) => ({ type: "create", ...args }),
        createMany: (args) => ({ type: "createMany", ...args }),
      },
      monitor: {
        update: (args) => ({ type: "update", ...args }),
      },
    };

    const start = performance.now();
    await syncFallbackToDatabase(mockPrisma, mockEnv);
    const end = performance.now();

    console.log(`Sync time for ${NUM_ITEMS} items: ${end - start}ms`);
    console.log(`Transactions executed: ${transactionCount}`);
    console.log(`Operations within transactions: ${opsCount}`);
  });
});
