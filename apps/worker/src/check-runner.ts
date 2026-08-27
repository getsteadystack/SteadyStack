import type { ExecutionContext } from "@cloudflare/workers-types";
import type { MonitorStatus } from "@steadystack/types";
import { checkHttpUniversal, checkPortUniversal } from "@steadystack/core";
import { CheckErrorReason, MonitorStatus as Status, MonitorType } from "./constants";
import type { Env } from "./env";

/** Base cooldown (ms) between duplicate alerts for the same monitor. */
const ALERT_COOLDOWN_BASE = 15 * 60 * 1000;
/** Maximum cooldown (ms) — caps exponential backoff at 1 hour. */
const ALERT_COOLDOWN_MAX = 60 * 60 * 1000;
/** Redis key prefix for alert cooldown tracking. */
const ALERT_COOLDOWN_PREFIX = "alert_cooldown";

export interface CheckOutcome {
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
  daysRemaining?: number | undefined;
  issuer?: string | undefined;
  protocol?: string | undefined;
  registrar?: string | undefined;
}

/**
 * Perform a health check on a given monitor URL.
 *
 * The function checks the status of the URL by making an HTTP GET request, establishing a TCP connection, or sending a ping based on the URL protocol. It measures the latency and captures any error reasons if the check fails. The function handles various protocols and classifies errors into specific categories for better diagnostics. If the monitor is explicitly marked as "MAINTENANCE", the check is skipped.
 *
 * @param monitor - An object containing the URL to be monitored and optional timeout settings.
 * @param env - Optional worker environment bindings (used by browser/sequence checks).
 * @param prisma - Optional database client (used by heartbeat checks).
 * @returns An object containing the status ("UP", "DOWN", or "MAINTENANCE"), the latency in milliseconds, and an optional error reason.
 */
