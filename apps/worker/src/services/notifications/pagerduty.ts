import type { MonitorAlertData } from "@steadystack/email";
import { NotificationType, type NotificationTypeValue } from "../../constants";

/**
 * Builds a stable deduplication key for a monitor so that PagerDuty can
 * collapse repeat alerts into a single open incident and auto-resolve it
 * when the monitor recovers.
 */
function dedupKey(monitorId: string): string {
  return `steadystack-${monitorId}`;
}

/**
 * Returns the PagerDuty event severity that best maps to the alert type.
 */
function severity(type?: NotificationTypeValue | string): "critical" | "warning" | "info" {
  if (type === NotificationType.INCIDENT_CREATED || type === NotificationType.INCIDENT_RESOLVED) {
    return "critical";
  }
  if (type === NotificationType.HIGH_LATENCY || type === NotificationType.SSL_EXPIRY) {
    return "warning";
  }
  return "critical";
}

/**
 * Posts an event to the PagerDuty Events API v2.
 *
 * - When the monitor is DOWN (or an incident is created), sends a "trigger" action,
 *   which opens a new incident or deduplicates into the existing one.
 * - When the monitor is UP (or an incident is resolved), sends a "resolve" action,
 *   which auto-closes the corresponding incident using the same dedup_key.
 *
 * @param routingKey - The PagerDuty integration routing key (32-char hex string).
 * @param data       - Monitor alert data from the notification handler.
 * @param type       - Optional notification type discriminator.
 * @param incidentId - Optional SteadyStack incident ID (used in PD custom_details).
 * @throws Error if the PagerDuty API rejects the event after all retries.
 */
export async function sendPagerDutyAlert(
  routingKey: string,
  data: MonitorAlertData,
  type?: NotificationTypeValue | string,
  incidentId?: string,
): Promise<void> {
  const isResolved = data.status === "UP" || type === NotificationType.INCIDENT_RESOLVED;

  const eventAction = isResolved ? "resolve" : "trigger";
  const dedup = dedupKey(data.monitorId);

  let summary: string;
  if (type === NotificationType.INCIDENT_CREATED) {
    summary = `🔥 Incident: ${data.monitorName} is DOWN`;
  } else if (type === NotificationType.INCIDENT_RESOLVED) {
    summary = `✅ Resolved: ${data.monitorName} has recovered`;
  } else if (type === NotificationType.HIGH_LATENCY) {
    summary = `⚠️ High Latency: ${data.monitorName}`;
  } else if (type === NotificationType.SSL_EXPIRY) {
    summary = `⚠️ SSL Expiry Warning: ${data.monitorName}`;
  } else if (isResolved) {
    summary = `✅ Recovery: ${data.monitorName} is UP`;
  } else {
    summary = `🚨 Alert: ${data.monitorName} is DOWN`;
  }

  const payload = isResolved
    ? {
        routing_key: routingKey,
        dedup_key: dedup,
        event_action: "resolve",
      }
    : {
        routing_key: routingKey,
        dedup_key: dedup,
        event_action: "trigger",
        payload: {
          summary,
          source: data.url,
          severity: severity(type),
          timestamp: data.timestamp,
          custom_details: {
            monitor_id: data.monitorId,
            monitor_name: data.monitorName,
            target_url: data.url,
            status: data.status,
            reason: data.reason ?? "No detail provided",
            ...(data.failedRegions?.length
              ? { failed_regions: data.failedRegions.join(", ") }
              : {}),
            ...(data.downtimeDuration ? { downtime_duration: data.downtimeDuration } : {}),
            ...(incidentId ? { steadystack_incident_id: incidentId } : {}),
          },
        },
        links: [
          {
            href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/monitors/${data.monitorId}`,
            text: "View Monitor",
          },
          ...(data.runbookUrl ? [{ href: data.runbookUrl, text: "Runbook" }] : []),
        ],
      };

  const PD_EVENTS_URL = "https://events.pagerduty.com/v2/enqueue";
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(PD_EVENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const body = (await res.json()) as {
          status?: string;
          message?: string;
        };
        console.log(
          `[PagerDuty] Event "${eventAction}" accepted for ${data.monitorName}: ${body.message ?? "ok"}`,
        );
        return;
      }

      // Rate-limit or transient server error — retry
      if ((res.status === 429 || res.status >= 500) && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempts) * 500));
        continue;
      }

      const errBody = await res.text();
      throw new Error(`PagerDuty Events API returned ${res.status}: ${errBody}`);
    } catch (err) {
      if (attempts >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempts) * 500));
    }
  }
}
