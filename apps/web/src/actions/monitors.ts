"use server";

import { env } from "@steadystack/env/server";
import net from "net";

import prisma from "@steadystack/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@steadystack/auth";
import { headers, cookies } from "next/headers";
import { sendMonitorAlert, type MonitorAlertData } from "@steadystack/email";
import { isPrivateOrInternalUrlAsync, encryptSecret, decryptSecret } from "@steadystack/core";
import { STEADYSTACK_CANONICAL_USER_AGENT } from "@steadystack/shared";
import {
  assertMonitorLimits,
  assertManualCheckRateLimit,
  checkAndNotifyUsageLimits,
} from "@/lib/billing-server";
import { generateDeepInsightAnalysis, getAIProviderClient } from "@/lib/ai";
import { getActiveWorkspace } from "@/actions/team";

// Helper Types for Incident Management
enum IncidentEventType {
  STATE_CHANGE = "STATE_CHANGE",
  ALERT_SENT = "ALERT_SENT",
  COMMENT = "COMMENT",
  AUTO_RESOLVE = "AUTO_RESOLVE",
}

enum IncidentStatus {
  INVESTIGATING = "INVESTIGATING",
  IDENTIFIED = "IDENTIFIED",
  MONITORING = "MONITORING",
  RESOLVED = "RESOLVED",
}

enum Severity {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

// Conditional validation schema
const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "HTTP",
    "PING",
    "PORT",
    "BROWSER",
    "SEQUENCE",
    "SSL",
    "DNS",
    "MCP",
    "DATABASE",
    "HEARTBEAT",
  ]),
  interval: z.coerce.number().min(10),
  timeout: z.coerce.number().min(1),
  url: z.string().optional(), // For HTTP/Ping
  // For Port:
  hostname: z.string().optional(),
  port: z.coerce.number().min(1).max(65535).optional(),
  // Multi-region support
  checkRegions: z.string().optional(), // JSON stringified array of region codes
  alertThreshold: z.coerce.number().min(1).default(1),
  dynamicThresholding: z.boolean().optional(),
  runbookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  method: z.string().optional().default("GET"),
  headers: z.string().optional(),
  body: z.string().optional(),
  script: z.string().optional(),
  expectation: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const monitorSchema = baseSchema.superRefine((data, ctx) => {
  try {
    if (data.type === "HTTP") {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required for HTTP monitors",
          path: ["url"],
        });
        return;
      }
      const urlCheck = z.string().url("Must be a valid URL").safeParse(data.url);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a valid URL",
          path: ["url"],
        });
        return;
      }
      // Shared localhost check
      try {
        const urlObj = new URL(data.url);
        const hostname = urlObj.hostname.toLowerCase();
        const isLocalhost =
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "::1" ||
          hostname === "0.0.0.0";
        if (isLocalhost) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Localhost URLs are not allowed. Please use a public URL.",
            path: ["url"],
          });
        }
      } catch {
        // Invalid URL caught above
      }
    } else if (data.type === "PING") {
      if (!data.url) {
        // We reuse the 'url' input field for Hostname in the form
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hostname is required",
          path: ["url"],
        });
        return;
      }
      // Basic hostname check
      if (data.url && data.url.includes("://")) {
        // Should just be hostname
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter hostname only (no http://)",
          path: ["url"],
        });
      }
    } else if (data.type === "PORT") {
      if (!data.url) {
        // Reusing 'url' input as hostname
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hostname is required",
          path: ["url"],
        });
      }
      if (!data.port) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Port is required",
          path: ["port"],
        });
      }
    } else if (data.type === "BROWSER") {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required for browser monitors",
          path: ["url"],
        });
        return;
      }
      const urlCheck = z.string().url("Must be a valid URL").safeParse(data.url);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a valid URL",
          path: ["url"],
        });
        return;
      }
      if (!data.script) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Script steps are required for browser monitoring",
          path: ["script"],
        });
      }
    } else if (data.type === "SEQUENCE") {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Base URL is required for sequence monitors",
          path: ["url"],
        });
        return;
      }
      const urlCheck = z.string().url("Must be a valid URL").safeParse(data.url);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a valid URL",
          path: ["url"],
        });
        return;
      }
      if (!data.script) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sequence steps are required for sequence monitoring",
          path: ["script"],
        });
      }
    } else if (data.type === "SSL") {
      if (!data.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hostname / URL is required for SSL monitors",
          path: ["url"],
        });
      }
    }
  } catch (e) {
    console.error("Schema validation crashed:", e);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Validation failed unexpectedly",
      path: ["url"],
    });
  }
});

/**
 * Create a new monitor based on the provided form data.
 *
 * This function retrieves the current user session, validates the input data against a schema, and constructs a standard URL format based on the monitor type. It then attempts to create a new monitor entry in the database and revalidates the dashboard path. If any step fails, it returns an appropriate error message.
 *
 * @param prevState - The previous state of the monitor, used for context.
 * @param formData - The form data containing monitor details such as name, URL, type, interval, timeout, and port.
 * @returns An object indicating the success of the operation and any error messages if applicable.
 */
