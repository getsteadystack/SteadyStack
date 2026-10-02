#!/usr/bin/env bun
/**
 * Deploy lock — prevents concurrent production deployments.
 *
 * A Postgres advisory lock (`pg_advisory_lock`) is the perfect primitive here:
 * it is atomic at the database level, auto-released if the holder's session
 * dies, and requires zero extra infrastructure. All deploy paths (CI, a
 * laptop, two engineers racing) serialize on the same lock key.
 *
 * Behavior:
 *  - `acquire` — try-lock; exits 0 if acquired, 1 if another deploy is running
 *    (unless `--takeover` and the existing lock is stale past the heartbeat
 *    TTL, i.e. its holder crashed mid-deploy).
 *  - `heartbeat` — refresh the lock's liveness record (run every 30s in CI).
 *  - `release` — release the lock (idempotent; always safe to call).
 *
 * The heartbeat matters because advisory locks only die with the *session* —
 * a CI job that hard-kills its runner leaves the session to be reaped by the
 * server eventually, and `--takeover` covers that gap deterministically.
 *
 * Usage:
 *   bun scripts/deploy-lock.ts acquire [--environment production] [--takeover]
 *   bun scripts/deploy-lock.ts heartbeat [--environment production]
 *   bun scripts/deploy-lock.ts release [--environment production]
 */

import { Client } from "pg";
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Stable, app-specific lock key (any bigint works; 42 is SteadyStack-flavored).
const LOCK_KEY = 4242424242;

const LOCK_DIR = join(import.meta.dir, "..", ".deploy");
const HEARTBEAT_TTL_MS = 5 * 60 * 1000; // takeover allowed after 5 min of silence

interface LockArgs {
  action: "acquire" | "heartbeat" | "release";
  environment: string;
  takeover: boolean;
}

function parseArgs(): LockArgs {
  const argv = process.argv.slice(2);
  const action = argv[0] as LockArgs["action"];
  if (action !== "acquire" && action !== "heartbeat" && action !== "release") {
    console.error("Usage: deploy-lock.ts <acquire|heartbeat|release> [--environment <env>] [--takeover]");
    process.exit(2);
  }
  const envIdx = argv.indexOf("--environment");
  return {
    action,
    environment: envIdx !== -1 ? (argv[envIdx + 1] ?? "production") : "production",
    takeover: argv.includes("--takeover"),
  };
}

function stateFile(environment: string): string {
  return join(LOCK_DIR, `deploy-lock.${environment}.json`);
}

interface LockState {
  holder: string;
  pid: number;
  acquiredAt: string;
  heartbeatAt: string;
}

function readState(environment: string): LockState | null {
  const file = stateFile(environment);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as LockState;
  } catch {
    return null;
  }
}

function writeState(environment: string, state: LockState): void {
  mkdirSync(LOCK_DIR, { recursive: true });
  writeFileSync(stateFile(environment), JSON.stringify(state, null, 2));
}

function clearState(environment: string): void {
  const file = stateFile(environment);
  if (existsSync(file)) unlinkSync(file);
}

function holderId(): string {
  return `${process.env.GITHUB_ACTOR ?? process.env.USER ?? "unknown"}@${
    process.env.GITHUB_RUN_ID ?? process.env.HOSTNAME ?? "local"
  }`;
}

function databaseUrl(): string {
  // DIRECT_URL is the non-pooled connection string — advisory locks must live
  // on a dedicated session, never through a pooler that may re-route sessions.
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("✖ DIRECT_URL or DATABASE_URL must be set for the deploy lock");
    process.exit(2);
  }
  return url;
}

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function main() {
  const args = parseArgs();

  if (args.action === "acquire") {
    const existing = readState(args.environment);
    if (existing) {
      const age = Date.now() - new Date(existing.heartbeatAt).getTime();
      const stale = age > HEARTBEAT_TTL_MS;
      if (!stale && !args.takeover) {
        console.error(
          `✖ Deploy lock held by ${existing.holder} since ${existing.acquiredAt} ` +
            `(heartbeat ${Math.round(age / 1000)}s ago).\n` +
            `  Another deployment is in progress. Wait for it to finish, or if you are ` +
            `certain it is dead, re-run with --takeover.`,
        );
        process.exit(1);
      }
      if (stale) {
        console.warn(
          `⚠ Existing lock from ${existing.holder} is stale ` +
            `(no heartbeat for ${Math.round(age / 1000)}s) — taking over.`,
        );
      }
    }

    const acquired = await withClient(async (client) => {
      // pg_try_advisory_lock: session-scoped, atomic, no blocking.
      const res = await client.query<{ locked: boolean }>(
        "SELECT pg_try_advisory_lock($1) AS locked",
        [LOCK_KEY],
      );
      return res.rows[0]?.locked === true;
    });

    if (!acquired) {
      console.error(
        `✖ Another deployment holds the advisory lock (no local state recorded). ` +
          `If you are certain it is orphaned, re-run with --takeover after confirming ` +
          `with: SELECT pg_terminate_backend(pid) FROM pg_locks WHERE objid = ${LOCK_KEY};`,
      );
      process.exit(1);
    }

    writeState(args.environment, {
      holder: holderId(),
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
      heartbeatAt: new Date().toISOString(),
    });
    console.log(`✔ Deploy lock acquired for ${args.environment} by ${holderId()}`);
    return;
  }

  if (args.action === "heartbeat") {
    const existing = readState(args.environment);
    if (!existing) {
      console.error("✖ No lock state to heartbeat — was acquire run?");
      process.exit(1);
    }
    existing.heartbeatAt = new Date().toISOString();
    writeState(args.environment, existing);
    console.log(`✔ Deploy lock heartbeat refreshed (${existing.holder})`);
    return;
  }

  // release — idempotent and forgiving: always try to drop the advisory lock,
  // always clear local state. A release after a crashed session is harmless.
  await withClient(async (client) => {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
  }).catch((err) => {
    // Connection may fail if the DB is mid-recovery; the lock dies with the
    // session anyway. Never block cleanup on this.
    console.warn(`⚠ Advisory unlock skipped: ${err.message}`);
  });
  clearState(args.environment);
  console.log(`✔ Deploy lock released for ${args.environment}`);
}

main().catch((err) => {
  console.error(`✖ deploy-lock failed: ${err?.message ?? err}`);
  process.exit(2);
});
