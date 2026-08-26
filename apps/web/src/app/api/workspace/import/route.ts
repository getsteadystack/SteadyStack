import { NextRequest, NextResponse } from "next/server";
import { auth } from "@steadystack/auth";
import prisma from "@steadystack/db";
import { encryptSecret } from "@steadystack/core";
import { headers } from "next/headers";
import { assertMonitorLimits } from "@/lib/billing-server";
import { getPlanLimits } from "@/lib/billing";
import type { MonitorType } from "@steadystack/db";

interface ParsedMonitor {
  name: string;
  url: string;
  type: MonitorType;
  interval: number;
  timeout: number;
  method: string;
  headers?: string | null;
  body?: string | null;
  expectation?: string | null;
  alertThreshold: number;
  tags: string[];
}

function parseUptimeKumaFormat(data: any): ParsedMonitor[] {
  const rawList: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.monitorList)
      ? data.monitorList
      : Array.isArray(data.monitors)
        ? data.monitors
        : [];

  return rawList.map((m: any): ParsedMonitor => {
    const rawType = (m.type || "http").toLowerCase();
    let type: MonitorType = "HTTP";
    let url = m.url || "";
    const method = (m.method || "GET").toUpperCase();
    const interval = Math.max(30, Number(m.interval) || 60);
    const timeout = Math.min(60, Math.max(2, Number(m.timeout) || 10));
    const alertThreshold = Math.max(1, Number(m.maxretries) || 1);

    switch (rawType) {
      case "http":
      case "keyword":
      case "json-query":
        type = "HTTP";
        break;
      case "port":
        type = "PORT";
        if (!url && m.hostname) {
          url = m.port ? `${m.hostname}:${m.port}` : m.hostname;
        }
        break;
      case "ping":
        type = "PING";
        if (!url && m.hostname) {
          url = m.hostname;
        }
        break;
      case "dns":
        type = "DNS";
        if (!url && m.hostname) {
          url = m.hostname;
        }
        break;
      case "push":
        type = "HEARTBEAT";
        if (!url) {
          url = `heartbeat://${m.name ? encodeURIComponent(m.name.toLowerCase().replace(/\s+/g, "-")) : "push-target"}`;
        }
        break;
      case "real-browser":
      case "chrome":
        type = "BROWSER";
        break;
      case "steam":
      case "gamedig":
      case "mqtt":
      case "docker":
        type = "PORT";
        if (!url && m.hostname) {
          url = m.port ? `${m.hostname}:${m.port}` : m.hostname;
        }
        break;
      case "postgres":
      case "mysql":
      case "redis":
      case "mongodb":
      case "sqlserver":
        type = "DATABASE";
        url =
          m.databaseConnectionString ||
          url ||
          (m.hostname ? `${m.hostname}:${m.port || 5432}` : "");
        break;
      default:
        type = "HTTP";
        break;
    }

    let customHeaders: string | null = null;
    if (m.headers) {
      if (typeof m.headers === "string") {
        try {
          // validate json
          JSON.parse(m.headers);
          customHeaders = m.headers;
        } catch {
          customHeaders = null;
        }
      } else if (typeof m.headers === "object") {
        customHeaders = JSON.stringify(m.headers);
      }
    }

    const expectationObj: Record<string, unknown> = {};
    if (m.keyword) {
      expectationObj.keyword = m.keyword;
    }
    if (m.accepted_statuscodes && Array.isArray(m.accepted_statuscodes)) {
      expectationObj.statusCode = m.accepted_statuscodes;
    }

    const tags: string[] = ["imported", "uptime-kuma"];
    if (Array.isArray(m.tags)) {
      for (const t of m.tags) {
        if (typeof t === "string" && t.trim()) {
          tags.push(t.trim());
        } else if (t && typeof t.name === "string" && t.name.trim()) {
          tags.push(t.name.trim());
        }
      }
    }

    return {
      name: m.name || url || "Imported Monitor",
      url: url || "https://example.com",
      type,
      interval,
      timeout,
      method,
      headers: customHeaders,
      body: m.body || null,
      expectation: Object.keys(expectationObj).length > 0 ? JSON.stringify(expectationObj) : null,
      alertThreshold,
      tags: Array.from(new Set(tags)),
    };
  });
}