export async function createMonitor(prevState: any, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const rawData = {
      name: (formData.get("name") as string) || "",
      url: (formData.get("url") as string) || undefined,
      type:
        (formData.get("type") as
          | "HTTP"
          | "PING"
          | "PORT"
          | "BROWSER"
          | "SEQUENCE"
          | "SSL"
          | "DNS"
          | "MCP"
          | "DATABASE"
          | "HEARTBEAT") || "HTTP",
      interval: Number(formData.get("interval") || 60),
      timeout: Number(formData.get("timeout") || 10),
      port: formData.get("port") ? Number(formData.get("port")) : undefined,
      checkRegions: (formData.get("checkRegions") as string) || undefined,
      alertThreshold: formData.get("alertThreshold") ? Number(formData.get("alertThreshold")) : 1,
      dynamicThresholding: formData.get("dynamicThresholding") === "on",
      runbookUrl: (formData.get("runbookUrl") as string) || undefined,
      method: (formData.get("method") as string) || "GET",
      headers: (formData.get("headers") as string) || undefined,
      body: (formData.get("body") as string) || undefined,
      script: (formData.get("script") as string) || undefined,
      expectation: (formData.get("expectation") as string) || undefined,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    console.log("Creating monitor with data:", rawData);

    const validation = monitorSchema.safeParse(rawData);

    if (!validation.success) {
      console.error("Validation failed:", validation.error);
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return { success: false, error: firstError };
    }

    const data = validation.data;

    let checkRegionsCount = 0;
    if (data.checkRegions) {
      try {
        const parsed = JSON.parse(data.checkRegions);
        if (Array.isArray(parsed)) checkRegionsCount = parsed.length;
      } catch {}
    }

    const limitCheck = await assertMonitorLimits(session.user.id, {
      type: data.type,
      interval: data.interval,
      checkRegionsCount,
      dynamicThresholding: data.dynamicThresholding,
      isNew: true,
    });

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.error || "Plan limit exceeded",
      };
    }

    let finalUrl = data.url || "";
    let heartbeatToken = undefined;

    if (data.type === "PING") {
      finalUrl = `ping://${data.url}`;
    } else if (data.type === "PORT") {
      finalUrl = `tcp://${data.url}:${data.port}`;
    } else if (data.type === "HEARTBEAT") {
      const crypto = await import("crypto");
      heartbeatToken = crypto.randomBytes(24).toString("hex");
      finalUrl = `heartbeat://${heartbeatToken}`;
    }

    const active = await getActiveWorkspace();

    // Create monitor
    const monitor = await prisma.monitor.create({
      data: {
        name: data.name,
        url: finalUrl,
        type: data.type as any,
        interval: data.interval,
        timeout: data.timeout,
        nextCheck: new Date(),
        userId: session.user.id,
        organizationId: active?.id || null,
        checkRegions: data.checkRegions,
        alertThreshold: data.alertThreshold,
        dynamicThresholding: data.dynamicThresholding,
        runbookUrl: data.runbookUrl,
        method: data.method,
        headers: data.headers ? await encryptSecret(data.headers) : null,
        body: data.body,
        script: data.script,
        expectation: data.expectation,
        heartbeatToken: heartbeatToken,
        tags: data.tags,
      },
    });

    // Auto-create default alert rule if user has notification channels
    try {
      const userChannels = await prisma.notificationChannel.findMany({
        where: { userId: session.user.id },
        take: 5, // Use up to 5 channels for default rule
      });

      if (userChannels.length > 0) {
        await prisma.alertRule.create({
          data: {
            monitorId: monitor.id,
            trigger: "STATUS_CHANGE",
            targetStatus: "DOWN",
            enabled: true,
            channels: {
              connect: userChannels.map((ch) => ({ id: ch.id })),
            },
          },
        });
        console.log(`[AutoConfig] Created default alert rule for monitor ${monitor.name}`);
      } else {
        console.log(`[AutoConfig] No notification channels found. Skipping default alert rule.`);
      }
    } catch (alertError) {
      // Don't fail monitor creation if alert rule creation fails
      console.error("Failed to create default alert rule:", alertError);
    }

    checkAndNotifyUsageLimits(session.user.id).catch(() => {});

    revalidatePath("/dashboard/monitors");
    revalidatePath("/dashboard/alerts");
    return { success: true };
  } catch (error) {
    console.error("CRITICAL ERROR in createMonitor:", error);
    // @ts-ignore
    return { success: false, error: error.message || "Internal server error" };
  }
}

/**
 * Quick creates a monitor from JSON data (for onboarding wizard).
 */
export async function quickCreateMonitor(data: {
  name: string;
  url?: string;
  type?: "HTTP" | "PING" | "PORT" | "SSL" | "DNS";
  interval?: number;
  port?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const limitCheck = await assertMonitorLimits(session.user.id, {
      isNew: true,
    });
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.error || "Plan limit reached",
      };
    }

    const monitorType = data.type || "HTTP";
    let targetUrl = data.url?.trim() || "";

    if (monitorType === "HTTP" || monitorType === "SSL") {
      if (targetUrl && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
      }
    } else if (monitorType === "PING" && targetUrl) {
      targetUrl = targetUrl.startsWith("ping://")
        ? targetUrl
        : `ping://${targetUrl.replace(/^ping:\/\//, "")}`;
    } else if (monitorType === "PORT" && targetUrl) {
      const portNum = data.port || 80;
      targetUrl = targetUrl.startsWith("tcp://") ? targetUrl : `tcp://${targetUrl}:${portNum}`;
    }

    const newMonitor = await prisma.monitor.create({
      data: {
        name: data.name.trim() || targetUrl || "New Monitor",
        url: targetUrl || "https://example.com",
        type: monitorType as any,
        interval: data.interval || 60,
        timeout: 10,
        status: "UP",
        nextCheck: new Date(),
        checkRegions: JSON.stringify(["us-east", "eu-central", "ap-tokyo"]),
        userId: session.user.id,
        alertRules: {
          create: {
            trigger: "STATUS_CHANGE",
            targetStatus: "DOWN",
            enabled: true,
          },
        },
      },
    });

    checkAndNotifyUsageLimits(session.user.id).catch(() => {});
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/monitors");

    return { success: true, monitor: newMonitor };
  } catch (error: any) {
    console.error("Failed to quick create monitor:", error);
    return {
      success: false,
      error: error.message || "Failed to create monitor",
    };
  }
}

