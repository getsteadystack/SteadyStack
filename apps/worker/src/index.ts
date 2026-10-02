import { getPrisma } from "@steadystack/db";
import type { ExecutionContext, MessageBatch, ScheduledEvent } from "@cloudflare/workers-types";
export { LatencyAggregator } from "./durable-objects/latency-aggregator";
export { MonitorChannel } from "./durable-objects/monitor-channel";
export { RegionalProbe } from "./durable-objects/regional-probe";
import { CLOUDFLARE_PROBE_REGIONS, type DOLocationHint } from "@steadystack/shared";
import type { Env } from "./env";
export type { Env };
import { handleFetch } from "./routes";
import { processBatch } from "./process-batch";

function syncEnv(env: Env) {
  if (typeof process !== "undefined" && process.env) {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") {
        process.env[key] = value;
      }
    }
  }
}

export default {
  // Required: Basic fetch handler
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    syncEnv(env);
    try {
      const url = new URL(request.url);
      return await handleFetch(request, env, ctx, url);
    } catch (globalErr: any) {
      console.error(`[GLOBAL WORKER ERROR]`, globalErr);
      return new Response(`Global Worker Error: ${globalErr.message}`, {
        status: 500,
      });
    }
  },

  // 1. Cron: Find pending checks and run them (Free Tier Batch Mode)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    syncEnv(env);
    try {
      console.log(`Cron triggered: ${event.cron}`);

      const now = new Date();
      const isFiveMinuteMark = now.getUTCMinutes() % 5 === 0;
      const isMidnight = now.getUTCHours() === 0 && now.getUTCMinutes() === 0;

      // --- DOWNSAMPLING & DATA RETENTION: Run daily at midnight ---
      if (event.cron === "0 0 * * *" || isMidnight) {
        ctx.waitUntil(
          (async () => {
            try {
              const { runDownsamplingCron } = await import("./downsampling-cron");
              await runDownsamplingCron(env);
            } catch (err) {
              console.error("[Downsampling] Daily run failed:", err);
            }
          })(),
        );
      }

      // --- ANOMALY SCANNER: Run every 5 minutes ---
      if (event.cron === "*/5 * * * *" || event.cron === "0 * * * *" || isFiveMinuteMark) {
        ctx.waitUntil(
          (async () => {
            try {
              if (!env.DATABASE_URL) return;
              const scanPrisma = getPrisma(env.DATABASE_URL, env.DATABASE_POOL_URL);
              const { runAnomalyScan } = await import("./services/anomaly-scanner");
              await runAnomalyScan(scanPrisma);
            } catch (err) {
              console.error("[AnomalyScan] Scheduled run failed:", err);
            }
          })(),
        );
      }

      if (!env.DATABASE_URL) {
        console.warn(
          "[Worker Cron] DATABASE_URL is not configured in worker environment. Skipping scheduled monitor checks.",
        );
        return;
      }

      const prisma = getPrisma(env.DATABASE_URL, env.DATABASE_POOL_URL);

      // --- DATABASE SYNC: Restore data from Redis fallback if DB is healthy ---
      try {
        if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
          const { DatabaseCircuitBreaker } = await import("./lib/circuit-breaker");
          const circuitBreaker = new DatabaseCircuitBreaker(
            env.UPSTASH_REDIS_REST_URL,
            env.UPSTASH_REDIS_REST_TOKEN,
          );
          const circuitState = await circuitBreaker.getState().catch(() => "CLOSED");

          if (circuitState !== "OPEN") {
            ctx.waitUntil(
              import("./services/db-sync")
                .then((m) => m.syncFallbackToDatabase(prisma, env))
                .catch((err) => console.error("[Sync] Background task failed:", err)),
            );

            // Inspect Queue Backlog & Alarm if Depth Exceeds Threshold
            ctx.waitUntil(
              (async () => {
                try {
                  const { FallbackQueue } = await import("./lib/fallback-queue");
                  const queue = new FallbackQueue(
                    env.UPSTASH_REDIS_REST_URL,
                    env.UPSTASH_REDIS_REST_TOKEN,
                  );
                  await queue.inspectBacklogAndAlarm(100);
                } catch (qErr) {
                  console.warn("[QueueMetrics] Failed to inspect queue backlog:", qErr);
                }
              })(),
            );

            // Check probe heartbeats in background
            ctx.waitUntil(
              import("./services/probe-registry")
                .then(async (m) => {
                  const results = await m.checkProbeHeartbeats(prisma);
                  const lostProbes = results.filter((r) => r.status === "DOWN");
                  for (const probeResult of lostProbes) {
                    console.warn(
                      `[ProbeHeartbeat] Probe ${probeResult.probeId} lost! ${probeResult.secondsSinceLastHeartbeat}s since last heartbeat.`,
                    );
                  }
                })
                .catch((err) => console.error("[ProbeHeartbeat] Check failed:", err)),
            );
          }
        }
      } catch (cbErr) {
        console.warn("[CircuitBreaker] Sync initialization skipped:", cbErr);
      }

      // --- REGIONAL PROBE DO BOOTSTRAP: Only run if explicit flag enabled to save free tier duration ---
      if (env.ENABLE_DURABLE_OBJECTS === "true" && env.REGIONAL_PROBE) {
        ctx.waitUntil(
          (async () => {
            for (const reg of CLOUDFLARE_PROBE_REGIONS) {
              try {
                const probeId = env.REGIONAL_PROBE.idFromName(`probe-${reg.code}`);
                const probe = env.REGIONAL_PROBE.get(probeId, {
                  locationHint: reg.code as any,
                });
                await probe.fetch("http://internal/init", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ region: reg.code }),
                });
              } catch {}
            }
          })(),
        );
      }

      // Process all due monitors for this shard in chunks to prevent dropping checks under load
      const CHUNK_SIZE = 25;
      const MAX_CHUNKS_PER_TICK = 5;
      let totalProcessedCount = 0;

      const totalShards = Number(env.TOTAL_SHARDS || 1);
      const shardId = Number(env.SHARD_ID || 0);

      const runWithRetry = async (retryCount: number = 0, maxRetries: number = 2): Promise<any> => {
        try {
          // Find active monitors that are due for a check
          const targetIds: { id: string }[] = await prisma.$queryRaw`
            SELECT m.id FROM "Monitor" m
            WHERE (m."status" IN ('UP', 'DOWN', 'MAINTENANCE'))
            AND NOT (m."type" = 'HEARTBEAT' AND m."status" = 'DOWN')
            AND (m."nextCheck" IS NULL OR m."nextCheck" <= NOW())
            AND (abs(hashtext(m.id)) % ${totalShards}) = ${shardId}
            AND NOT EXISTS (
              SELECT 1 FROM "ProbeAssignment" WHERE "monitorId" = m."id"
            )
            ORDER BY m."nextCheck" ASC NULLS FIRST
            LIMIT ${CHUNK_SIZE}
          `;
          return targetIds;
        } catch (err: any) {
          if (
            retryCount < maxRetries &&
            (err.message?.includes("Connection terminated") ||
              err.message?.includes("is closed") ||
              err.message?.includes("not found") ||
              err.message?.includes("timeout") ||
              err.message?.includes("performIO"))
          ) {
            const delayMs = 200 * Math.pow(2, retryCount) + Math.random() * 50;
            console.warn(
              `[Sync] Transient DB connection error or timeout in schedule (attempt ${retryCount + 1}/${maxRetries}). Retrying in ${Math.round(delayMs)}ms...`,
            );
            await new Promise((r) => setTimeout(r, delayMs));
            return await runWithRetry(retryCount + 1, maxRetries);
          }
          throw err;
        }
      };

      try {
        for (let chunkIdx = 0; chunkIdx < MAX_CHUNKS_PER_TICK; chunkIdx++) {
          const targetIds = await runWithRetry();
          if (targetIds.length === 0) break;

          const ids = targetIds.map((t: { id: any }) => t.id);

          const monitors = await prisma.monitor.findMany({
            where: { id: { in: ids } },
            select: {
              id: true,
              url: true,
              interval: true,
              status: true,
              name: true,
              type: true,
              checkRegions: true,
              alertThreshold: true,
              dynamicThresholding: true,
              runbookUrl: true,
              method: true,
              headers: true,
              body: true,
              expectation: true,
              script: true,
              // @ts-ignore
              maintenanceWindows: {
                where: {
                  startAt: { lte: new Date() },
                  endAt: { gte: new Date() },
                },
                take: 1,
              },
              alertRules: {
                where: { enabled: true },
              },
            },
          });

          if (monitors.length === 0) break;

          console.log(`[Cron Chunk ${chunkIdx + 1}] Processing ${monitors.length} monitors...`);
          const { remaining } = await processBatch(monitors, prisma, env, ctx);
          totalProcessedCount += monitors.length - remaining.length;

          if (remaining.length > 0) {
            if (env.CHECK_QUEUE) {
              console.warn(
                `[SmartBatch] Offloading ${remaining.length} monitors to Queue due to execution limits.`,
              );
              const messages = remaining.map((m) => ({ body: m }));
              await env.CHECK_QUEUE.sendBatch(messages);
            } else {
              console.error(
                "[SmartBatch] CPU/time limit reached and NO CHECK_QUEUE configured. Remaining monitors deferred.",
              );
            }
            break;
          }

          // If chunk returned fewer than CHUNK_SIZE, no more due monitors
          if (targetIds.length < CHUNK_SIZE) break;
        }

        console.log(`Cron execution completed. Total monitors checked: ${totalProcessedCount}.`);

        // Outbound dead-man's switch / external heartbeat ping to verify worker check-loop liveness
        const pingUrl = env.DEADMAN_SNITCH_URL || env.HEALTHCHECK_PING_URL;
        if (pingUrl) {
          ctx.waitUntil(
            fetch(pingUrl, {
              method: "POST",
              headers: {
                "User-Agent": "SteadyStack-Cron-Sentinel/1.0",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "ok",
                checkedMonitors: totalProcessedCount,
                timestamp: new Date().toISOString(),
              }),
            }).catch((pingErr) => {
              console.warn("[Sentinel] Failed to ping outbound heartbeat URL:", pingErr);
            }),
          );
        }
      } catch (error: any) {
        console.error("Error in scheduled handler monitor check batch:", error);

        // Notify external dead-man's switch of check-loop failure
        const pingUrl = env.DEADMAN_SNITCH_URL || env.HEALTHCHECK_PING_URL;
        if (pingUrl) {
          ctx.waitUntil(
            fetch(pingUrl, {
              method: "POST",
              headers: {
                "User-Agent": "SteadyStack-Cron-Sentinel/1.0",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "error",
                error: error?.message || String(error),
                timestamp: new Date().toISOString(),
              }),
            }).catch((pingErr) => {
              console.warn("[Sentinel] Failed to ping error heartbeat URL:", pingErr);
            }),
          );
        }
      }
    } catch (topLevelError: any) {
      console.error("[Scheduled Worker Fatal Handler]", topLevelError);
    }
  },

  // 2. Queue Consumer: (Preserved for Paid Plan Upgrade)
  async queue(batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) {
    let activeBatch = batch;

    if (env.CHAOS_ENGINEERING === "true") {
      // 1. Simulate batch/isolate level crash (10% chance)
      if (Math.random() < 0.1) {
        console.warn("[Chaos Mode] Simulating fatal worker instance crash / V8 isolate eviction!");
        throw new Error("IsolateEvictionError: Cloudflare Worker instance killed by Chaos Engine");
      }

      // 2. Simulate message level failure (10% chance per message)
      const failedMessageIds = new Set<string>();
      for (const msg of batch.messages) {
        const msgId = msg.id || (msg.body && msg.body.id) || `mock_${Math.random()}`;
        // Systematic failure for 1 in 15 messages (e.g. msg_event_0, 15, 30...) to force DLQ escalation
        const shouldSystematicFail =
          msgId.startsWith("msg_event_") && parseInt(msgId.replace("msg_event_", "")) % 15 === 0;
        if (Math.random() < 0.1 || shouldSystematicFail) {
          console.warn(`[Chaos Mode] Simulating message processing failure for message: ${msgId}`);
          msg.retry();
          failedMessageIds.add(msgId);
        }
      }

      if (failedMessageIds.size > 0) {
        // Construct a filtered batch inheriting prototype methods from original batch
        activeBatch = Object.create(batch);
        (
          activeBatch as {
            -readonly [K in keyof MessageBatch<any>]: MessageBatch<any>[K];
          }
        ).messages = batch.messages.filter((msg) => {
          const msgId = msg.id || (msg.body && msg.body.id);
          return !failedMessageIds.has(msgId);
        });

        // If no messages left, return early
        if (activeBatch.messages.length === 0) {
          return;
        }
      }
    }

    // Dispatch based on queue name
    if (activeBatch.queue === "notifications") {
      const { default: notificationHandler } = await import("./notification-handler");
      await notificationHandler.queue(activeBatch, env, ctx);
      return;
    }

    // Default: 'monitor-checks' queue
    const prisma = getPrisma(env.DATABASE_URL, env.DATABASE_POOL_URL);
    const monitors = activeBatch.messages.map((msg) => msg.body);

    const { remaining } = await processBatch(monitors, prisma, env, ctx);

    // Ack processed messages, Retry remaining
    if (remaining.length > 0) {
      console.warn(
        `[SmartBatch] Queue processing hit limit. Retrying ${remaining.length} messages.`,
      );

      // Get IDs of remaining monitors for lookup
      const remainingIds = new Set(remaining.map((m) => m.id));

      // Retry specific messages
      for (const msg of activeBatch.messages) {
        if (remainingIds.has(msg.body.id)) {
          msg.retry();
        } else {
          msg.ack();
        }
      }
    } else {
      // All done
      activeBatch.ackAll();
    }
  },
};
