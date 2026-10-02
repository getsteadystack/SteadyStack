#!/usr/bin/env bun
/**
 * Post-deployment smoke tests.
 *
 * Verifies that the critical surfaces of a fresh deployment actually respond:
 *
 *   Web (Next.js on Cloudflare via OpenNext):
 *     - GET /                      → 200 (dashboard shell renders)
 *     - GET /api/health            → 200 with db:"connected" (503 = degraded
 *                                    is tolerated in non-prod; broken DB is not)
 *     - GET /llms.txt              → 200 (public static assets pipeline)
 *
 *   Worker (check engine):
 *     - GET /                      → 200 "SteadyStack Worker is Running"
 *     - GET /api/locations         → 200 JSON with region probes
 *
 * Exits 0 when every required check passes, 1 on the first hard failure —
 * designed to be the gate between deploy and announce in CI. A failing run is
 * the rollback trigger in the deploy pipeline.
 *
 * Usage:
 *   bun scripts/smoke-test.ts --web-url https://steadystack.dev \
 *                            --worker-url https://pulseguard-worker.workers.dev
 */

interface SmokeArgs {
  webUrl: string;
  workerUrl?: string;
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
  requireWorker: boolean;
}

function parseArgs(): SmokeArgs {
  const argv = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const webUrl = get("--web-url") ?? process.env.SMOKE_WEB_URL;
  const workerUrl = get("--worker-url") ?? process.env.SMOKE_WORKER_URL;
  if (!webUrl) {
    console.error("Usage: smoke-test.ts --web-url <url> [--worker-url <url>] [--timeout-ms 10000] [--retries 3]");
    process.exit(2);
  }
  return {
    webUrl: webUrl.replace(/\/+$/, ""),
    workerUrl: workerUrl?.replace(/\/+$/, ""),
    timeoutMs: Number(get("--timeout-ms") ?? 10_000),
    retries: Number(get("--retries") ?? 3),
    retryDelayMs: Number(get("--retry-delay-ms") ?? 5_000),
    requireWorker: Boolean(workerUrl),
  };
}

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
  required: boolean;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": "steadystack-smoke/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch with retries — cold worker starts and first-hit compilations are slow. */
async function fetchWithRetry(
  url: string,
  timeoutMs: number,
  retries: number,
  delayMs: number,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, timeoutMs);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        console.log(`    attempt ${attempt} failed (${err instanceof Error ? err.message : err}), retrying in ${delayMs / 1000}s…`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

async function check(
  name: string,
  required: boolean,
  fn: () => Promise<{ passed: boolean; detail: string }>,
): Promise<CheckResult> {
  try {
    const { passed, detail } = await fn();
    return { name, passed, detail, required };
  } catch (err) {
    return {
      name,
      passed: false,
      detail: err instanceof Error ? err.message : String(err),
      required,
    };
  }
}

async function main() {
  const args = parseArgs();
  const results: CheckResult[] = [];

  console.log(`\n🚭 Smoke testing web:   ${args.webUrl}`);
  if (args.workerUrl) console.log(`🚭 Smoke testing worker: ${args.workerUrl}`);
  console.log();

  // ── Web: landing page ──────────────────────────────────────────────────────
  results.push(
    await check("web: GET / returns 200", true, async () => {
      const res = await fetchWithRetry(`${args.webUrl}/`, args.timeoutMs, args.retries, args.retryDelayMs);
      return {
        passed: res.status === 200,
        detail: `status ${res.status}`,
      };
    }),
  );

  // ── Web: health endpoint (db + scheduler visibility) ───────────────────────
  results.push(
    await check("web: GET /api/health reports db connected", true, async () => {
      const res = await fetchWithRetry(`${args.webUrl}/api/health`, args.timeoutMs, args.retries, args.retryDelayMs);
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        return { passed: false, detail: `status ${res.status}, non-JSON body` };
      }
      // Hard failure: the app cannot reach its database at all.
      // Tolerated (non-required pass): degraded-but-alive states like a stale
      // worker heartbeat right after a deploy or Redis hiccups.
      const dbOk = body.db === "connected";
      return {
        passed: res.status === 200 && dbOk,
        detail: `status ${res.status}, db=${body.db}, scheduler=${body.scheduler}, redis=${body.redis}`,
      };
    }),
  );

  // ── Web: static asset pipeline (llms.txt is served from public/) ──────────
  results.push(
    await check("web: GET /llms.txt serves static assets", false, async () => {
      const res = await fetchWithRetry(`${args.webUrl}/llms.txt`, args.timeoutMs, args.retries, args.retryDelayMs);
      return { passed: res.status === 200, detail: `status ${res.status}` };
    }),
  );

  // ── Worker: liveness (fallback route answers every unmatched path) ────────
  if (args.workerUrl) {
    results.push(
      await check("worker: GET / returns running banner", args.requireWorker, async () => {
        const res = await fetchWithRetry(`${args.workerUrl}/`, args.timeoutMs, args.retries, args.retryDelayMs);
        const text = await res.text();
        return {
          passed: res.status === 200 && text.includes("SteadyStack Worker"),
          detail: `status ${res.status}, body: ${text.slice(0, 60)}`,
        };
      }),
    );

    // ── Worker: region registry (exercises DO fan-out) ──────────────────────
    results.push(
      await check("worker: GET /api/locations returns regions", args.requireWorker, async () => {
        const res = await fetchWithRetry(`${args.workerUrl}/api/locations`, args.timeoutMs, args.retries, args.retryDelayMs);
        let body: any = null;
        try {
          body = await res.json();
        } catch {
          return { passed: false, detail: `status ${res.status}, non-JSON body` };
        }
        const regions = Array.isArray(body?.regions) ? body.regions.length : Array.isArray(body) ? body.length : 0;
        return {
          passed: res.status === 200 && regions > 0,
          detail: `status ${res.status}, regions: ${regions}`,
        };
      }),
    );
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log("Results:");
  let failed = 0;
  for (const r of results) {
    const icon = r.passed ? "✔" : r.required ? "✖" : "⚠";
    const label = r.passed ? "PASS" : r.required ? "FAIL" : "WARN";
    console.log(`  ${icon} ${label.padEnd(4)} ${r.name} — ${r.detail}`);
    if (!r.passed && r.required) failed++;
  }

  const optional = results.filter((r) => !r.required && !r.passed).length;
  if (failed > 0) {
    console.error(`\n✖ Smoke tests failed: ${failed} required check(s) failed${optional ? `, ${optional} optional warning(s)` : ""}`);
    process.exit(1);
  }
  console.log(`\n✔ All required smoke tests passed${optional ? ` (${optional} optional warning(s))` : ""}`);
  process.exit(0);
}

main();