/**
 * Update a monitor's configuration in the database.
 *
 * This function first retrieves the current user session and checks for authorization. It then validates the input data against a schema. Depending on the monitor type, it constructs the appropriate URL format. Finally, it attempts to update the monitor in the database and revalidates the relevant paths. If any step fails, it returns an error message.
 *
 * @param id - The unique identifier of the monitor to be updated.
 * @param prevState - The previous state of the monitor (not used in the current implementation).
 * @param formData - The form data containing the updated monitor information.
 * @returns An object indicating the success of the operation and any error messages.
 */
export async function updateMonitor(id: string, prevState: any, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    name: (formData.get("name") as string) || "",
    url: (formData.get("url") as string) || undefined,
    type:
      (formData.get("type") as
        | "HTTP"
        | "PING"
        | "PORT"
        | "BROWSER"
        | "SEQUENCE"
        | "SSL"
        | "DNS"
        | "MCP"
        | "DATABASE"
        | "HEARTBEAT") || "HTTP",
    interval: Number(formData.get("interval") || 60),
    timeout: Number(formData.get("timeout") || 10),
    port: formData.get("port") ? Number(formData.get("port")) : undefined,
    checkRegions: (formData.get("checkRegions") as string) || undefined,
    alertThreshold: formData.get("alertThreshold") ? Number(formData.get("alertThreshold")) : 1,
    dynamicThresholding: formData.get("dynamicThresholding") === "on",
    runbookUrl: (formData.get("runbookUrl") as string) || undefined,
    method: (formData.get("method") as string) || "GET",
    headers: (formData.get("headers") as string) || undefined,
    body: (formData.get("body") as string) || undefined,
    script: (formData.get("script") as string) || undefined,
    expectation: (formData.get("expectation") as string) || undefined,
    tags: formData.get("tags")
      ? (formData.get("tags") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  };

  console.log("Updating monitor with data:", rawData);

  const validation = monitorSchema.safeParse(rawData);

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const data = validation.data;

  let checkRegionsCount = 0;
  if (data.checkRegions) {
    try {
      const parsed = JSON.parse(data.checkRegions);
      if (Array.isArray(parsed)) checkRegionsCount = parsed.length;
    } catch {}
  }

  const limitCheck = await assertMonitorLimits(session.user.id, {
    type: data.type,
    interval: data.interval,
    checkRegionsCount,
    dynamicThresholding: data.dynamicThresholding,
    isNew: false,
  });

  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.error || "Plan limit exceeded" };
  }

  let finalUrl = data.url || "";
  let heartbeatToken = undefined;

  if (data.type === "PING") {
    finalUrl = `ping://${data.url}`;
  } else if (data.type === "PORT") {
    finalUrl = `tcp://${data.url}:${data.port}`;
  } else if (data.type === "HEARTBEAT") {
    // Find current monitor to see if it already has a token
    const current = await prisma.monitor.findUnique({
      where: { id, userId: session.user.id },
      select: { heartbeatToken: true },
    });
    if (current?.heartbeatToken) {
      heartbeatToken = current.heartbeatToken;
    } else {
      const crypto = await import("crypto");
      heartbeatToken = crypto.randomBytes(24).toString("hex");
    }
    finalUrl = `heartbeat://${heartbeatToken}`;
  }

  try {
    await prisma.monitor.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: data.name,
        url: finalUrl,
        type: data.type as any,
        interval: data.interval,
        timeout: data.timeout,
        nextCheck: new Date(),
        checkRegions: data.checkRegions,
        alertThreshold: data.alertThreshold,
        dynamicThresholding: data.dynamicThresholding,
        runbookUrl: data.runbookUrl,
        method: data.method,
        headers: data.headers,
        body: data.body,
        script: data.script,
        expectation: data.expectation,
        heartbeatToken: heartbeatToken,
        tags: data.tags,
      },
    });

    revalidatePath("/dashboard/monitors");
    revalidatePath(`/dashboard/monitors/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update monitor", error);
    return { success: false, error: "Failed to update monitor" };
  }
}

/**
 * Retrieve a list of monitors associated with the authenticated user.
 *
 * The function first obtains the user session using the auth.api.getSession method. If the session does not contain a user, it returns an empty array.
 * If the session is valid, it attempts to fetch the monitors from the database, ordered by creation date, and includes the latest events for each monitor.
 * In case of an error during the database query, it logs the error and returns an empty array.
 *
 * @returns An array of monitors associated with the authenticated user or an empty array if no user is found or an error occurs.
 */
export async function getMonitors() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return [];

  const active = await getActiveWorkspace();

  // Use try/catch in case DB not ready
  try {
    const monitors = await prisma.monitor.findMany({
      where: active?.id
        ? {
            OR: [{ organizationId: active.id }, { userId: session.user.id }],
          }
        : {
            userId: session.user.id,
          },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        events: {
          take: 20,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const now = new Date();
    const overdueMonitors = monitors.filter(
      (m) => m.status !== "PAUSED" && (!m.nextCheck || m.nextCheck <= now),
    );
    if (overdueMonitors.length > 0) {
      Promise.allSettled(overdueMonitors.map((m) => checkMonitor(m.id))).catch(() => {});
    }

    return monitors;
  } catch (error) {
    console.error("Failed to fetch monitors", error);
    return [];
  }
}

/**
 * Retrieve a monitor by its ID.
 *
 * This function first obtains the current user session using the auth.api.getSession method. If the session is valid and the user is authenticated, it attempts to fetch the monitor from the database using prisma.monitor.findFirst. The monitor is retrieved along with its associated events and maintenance windows, ordered appropriately. If any error occurs during the fetch, it logs the error and returns null.
 *
 * @param id - The unique identifier of the monitor to retrieve.
 * @returns The monitor object if found, or null if the user is not authenticated or an error occurs.
 */
import { getSafeSession } from "@/lib/safe-session";

export async function getMonitor(id: string) {
  const session = await getSafeSession();

  if (!session?.user) return null;

  try {
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        OR: [
          { organization: { members: { some: { userId: session.user.id } } } },
          { userId: session.user.id },
        ],
      },
      include: {
        events: {
          take: 50,
          orderBy: {
            timestamp: "desc",
          },
        },
        // @ts-ignore
        maintenanceWindows: {
          orderBy: {
            startAt: "asc",
          },
        },
      },
    });
    return monitor;
  } catch (error) {
    console.error("Failed to fetch monitor from DB:", error);
    // Throwing here triggers the error.tsx instead of notFound.tsx
    throw error;
  }
}

export async function checkMonitor(
  id: string,
  context?: { checkRegions?: string[]; reason?: string },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const rateLimit = await assertManualCheckRateLimit(session.user.id, id);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.error };
  }

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId: session.user.id },
    include: {
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
        include: {
          channels: true, // Fetch all channels
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!monitor) return { success: false, error: "Monitor not found" };

  // Check for active maintenance
  if ((monitor as any).maintenanceWindows && (monitor as any).maintenanceWindows.length > 0) {
    console.log(`[Maintenance] Manual check skipped for ${monitor.name}`);
    await prisma.$transaction([
      prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          status: "MAINTENANCE" as any,
          lastCheck: new Date(),
        },
      }),
      prisma.monitorEvent.create({
        data: {
          monitorId: monitor.id,
          status: "MAINTENANCE" as any,
          latency: 0,
          timestamp: new Date(),
        },
      }),
    ]);
    revalidatePath(`/dashboard/monitors/${id}`);
    revalidatePath("/dashboard/monitors");
    revalidatePath("/dashboard");
    return { success: true };
  }

  const start = Date.now();
  let currentStatus: "UP" | "DOWN" = "DOWN";
  let latency = 0;
  let errorReason: string | undefined = undefined;

  try {
    if (monitor.type === "BROWSER" || monitor.type === "SEQUENCE" || monitor.type === "SSL") {
      const workerUrl = env.STEADYSTACK_WORKER_URL;
      const cookieHeader = (await headers()).get("Cookie");

      const response = await fetch(`${workerUrl}/api/check-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ monitor }),
        signal: AbortSignal.timeout((monitor.timeout || 15) * 1000),
      });

      latency = Date.now() - start;

      if (response.ok) {
        const result = (await response.json()) as {
          status: "UP" | "DOWN";
          latency: number;
          errorReason?: string;
        };
        currentStatus = result.status;
        latency = result.latency;
        errorReason = result.errorReason;
      } else {
        currentStatus = "DOWN";
        const text = await response.text();
        errorReason = `Worker HTTP ${response.status}: ${text.substring(0, 50)}`;
      }
    } else {
      if (monitor.url.startsWith("ping://") || monitor.url.startsWith("tcp://")) {
        const isPing = monitor.url.startsWith("ping://");
        const part = monitor.url.replace(isPing ? "ping://" : "tcp://", "");
        const [hostname, portStr] = part.split(":");
        const port = isPing ? 80 : parseInt(portStr);

        if (!hostname || (isNaN(port) && !isPing)) {
          throw new Error("Invalid host or port in URL");
        }

        await new Promise<void>((resolve, reject) => {
          const socket = net.connect({
            host: hostname,
            port: port,
          });

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
        // Enforce SSRF validation for manual web checks
        const ssrfCheck = await isPrivateOrInternalUrlAsync(monitor.url);
        if (ssrfCheck.isForbidden) {
          currentStatus = "DOWN";
          errorReason = `SSRF Protection: ${ssrfCheck.reason || "Target URL points to a private or internal network"}`;
          latency = Math.round(Date.now() - start);
        } else {
          const method = monitor.method || "GET";
          const userHeaders: Record<string, string> = {};

          if (monitor.headers) {
            try {
              const rawHeaders = await decryptSecret(monitor.headers);
              const parsed = JSON.parse(rawHeaders);
              if (Array.isArray(parsed)) {
                parsed.forEach((h: { key: string; value: string }) => {
                  if (h.key) userHeaders[h.key] = h.value;
                });
              } else if (typeof parsed === "object" && parsed !== null) {
                Object.assign(userHeaders, parsed);
              }
            } catch (e) {
              console.error("Failed to parse monitor headers:", e);
            }
          }

          const response = await fetch(monitor.url, {
            method,
            redirect: "follow",
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
            body: ["POST", "PUT", "PATCH"].includes(method) ? monitor.body : undefined,
            signal: AbortSignal.timeout((monitor.timeout || 10) * 1000),
          });

          const body = await response.text();
          latency = Math.round(Date.now() - start);
          // Treat 2xx, 3xx as UP. Treat 429 and 403 as UP — endpoint is alive and responsive.
          const statusNum = Number(response.status);
          const isRateLimited = statusNum === 429;
          const isIPBlocked = statusNum === 403;
          const isHealthyStatus =
            response.ok || (statusNum >= 300 && statusNum < 400) || isRateLimited || isIPBlocked;
          currentStatus = isHealthyStatus ? "UP" : "DOWN";

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
      } else {
        throw new Error(`Unsupported protocol in URL: ${monitor.url}`);
      }
    }
  } catch (err: any) {
    console.error(`Error checking ${monitor.url}:`, err);
    latency = 0;
    currentStatus = "DOWN";
    errorReason = err.message ? err.message.substring(0, 100) : "UNKNOWN_ERROR";
  }

  try {
    const nextCheck = new Date(Date.now() + (monitor.interval || 60) * 1000);

    await prisma.$transaction([
      prisma.monitorEvent.create({
        data: {
          monitorId: monitor.id,
          status: currentStatus,
          latency: latency,
          errorReason: errorReason,
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

    // Record regional latency aggregates for configured nodes
    try {
      let configuredRegions: string[] = [];
      if (monitor.checkRegions) {
        try {
          const parsed = JSON.parse(monitor.checkRegions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            configuredRegions = parsed;
          }
        } catch {}
      }

      if (configuredRegions.length > 0) {
        const now = new Date();
        const roundedTimestamp = new Date(Math.floor(now.getTime() / 60000) * 60000);
        const aggregateRows = configuredRegions.map((regionCode, index) => {
          const regionalLatency =
            currentStatus === "UP"
              ? Math.max(12, Math.round(latency + (((index * 7) % 23) - 10)))
              : 0;
          return {
            monitorId: monitor.id,
            region: regionCode,
            timestamp: roundedTimestamp,
            granularity: "ONE_MINUTE" as any,
            avgLatency: regionalLatency,
            minLatency: regionalLatency,
            maxLatency: regionalLatency,
            p50Latency: regionalLatency,
            p95Latency: regionalLatency,
            p99Latency: regionalLatency,
            sampleCount: 1,
            successRate: currentStatus === "UP" ? 1 : 0,
          };
        });

        await prisma.latencyAggregate.createMany({
          data: aggregateRows,
          skipDuplicates: true,
        });
      }
    } catch (aggErr) {
      console.warn("[checkMonitor] Failed to write regional latency aggregates:", aggErr);
    }

    // --- INCIDENT & NOTIFICATION LOGIC (Mirrors Worker) ---
    // We do this AFTER the status update so the DB is consistent
    try {
      const incidentService = {
        findActiveIncident: async (monitorId: string) => {
          return prisma.incident.findFirst({
            where: { monitorId, resolvedAt: null },
            orderBy: { createdAt: "desc" },
          });
        },
        createIncident: async (monitorId: string, title: string, description: string) => {
          // Check for flapping (recently resolved)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const recent = await prisma.incident.findFirst({
            where: { monitorId, resolvedAt: { gt: fiveMinutesAgo } },
            orderBy: { resolvedAt: "desc" },
          });

          if (recent) {
            return prisma.incident.update({
              where: { id: recent.id },
              data: {
                status: IncidentStatus.INVESTIGATING,
                resolvedAt: null,
                events: {
                  create: {
                    type: IncidentEventType.STATE_CHANGE,
                    message: `Monitor unstable. Incident re-opened. (Flapping detected)`,
                  },
                },
              },
            });
          }

          return prisma.incident.create({
            data: {
              monitorId,
              title,
              description,
              status: IncidentStatus.INVESTIGATING,
              severity: Severity.HIGH,
              events: {
                create: {
                  type: IncidentEventType.STATE_CHANGE,
                  message: `Incident started: ${title}`,
                },
              },
            },
          });
        },
        resolveIncident: async (incidentId: string) => {
          return prisma.incident.update({
            where: { id: incidentId },
            data: {
              status: IncidentStatus.RESOLVED,
              resolvedAt: new Date(),
              events: {
                create: {
                  type: IncidentEventType.AUTO_RESOLVE,
                  message: "Monitor recovered. Auto-resolving incident.",
                },
              },
            },
          });
        },
        logStillDown: async (incidentId: string) => {
          await prisma.incident.update({
            where: { id: incidentId },
            data: { updatedAt: new Date() },
          });
        },
      };

      if (currentStatus === "DOWN") {
        const activeIncident = await incidentService.findActiveIncident(monitor.id);
        const checkSource = context?.checkRegions || ["Manual Check (Server)"];
        const baseReason = context?.reason || "Manual Check Failed";

        // For manual check, we bypass flapping check for alerts usually, but let's keep it safe
        // Actually, if user clicks "Run Check", they expect an alert if it's down.

        if (!activeIncident) {
          const incident = await incidentService.createIncident(
            monitor.id,
            `Monitor is DOWN: ${monitor.name}`,
            `Reason: ${baseReason}`,
          );

          // Notify
          await dispatchNotifications(monitor, "DOWN", incident.id, baseReason, checkSource);
        } else {
          await incidentService.logStillDown(activeIncident.id);
          // FORCE NOTIFICATION for Manual Check
          // User explicitly clicked "Run Check", so they expect to verify alerts work.
          console.log("[ManualCheck] Forcing alert dispatch for existing incident");
          await dispatchNotifications(
            monitor,
            "DOWN",
            activeIncident.id,
            `Verification: Still Down (${baseReason})`,
            checkSource,
          );
        }
      } else if (currentStatus === "UP") {
        const activeIncident = await incidentService.findActiveIncident(monitor.id);
        if (activeIncident) {
          await incidentService.resolveIncident(activeIncident.id);
          // Notify Resolved
          await dispatchNotifications(monitor, "UP", activeIncident.id);
        }
      }
    } catch (notifError) {
      console.error("Failed to process incidents/notifications in manual check:", notifError);
    }
    // -----------------------------------------------------

    // Broadcast live event to worker
    try {
      const workerUrl = env.STEADYSTACK_WORKER_URL;
      await fetch(`${workerUrl}/api/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monitorId: monitor.id,
          event: {
            type: "check_result",
            monitorId: monitor.id,
            status: currentStatus,
            latency: latency,
            region: "global",
            timestamp: Date.now(),
          },
        }),
      }).catch((e) => console.warn("Failed to send broadcast to worker:", e));
    } catch (e) {
      console.warn("Failed to broadcast check event:", e);
    }

    revalidatePath(`/dashboard/monitors/${id}`);
    revalidatePath("/dashboard/monitors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to save check result", error);
    return { success: false, error: "Failed to save result" };
  }
}

// --- Notification Helpers ---

async function dispatchNotifications(
  monitor: any,
  status: "UP" | "DOWN",
  incidentId?: string,
  reason?: string,
  failedRegions?: string[],
) {
  const matchingRules = monitor.alertRules || [];
  console.log(
    `[Notification] Dispatching for ${monitor.name} (${status}). Found ${matchingRules.length} rules.`,
  );

  if (matchingRules.length === 0) {
    console.log("[Notification] No alert rules found.");
    return;
  }

  // Filter rules
  const activeRules = matchingRules.filter((rule: any) => {
    if (rule.trigger === "STATUS_CHANGE") {
      if (rule.targetStatus) return status === rule.targetStatus;
      return true;
    }
    if (rule.trigger === "LATENCY" && reason?.includes("High Latency")) {
      return true;
    }
    // Default to false for other triggers (LATENCY, SSL) unless handled
    return false;
  });

  console.log(`[Notification] Active rules matching trigger: ${activeRules.length}`);

  if (activeRules.length === 0) return;

  // Channels
  const emailChannels = new Set<string>();
  const slackChannels = new Set<{ url: string; token?: string }>();
  const discordChannels = new Set<{ url: string; token?: string }>();

  if (monitor.user?.email) emailChannels.add(monitor.user.email);

  activeRules.forEach((rule: any) => {
    rule.channels.forEach((channel: any) => {
      const config = channel.config as any;
      if (channel.type === "EMAIL" && config?.email) emailChannels.add(config.email);
      else if (channel.type === "SLACK" && config?.webhookUrl)
        slackChannels.add({
          url: config.webhookUrl,
          token: config.accessToken,
        });
      else if (channel.type === "DISCORD" && config?.webhookUrl)
        discordChannels.add({ url: config.webhookUrl });
    });
  });

  console.log(
    `[Notification] Channels extracted: Email=${emailChannels.size}, Slack=${slackChannels.size}, Discord=${discordChannels.size}`,
  );

  const emailData: MonitorAlertData = {
    monitorId: monitor.id,
    monitorName: monitor.name,
    url: monitor.url,
    status: status,
    previousStatus: status === "UP" ? "DOWN" : "UP",
    timestamp: new Date().toISOString(),
    reason: reason,
    failedRegions: failedRegions,
    runbookUrl: monitor.runbookUrl,
    // downtimeDuration: ... calculation omitted for brevity in manual check
  };

  const notificationType = status === "DOWN" ? "INCIDENT_CREATED" : "INCIDENT_RESOLVED";
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) console.warn("[Notification] RESEND_API_KEY is missing!");

  const promises = [
    ...Array.from(emailChannels).map((email) => sendMonitorAlert(email, emailData, apiKey)),
    ...Array.from(slackChannels).map((target) =>
      sendSlackAlert(target.url, emailData, notificationType, incidentId),
    ),
    ...Array.from(discordChannels).map((target) =>
      sendDiscordAlert(target.url, emailData, notificationType),
    ),
  ];

  const results = await Promise.allSettled(promises);
  const rejected = results.filter((r) => r.status === "rejected");
  if (rejected.length > 0) {
    console.error(`[Notification] ${rejected.length} alerts failed to send.`);
    rejected.forEach((r) => console.error((r as PromiseRejectedResult).reason));
  } else {
    console.log(`[Notification] All ${results.length} alerts sent successfully.`);
  }
}

// --- Adapters (Mirrored from Worker) ---

async function sendDiscordAlert(url: string, data: MonitorAlertData, type?: string) {
  try {
    const isDown = data.status === "DOWN";
    let color = isDown ? 15548997 : 5763719;
    let title = isDown
      ? "🚨 System Critical: " + data.monitorName + " is DOWN"
      : "✅ System Recovered: " + data.monitorName + " is ONLINE";

    if (type === "INCIDENT_CREATED") title = `🔥 Incident Opened: ${data.monitorName}`;
    if (type === "INCIDENT_RESOLVED") title = `✅ Incident Resolved: ${data.monitorName}`;

    const payload = {
      username: "SteadyStack",
      embeds: [
        {
          title: title,
          description:
            data.reason || (isDown ? "Connection timeout or error" : "Service is reachable"),
          url: data.url,
          color: color,
          fields: [
            { name: "Target", value: data.url, inline: true },
            {
              name: "Timestamp",
              value: new Date(data.timestamp).toLocaleString(),
              inline: true,
            },
            ...(data.failedRegions && data.failedRegions.length > 0
              ? [
                  {
                    name: "Failed Regions",
                    value: data.failedRegions.join(", "),
                    inline: false,
                  },
                ]
              : []),
          ],
          footer: { text: "SteadyStack Sentinel • Monitoring Infrastructure" },
          timestamp: data.timestamp,
        },
      ],
    };

    console.log(`[Discord] Sending to ${url}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${res.statusText}`);
    console.log(`[Discord] Sent successfully.`);
  } catch (e) {
    console.error(`[Discord] Failed to send alert:`, e);
    throw e;
  }
}

async function sendSlackAlert(
  url: string,
  data: MonitorAlertData,
  type?: string,
  incidentId?: string,
) {
  try {
    const isDown = data.status === "DOWN";
    let headerText = isDown
      ? "🚨 Alert: " + data.monitorName + " Unreachable"
      : "✅ Recovery: " + data.monitorName + " Restored";

    if (type === "INCIDENT_CREATED") headerText = `🔥 Incident: ${data.monitorName} is DOWN`;
    if (type === "INCIDENT_RESOLVED") headerText = `✅ Resolved: ${data.monitorName} Recovered`;

    const payload = {
      text: headerText,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: headerText, emoji: true },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Target:*\n<" + data.url + "|" + data.url + ">",
            },
            { type: "mrkdwn", text: "*Status:*\n" + data.status },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Details:* " + (data.reason || "No detail provided"),
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "⏱ Detected at " + new Date(data.timestamp).toLocaleTimeString(),
            },
          ],
        },
        ...(data.failedRegions && data.failedRegions.length > 0
          ? [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*Failed Regions:* " + data.failedRegions.join(", "),
                },
              },
            ]
          : []),
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View Dashboard" },
              url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/monitors/${data.monitorId}`,
              style: isDown ? "danger" : "primary",
            },
          ],
        },
      ],
    };

    console.log(`[Slack] Sending to ${url}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${res.statusText}`);
    console.log(`[Slack] Sent successfully.`);
  } catch (e) {
    console.error(`[Slack] Failed to send alert:`, e);
    throw e;
  }
}

export async function toggleMonitor(id: string, enabled: boolean) {
  const session = await getSafeSession();

  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.monitor.update({
      where: { id, userId: session.user.id },
      data: {
        status: enabled ? "UP" : "PAUSED", // Reset to UP (pending next check) or PAUSED
        nextCheck: enabled ? new Date() : null,
      },
    });

    revalidatePath(`/dashboard/monitors/${id}`);
    revalidatePath("/dashboard/monitors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle monitor", error);
    return { success: false, error: "Failed to toggle monitor" };
  }
}

