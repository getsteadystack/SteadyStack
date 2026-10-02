/**
 * Worker dev orchestrator.
 *
 * `wrangler dev --test-scheduled` does NOT fire cron triggers on its own —
 * scheduled handlers only run when something hits /__scheduled. This script
 * starts wrangler and a local ticker that triggers the scheduled event every
 * 60 seconds, mirroring the production `* * * * *` cron in wrangler.jsonc.
 */

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const TICK_INTERVAL_MS = Number(process.env.CRON_INTERVAL_MS || 60000);
const WRANGLER_URL = process.env.STEADYSTACK_WORKER_URL || "http://localhost:8787";

// The Neon serverless driver's WebSocket tunnel crashes inside the local
// workerd build ("internal error; reference = ..." floods + Prisma "No
// database host or connection string" errors). Local dev must run Prisma on
// the standard pg driver instead — production ignores this flag and keeps
// the Neon driver. Ensure it's present in .dev.vars before every dev start.
const devVarsPath = path.join(__dirname, "..", ".dev.vars");
try {
  let contents = fs.existsSync(devVarsPath) ? fs.readFileSync(devVarsPath, "utf8") : "";
  if (!/^DB_USE_PG_DRIVER=\s*true\s*$/m.test(contents)) {
    contents = contents.replace(/\r?\n$/, "") + (contents ? "\r\n" : "") + "DB_USE_PG_DRIVER=true\r\n";
    fs.writeFileSync(devVarsPath, contents);
    console.log("[WorkerDev] Added DB_USE_PG_DRIVER=true to .dev.vars (required for local wrangler dev)");
  }
} catch (err) {
  console.warn("[WorkerDev] Could not ensure DB_USE_PG_DRIVER in .dev.vars:", err.message);
}

let wranglerExited = false;

// Start wrangler dev (npx resolves the local wrangler binary; also works on Windows).
const wrangler = spawn("npx", ["wrangler", "dev", "--test-scheduled"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

wrangler.on("exit", (code) => {
  wranglerExited = true;
  console.log(`[WorkerDev] wrangler exited (code ${code}) — stopping local cron`);
  process.exit(code ?? 0);
});

// Local cron ticker: hits /__scheduled like production cron would.
async function tick() {
  const timestamp = new Date().toISOString();
  try {
    const res = await fetch(`${WRANGLER_URL}/__scheduled?cron=*+*+*+*+*`, {
      method: "GET",
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      console.log(`[LocalCron ${timestamp}] Scheduled batch triggered (HTTP ${res.status})`);
    } else {
      console.warn(`[LocalCron ${timestamp}] Worker responded with HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.warn(`[LocalCron ${timestamp}] Tick timed out after 30s`);
    } else {
      console.warn(`[LocalCron ${timestamp}] Worker not ready yet: ${err.message}`);
    }
  }
}

// First tick after 10s (gives wrangler time to boot), then every interval.
setTimeout(() => {
  void tick();
  setInterval(() => {
    void tick();
  }, TICK_INTERVAL_MS);
}, 10000);

process.on("SIGINT", () => {
  if (!wranglerExited) wrangler.kill("SIGINT");
  process.exit(0);
});
