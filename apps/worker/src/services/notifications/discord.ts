import type { MonitorAlertData } from "@steadystack/email";
import { NotificationType, type NotificationTypeValue } from "../../constants";

// Embed color constants (Discord uses decimal RGB values)
const COLOR_RED = 15548997; // #ED4245
const COLOR_GREEN = 5763719; // #57F287
const COLOR_ORANGE = 16753920; // #FFA500

/**
 * Sends an alert to a Discord channel via webhook.
 *
 * Builds an embed that reflects the monitor status and alert type (incident
 * created/resolved, high latency, SSL expiry) and POSTs it to the webhook URL.
 *
 * @param url - The Discord webhook URL to send the alert to.
 * @param data - The data containing monitor alert information.
 * @param type - Optional type of alert (e.g., "INCIDENT_CREATED", "INCIDENT_RESOLVED", "HIGH_LATENCY").
 * @throws Error If the Discord webhook request fails.
 */
export async function sendDiscordAlert(
  url: string,
  data: MonitorAlertData,
  type?: NotificationTypeValue | string,
) {
  const isDown = data.status === "DOWN";
  const isDegraded = data.status === "DEGRADED";
  let color = isDown ? COLOR_RED : isDegraded ? COLOR_ORANGE : COLOR_GREEN;

  let title = isDown
    ? "🚨 System Critical: " + data.monitorName + " is DOWN"
    : isDegraded
      ? "🟡 System Degraded: " + data.monitorName + " Partial Regional Failure"
      : "✅ System Recovered: " + data.monitorName + " is ONLINE";

  if (type === NotificationType.INCIDENT_CREATED) title = `🔥 Incident Opened: ${data.monitorName}`;
  if (type === NotificationType.REGIONAL_DEGRADATION) {
    title = `🟡 Degradation: ${data.monitorName} Partial Regional Failure`;
    color = COLOR_ORANGE;
  }
  if (type === NotificationType.INCIDENT_RESOLVED)
    title = `✅ Incident Resolved: ${data.monitorName}`;
  if (type === NotificationType.HIGH_LATENCY) {
    title = `⚠️ High Latency: ${data.monitorName}`;
    color = COLOR_ORANGE;
  }
  if (type === NotificationType.SSL_EXPIRY) {
    title = `⚠️ SSL Expiry Warning: ${data.monitorName}`;
    color = COLOR_ORANGE;
  }

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
          {
            name: "Target",
            value: data.url,
            inline: true,
          },
          {
            name: "Timestamp",
            value: new Date(data.timestamp).toLocaleString(),
            inline: true,
          },
          ...(data.downtimeDuration
            ? [
                {
                  name: "Downtime Duration",
                  value: data.downtimeDuration,
                  inline: true,
                },
              ]
            : []),
          ...(data.failedRegions && data.failedRegions.length > 0
            ? [
                {
                  name: "Failed Regions",
                  value: data.failedRegions.join(", "),
                  inline: false,
                },
              ]
            : []),
          ...(data.runbookUrl
            ? [
                {
                  name: "Remediation Runbook",
                  value: `[View Runbook](${data.runbookUrl})`,
                  inline: false,
                },
              ]
            : []),
        ],
        footer: {
          text: "SteadyStack Sentinel • Monitoring Infrastructure",
        },
        timestamp: data.timestamp,
      },
    ],
  };

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.text();

      if (res.ok) {
        return; // Success
      }

      if (res.status === 429 || res.status >= 500) {
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 500));
          continue;
        }
      }

      throw new Error(`Discord Webhook failed: ${res.status} ${res.statusText}`);
    } catch (err) {
      if (attempts >= maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 500));
    }
  }
}