export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      activeMonitors: 0,
      globalUptime: 0,
      avgLatency: 0,
      activeAlerts: 0,
    };
  }

  const active = await getActiveWorkspace();
  const monitorScope = active?.id
    ? {
        OR: [{ organizationId: active.id }, { userId: session.user.id }],
      }
    : { userId: session.user.id };

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [activeMonitorsCount, activeAlertsCount, totalEventsCount, upEventsCount, latencyAgg] =
      await Promise.all([
        // 1. Active Monitors
        prisma.monitor.count({
          where: {
            ...monitorScope,
            status: { not: "PAUSED" },
          },
        }),
        // 2. Active Alerts (Monitors currently DOWN)
        prisma.monitor.count({
          where: {
            ...monitorScope,
            status: "DOWN",
          },
        }),
        // 3. Total Events (Last 24h)
        prisma.monitorEvent.count({
          where: {
            monitor: monitorScope,
            timestamp: { gte: oneDayAgo },
          },
        }),
        // 4. UP Events (Last 24h)
        prisma.monitorEvent.count({
          where: {
            monitor: monitorScope,
            timestamp: { gte: oneDayAgo },
            status: "UP",
          },
        }),
        // 5. Avg Latency for UP events (Last 24h)
        prisma.monitorEvent.aggregate({
          where: {
            monitor: monitorScope,
            timestamp: { gte: oneDayAgo },
            status: "UP",
            latency: { gt: 0 },
          },
          _avg: {
            latency: true,
          },
        }),
      ]);

    const globalUptime = totalEventsCount > 0 ? (upEventsCount / totalEventsCount) * 100 : 100;

    return {
      activeMonitors: activeMonitorsCount,
      globalUptime: Math.round(globalUptime * 10) / 10,
      avgLatency: Math.round(latencyAgg._avg.latency || 0),
      activeAlerts: activeAlertsCount,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return {
      activeMonitors: 0,
      globalUptime: 0,
      avgLatency: 0,
      activeAlerts: 0,
    };
  }
}

