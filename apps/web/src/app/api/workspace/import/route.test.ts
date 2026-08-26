import { test, expect, mock } from "bun:test";
import { NextRequest } from "next/server";

mock.module("next/headers", () => ({ headers: async () => new Headers() }));

// We need to mock auth
mock.module("@steadystack/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({
        user: { id: "test-user-id" }
      })
    }
  }
}));

// We need to mock prisma
let ops = 0;
mock.module("@steadystack/db", () => {
  return {
    default: {
      monitor: {
        findMany: async () => [],
        update: async (data: any) => { ops++; return { id: "updated-1", name: data.data.name }; },
        create: async (data: any) => { ops++; return { id: "created-1", name: data.data.name }; },
        findUnique: async () => null,
      },
      user: {
        findUnique: async () => ({ tier: "PRO" })
      },
      $transaction: async (queries: any[]) => {
        return Promise.all(queries);
      }
    }
  }
});

import { POST } from "./route";

test("benchmark import", async () => {
  ops = 0;
  const payload = {
    version: "1.0",
    workspaceId: "test",
    monitors: Array.from({ length: 49 }, (_, i) => ({
      name: `monitor-${i}`,
      url: `https://example.com/${i}`,
      type: "HTTP"
    }))
  };

  const req = new NextRequest("http://localhost/api/workspace/import?format=steadystack", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const start = performance.now();
  const res = await POST(req);
  const end = performance.now();

  const json = await res.json() as any;
  console.log(`Time taken: ${end - start}ms, Ops: ${ops}`);
  expect(json.success).toBe(true);
});