function parseSteadyStackFormat(data: any): ParsedMonitor[] {
  const list = Array.isArray(data.monitors) ? data.monitors : [];
  return list.map((m: any): ParsedMonitor => {
    return {
      name: m.name || "Imported Monitor",
      url: m.url || (m.host ? `${m.host}:${m.port || 80}` : "https://example.com"),
      type: (m.type as MonitorType) || "HTTP",
      interval: Math.max(30, Number(m.interval) || 60),
      timeout: Math.min(60, Math.max(2, Number(m.timeout) || 10)),
      method: (m.method || "GET").toUpperCase(),
      headers:
        typeof m.headers === "string" ? m.headers : m.headers ? JSON.stringify(m.headers) : null,
      body: m.body || null,
      expectation:
        typeof m.expectation === "string"
          ? m.expectation
          : m.expectation
            ? JSON.stringify(m.expectation)
            : null,
      alertThreshold: 1,
      tags: ["imported", "steadystack-backup"],
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let payload: any;
    let format = req.nextUrl.searchParams.get("format") || "auto";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const text = await file.text();
      try {
        payload = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "Invalid JSON file uploaded" }, { status: 400 });
      }
    } else {
      payload = await req.json();
    }

    // Auto-detect format
    if (format === "auto") {
      if (payload?.vcrdVersion || payload?.monitorList || payload?.notificationList) {
        format = "uptime-kuma";
      } else if (
        payload?.version === "1.0" &&
        payload?.workspaceId &&
        Array.isArray(payload?.monitors)
      ) {
        format = "steadystack";
      } else if (Array.isArray(payload) && payload.length > 0 && "type" in payload[0]) {
        format = "uptime-kuma";
      } else if (Array.isArray(payload?.monitors)) {
        format = "uptime-kuma";
      } else {
        format = "uptime-kuma";
      }
    }

    let parsedMonitors: ParsedMonitor[] = [];
    if (format === "uptime-kuma") {
      parsedMonitors = parseUptimeKumaFormat(payload);
    } else if (format === "steadystack") {
      parsedMonitors = parseSteadyStackFormat(payload);
    } else {
      parsedMonitors = parseUptimeKumaFormat(payload);
    }

    if (parsedMonitors.length === 0) {
      return NextResponse.json(
        { error: "No valid monitors found in the provided configuration." },
        { status: 400 },
      );
    }

    // Fetch existing monitors for conflict resolution
    const existingMonitors = await prisma.monitor.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const existingByName = new Map(
      existingMonitors.map((m) => [m.name.toLowerCase().trim(), m.id]),
    );

    const toCreateCount = parsedMonitors.filter(
      (m) => !existingByName.has(m.name.toLowerCase().trim()),
    ).length;

    // Check user plan limits for the full batch
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    const limits = getPlanLimits((user?.tier as any) || "INITIATE");
    if (existingMonitors.length + toCreateCount > limits.maxMonitors) {
      return NextResponse.json(
        {
          error: `Importing ${toCreateCount} new monitors would exceed your plan limit of ${limits.maxMonitors} (currently active: ${existingMonitors.length}). Please upgrade to import more monitors.`,
        },
        { status: 403 },
      );
    }

    const dryRun = req.nextUrl.searchParams.get("dryRun") === "true";
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        format,
        total: parsedMonitors.length,
        monitors: parsedMonitors.map((m) => ({
          name: m.name,
          url: m.url,
          type: m.type,
          interval: m.interval,
          tags: m.tags,
          action: existingByName.has(m.name.toLowerCase().trim()) ? "update" : "create",
        })),
      });
    }

    const monitorPromises = parsedMonitors.map(async (m) => {
      const existingId = existingByName.get(m.name.toLowerCase().trim());
      const encryptedHeaders = m.headers ? await encryptSecret(m.headers) : null;

      if (existingId) {
        const updated = await prisma.monitor.update({
          where: { id: existingId },
          data: {
            name: m.name,
            url: m.url,
            type: m.type,
            interval: m.interval,
            timeout: m.timeout,
            method: m.method,
            headers: encryptedHeaders,
            body: m.body,
            expectation: m.expectation,
            alertThreshold: m.alertThreshold,
            tags: m.tags,
          },
        });
        return {
          id: updated.id,
          name: updated.name,
          action: "updated",
        };
      } else {
        const created = await prisma.monitor.create({
          data: {
            userId,
            name: m.name,
            url: m.url,
            type: m.type,
            interval: m.interval,
            timeout: m.timeout,
            method: m.method,
            headers: encryptedHeaders,
            body: m.body,
            expectation: m.expectation,
            alertThreshold: m.alertThreshold,
            tags: m.tags,
            alertRules: {
              create: {
                trigger: "STATUS_CHANGE",
                targetStatus: "DOWN",
                enabled: true,
              },
            },
          },
        });
        return {
          id: created.id,
          name: created.name,
          action: "created",
        };
      }
    });

    const resultMonitors = await Promise.all(monitorPromises);

    let createdCount = 0;
    let updatedCount = 0;

    for (const res of resultMonitors) {
      if (res.action === "created") {
        createdCount++;
      } else if (res.action === "updated") {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      format,
      total: parsedMonitors.length,
      created: createdCount,
      updated: updatedCount,
      monitors: resultMonitors,
    });
  } catch (error: any) {
    console.error("Workspace import error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during import" },
      { status: 500 },
    );
  }
}
