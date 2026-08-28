import { test, expect, mock } from "bun:test";

mock.module("next/headers", () => ({
  headers: async () => new Headers(),
}));
mock.module("@steadystack/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({ user: { id: "perf-user-id" } }),
    }
  }
}));
mock.module("@/lib/billing-server", () => ({
  assertMonitorLimits: async () => ({ allowed: true }),
  checkAndNotifyUsageLimits: async () => {},
}));
mock.module("@/actions/team", () => ({
  getActiveWorkspace: async () => ({ id: "perf-org-id" }),
}));
mock.module("next/cache", () => ({
  revalidatePath: () => {},
}));

const mockDb: any[] = [];
mock.module("@steadystack/db", () => ({
  default: {
    monitor: {
      create: async (data: any) => {
        mockDb.push(data);
        // Simulate some async DB latency
        await new Promise(r => setTimeout(r, 2));
        return data;
      },
      createMany: async (args: any) => {
        mockDb.push(...args.data);
        await new Promise(r => setTimeout(r, 2));
        return { count: args.data.length };
      },
      deleteMany: async () => {
        mockDb.length = 0; // reset
        return { count: 0 };
      }
    }
  }
}));

import { importUptimeRobotMonitors, NormalizedImportMonitor } from "./apps/web/src/actions/uptimerobot";

test("importUptimeRobotMonitors performance", async () => {
  const monitors: NormalizedImportMonitor[] = [];
  for (let i = 0; i < 50; i++) {
    monitors.push({
      name: `Perf Monitor ${i}`,
      url: `https://perf${i}.com`,
      type: "HTTP",
      interval: 60,
      selected: true
    });
  }

  const start = performance.now();
  const res = await importUptimeRobotMonitors(monitors);
  const end = performance.now();

  console.log(`importUptimeRobotMonitors took ${end - start} ms`);
  expect(res.success).toBe(true);
  expect(res.importedCount).toBe(50);
});
