import type { MonitorAlertData } from "@steadystack/email";
import { NotificationType, type NotificationTypeValue } from "../../constants";

/**
 * Sends an alert to a Slack channel based on the monitor's status.
 *
 * The function constructs a message payload that varies depending on the monitor's status and the type of alert.
 * It handles different alert types such as incident creation, resolution, and high latency, and includes relevant details
 * such as target URL, status, downtime duration, and failed regions. Finally, it sends the payload to the specified Slack
 * webhook URL and checks for a successful response.
 *
 * @param url - The Slack webhook URL to send the alert to.
 * @param data - The data containing monitor alert information.
 * @param type - Optional type of alert (e.g., "INCIDENT_CREATED", "INCIDENT_RESOLVED", "HIGH_LATENCY").
 * @param incidentId - Optional identifier for the incident, used for acknowledgment and resolution buttons.
 * @throws Error If the Slack webhook request fails.
 */
export async function sendSlackAlert(
  url: string,
  data: MonitorAlertData,
  type?: NotificationTypeValue | string,
  incidentId?: string,
) {
  const isDown = data.status === "DOWN";
  const isDegraded = data.status === "DEGRADED";

  let headerText = isDown
    ? "🚨 Alert: " + data.monitorName + " Unreachable"
    : isDegraded
      ? "🟡 Degradation: " + data.monitorName + " Partial Regional Failure"
      : "✅ Recovery: " + data.monitorName + " Restored";

  if (type === NotificationType.INCIDENT_CREATED)
    headerText = `🔥 Incident: ${data.monitorName} is DOWN`;
  if (type === NotificationType.REGIONAL_DEGRADATION)
    headerText = `🟡 Degradation: ${data.monitorName} Partial Regional Failure`;
  if (type === NotificationType.INCIDENT_RESOLVED)
    headerText = `✅ Resolved: ${data.monitorName} Recovered`;
  if (type === NotificationType.HIGH_LATENCY) headerText = `⚠️ High Latency: ${data.monitorName}`;
  if (type === NotificationType.SSL_EXPIRY)
    headerText = `⚠️ SSL Expiry Warning: ${data.monitorName}`;

  const payload = {
    text: headerText,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Target:*\n<" + data.url + "|" + data.url + ">",
          },
          {
            type: "mrkdwn",
            text: "*Status:*\n" + data.status,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Details:* " + (data.reason || "No detail provided"),
        },
      },
      ...(data.downtimeDuration
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Downtime:* " + data.downtimeDuration,
              },
            },
          ]
        : []),
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
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "⏱ Detected at " + new Date(data.timestamp).toLocaleTimeString(),
          },
        ],
      },
      ...(data.runbookUrl
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Remediation Runbook:* <" + data.runbookUrl + "|View Runbook>",
              },
            },
          ]
        : []),
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Dashboard",
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/monitors/` + data.monitorId,
            style: isDown ? "danger" : "primary",
          },
          ...(incidentId && type === NotificationType.INCIDENT_CREATED
            ? [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Acknowledge",
                  },
                  action_id: "acknowledge_incident",
                  value: incidentId,
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Resolve",
                  },
                  action_id: "resolve_incident",
                  value: incidentId,
                  style: "danger",
                },
              ]
            : []),
        ],
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

      throw new Error(`Slack Webhook failed: ${res.status} ${res.statusText}`);
    } catch (err) {
      if (attempts >= maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 500));
    }
  }
}
