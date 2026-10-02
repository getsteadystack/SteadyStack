/**
 * Next.js instrumentation hook — runs once per server process start.
 *
 * Registers a background scheduler that executes due uptime checks every
 * minute, so monitors keep being tracked even when no user has the dashboard
 * open. Production deployments should still prefer the Cloudflare worker cron
 * (apps/worker); this is the safety net for dev, previews, and deployments
 * where the worker isn't running.
 */
export async function register() {
  // Skip entirely on edge runtime and when explicitly disabled.
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.DISABLE_UPTIME_SCHEDULER === "1") return;

  // Only the Node.js server runtime runs the scheduler. `register` is invoked
  // for both nodejs and edge middleware; guard with a dynamic import so edge
  // builds never pull in the pg/prisma-based scheduler.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startUptimeScheduler } = await import("@/lib/uptime-scheduler");
  startUptimeScheduler();
}
