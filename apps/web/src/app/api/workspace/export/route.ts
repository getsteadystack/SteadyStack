import { NextRequest, NextResponse } from "next/server";
import { auth } from "@steadystack/auth";
import prisma from "@steadystack/db";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";

    // Fetch all user configuration models
    const monitors = await prisma.monitor.findMany({
      where: { userId },
      include: {
        alertRules: true,
      },
    });

    const statusPages = await prisma.statusPage.findMany({
      where: { userId },
      include: {
        monitors: true,
      },
    });

    const incidentTemplates = await prisma.incidentTemplate.findMany({
      where: { createdById: userId },
    });

    // Helper to extract host/port from url
    const parseUrlTarget = (urlStr: string) => {
      let host = urlStr || "";
      let port = 80;
      try {
        if (urlStr.includes("://")) {
          const urlObj = new URL(urlStr);
          host = urlObj.hostname;
          port = urlObj.port ? parseInt(urlObj.port) : urlObj.protocol === "https:" ? 443 : 80;
        } else if (urlStr.includes(":")) {
          const parts = urlStr.split(":");
          host = parts[0];
          port = parseInt(parts[1]) || 80;
        }
      } catch {}
      return { host, port };
    };

    // 1. Full SteadyStack Backup
    if (format === "json") {
      const backup = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        workspaceId: userId,
        monitors: monitors.map((m) => {
          const target = parseUrlTarget(m.url);
          return {
            name: m.name,
            type: m.type,
            url: m.url,
            host: target.host,
            port: target.port,
            interval: m.interval,
            method: m.method,
            headers: m.headers,
            body: m.body,
            expectation: m.expectation,
            alertRules: m.alertRules.map((r) => ({
              trigger: r.trigger,
              threshold: r.threshold,
              comparison: r.comparison,
              targetStatus: r.targetStatus,
              enabled: r.enabled,
            })),
          };
        }),
        statusPages: statusPages.map((s) => ({
          slug: s.slug,
          title: s.title,
          description: s.description,
          logo: s.logo,
          theme: s.theme,
          isPrivate: s.isPrivate,
          ipWhitelist: s.ipWhitelist,
          monitors: s.monitors.map((sm) => sm.monitorId),
        })),
        incidentTemplates: incidentTemplates.map((t) => ({
          name: t.name,
          title: t.title,
          status: t.status,
          severity: t.severity,
          description: t.description,
        })),
      };

      return new NextResponse(JSON.stringify(backup, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="steadystack-workspace-export.json"`,
        },
      });
    }

    // 2. OpenStatus Compat Format
    if (format === "openstatus") {
      const openStatusExport = monitors.map((m) => {
        let headersObj = {};
        if (m.headers) {
          try {
            headersObj = typeof m.headers === "string" ? JSON.parse(m.headers) : m.headers;
          } catch {}
        }
        const target = parseUrlTarget(m.url);
        return {
          name: m.name,
          active: m.status !== "PAUSED",
          public: true,
          type: m.type === "PING" ? "tcp" : "http",
          url: m.url || target.host,
          interval: m.interval || 60,
          headers: headersObj,
          method: m.method || "GET",
          assertions: [
            {
              type: "status",
              comparison: "less_than",
              value: "400",
            },
          ],
        };
      });

      return new NextResponse(JSON.stringify(openStatusExport, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="openstatus-import-config.json"`,
        },
      });
    }

    // 3. Uptime Kuma Format
    if (format === "uptime-kuma") {
      const kumaExport = {
        vcrdVersion: "1.0.0",
        monitors: monitors.map((m, idx) => {
          let headersObj = undefined;
          if (m.headers) {
            try {
              headersObj = typeof m.headers === "string" ? JSON.parse(m.headers) : m.headers;
            } catch {}
          }
          const target = parseUrlTarget(m.url);
          return {
            id: idx + 1,
            name: m.name,
            type: m.type === "PING" ? "ping" : m.type === "PORT" ? "port" : "http",
            url: m.url || "",
            hostname: target.host,
            port: target.port,
            interval: m.interval || 60,
            retryInterval: 60,
            maxRetries: 3,
            method: m.method || "GET",
            headers: headersObj,
            body: m.body || undefined,
            active: m.status !== "PAUSED" ? 1 : 0,
          };
        }),
      };

      return new NextResponse(JSON.stringify(kumaExport, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="uptime-kuma-import.json"`,
        },
      });
    }

    // 4. Prometheus Config Format (YAML)
    if (format === "prometheus") {
      const httpTargets = monitors.filter((m) => m.type === "HTTP" && m.url).map((m) => m.url);
      const tcpTargets = monitors
        .filter((m) => m.type === "PORT" || m.type === "PING")
        .map((m) => {
          const target = parseUrlTarget(m.url);
          return `${target.host}:${target.port}`;
        });

      const prometheusYaml = `# Prometheus Scrape Configuration for SteadyStack Migrated Monitors
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
${httpTargets.map((t) => `        - '${t}'`).join("\n")}
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 127.0.0.1:9115 # Target Blackbox Exporter

  - job_name: 'blackbox-tcp'
    metrics_path: /probe
    params:
      module: [tcp_connect]
    static_configs:
      - targets:
${tcpTargets.map((t) => `        - '${t}'`).join("\n")}
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 127.0.0.1:9115 # Target Blackbox Exporter
`;

      return new NextResponse(prometheusYaml, {
        headers: {
          "Content-Type": "text/yaml",
          "Content-Disposition": `attachment; filename="prometheus-blackbox.yml"`,
        },
      });
    }

    return new NextResponse("Invalid format", { status: 400 });
  } catch (error) {
    console.error("Workspace export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
