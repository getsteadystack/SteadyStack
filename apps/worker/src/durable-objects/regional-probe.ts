import { DurableObject } from "cloudflare:workers";
import type { ProbeCheckResult, ProbeHealthState } from "@steadystack/types";
import { isPrivateOrInternalUrlAsync, decryptSecret } from "@steadystack/core";
import {
  getRegionByCode,
  type DOLocationHint,
  STEADYSTACK_CANONICAL_USER_AGENT,
} from "@steadystack/shared";
import { getPrisma } from "@steadystack/db";
import type { Env } from "../env";

interface ProbeStorageState {
  region: DOLocationHint;
  probeId: string;
  measuredColo: string;
  measuredIp: string;
  asn: string;
  healthState: ProbeHealthState;
  stateTransitions: number[]; // Timestamps of transitions in last 2 hours
  alarmIntervalMs: number;
  lastAlarmRun: number;
  lastWallDurationMs: number;
  consecutiveFailures: number;
}

const MAX_CONCURRENT_FETCHES = 5; // Enforces the <6 connection concurrency limit
const DEFAULT_ALARM_INTERVAL_MS = 60_000; // 60s check cycle

/**
 * Executes async tasks with a bounded concurrency pool
 */
async function runWithBoundedConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index]!);
    }
  });

  await Promise.all(workers);
  return results;
}

export class RegionalProbe extends DurableObject<Env> {
  private probeState: ProbeStorageState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  private async initializeState(): Promise<ProbeStorageState> {
    if (this.probeState) return this.probeState;

    const stored = await this.ctx.storage.get<ProbeStorageState>("probe_state");
    if (stored) {
      this.probeState = stored;
      return stored;
    }

    // Default initialization
    const regionHint: DOLocationHint = "wnam";
    const defaultState: ProbeStorageState = {
      region: regionHint,
      probeId: `cf-probe-${regionHint}`,
      measuredColo: "UNKNOWN",
      measuredIp: "0.0.0.0",
      asn: "AS13335",
      healthState: "ONLINE",
      stateTransitions: [],
      alarmIntervalMs: DEFAULT_ALARM_INTERVAL_MS,
      lastAlarmRun: Date.now(),
      lastWallDurationMs: 0,
      consecutiveFailures: 0,
    };

    await this.ctx.storage.put("probe_state", defaultState);
    this.probeState = defaultState;
    return defaultState;
  }

