"use server";

import prisma, { MonitorType } from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTemplateById } from "@steadystack/shared/stack-templates";
import { getActiveWorkspace } from "@/actions/team";

export type ApplyTemplateResult = {
  success: boolean;
  created: { name: string; id: string }[];
  errors: { name: string; reason: string }[];
};

export async function applyTemplate(
  templateId: string,
  urlMapping: Record<string, string>,
): Promise<ApplyTemplateResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const active = await getActiveWorkspace();
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  const userId = session.user.id;
  const user = session.user;
  const tier = (user.tier ?? "INITIATE") as "INITIATE" | "NETRUNNER" | "CONSTRUCT";

  const tierLimits: Record<string, { maxMonitors: number; minInterval: number }> = {
    INITIATE: { maxMonitors: 50, minInterval: 60 },
    NETRUNNER: { maxMonitors: 200, minInterval: 30 },
    CONSTRUCT: { maxMonitors: 9999, minInterval: 10 },
  };

  const limits = tierLimits[tier] ?? tierLimits.INITIATE;

  const existingCount = await prisma.monitor.count({ where: { userId } });
  const remainingSlots = limits.maxMonitors - existingCount;

  if (remainingSlots <= 0) {
    return {
      success: false,
      created: [],
      errors: [
        {
          name: template.name,
          reason: `Monitor limit reached (${limits.maxMonitors}). Upgrade your plan to create more.`,
        },
      ],
    };
  }

  const created: { name: string; id: string }[] = [];
  const errors: { name: string; reason: string }[] = [];

  const allowedTypes: Record<string, string[]> = {
    INITIATE: ["HTTP", "SSL", "DNS", "HEARTBEAT"],
    NETRUNNER: [
      "HTTP",
      "PING",
      "PORT",
      "SEQUENCE",
      "SSL",
      "DNS",
      "HEARTBEAT",
      "MCP",
      "DATABASE",
      "GRPC",
      "SMTP",
      "FTP",
      "ICMP",
      "MAIL",
    ],
    CONSTRUCT: [
      "HTTP",
      "PING",
      "PORT",
      "BROWSER",
      "SEQUENCE",
      "SSL",
      "DNS",
      "HEARTBEAT",
      "MCP",
      "GRAPHQL",
      "WEBSOCKET",
      "DATABASE",
      "BGP",
      "GRPC",
      "SMTP",
      "FTP",
      "ICMP",
      "MAIL",
    ],
  };

  const userAllowedTypes = allowedTypes[tier] ?? allowedTypes.INITIATE;

  const monitorsToCreate = template.monitors.slice(0, remainingSlots);

  for (const preset of monitorsToCreate) {
    try {
      if (!userAllowedTypes.includes(preset.type)) {
        errors.push({
          name: preset.name,
          reason: `Monitor type "${preset.type}" is not available on your ${tier} plan. Upgrade to unlock.`,
        });
        continue;
      }

      const interval = Math.max(preset.interval ?? 60, limits.minInterval);
      let url = preset.url;

      if (urlMapping[preset.name]) {
        url = urlMapping[preset.name];
      }

      url = url.replace(/\/$/, "");

      const monitorData: Record<string, unknown> = {
        name: preset.name,
        type: preset.type,
        url,
        interval,
        method: preset.method ?? "GET",
        expectation: preset.expectation ?? undefined,
        body: preset.body ?? undefined,
      };

      if (preset.type === "PORT" && preset.port) {
        monitorData.url = `tcp://${url}:${preset.port}`;
      }

      if (preset.type === "HEARTBEAT") {
        const crypto = await import("node:crypto");
        const token = crypto.randomBytes(24).toString("hex");
        monitorData.url = `heartbeat://${token}`;
        monitorData.heartbeatToken = token;
      }

      if (preset.headers && preset.headers.length > 0) {
        monitorData.headers = JSON.stringify(preset.headers);
      }

      const monitor = await prisma.monitor.create({
        data: {
          name: monitorData.name as string,
          type: monitorData.type as MonitorType,
          url: monitorData.url as string,
          interval: monitorData.interval as number,
          method: (monitorData.method as string) ?? "GET",
          headers: monitorData.headers as string | undefined,
          body: monitorData.body as string | undefined,
          expectation: monitorData.expectation as string | undefined,
          userId,
          organizationId: active?.id,
          checkRegions: JSON.stringify(["us-east"]),
        },
      });

      created.push({ name: preset.name, id: monitor.id });
    } catch (error) {
      errors.push({
        name: preset.name,
        reason: error instanceof Error ? error.message : "Unknown error creating monitor",
      });
    }
  }

  revalidatePath("/dashboard/monitors");

  return {
    success: errors.length === 0,
    created,
    errors,
  };
}
