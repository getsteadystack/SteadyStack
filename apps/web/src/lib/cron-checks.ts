import prisma, { MonitorType } from "@steadystack/db";
import {
  DEFAULT_CHECK_TIMEOUT_SECONDS,
  decryptSecret,
  isPrivateOrInternalUrlAsync,
} from "@steadystack/core";
import { STEADYSTACK_CANONICAL_USER_AGENT } from "@steadystack/shared";
import { sendMonitorAlert } from "@steadystack/email";
import net from "net";

/**
 * Web runtime check engine.
 *
 * Runs due monitor checks from inside the Next.js server so uptime is tracked
 * even when no user has the dashboard open. The Cloudflare worker cron does the
 * same job in production — the two share work safely because every claimed
 * monitor is atomically marked in-queue via nextCheck, so whichever engine
 * claims it first wins and the other skips it.
 *
 * Capability notes: this engine evaluates HTTP(S), PING and TCP/PORT monitors.
 * HEARTBEAT monitors are passive (their nextCheck advances on incoming pings),
 * probe-assigned monitors belong to distributed probes, and BROWSER/SEQUENCE/
 * SSL/DNS/DOMAIN/MCP/GRAPHQL/WEBSOCKET/DATABASE/BGP/GRPC/SMTP/FTP/ICMP/MAIL
 * monitors are evaluated by the dedicated worker paths — so we leave them for
 * their engines.
 */

const WEB_ENGINE_CAPABLE_TYPES: MonitorType[] = ["HTTP", "PING", "PORT"];

export interface DueCheckResult {
  id: string;
  name: string;
  status: string;
  latency: number;
}

interface DueMonitor {
  id: string;
  name: string;
  type: string;
  url: string;
  method: string | null;
  body: string | null;
  headers: string | null;
  clientCert: string | null;
  expectation: unknown;
  interval: number;
  status: string;
  maintenanceWindows: unknown[];
  alertRules: Array<{
    channels: Array<{
      id: string;
      type: string;
      config: unknown;
    }>;
  }>;
}

/**
 * Atomically claim due monitors so concurrent engines (this scheduler, the
 * /api/cron/check route, and the Cloudflare worker cron) never run the same
 * check twice.
 *
 * Strategy: optimistic claims. Read due candidates, then advance each one's
 * nextCheck with a conditional UPDATE that only matches if nextCheck is still
 * the value we read. A competing engine that claimed the monitor first will
 * have already moved nextCheck, so our UPDATE matches 0 rows and we skip it.
 * No locks or leader election needed — the database arbitrates.
 */
async function claimDueMonitors(now: Date, take: number): Promise<DueMonitor[]> {
  const candidates = await prisma.monitor.findMany({
    where: {
      status: { in: ["UP", "DOWN", "MAINTENANCE"] },
      type: { in: WEB_ENGINE_CAPABLE_TYPES },
      OR: [{ nextCheck: null }, { nextCheck: { lte: now } }],
      // HEARTBEAT-style passive monitors and probe-assigned monitors have
      // their own engines; never claim them here.
      probeAssignments: { none: {} },
    },
    select: { id: true, nextCheck: true },
    take,
    orderBy: [{ nextCheck: "asc" }, { id: "asc" }],
  });

  if (candidates.length === 0) return [];

  const claimed: DueMonitor[] = [];

  for (const candidate of candidates) {
    const intervalSeconds = 60; // refined below after full fetch when needed
    const nextCheck = new Date(now.getTime() + intervalSeconds * 1000);

    // Conditional write: only bump nextCheck if it is still what we read.
    // A concurrent engine that claimed the monitor first will have moved
    // nextCheck, so our update matches 0 rows and we skip it.
    const updated = await prisma.monitor.updateMany({
      where: {
        id: candidate.id,
        OR: [{ nextCheck: null }, { nextCheck: candidate.nextCheck }],
      },
      data: { nextCheck },
    });

    if (updated.count === 0) continue; // lost the race — another engine took it

    const monitor = (await prisma.monitor.findUnique({
      where: { id: candidate.id },
      include: {
        alertRules: {
          where: { enabled: true },
          include: { channels: true },
        },
        maintenanceWindows: {
          where: { startAt: { lte: now }, endAt: { gte: now } },
          take: 1,
        },
      },
    })) as DueMonitor | null;

    if (monitor) claimed.push(monitor);
  }

  return claimed;
}

/**
 * Confirmation retry before a DOWN is persisted.
 *
 * A single failed check is not proof of an outage: DNS blips, TLS
 * renegotiations, and slow origins routinely produce one-off failures. To keep
 * those from flipping a healthy monitor DOWN, a first-attempt failure is
 * re-checked after a short pause; only a confirmed failure persists DOWN.
 */
const DOWN_CONFIRMATION_RETRY_DELAY_MS = 2_000;