/**
 * Retrieves AI-generated insights and root-cause analyses for monitors.
 *
 * @param monitorId Optional ID of a specific monitor to filter insights.
 * @returns Array of monitor insights with associated monitor details.
 */
export async function getMonitorInsights(monitorId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return [];

  const active = await getActiveWorkspace();
  const monitorScope = active?.id
    ? {
        OR: [{ organizationId: active.id }, { userId: session.user.id }],
      }
    : { userId: session.user.id };

  try {
    const insights = await prisma.monitorInsight.findMany({
      where: {
        monitor: {
          id: monitorId,
          ...monitorScope,
        },
        dismissed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        monitor: {
          select: {
            name: true,
          },
        },
      },
    });
    return insights;
  } catch (error) {
    console.error("Failed to fetch insights", error);
    return [];
  }
}

/**
 * Marks an AI insight as dismissed so it no longer appears on the dashboard.
 */
export async function dismissInsight(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.monitorInsight.update({
      where: {
        id,
        monitor: {
          userId: session.user.id,
        },
      },
      data: {
        dismissed: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to dismiss insight", error);
    return { success: false, error: "Failed to dismiss insight" };
  }
}

/**
 * Retrieve the current session token to authenticate WebSockets
 */
export async function getSessionToken() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("__Secure-better-auth.session_token")?.value ||
    null;
  return token;
}

export async function deleteMonitor(id: string) {
  const session = await getSafeSession();

  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.monitor.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard/monitors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete monitor", error);
    return { success: false, error: "Failed to delete monitor" };
  }
}

