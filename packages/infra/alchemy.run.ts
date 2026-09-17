import alchemy from "alchemy";
import { Nextjs, Worker, DurableObjectNamespace, KVNamespace } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

/**
 * Stage-aware infrastructure.
 *
 * Stages are selected via `--stage <name>` (alchemy parses this automatically)
 * or the ALCHEMY_STAGE env var. Defaults to "prod" for backward compatibility
 * with existing deploy tooling.
 *
 *   bun run deploy                       → prod   (unchanged behavior)
 *   bunx alchemy deploy --stage staging  → staging
 *
 * Each stage gets isolated resource names and its own state directory
 * (.alchemy/<stage>/), so staging can never touch production resources.
 * Secrets (DATABASE_URL etc.) are read from the same .env for both stages
 * today — split them into per-stage values by adding e.g. STAGING_DATABASE_URL
 * lookups to the `stageConfig` below.
 */
const stage = process.env.ALCHEMY_STAGE ?? "prod";

const isStaging = stage === "staging";

const stageConfig = {
  prod: {
    webName: "web",
    workerName: "pulseguard-worker",
    /** Production checks run every minute via cron trigger. */
    workerCrons: ["* * * * *"],
  },
  staging: {
    webName: "web-staging",
    workerName: "pulseguard-worker-staging",
    /** Staging checks every 5 minutes — same engine, fraction of the load. */
    workerCrons: ["*/5 * * * *"],
  },
} as const;

const cfg = isStaging ? stageConfig.staging : stageConfig.prod;

const app = await alchemy("steadystack");

/**
 * Next.js dashboard (OpenNext → Cloudflare Worker).
 * The Nextjs resource runs the app's build (`next build` + OpenNext transform)
 * as part of `alchemy deploy`, matching the turbo `deploy` task dependencies.
 */
export const web = await Nextjs(cfg.webName, {
  cwd: "../../apps/web",
  bindings: {
    DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
});

/**
 * Check engine worker.
 *
 * Deployed through alchemy (not `wrangler deploy`) so both web and worker live
 * in one state-managed, stage-scoped deployment. Secrets (UPSTASH_*,
 * CORS_ORIGIN) stay as Cloudflare secrets set out-of-band.
 */
const latencyAggregator = DurableObjectNamespace("latency-aggregator", {
  className: "LatencyAggregator",
  sqlite: true,
});
const monitorChannel = DurableObjectNamespace("monitor-channel", {
  className: "MonitorChannel",
  sqlite: true,
});
const regionalProbe = DurableObjectNamespace("regional-probe", {
  className: "RegionalProbe",
  sqlite: true,
});
const dnsCache = await KVNamespace("dns-cache");

export const worker = await Worker(cfg.workerName, {
  entrypoint: "../../apps/worker/src/index.ts",
  compatibilityDate: "2026-01-24",
  compatibilityFlags: ["nodejs_compat"],
  crons: [...cfg.workerCrons],
  url: true,
  bindings: {
    NODE_ENV: isStaging ? "staging" : "production",
    SHARD_ID: "0",
    TOTAL_SHARDS: "1",
    LATENCY_AGGREGATOR: latencyAggregator,
    MONITOR_CHANNEL: monitorChannel,
    REGIONAL_PROBE: regionalProbe,
    DNS_CACHE: dnsCache,
  },
});

await app.finalize();

console.log(`[${stage}] web:    ${web.url ?? "(no url)"}`);
console.log(`[${stage}] worker: ${worker.url ?? "(no url)"}`);