/** Re-runs the appropriate check for the monitor's scheme. */
async function recheck(
  monitor: DueMonitor,
  start: number,
): Promise<{ status: "UP" | "DOWN"; latency: number; errorReason: string | undefined }> {
  await new Promise((resolve) => setTimeout(resolve, DOWN_CONFIRMATION_RETRY_DELAY_MS));
  try {
    if (
      monitor.url.startsWith("ping://") ||
      monitor.url.startsWith("tcp://") ||
      monitor.type === "PING"
    ) {
      const latency = await checkPingMonitor(monitor, start);
      return { status: "UP", latency, errorReason: undefined };
    }
    return await checkHttpMonitor(monitor, Date.now());
  } catch (retryErr) {
    const error = retryErr instanceof Error ? retryErr : new Error(String(retryErr));
    return {
      status: "DOWN",
      latency: Math.round(Date.now() - start),
      errorReason: error.message ? error.message.substring(0, 100) : "UNKNOWN_ERROR",
    };
  }
}

async function checkHttpMonitor(monitor: DueMonitor, start: number) {
  let currentStatus: "UP" | "DOWN" = "DOWN";
  let latency = 0;
  let errorReason: string | undefined;

  const ssrfCheck = await isPrivateOrInternalUrlAsync(monitor.url);
  if (ssrfCheck.isForbidden) {
    return { status: "DOWN" as const, latency, errorReason: `SSRF Protection: ${ssrfCheck.reason || "Private address forbidden"}` };
  }

  const method = monitor.method || "GET";
  const userHeaders: Record<string, string> = {};

  if (monitor.headers) {
    try {
      const rawHeaders = await decryptSecret(monitor.headers);
      const parsed = JSON.parse(rawHeaders);
      if (Array.isArray(parsed)) {
        for (const h of parsed) {
          if (h?.key) userHeaders[h.key] = h.value;
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        Object.assign(userHeaders, parsed);
      }
    } catch (e) {
      console.error("Failed to parse headers:", e);
    }
  }

  // mTLS: decrypt the client certificate bundle when present
  let clientCert: string | undefined;
  let clientKey: string | undefined;
  if (monitor.clientCert) {
    try {
      const raw = await decryptSecret(monitor.clientCert);
      const parsed = JSON.parse(raw) as { cert?: string; key?: string };
      clientCert = parsed.cert;
      clientKey = parsed.key;
    } catch {
      console.error("[MTLS] Failed to parse client certificate bundle");
    }
  }

  const response = await fetch(monitor.url, {
    method,
    redirect: "follow",
    headers: {
      "User-Agent": STEADYSTACK_CANONICAL_USER_AGENT,
      Accept: "*/*",
      ...userHeaders,
    },
    body: ["POST", "PUT", "PATCH"].includes(method) ? monitor.body : undefined,
    signal: AbortSignal.timeout(DEFAULT_CHECK_TIMEOUT_SECONDS * 1000),
    // @ts-expect-error — Node dispatcher for mTLS; ignored on non-Node runtimes
    dispatcher:
      clientCert && clientKey
        ? (await import("@steadystack/core")).createMtlsDispatcher(clientCert, clientKey)
        : undefined,
  });

  const body = await response.text();
  latency = Math.round(Date.now() - start);
  const statusNum = Number(response.status);
  const isHealthy =
    response.ok || (statusNum >= 300 && statusNum < 400) || statusNum === 429 || statusNum === 403;
  currentStatus = isHealthy ? "UP" : "DOWN";

  if (currentStatus === "UP" && monitor.expectation) {
    const { validatePayload, validateBodySize } = await import("@/lib/payload-parser");
    // Body size thresholds first (byte-exact), then content validation
    // expectation is the raw JSON string column the validators parse themselves
    const expectation = monitor.expectation as string | null | undefined;
    const sizeValidation = validateBodySize(new Blob([body]).size, expectation);
    if (!sizeValidation.success) {
      currentStatus = "DOWN";
      errorReason = sizeValidation.errorMessage;
    } else {
      const validation = validatePayload(body, response.status, expectation);
      if (!validation.success) {
        currentStatus = "DOWN";
        errorReason = validation.errorMessage || "Payload validation failed";
      }
    }
  } else if (currentStatus === "DOWN") {
    errorReason = `HTTP_${response.status}`;
  }

  return { status: currentStatus, latency, errorReason };
}

async function checkPingMonitor(monitor: DueMonitor, start: number) {
  const isPing = monitor.url.startsWith("ping://");
  const part = monitor.url.replace(isPing ? "ping://" : "tcp://", "");
  const [hostname, portStr] = part.split(":");
  const port = isPing ? 80 : Number.parseInt(portStr, 10);

  if (!hostname || (Number.isNaN(port) && !isPing)) {
    throw new Error("Invalid host or port in URL");
  }

  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host: hostname, port: port || 80 });
    socket.setTimeout(DEFAULT_CHECK_TIMEOUT_SECONDS * 1000);
    socket.on("connect", () => {
      socket.end();
      resolve();
    });
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("TIMEOUT"));
    });
    socket.on("error", (err) => {
      socket.destroy();
      reject(err);
    });
  });

  return Math.round(Date.now() - start);
}

