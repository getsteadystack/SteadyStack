import { test, expect, mock } from "bun:test";

mock.module("next/headers", () => ({
  headers: async () => new Headers(),
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
        await new Promise(r => setTimeout(r, 2));
        return data;
      },
      createMany: async (args: any) => {
        mockDb.push(...args.data);
        await new Promise(r => setTimeout(r, 2));
        return { count: args.data.length };
      },
    }
  }
}));

// We'll rewrite uptimerobot.ts briefly inside this script for testing, then restore it.
