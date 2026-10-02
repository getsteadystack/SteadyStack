import type { MonitorAlertData } from "@steadystack/email";
import { NotificationType, type NotificationTypeValue } from "../../constants";

export interface OpsgenieConfig {
  apiKey: string;
  region?: "us" | "eu";
}

function getBaseUrl(region?: "us" | "eu"): string {
  return region === "eu" ? "https://api.eu.opsgenie.com/v2" : "https://api.opsgenie.com/v2";
}

function dedupAlias(monitorId: string): string {
  return `steadystack-${monitorId}`;
}

function mapPriority(type?: NotificationTypeValue | string): "P1" | "P2" | "P3" | "P4" | "P5" {
  if (type === NotificationType.INCIDENT_CREATED) {
    return "P1";
  }
  if (type === NotificationType.HIGH_LATENCY) {
    return "P3";
  }
  if (type === NotificationType.SSL_EXPIRY) {
    return "P3";
  }
  return "P2";
}

/**
 * Posts or resolves alerts via Atlassian Opsgenie Alert API v2.
 * Supports US and EU regions, auto-deduplication via aliases, and auto-closing on recovery.
 */
export async function sendOpsgenieAlert(
  config: OpsgenieConfig | string,
  data: MonitorAlertData,
  type?: NotificationTypeValue | string,
  incidentId?: string,
): Promise<void> {
  const parsedConfig: OpsgenieConfig =
    typeof config === "string" ? { apiKey: config, region: "us" } : config;

  if (!parsedConfig.apiKey) {
    throw new Error("[Opsgenie] API key is missing");
  }

  const baseUrl = getBaseUrl(parsedConfig.region);
  const alias = dedupAlias(data.monitorId);
  const isResolved = data.status === "UP" || type === NotificationType.INCIDENT_RESOLVED;

  if (isResolved) {
    // Close existing alert using alias
    const closeUrl = `${baseUrl}/alerts/${encodeURIComponent(alias)}/close?identifierType=alias`;
    const res = await fetch(closeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `GenieKey ${parsedConfig.apiKey}`,
      },
      body: JSON.stringify({
        user: "Edge Monitor",
        source: "Edge Monitor",
        note: `Resolved: ${data.monitorName} recovered at ${data.timestamp}. ${data.downtimeDuration ? `Downtime: ${data.downtimeDuration}` : ""}`,
      }),
    });

    // 404 means the alert was already closed or does not exist — treat as success
    if (!res.ok && res.status !== 404) {
      const errText = await res.text();
      throw new Error(`[Opsgenie] Close alert failed (${res.status}): ${errText}`);
    }
    return;
  }

  // Trigger alert
  let message = `[ALERT] ${data.monitorName} is DOWN`;
  if (type === NotificationType.HIGH_LATENCY) {
    message = `[WARNING] High Latency: ${data.monitorName}`;
  } else if (type === NotificationType.SSL_EXPIRY) {
    message = `[WARNING] SSL Expiry: ${data.monitorName}`;
  }

  const payload = {
    message,
    alias,
    description: `Target: ${data.url}\nReason: ${data.reason || "Health check failed"}\nRegions Failed: ${(data.failedRegions || []).join(", ") || "Global"}`,
    priority: mapPriority(type),
    source: "Edge Monitor",
    details: {
      monitorId: data.monitorId,
      url: data.url,
      incidentId: incidentId || "none",
      failedRegions: (data.failedRegions || []).join(", "),
      runbookUrl: data.runbookUrl || "none",
    },
  };

  const createUrl = `${baseUrl}/alerts`;
  const res = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `GenieKey ${parsedConfig.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  // 202 Accepted is standard Opsgenie response
  if (!res.ok && res.status !== 202) {
    const errText = await res.text();
    throw new Error(`[Opsgenie] Create alert failed (${res.status}): ${errText}`);
  }
}
