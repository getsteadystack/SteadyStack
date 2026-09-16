/**
 * In-process uptime scheduler.
 *
 * Kicks off a 60-second interval that claims and runs due monitor checks
 * directly against the database. Coordinates with the Cloudflare worker and
 * any external cron (e.g. /api/cron/check) via atomic nextCheck claims in
 * cron-checks.ts — whichever engine claims a monitor first runs it; the rest
 * skip it. No leader election needed.
 */

const TICK_INTERVAL_MS = 60_000;
const BATCH_SIZE = 50;

let started = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function tick() {
  try {
    const { runDueChecks } = await import("./cron-checks");
    const results = await runDueChecks(BATCH_SIZE);
    if (results.length > 0) {
      console.log(`[UptimeScheduler] Ran ${results.length} check(s)`);
    }
  } catch (err) {
    console.error("[UptimeScheduler] Tick failed:", err);
  }
}

export function startUptimeScheduler() {
  if (started) return;
  started = true;

  // First tick after a short settle delay so the server can finish booting
  // (and instrumentation doesn't slow startup), then every minute.
  setTimeout(() => {
    void tick();
    intervalHandle = setInterval(() => {
      void tick();
    }, TICK_INTERVAL_MS);
  }, 10_000);

  console.log("[UptimeScheduler] Started — due checks run every 60s");
}

export function stopUptimeScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  started = false;
}
