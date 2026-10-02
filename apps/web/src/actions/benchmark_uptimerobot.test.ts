import { mock, test } from "bun:test";
mock.module("next/headers", () => ({
  headers: async () => new Headers(),
}));
mock.module("next/cache", () => ({
  revalidatePath: () => {},
}));
mock.module("@/lib/billing-server", () => ({
  assertMonitorLimits: async () => ({ allowed: true }),
  checkAndNotifyUsageLimits: async () => {},
}));
mock.module("@/actions/team", () => ({
  getActiveWorkspace: async () => ({ id: "workspace_1" }),
}));

// Mock db completely before importing uptimerobot
mock.module("@steadystack/db", () => {
  return {
    default: {
      monitor: {
        create: async (args: any) => {
          await new Promise((r) => setTimeout(r, 2)); // simulate network delay
          return { id: "test" };
        },
        createMany: async (args: any) => {
          await new Promise((r) => setTimeout(r, 2)); // simulate network delay
          return { count: args.data.length };
        },
      },
    },
  };
});

mock.module("@steadystack/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({ user: { id: "user_1" } }),
    },
  },
}));

import { importUptimeRobotMonitors, type NormalizedImportMonitor } from "./uptimerobot";

test("benchmark importUptimeRobotMonitors", async () => {
  const monitorsToImport: NormalizedImportMonitor[] = Array.from({ length: 100 }).map((_, i) => ({
    name: `Monitor ${i}`,
    url: `https://example.com/${i}`,
    type: "HTTP",
    interval: 60,
  }));

  const start = performance.now();
  await importUptimeRobotMonitors(monitorsToImport);
  const end = performance.now();

  console.log(`\nExecution time for 100 monitors: ${(end - start).toFixed(2)} ms`);
});
