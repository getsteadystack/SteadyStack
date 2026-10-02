import { getPrisma } from "@steadystack/db";
import { json } from "./http";
import type { RouteHandler } from "./types";

/**
 * Route: POST /api/reports/dispatch-monthly
 * Triggers the monthly SLA report email dispatcher for agency clients.
 */
export const reportsDispatchRoute: RouteHandler = async (ctx, url) => {
  if (url.pathname !== "/api/reports/dispatch-monthly") return null;

  if (ctx.request.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405, ctx.env);
  }

  // Verify internal authorization (e.g. WORKER_SECRET or DATABASE_URL present)
  const authHeader = ctx.request.headers.get("Authorization");
  const expectedSecret = (ctx.env as any).WORKER_SECRET || (ctx.env as any).BETTER_AUTH_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return json({ error: "Unauthorized" }, 401, ctx.env);
  }

  if (!ctx.env.DATABASE_URL) {
    return json({ error: "DATABASE_URL not configured" }, 500, ctx.env);
  }

  try {
    const prisma = getPrisma(ctx.env.DATABASE_URL, ctx.env.DATABASE_POOL_URL);
    const { runMonthlyReportDispatcher } = await import("../services/monthly-report-dispatcher");
    const result = await runMonthlyReportDispatcher(prisma, ctx.env as any);

    return json({ success: true, ...result }, 200, ctx.env);
  } catch (err) {
    return json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Dispatcher failed",
      },
      500,
      ctx.env,
    );
  }
};