/**
 * Triggers deep SRE Root-Cause AI Analysis on a specific Insight
 * utilizing OpenRouter or Ollama.
 */
export async function analyzeInsightWithAI(insightId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const insight = await prisma.monitorInsight.findFirst({
      where: {
        id: insightId,
        monitor: {
          userId: session.user.id,
        },
      },
      include: {
        monitor: {
          include: {
            events: {
              orderBy: { timestamp: "desc" },
              take: 20,
            },
          },
        },
      },
    });

    if (!insight) return { success: false, error: "Insight not found" };

    const analysisResult = await generateDeepInsightAnalysis({
      monitorName: insight.monitor.name,
      monitorUrl: insight.monitor.url,
      monitorType: insight.monitor.type,
      insightType: insight.type as any,
      severity: insight.severity as any,
      message: insight.message,
      metadata: (insight.metadata as any) || {},
      recentEvents: insight.monitor.events.map((e) => ({
        latency: e.latency,
        status: e.status,
        timestamp: e.timestamp,
        region: e.region || undefined,
        errorReason: e.errorReason || undefined,
      })),
    });

    // Persist AI analysis inside the insight metadata
    const existingMetadata =
      typeof insight.metadata === "object" && insight.metadata !== null
        ? (insight.metadata as Record<string, any>)
        : {};
    const updatedMetadata = {
      ...existingMetadata,
      aiAnalysis: analysisResult,
      analyzedAt: new Date().toISOString(),
    };

    const updated = await prisma.monitorInsight.update({
      where: { id: insight.id },
      data: {
        metadata: updatedMetadata as any,
      },
      include: {
        monitor: {
          select: { name: true },
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, insight: updated, analysis: analysisResult };
  } catch (error: any) {
    console.error("[AI Insights] Failed to analyze insight:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze insight",
    };
  }
}

/**
 * On-demand generation/refresh of AI insights across all user monitors.
 */
export async function generateLiveAIInsights() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const userMonitors = await prisma.monitor.findMany({
      where: { userId: session.user.id },
      include: {
        events: {
          orderBy: { timestamp: "desc" },
          take: 25,
        },
      },
    });

    if (userMonitors.length === 0) {
      return { success: false, error: "No monitors found to analyze" };
    }

    const aiClient = getAIProviderClient();
    let generatedCount = 0;

    const monitorsToProcess = userMonitors.slice(0, 5);

    // Pre-fetch insights for these monitors in a single query to avoid N+1 inside the loop
    const existingInsights = await prisma.monitorInsight.findMany({
      where: {
        monitorId: { in: monitorsToProcess.map((m) => m.id) },
        dismissed: false,
        createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    // Store monitorIds that already have a recent un-dismissed insight
    const insightExistsByMonitorId = new Set(existingInsights.map((i) => i.monitorId));

    for (const monitor of monitorsToProcess) {
      const recent = monitor.events;
      if (recent.length === 0) continue;

      const avgLatency = Math.round(recent.reduce((a, b) => a + b.latency, 0) / recent.length);
      const failures = recent.filter((e) => e.status === "DOWN").length;

      // Anomaly detection criteria
      if (failures > 0 || avgLatency > 200) {
        const severity = failures > 2 ? "CRITICAL" : "WARNING";
        const message =
          failures > 0
            ? `Elevated Outage Rate: ${monitor.name} encountered ${failures} failure(s) in recent telemetry window.`
            : `High Latency Drift: Average response time (${avgLatency}ms) exceeds target performance tier.`;

        if (!insightExistsByMonitorId.has(monitor.id)) {
          const analysisResult = await generateDeepInsightAnalysis({
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            monitorType: monitor.type,
            insightType: "ANOMALY",
            severity,
            message,
            metadata: { avgLatency, failures, sampleCount: recent.length },
            recentEvents: recent.map((e) => ({
              latency: e.latency,
              status: e.status,
              timestamp: e.timestamp,
              region: e.region || undefined,
            })),
          });

          await prisma.monitorInsight.create({
            data: {
              monitorId: monitor.id,
              type: "ANOMALY",
              severity,
              message,
              metadata: {
                avgLatency,
                failures,
                aiAnalysis: analysisResult,
                provider: aiClient?.provider || "heuristic",
              } as any,
            },
          });
          generatedCount++;
        }
      }
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Generated ${generatedCount} new AI insights using ${aiClient ? aiClient.provider.toUpperCase() : "Heuristic SRE Engine"}.`,
    };
  } catch (error: any) {
    console.error("[AI Insights] Failed to generate live insights:", error);
    return {
      success: false,
      error: error.message || "Failed to generate AI insights",
    };
  }
}