  /**
   * Measure physical POP location via Cloudflare trace endpoint
   */
  private async measureColo(): Promise<{ colo: string; ip: string }> {
    try {
      const traceRes = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
        headers: { "User-Agent": "SteadyStack-Probe-Bootstrap/1.0" },
        signal: AbortSignal.timeout(4000),
      });
      if (traceRes.ok) {
        const text = await traceRes.text();
        const lines = text.split("\n");
        let colo = "UNKNOWN";
        let ip = "0.0.0.0";
        for (const line of lines) {
          if (line.startsWith("colo=")) colo = line.replace("colo=", "").trim();
          if (line.startsWith("ip=")) ip = line.replace("ip=", "").trim();
        }
        return { colo, ip };
      }
    } catch {
      // Fallback if trace endpoint is unreachable
    }
    return { colo: "DIRECT", ip: "0.0.0.0" };
  }

  /**
   * Execute an individual HTTP/HTTPS check with SSRF validation and single-probe retry
   */
  async executeSingleCheck(monitor: {
    id: string;
    url: string;
    timeout?: number;
    method?: string;
    headers?: string | null;
    body?: string | null;
  }): Promise<ProbeCheckResult> {
    const state = await this.initializeState();
    const start = performance.now();
    const timeoutSeconds = monitor.timeout || 10;

    const performRequest = async (
      _isRetry = false,
    ): Promise<{
      status: "UP" | "DOWN";
      statusCode?: number | undefined;
      latency: number;
      errorReason?: string | undefined;
      errorClass?: string | undefined;
      resolvedIp?: string | undefined;
    }> => {
      const reqStart = performance.now();
      try {
        const ssrfCheck = await isPrivateOrInternalUrlAsync(monitor.url);
        if (ssrfCheck.isForbidden) {
          return {
            status: "DOWN",
            latency: Math.round(performance.now() - reqStart),
            errorReason: `SSRF_PROTECTED: ${ssrfCheck.reason}`,
            errorClass: "SECURITY_VIOLATION",
          };
        }

        const userHeaders: Record<string, string> = {};
        if (monitor.headers) {
          try {
            const rawHeaders = await decryptSecret(monitor.headers, this.env.ENCRYPTION_SECRET);
            const parsed = JSON.parse(rawHeaders);
            if (Array.isArray(parsed)) {
              for (const h of parsed as { key?: string; value?: string }[]) {
                if (h.key && h.value) userHeaders[h.key] = h.value;
              }
            } else if (typeof parsed === "object" && parsed !== null) {
              Object.assign(userHeaders, parsed);
            }
          } catch {}
        }

        const hasBody =
          ["POST", "PUT", "PATCH"].includes(monitor.method || "GET") && Boolean(monitor.body);

        let currentUrl = monitor.url;
        let hops = 0;
        const maxHops = 5;
        let res: Response | null = null;
        let code = 0;

        while (hops < maxHops) {
          const hopCheck = await isPrivateOrInternalUrlAsync(currentUrl);
          if (hopCheck.isForbidden) {
            return {
              status: "DOWN",
              statusCode: 403,
              latency: Math.round(performance.now() - reqStart),
              errorReason: `SSRF Blocked: ${hopCheck.reason || "Forbidden target"}`,
              errorClass: "SECURITY_BLOCK",
            };
          }

          res = await fetch(currentUrl, {
            method: hops === 0 ? monitor.method || "GET" : "GET",
            headers: {
              "User-Agent": STEADYSTACK_CANONICAL_USER_AGENT,
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Sec-CH-UA": '"Chromium";v="133", "Not(A:Brand";v="99", "Google Chrome";v="133"',
              "Sec-CH-UA-Mobile": "?0",
              "Sec-CH-UA-Platform": '"Windows"',
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "none",
              "Sec-Fetch-User": "?1",
              "Upgrade-Insecure-Requests": "1",
              ...userHeaders,
            },
            ...(hops === 0 && hasBody && monitor.body ? { body: monitor.body } : {}),
            signal: AbortSignal.timeout(timeoutSeconds * 1000),
            redirect: "manual",
          });

          code = res.status;
          if (code >= 300 && code < 400) {
            const location = res.headers.get("location");
            if (!location) break;
            currentUrl = new URL(location, currentUrl).toString();
            hops++;
            continue;
          }
          break;
        }

        if (!res) throw new Error("No HTTP response received");

        // Consume body stream to avoid resource leakage
        await res.text();

        const latency = Math.round(performance.now() - reqStart);
        // Treat 2xx, 3xx as UP. 429 and 403 are server responses (endpoint is up/alive)
        const isUp = res.ok || (code >= 300 && code < 400) || code === 429 || code === 403;

        return {
          status: isUp ? "UP" : "DOWN",
          statusCode: code,
          latency,
          errorReason: isUp ? undefined : `HTTP ${code}`,
          errorClass: isUp ? undefined : code >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR",
        };
      } catch (err: any) {
        let latency = Math.round(performance.now() - reqStart);
        let errorClass = "NETWORK_ERROR";
        let errorReason = err.message || "Unknown error";

        if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
          errorClass = "TIMEOUT";
          errorReason = `Timed out after ${timeoutSeconds}s`;
          latency = timeoutSeconds * 1000;
        } else if (err.message?.includes("fetch")) {
          errorClass = "DNS_OR_CONNECT_FAILURE";
        }

        return {
          status: errorClass === "TIMEOUT" ? "DEGRADED" : "DOWN",
          latency,
          errorReason,
          errorClass,
        };
      }
    };

    // 1. First probe attempt
    let outcome = await performRequest(false);

    // 2. Immediate Re-check on Failure:
    // Single-packet drop or transient TLS reset must be re-checked immediately before declaring a probe failure
    if (outcome.status === "DOWN") {
      await new Promise((r) => setTimeout(r, 60)); // 60ms delay
      const retryOutcome = await performRequest(true);
      if (retryOutcome.status === "UP") {
        // Transient error prevented at the probe level!
        outcome = retryOutcome;
      }
    }

    const totalDuration = Math.round(performance.now() - start);

    return {
      monitorId: monitor.id,
      probeId: state.probeId,
      region: state.region,
      status: outcome.status,
      statusCode: outcome.statusCode,
      latency: outcome.latency || totalDuration,
      errorClass: outcome.errorClass,
      errorReason: outcome.errorReason,
      colo: state.measuredColo,
      asn: state.asn,
      resolvedIp: state.measuredIp,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process a batch of monitors through the bounded concurrency pool
   */
  async executeBatch(monitors: any[]): Promise<ProbeCheckResult[]> {
    return runWithBoundedConcurrency(monitors, MAX_CONCURRENT_FETCHES, (m) =>
      this.executeSingleCheck(m),
    );
  }

  /**
   * Durable Object Alarm Handler
   * Self-schedules every check interval with defensive early rescheduling.
   */
  override async alarm(): Promise<void> {
    const wallStart = performance.now();
    const state = await this.initializeState();

    // DEFENSIVE RESCHEDULING: Schedule next alarm BEFORE executing batch
    // This prevents orphan probes if an uncaught exception occurs mid-execution.
    const nextAlarmTime = Date.now() + (state.alarmIntervalMs || DEFAULT_ALARM_INTERVAL_MS);
    await this.ctx.storage.setAlarm(nextAlarmTime);

    try {
      // Periodic colo refresh if UNKNOWN
      if (state.measuredColo === "UNKNOWN") {
        const { colo, ip } = await this.measureColo();
        state.measuredColo = colo;
        state.measuredIp = ip;
        await this.ctx.storage.put("probe_state", state);
      }

      // Query monitors due for check across this region from database
      const env = this.env as Env;
      if (env.DATABASE_URL) {
        const prisma = getPrisma(env.DATABASE_URL);

        // Resilient query with exponential backoff for cross-region edge calls (e.g. APAC to US/EU Postgres)
        let monitors: any[] = [];
        let queryAttempts = 0;
        const maxQueryAttempts = 3;
        while (queryAttempts < maxQueryAttempts) {
          try {
            monitors = await prisma.monitor.findMany({
              where: {
                status: { in: ["UP", "DOWN", "MAINTENANCE"] },
                OR: [{ nextCheck: null }, { nextCheck: { lte: new Date() } }],
              },
              take: 30, // Free/standard batch size per probe wake
              select: {
                id: true,
                url: true,
                timeout: true,
                method: true,
                headers: true,
                body: true,
                checkRegions: true,
              },
            });
            break;
          } catch (queryErr: any) {
            queryAttempts++;
            if (queryAttempts >= maxQueryAttempts) {
              throw queryErr;
            }
            const delayMs = 200 * Math.pow(2, queryAttempts - 1) + Math.random() * 75;
            console.warn(
              `[RegionalProbe:${state.region}] DB query retry ${queryAttempts}/${maxQueryAttempts} after ${Math.round(delayMs)}ms:`,
              queryErr?.message,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }

        if (monitors.length > 0) {
          const results = await this.executeBatch(monitors);

          // Submit results to central Quorum Engine with retry
          const { processProbeResultsBatch } = await import("../services/quorum-engine");
          let quorumAttempts = 0;
          const maxQuorumAttempts = 3;
          while (quorumAttempts < maxQuorumAttempts) {
            try {
              await processProbeResultsBatch(prisma, env, results);
              break;
            } catch (quorumErr: any) {
              quorumAttempts++;
              if (quorumAttempts >= maxQuorumAttempts) {
                throw quorumErr;
              }
              const delayMs = 200 * Math.pow(2, quorumAttempts - 1) + Math.random() * 75;
              console.warn(
                `[RegionalProbe:${state.region}] Quorum batch retry ${quorumAttempts}/${maxQuorumAttempts} after ${Math.round(delayMs)}ms:`,
                quorumErr?.message,
              );
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }
        }
      }

      state.lastWallDurationMs = Math.round(performance.now() - wallStart);
      state.lastAlarmRun = Date.now();
      state.consecutiveFailures = 0;
      await this.ctx.storage.put("probe_state", state);
    } catch (err) {
      console.error(`[RegionalProbe:${state.region}] Alarm execution error:`, err);
      state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
      if (state.consecutiveFailures >= 3 && state.healthState !== "FLAPPING") {
        state.healthState = "DEGRADED";
      }
      await this.ctx.storage.put("probe_state", state);
    }
  }

  /**
   * HTTP Handler for DO RPC / Internal Gateway
   */
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const state = await this.initializeState();

    // 1. Initialize region identity
    if (request.method === "POST" && url.pathname === "/init") {
      const body = (await request.json().catch(() => ({}))) as {
        region?: DOLocationHint;
        intervalMs?: number;
      };
      if (body.region) {
        state.region = body.region;
        state.probeId = `cf-probe-${body.region}`;
        const regionMeta = getRegionByCode(body.region);
        if (regionMeta) {
          state.asn = regionMeta.asn;
        }
      }
      if (body.intervalMs) {
        state.alarmIntervalMs = body.intervalMs;
      }
      const { colo, ip } = await this.measureColo();
      state.measuredColo = colo;
      state.measuredIp = ip;

      await this.ctx.storage.put("probe_state", state);

      // Ensure alarm is scheduled
      const currentAlarm = await this.ctx.storage.getAlarm();
      if (!currentAlarm) {
        await this.ctx.storage.setAlarm(Date.now() + 5000);
      }

      return new Response(JSON.stringify({ ok: true, state }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Execute Batch of Checks on Demand
    if (request.method === "POST" && url.pathname === "/check-batch") {
      const { monitors } = (await request.json()) as { monitors: any[] };
      const results = await this.executeBatch(monitors || []);
      return new Response(JSON.stringify({ results }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Telemetry & Probe Status
    if (request.method === "GET" && url.pathname === "/telemetry") {
      const regionMeta = getRegionByCode(state.region);
      return new Response(
        JSON.stringify({
          probeId: state.probeId,
          region: state.region,
          regionName: regionMeta?.name || state.region,
          city: regionMeta?.city || "",
          continent: regionMeta?.continent || "",
          flag: regionMeta?.flag || "🌐",
          provider: state.asn === "AS13335" ? "Cloudflare Edge" : "Hybrid Node",
          asn: state.asn,
          measuredColo: state.measuredColo,
          measuredIp: state.measuredIp,
          healthState: state.healthState,
          lastAlarmRun: new Date(state.lastAlarmRun).toISOString(),
          lastWallDurationMs: state.lastWallDurationMs,
          alarmIntervalMs: state.alarmIntervalMs,
          ipv4Ranges: regionMeta?.ipv4Ranges || [],
          ipv6Ranges: regionMeta?.ipv6Ranges || [],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // 4. Heartbeat / State Update
    if (request.method === "POST" && url.pathname === "/heartbeat") {
      const now = Date.now();
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      // Filter old transitions
      state.stateTransitions = state.stateTransitions.filter((t) => t > twoHoursAgo);

      // Flapping exclusion: 3+ transitions in 2 hours = FLAPPING
      if (state.stateTransitions.length >= 3) {
        state.healthState = "FLAPPING";
      } else if (state.consecutiveFailures === 0) {
        state.healthState = "ONLINE";
      }

      await this.ctx.storage.put("probe_state", state);
      return new Response(JSON.stringify({ ok: true, healthState: state.healthState }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  }
}
