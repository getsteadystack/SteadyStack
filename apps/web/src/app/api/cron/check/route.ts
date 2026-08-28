import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { isPrivateOrInternalUrlAsync, decryptSecret } from "@steadystack/core";
import { STEADYSTACK_CANONICAL_USER_AGENT } from "@steadystack/shared";
import { sendMonitorAlert } from "@steadystack/email";
import net from "net";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Performs due checks for monitors across the system
async function runDueChecks() {
  const now = new Date();

  // 1. Fetch monitors due for check (nextCheck is null or <= now, active status)
  const dueMonitors = await prisma.monitor.findMany({
    where: {
      status: { in: ["UP", "DOWN", "MAINTENANCE"] },
      OR: [{ nextCheck: null }, { nextCheck: { lte: now } }],
    },
    include: {
      alertRules: {
        where: { enabled: true },
        include: { channels: true },
      },
      user: {
        select: { email: true },
      },
      maintenanceWindows: {
        where: {
          startAt: { lte: now },
          endAt: { gte: now },
        },
        take: 1,
      },
    },
    take: 50, // Batch limit per invocation
  });

  const results: Array<{ id: string; name: string; status: string; latency: number }> = [];

  // Separate monitors into those in maintenance and those needing active checks
  const maintenanceMonitors = [];
  const activeMonitors = [];

  for (const monitor of dueMonitors) {
    if (monitor.maintenanceWindows && monitor.maintenanceWindows.length > 0) {
      maintenanceMonitors.push(monitor);
    } else {
      activeMonitors.push(monitor);
    }
  }

  // Batch update all monitors in maintenance to avoid N+1 queries
  if (maintenanceMonitors.length > 0) {
    const updateOperations = maintenanceMonitors.map((monitor) => {
      const nextCheck = new Date(Date.now() + (monitor.interval || 60) * 1000);
      return prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          status: "MAINTENANCE",
          lastCheck: now,
          nextCheck,
        },
      });
    });
    await prisma.$transaction(updateOperations);
  }

  await Promise.all(
    activeMonitors.map(async (monitor) => {
      const start = Date.now();
      let currentStatus: "UP" | "DOWN" = "DOWN";
      let latency = 0;
      let errorReason: string | undefined;

      try {
        if (
          monitor.type === "PING" ||
          monitor.url.startsWith("ping://") ||
          monitor.url.startsWith("tcp://")
        ) {
          const isPing = monitor.url.startsWith("ping://");
          const part = monitor.url.replace(isPing ? "ping://" : "tcp://", "");
          const [hostname, portStr] = part.split(":");
          const port = isPing ? 80 : Number.parseInt(portStr, 10);

          if (!hostname || (Number.isNaN(port) && !isPing)) {
            throw new Error("Invalid host or port in URL");
          }

          await new Promise<void>((resolve, reject) => {
            const socket = net.connect({ host: hostname, port: port || 80 });
            socket.setTimeout((monitor.timeout || 10) * 1000);
            socket.on("connect", () => {
              currentStatus = "UP";
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

          latency = Math.round(Date.now() - start);
        } else if (monitor.url.startsWith("http://") || monitor.url.startsWith("https://")) {
          const ssrfCheck = await isPrivateOrInternalUrlAsync(monitor.url);
          if (ssrfCheck.isForbidden) {
            currentStatus = "DOWN";
            errorReason = `SSRF Protection: ${ssrfCheck.reason || "Private address forbidden"}`;
            latency = Math.round(Date.now() - start);
          } else {
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

            const response = await fetch(monitor.url, {
              method,
              redirect: "follow",
              headers: {
                "User-Agent": STEADYSTACK_CANONICAL_USER_AGENT,
                Accept: "*/*",
                ...userHeaders,
              },
              body: ["POST", "PUT", "PATCH"].includes(method) ? monitor.body : undefined,
              signal: AbortSignal.timeout((monitor.timeout || 10) * 1000),
            });

            const body = await response.text();
            latency = Math.round(Date.now() - start);
            const statusNum = Number(response.status);
            const isHealthy =
              response.ok ||
              (statusNum >= 300 && statusNum < 400) ||
              statusNum === 429 ||
              statusNum === 403;
            currentStatus = isHealthy ? "UP" : "DOWN";

            if (currentStatus === "UP" && monitor.expectation) {
              const { validatePayload } = await import("@/lib/payload-parser");
              const validation = validatePayload(body, response.status, monitor.expectation);
              if (!validation.success) {
                currentStatus = "DOWN";
                errorReason = validation.errorMessage || "Payload validation failed";
              }
            } else if (currentStatus === "DOWN") {
              errorReason = `HTTP_${response.status}`;
            }
          }
        }
      } catch (err: unknown) {
        latency = 0;
        currentStatus = "DOWN";
        const error = err instanceof Error ? err : new Error(String(err));
        errorReason = error.message ? error.message.substring(0, 100) : "UNKNOWN_ERROR";
      }

      const previousStatus = monitor.status;
      const nextCheck = new Date(Date.now() + (monitor.interval || 60) * 1000);

      // Save event and update monitor
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

      // Send alert if status transitioned to DOWN
      if (previousStatus === "UP" && currentStatus === "DOWN" && monitor.alertRules.length > 0) {
        for (const rule of monitor.alertRules) {
          for (const channel of rule.channels) {
            try {
              const cfg = channel.config as Record<string, any>;
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
              } else if (
                (channel.type === "DISCORD" || channel.type === "SLACK") &&
                cfg?.webhookUrl
              ) {
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

      results.push({ id: monitor.id, name: monitor.name, status: currentStatus, latency });
    }),
  );

  return results;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const urlSecret = req.nextUrl.searchParams.get("key");
    if (urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await runDueChecks();
  return NextResponse.json({
    success: true,
    count: results.length,
    timestamp: new Date().toISOString(),
    monitors: results,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
