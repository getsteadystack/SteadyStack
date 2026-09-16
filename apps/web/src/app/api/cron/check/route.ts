import { NextRequest, NextResponse } from "next/server";
import { runDueChecks } from "@/lib/cron-checks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * External cron entrypoint (e.g. Vercel Cron, platform scheduler).
 *
 * The check engine itself lives in @/lib/cron-checks and is shared with the
 * in-process uptime scheduler (src/instrumentation.ts) — atomic nextCheck
 * claims make concurrent invocations safe, so this route and the internal
 * scheduler can coexist without double-checking monitors.
 */
async function handler(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const urlSecret = req.nextUrl.searchParams.get("key");
    if (urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await runDueChecks(50);
  return NextResponse.json({
    success: true,
    count: results.length,
    timestamp: new Date().toISOString(),
    monitors: results,
  });
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