async function dispatchAlerts(
  monitor: DueMonitor,
  previousStatus: string,
  currentStatus: "UP" | "DOWN",
  errorReason: string | undefined,
) {
  if (previousStatus !== "UP" || currentStatus !== "DOWN") return;

  for (const rule of monitor.alertRules) {
    for (const channel of rule.channels) {
      try {
        const cfg = (channel.config ?? {}) as Record<string, any>;
        if (channel.type === "EMAIL" && cfg?.email) {
          await sendMonitorAlert(cfg.email, {
            monitorName: monitor.name,
            url: monitor.url,
            status: "DOWN",
            timestamp: new Date().toISOString(),
            reason: errorReason || "Endpoint unreachable",
            monitorId: "",
            previousStatus: "UP",
          });
        } else if ((channel.type === "DISCORD" || channel.type === "SLACK") && cfg?.webhookUrl) {
          await fetch(cfg.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `🚨 **Alert**: Monitor **${monitor.name}** is DOWN!\nURL: ${monitor.url}\nReason: ${errorReason || "Failed check"}`,
            }),
          });
        }
      } catch (alertErr) {
        console.error(`Failed to dispatch alert to channel ${channel.id}:`, alertErr);
      }
    }
  }
}

/**
 * Run one batch of due checks (max `take` monitors). Safe to call from any
 * server context — API route, instrumentation scheduler, or a server action.
 */
export async function runDueChecks(take = 50): Promise<DueCheckResult[]> {
  const now = new Date();
  const results: DueCheckResult[] = [];

  // Claim first so a long-running HTTP check doesn't hold open the initial
  // query or double-claim against the worker cron.
  const activeMonitors = await claimDueMonitors(now, take);

  if (activeMonitors.length === 0) return results;

  // Monitors inside an active maintenance window just idle in place.
  const maintenanceMonitors = activeMonitors.filter((m) => m.maintenanceWindows.length > 0);
  const checks = activeMonitors.filter((m) => m.maintenanceWindows.length === 0);

  if (maintenanceMonitors.length > 0) {
    // Advance each maintenance monitor by its own interval (the claim used a
    // conservative placeholder so it doesn't get re-claimed mid-check).
    await prisma.$transaction(
      maintenanceMonitors.map((monitor) =>
        prisma.monitor.update({
          where: { id: monitor.id },
          data: {
            status: "MAINTENANCE" as const,
            lastCheck: now,
            nextCheck: new Date(now.getTime() + (monitor.interval || 60) * 1000),
          },
        }),
      ),
    );
  }

  await Promise.all(
    checks.map(async (monitor) => {
      const start = Date.now();
      let currentStatus: "UP" | "DOWN" = "DOWN";
      let latency = 0;
      let errorReason: string | undefined;

      try {
        if (monitor.url.startsWith("ping://") || monitor.url.startsWith("tcp://") || monitor.type === "PING") {
          latency = await checkPingMonitor(monitor, start);
          currentStatus = "UP";
        } else if (monitor.url.startsWith("http://") || monitor.url.startsWith("https://")) {
          const result = await checkHttpMonitor(monitor, start);
          currentStatus = result.status;
          latency = result.latency;
          errorReason = result.errorReason;
          // A bad status code is not confirmed on the first attempt either —
          // 502/503 blips behind proxies are the classic false DOWN.
          if (currentStatus === "DOWN") {
            const confirmed = await recheck(monitor, start);
            currentStatus = confirmed.status;
            latency = confirmed.latency;
            errorReason = confirmed.errorReason;
          }
        } else {
          errorReason = `Unsupported monitor type for web engine: ${monitor.type}`;
        }
      } catch (err: unknown) {
        latency = 0;
        currentStatus = "DOWN";
        const error = err instanceof Error ? err : new Error(String(err));
        errorReason = error.message ? error.message.substring(0, 100) : "UNKNOWN_ERROR";

        // Thrown errors (fetch failures, timeouts) are the most common source
        // of transient false DOWNs — confirm before persisting.
        if (
          monitor.url.startsWith("http://") ||
          monitor.url.startsWith("https://") ||
          monitor.url.startsWith("ping://") ||
          monitor.url.startsWith("tcp://") ||
          monitor.type === "PING"
        ) {
          const confirmed = await recheck(monitor, start);
          currentStatus = confirmed.status;
          latency = confirmed.latency;
          errorReason = confirmed.errorReason;
        }
      }

      const previousStatus = monitor.status;
      const nextCheck = new Date(Date.now() + (monitor.interval || 60) * 1000);

      try {
        await prisma.$transaction([
          prisma.monitorEvent.create({
            data: {
              monitorId: monitor.id,
              status: currentStatus,
              latency,
              errorReason,
              timestamp: new Date(),
            },
          }),
          prisma.monitor.update({
            where: { id: monitor.id },
            data: {
              status: currentStatus,
              lastCheck: new Date(),
              nextCheck,
            },
          }),
        ]);
      } catch (dbErr) {
        // The claim already bumped nextCheck, so we won't hot-loop on a
        // persist failure — but log loudly since the event was lost.
        console.error(`[CronChecks] Failed to persist result for ${monitor.id}:`, dbErr);
      }

      await dispatchAlerts(monitor, previousStatus, currentStatus, errorReason);

      results.push({ id: monitor.id, name: monitor.name, status: currentStatus, latency });
    }),
  );

  return results;
}