export async function performCheck(monitor: any, env?: Env, prisma?: any): Promise<CheckOutcome> {
  // If explicitly in maintenance (passed from caller), skip check
  if (monitor.status === Status.MAINTENANCE) {
    return { status: Status.MAINTENANCE, latency: 0 };
  }

  // Check for active maintenance window in the database
  if (prisma) {
    try {
      const activeWindow = await prisma.maintenanceWindow.findFirst({
        where: {
          monitorId: monitor.id,
          startAt: { lte: new Date() },
          endAt: { gte: new Date() },
        },
      });

      if (activeWindow) {
        console.log(
          `[Maintenance] Skipping check for ${monitor.name || monitor.id} (active maintenance window)`,
        );
        return { status: Status.MAINTENANCE, latency: 0 };
      }
    } catch (dbErr) {
      console.error(`[Maintenance] Failed to check maintenance window for ${monitor.id}:`, dbErr);
      // On DB failure, proceed with the check (fail-open)
    }
  }
  if (monitor.type === MonitorType.BROWSER) {
    const { performBrowserCheck } = await import("./lib/browser-runner");
    return performBrowserCheck(monitor, env);
  }

  if (monitor.type === MonitorType.SEQUENCE) {
    const { performSequenceCheck } = await import("./lib/sequence-runner");
    return performSequenceCheck(monitor, env);
  }

  if (monitor.type === MonitorType.SSL) {
    const { checkSSL } = await import("./services/ssl-check");
    try {
      const startSsl = performance.now();
      const sslResult = await checkSSL(monitor.url);
      const sslLatency = Math.round(performance.now() - startSsl);

      let currentStatus: MonitorStatus = Status.UP;
      let errorReason: string | undefined = undefined;

      if (sslResult.status !== "VALID") {
        currentStatus = Status.DOWN;
        errorReason = `SSL_${sslResult.status}`;
      } else if (sslResult.protocol === "TLSv1.0" || sslResult.protocol === "TLSv1.1") {
        currentStatus = Status.DOWN;
        errorReason = CheckErrorReason.LEGACY_TLS_PROTOCOL;
      }

      return {
        status: currentStatus,
        latency: sslLatency,
        errorReason,
        daysRemaining: sslResult.daysRemaining,
        issuer: sslResult.issuer,
        protocol: sslResult.protocol,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.SSL_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.DNS) {
    const { checkDNSWatchdog } = await import("./services/dns-watchdog");
    try {
      const startDns = performance.now();
      const expected = monitor.expectation
        ? (JSON.parse(monitor.expectation).expectedIPs as string[]) || []
        : [];
      const dnsResult = await checkDNSWatchdog(monitor.url, expected);
      const dnsLatency = Math.round(performance.now() - startDns);

      const isHealthy = dnsResult.anomalies.length === 0;
      return {
        status: isHealthy ? Status.UP : Status.DOWN,
        latency: dnsLatency,
        errorReason: isHealthy ? undefined : `DNS_ANOMALY: ${dnsResult.anomalies.join("; ")}`,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.DNS_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.DOMAIN) {
    const { checkDomainExpiration } = await import("./services/domain-expiration");
    try {
      const startDom = performance.now();
      const domainResult = await checkDomainExpiration(monitor.url);
      const domLatency = Math.round(performance.now() - startDom);

      return {
        status: domainResult.isCritical ? Status.DOWN : Status.UP,
        latency: domLatency,
        errorReason: domainResult.isCritical
          ? `DOMAIN_${domainResult.criticalStatuses.length > 0 ? "CRITICAL_STATUS" : "EXPIRED"}`
          : undefined,
        daysRemaining: domainResult.daysRemaining,
        registrar: domainResult.registrar ?? undefined,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.DOMAIN_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.HEARTBEAT) {
    const { checkHeartbeat } = await import("./services/heartbeat");
    try {
      const result = await checkHeartbeat(prisma, monitor.id, monitor.interval || 300);
      return {
        status: result.status,
        latency: result.latency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.HEARTBEAT_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.MCP) {
    const { checkMCP } = await import("./services/mcp-sentinel");
    try {
      const mcpMethod = monitor.script
        ? (JSON.parse(monitor.script).method as string) || "tools/list"
        : "tools/list";
      const mcpParams = monitor.script
        ? (JSON.parse(monitor.script).params as Record<string, unknown> | undefined)
        : undefined;
      const mcpAssertions = monitor.expectation
        ? (JSON.parse(monitor.expectation).assertions as any[]) || []
        : [];
      const result = await checkMCP(monitor.url, mcpAssertions, mcpMethod, mcpParams);
      return {
        status: result.status,
        latency: result.latency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.MCP_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.GRAPHQL) {
    const { checkGraphQL } = await import("./services/graphql-monitor");
    try {
      const gqlQuery = monitor.body || undefined;
      const gqlAssertions = monitor.expectation
        ? (JSON.parse(monitor.expectation).assertions as any[]) || []
        : [];
      const result = await checkGraphQL(monitor.url, gqlQuery, undefined, gqlAssertions);
      return {
        status: result.status,
        latency: result.latency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.GRAPHQL_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.WEBSOCKET) {
    const { checkWebSocket } = await import("./services/websocket-monitor");
    try {
      const listenSeconds = monitor.timeout || 5;
      const wsAssertion = monitor.expectation
        ? (JSON.parse(monitor.expectation) as any)
        : undefined;
      const result = await checkWebSocket(monitor.url, listenSeconds, wsAssertion);
      return {
        status: result.status,
        latency: result.latency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.WEBSOCKET_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.DATABASE) {
    const { checkDatabase } = await import("./services/database-monitor");
    try {
      const dbQuery = monitor.body || undefined;
      const dbExpectation = monitor.expectation
        ? (JSON.parse(monitor.expectation) as any)
        : undefined;
      const result = await checkDatabase(monitor.url, dbQuery, dbExpectation);
      return {
        status: result.status,
        latency: result.latency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.DATABASE_CHECK_FAILED,
      };
    }
  }

  if (monitor.type === MonitorType.BGP) {
    const { checkBGPTRoute } = await import("./services/bgp-monitor");
    try {
      const startBgp = performance.now();
      const expectation = monitor.expectation
        ? (JSON.parse(monitor.expectation) as any)
        : undefined;
      const result = await checkBGPTRoute(monitor.url, expectation);
      const bgpLatency = Math.round(performance.now() - startBgp);

      return {
        status: result.status,
        latency: bgpLatency,
        errorReason: result.errorReason,
      };
    } catch (e: any) {
      return {
        status: Status.DOWN,
        latency: 0,
        errorReason: CheckErrorReason.BGP_CHECK_FAILED,
      };
    }
  }

  const urlStr = monitor.url;

  // 1. Initial Standard Check
  let result = await performInternalRequest(monitor, urlStr, undefined, env);

  // 2. DNS Fallback Layer: If DNS failed but we have a cached IP
  if (
    result.status === Status.DOWN &&
    result.errorReason === CheckErrorReason.DNS_ERROR &&
    env?.DNS_CACHE
  ) {
    try {
      const urlObj = new URL(urlStr);
      const hostname = urlObj.hostname;

      const cachedValue = await env.DNS_CACHE.get(`dns:${hostname}`);
      if (cachedValue) {
        console.warn(`[DNSFallback] DNS failed for ${hostname}. Retrying via IP...`);

        // Re-map the hostname to IP for the fetch
        const { ip } = JSON.parse(cachedValue) as { ip: string };
        const ipUrl = urlStr.replace(hostname, ip);
        const fallbackResult = await performInternalRequest(
          monitor,
          ipUrl,
          { Host: hostname },
          env,
        );

        if (fallbackResult.status === Status.UP) {
          console.log(
            `[DNSFallback] SUCCESS: ${hostname} reached via direct IP. False positive avoided.`,
          );
          return fallbackResult;
        }
      }
    } catch (err) {
      console.error(`[DNSFallback] Failed fallback for ${urlStr}:`, err);
    }
  }

  return result;
}

/**
 * Reusable core fetch/connection logic
 */
export async function performInternalRequest(
  monitor: any,
  urlStr: string,
  extraHeaders?: Record<string, string>,
  env?: Env,
): Promise<{
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
}> {
  const start = performance.now();
  let currentStatus: MonitorStatus = Status.DOWN;
  let latency = 0;
  let errorReason: string | undefined = undefined;

  try {
    if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
      const headersObj: Record<string, string> = {};
      if (monitor.headers) {
        try {
          let rawHeaders = monitor.headers;
          if (rawHeaders.startsWith("enc:v1:")) {
            const { decryptSecret } = await import("@steadystack/core");
            rawHeaders = await decryptSecret(rawHeaders, env?.ENCRYPTION_SECRET);
          }
          const parsed = JSON.parse(rawHeaders);
          if (Array.isArray(parsed)) {
            parsed.forEach((h: { key: string; value: string }) => {
              if (h.key) headersObj[h.key] = h.value;
            });
          } else if (typeof parsed === "object" && parsed !== null) {
            Object.assign(headersObj, parsed);
          }
        } catch {}
      }
      if (extraHeaders) {
        Object.assign(headersObj, extraHeaders);
      }

      const checkResult = await checkHttpUniversal(urlStr, {
        method: monitor.method,
        headers: headersObj,
        body: monitor.body,
        timeoutSeconds: monitor.timeout,
      });

      currentStatus = checkResult.status;
      latency = checkResult.latency;
      errorReason = checkResult.errorReason;

      // 3. Deep Payload/Status Validation (WASM/Rust Optimized Bridge)
      if (currentStatus === Status.UP && monitor.expectation) {
        const { validatePayload } = await import("./lib/payload-parser");
        const validation = validatePayload(
          checkResult.bodyText,
          checkResult.statusCode || 200,
          monitor.expectation,
        );
        if (!validation.success) {
          currentStatus = Status.DOWN;
          errorReason = validation.errorMessage || `HTTP_${checkResult.statusCode || 200}`;
        }
      }
    } else if (urlStr.startsWith("tcp://")) {
      // Parse tcp://hostname:port
      const part = urlStr.replace("tcp://", "");
      const [hostname, port] = part.split(":");

      if (!hostname || !port) throw new Error("Invalid TCP URL format");

      const checkResult = await checkPortUniversal(
        hostname,
        parseInt(port, 10),
        (monitor.timeout || 10) * 1000,
      );

      if (checkResult.isOpen) {
        currentStatus = Status.UP;
      } else {
        currentStatus = Status.DOWN;
        errorReason = checkResult.errorReason || CheckErrorReason.PORT_CLOSED;
      }
    } else if (urlStr.startsWith("ping://")) {
      const hostname = urlStr.replace("ping://", "");
      const checkResult = await checkPortUniversal(hostname, 80, (monitor.timeout || 10) * 1000);

      if (checkResult.isOpen) {
        currentStatus = Status.UP;
      } else {
        currentStatus = Status.DOWN;
        errorReason = checkResult.errorReason || CheckErrorReason.PING_FAILED;
      }
    } else {
      // Fallback or unknown
      throw new Error("Unknown protocol");
    }

    if (latency === 0) {
      latency = Math.round(performance.now() - start);
    }
  } catch (err: any) {
    console.error(`Error checking ${urlStr}:`, err);
    latency = 0;
    currentStatus = Status.DOWN;

    // Classify Error
    if (err.name === "TimeoutError" || (err.message && err.message.includes("Stats"))) {
      errorReason = CheckErrorReason.TIMEOUT;
      currentStatus = Status.DEGRADED;
    } else if (
      err.code === "ECONNREFUSED" ||
      (err.message && err.message.includes("Connection refused"))
    ) {
      errorReason = CheckErrorReason.CONNECTION_REFUSED;
    } else if (
      err.code === "ENOTFOUND" ||
      (err.message && err.message.includes("getaddrinfo")) ||
      (err.message && err.message.includes("dns"))
    ) {
      errorReason = CheckErrorReason.DNS_ERROR;
    } else {
      errorReason = CheckErrorReason.UNKNOWN_ERROR;
    }
  }

  return { status: currentStatus, latency, errorReason };
}

// Helper: Check for flapping (Rate Limiting) and alert cooldown (de-duplication)
export async function shouldSendAlert(
  monitorId: string,
  eventCounts: Map<string, number>,
  env?: Env,
  prisma?: any,
): Promise<boolean> {
  const recentEvents = eventCounts.get(monitorId) || 0;

  // If > 3 events in 5 mins (e.g. DOWN -> UP -> DOWN -> ...), suppress
  if (recentEvents > 3) {
    console.warn(`[RateLimit] Flapping detected for ${monitorId}. Suppressing alert.`);
    return false;
  }

  // Redis-based cooldown de-duplication
  if (env?.UPSTASH_REDIS_REST_URL && env?.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redisKey = `${ALERT_COOLDOWN_PREFIX}:${monitorId}`;
      const redisUrl = `${env.UPSTASH_REDIS_REST_URL}/get/${redisKey}`;
      const redisRes = await fetch(redisUrl, {
        headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
      });

      if (redisRes.ok) {
        const redisData = (await redisRes.json()) as any;
        if (redisData.result) {
          const { lastAlertAt, alertCount } = JSON.parse(redisData.result) as {
            lastAlertAt: number;
            alertCount: number;
          };

          const elapsed = Date.now() - lastAlertAt;
          // Exponential backoff: base cooldown * 2^(alertCount-1), capped at max
          const cooldown = Math.min(
            ALERT_COOLDOWN_BASE * Math.pow(2, alertCount - 1),
            ALERT_COOLDOWN_MAX,
          );

          if (elapsed < cooldown) {
            console.warn(
              `[AlertDedup] Suppressing alert for ${monitorId} (cooldown: ${cooldown}ms, elapsed: ${elapsed}ms, count: ${alertCount}).`,
            );
            return false;
          }
        }
      }

      // Redis responded successfully — trust it as the source of truth.
      return true;
    } catch (err) {
      console.error(`[AlertDedup] Redis check failed for ${monitorId}:`, err);
      // Redis is unavailable — fall through to the DB-backed fallback below
      // instead of failing open and flooding the user with alerts.
    }
  }

  // DB-backed cooldown fallback: used when Redis is unavailable or not configured.
  // Check whether an incident was already created for this monitor within the base
  // cooldown window. If one exists (open or recently resolved), suppress the alert.
  if (prisma) {
    try {
      const since = new Date(Date.now() - ALERT_COOLDOWN_BASE);
      const recentIncident = await prisma.incident.findFirst({
        where: {
          monitorId,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
      });

      if (recentIncident) {
        console.warn(
          `[AlertDedup] DB fallback: suppressing alert for ${monitorId} — incident ${recentIncident.id} created at ${recentIncident.createdAt.toISOString()} is within cooldown window.`,
        );
        return false;
      }
    } catch (dbErr) {
      console.error(`[AlertDedup] DB fallback check failed for ${monitorId}:`, dbErr);
      // Both Redis and DB failed. Fail-closed to protect the user's inbox.
      return false;
    }
  }

  return true;
}

/**
 * Record that an alert was sent for a monitor, updating the cooldown tracker
 * in Redis for future de-duplication.
 */
export async function recordAlertSent(monitorId: string, env?: Env): Promise<void> {
  if (!env?.UPSTASH_REDIS_REST_URL || !env?.UPSTASH_REDIS_REST_TOKEN) return;

  try {
    const redisKey = `${ALERT_COOLDOWN_PREFIX}:${monitorId}`;
    const redisUrl = `${env.UPSTASH_REDIS_REST_URL}/get/${redisKey}`;
    const redisRes = await fetch(redisUrl, {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
    });

    let alertCount = 0;
    if (redisRes.ok) {
      const redisData = (await redisRes.json()) as any;
      if (redisData.result) {
        const parsed = JSON.parse(redisData.result) as {
          lastAlertAt: number;
          alertCount: number;
        };
        alertCount = parsed.alertCount;
      }
    }

    const newValue = JSON.stringify({
      lastAlertAt: Date.now(),
      alertCount: alertCount + 1,
    });

    const setUrl = `${env.UPSTASH_REDIS_REST_URL}/set/${redisKey}/${encodeURIComponent(newValue)}/EX/3600`;
    await fetch(setUrl, {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
    });
  } catch (err) {
    console.error(`[AlertDedup] Failed to record alert for ${monitorId}:`, err);
  }
}

// Helper: Record latency to Aggregator DO
/**
 * Records latency data to the aggregator service.
 *
 * @param {Env | undefined} env - The environment object that may contain the LATENCY_AGGREGATOR.
 * @param {string} monitorId - The identifier for the monitor.
 * @param {string} region - The region associated with the latency data.
 * @param {number} latency - The recorded latency value.
 * @param {boolean} success - Indicates whether the operation was successful.
 * @param {boolean} flush - Whether to trigger an immediate flush.
 */
export async function recordLatencyToAggregator(
  env: Env | undefined,
  monitorId: string,
  region: string,
  latency: number,
  success: boolean,
  flush: boolean = false,
): Promise<void> {
  if (!env?.LATENCY_AGGREGATOR) return;

  try {
    const id = env.LATENCY_AGGREGATOR.idFromName("global-latency-aggregator");
    const stub = env.LATENCY_AGGREGATOR.get(id);

    await stub
      .fetch(`https://latency-aggregator/record${flush ? "?flush=true" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monitorId,
          region,
          latency,
          success,
          timestamp: Date.now(),
        }),
      })
      .then((r) => r.text()); // Consume body
  } catch (error) {
    console.error(`[LatencyAggregator] Failed to record latency:`, error);
  }
}

/**
 * Records a batch of latency records to the Aggregator DO, with direct DB fallback.
 */
export async function recordLatencyBatchToAggregator(
  env: Env | undefined,
  prisma: any,
  records: Array<{
    monitorId: string;
    region: string;
    latency: number;
    success: boolean;
    timestamp?: number | Date;
  }>,
  flush: boolean = true,
): Promise<void> {
  if (records.length === 0) return;

  // 1. Broadcast to LatencyAggregator DO for live subscribers & websocket streaming (paid DO tier)
  if (env?.ENABLE_DURABLE_OBJECTS === "true" && env?.LATENCY_AGGREGATOR) {
    try {
      const id = env.LATENCY_AGGREGATOR.idFromName("global-latency-aggregator");
      const stub = env.LATENCY_AGGREGATOR.get(id);

      await stub.fetch("https://latency-aggregator/record-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: records.map((r) => ({
            monitorId: r.monitorId,
            region: r.region,
            latency: r.latency,
            success: r.success,
            timestamp:
              typeof r.timestamp === "number" ? r.timestamp : r.timestamp?.getTime() || Date.now(),
          })),
          flush,
        }),
      });
    } catch (error) {
      console.warn(`[LatencyAggregator] DO record-batch notification failed (non-fatal):`, error);
    }
  }

  // 2. Persist direct to Postgres database for guaranteed dashboard querying
  if (prisma) {
    try {
      const now = new Date();
      const timestamp = new Date(Math.floor(now.getTime() / 60000) * 60000);

      await prisma.latencyAggregate.createMany({
        data: records.map((r) => ({
          monitorId: r.monitorId,
          region: r.region,
          timestamp,
          granularity: "ONE_MINUTE" as any,
          avgLatency: r.latency,
          minLatency: r.latency,
          maxLatency: r.latency,
          p50Latency: r.latency,
          p95Latency: r.latency,
          p99Latency: r.latency,
          sampleCount: 1,
          successRate: r.success ? 1 : 0,
        })),
      });
    } catch (err) {
      console.error("[LatencyAggregator] Direct DB persistence failed:", err);
    }
  }
}

// Helper: Broadcast live event to MonitorChannel DO
/**
 * Broadcasts a live event to the specified monitor channel.
 *
 * This function checks if the MONITOR_CHANNEL is defined in the environment. If it is, it retrieves the DO instance using the monitorId and sends a broadcast request with the event data. The request is sent without awaiting the response to prevent blocking the check loop, allowing for a fire-and-forget approach. Errors during the broadcast setup or execution are logged to the console.
 *
 * @param {Env | undefined} env - The environment object that may contain the MONITOR_CHANNEL.
 * @param {string} monitorId - The identifier for the monitor to which the event is being broadcasted.
 * @param {any} event - The event data to be broadcasted.
 * @param {ExecutionContext} [ctx] - Optional execution context; when provided the broadcast is scheduled via waitUntil.
 */
export async function broadcastLiveEvent(
  env: Env | undefined,
  monitorId: string,
  event: any,
  ctx?: ExecutionContext,
): Promise<void> {
  if (env?.ENABLE_DURABLE_OBJECTS !== "true" || !env?.MONITOR_CHANNEL) return;

  try {
    // Get DO instance (using monitorId as the DO ID)
    const id = env.MONITOR_CHANNEL.idFromName(monitorId);
    const stub = env.MONITOR_CHANNEL.get(id);

    // Send broadcast
    const promise = stub
      .fetch("https://monitor-channel/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
      .then((r) => r.text())
      .catch((err) => console.error(`[MonitorChannel] Broadcast failed:`, err));

    if (ctx) {
      ctx.waitUntil(promise);
    } else {
      await promise;
    }
  } catch (error) {
    console.error(`[MonitorChannel] Failed to setup broadcast:`, error);
  }
}
