#!/usr/bin/env bun
/**
 * Automated worker rollback.
 *
 * When post-deploy smoke tests fail, the pipeline rolls the check-engine
 * worker back to the last known-good version. Cloudflare keeps every version
 * immutable; `wrangler rollback <version-id>` repoints the live deployment.
 *
 * Strategy:
 *  1. If a version ID is provided (--to), roll back to it explicitly.
 *  2. Otherwise, read the deployment list and pick the most recent deployment
 *     whose version differs from the current one and which was recorded as
 *     healthy in `.deploy/last-good-worker-version` (written by this script's
 *     `record-good` command after a successful smoke pass).
 *  3. Fallback: roll back to the *previous* deployment in the list — best
 *     effort when no healthy marker exists yet (first deploys after adopting
 *     this pipeline).
 *
 * Usage:
 *   bun scripts/rollback-worker.ts [--to <version-id>] [--config apps/worker/wrangler.jsonc]
 *   bun scripts/rollback-worker.ts record-good --version <id>   # called on smoke success
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const LAST_GOOD_FILE = join(import.meta.dir, "..", ".deploy", "last-good-worker-version.json");

function parseArgs() {
  const argv = process.argv.slice(2);
  const command = argv[0] === "record-good" ? "record-good" : "rollback";
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  return {
    command,
    to: get("--to"),
    version: get("--version"),
    config: get("--config") ?? "apps/worker/wrangler.jsonc",
  };
}

function readLastGood(): { version: string; recordedAt: string } | null {
  if (!existsSync(LAST_GOOD_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LAST_GOOD_FILE, "utf8"));
  } catch {
    return null;
  }
}

async function wrangler(args: string[]): Promise<string> {
  const proc = Bun.spawnSync({
    cmd: ["bunx", "wrangler", ...args],
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "true" },
  });
  const out = `${proc.stdout?.toString() ?? ""}${proc.stderr?.toString() ?? ""}`;
  if (proc.exitCode !== 0) {
    throw new Error(`wrangler ${args.join(" ")} failed (exit ${proc.exitCode}):\n${out.slice(-1500)}`);
  }
  return out;
}

async function main() {
  const args = parseArgs();

  if (args.command === "record-good") {
    if (!args.version) {
      console.error("✖ record-good requires --version <id>");
      process.exit(2);
    }
    mkdirSync(join(import.meta.dir, "..", ".deploy"), { recursive: true });
    writeFileSync(
      LAST_GOOD_FILE,
      JSON.stringify({ version: args.version, recordedAt: new Date().toISOString() }, null, 2),
    );
    console.log(`✔ Recorded known-good worker version: ${args.version}`);
    return;
  }

  console.log("⟳ Initiating worker rollback…");

  // ── Resolve current live version ────────────────────────────────────────────
  let currentVersion: string | undefined;
  try {
    const status = await wrangler(["deployments", "status", "--config", args.config]);
    const match = status.match(/Version ID:\s*(\w+)/i) ?? status.match(/"id"\s*:\s*"(\w+)"/);
    currentVersion = match?.[1];
    if (currentVersion) console.log(`  Current live version: ${currentVersion}`);
  } catch (err) {
    console.warn(`⚠ Could not read deployment status: ${err instanceof Error ? err.message.split("\n")[0] : err}`);
  }

  // ── Resolve the target version ──────────────────────────────────────────────
  let target = args.to ?? undefined;

  if (!target) {
    const lastGood = readLastGood();
    if (lastGood && lastGood.version !== currentVersion) {
      target = lastGood.version;
      console.log(`  Using last known-good version: ${target} (recorded ${lastGood.recordedAt})`);
    } else {
      const listOut = await wrangler(["deployments", "list", "--config", args.config]);
      // wrangler prints a table; version IDs are 32-hex strings. Take the
      // first distinct ID that isn't the current version.
      const ids = [...listOut.matchAll(/\b[0-9a-f]{32}\b/gi)].map((m) => m[0]);
      target = ids.find((id) => id !== currentVersion);
      if (target) console.log(`  Falling back to previous deployment version: ${target}`);
    }
  }

  if (!target) {
    console.error(
      "✖ No rollback target found: no --to, no known-good marker, and no previous deployment " +
        "distinct from the current version. Manual intervention required:\n" +
        "  bunx wrangler deployments list",
    );
    process.exit(1);
  }

  if (target === currentVersion) {
    console.log("✔ Target version is already live — nothing to do.");
    return;
  }

  // ── Execute rollback ────────────────────────────────────────────────────────
  await wrangler(["rollback", target, "--config", args.config]);
  console.log(`✔ Rolled worker back to ${target}`);

  // Post-rollback verification: the worker must answer its liveness route.
  const url = process.env.SMOKE_WORKER_URL;
  if (url) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch(url.replace(/\/+$/, ""), { signal: AbortSignal.timeout(10_000) });
        if (res.ok) {
          console.log(`✔ Post-rollback liveness check passed (${res.status})`);
          return;
        }
        console.log(`  liveness attempt ${attempt}: status ${res.status}`);
      } catch (err) {
        console.log(`  liveness attempt ${attempt}: ${err instanceof Error ? err.message : err}`);
      }
      await new Promise((r) => setTimeout(r, 5_000));
    }
    console.error(
      "✖ Worker did not become responsive after rollback. This is now an incident — " +
        "check Cloudflare dashboard and consider rolling forward or pinning a known version.",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`✖ rollback failed: ${err?.message ?? err}`);
  process.exit(1);
});
