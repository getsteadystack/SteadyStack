import { getPrisma } from "@steadystack/db";
import type { ExecutionContext, MessageBatch } from "@cloudflare/workers-types";
import {
  sendMonitorAlert,
  sendStatusUpdate,
  type MonitorAlertData,
  type StatusUpdateData,
} from "@steadystack/email";
import { MonitorStatus as Status, NotificationType, type NotificationTypeValue } from "./constants";
import type { Env } from "./env";
import {
  runWithLimit,
  sendDiscordAlert,
  sendOpsgenieAlert,
  sendPagerDutyAlert,
  sendSlackAlert,
  type OpsgenieConfig,
} from "./services/notifications";

export interface NotificationMessage {
  type?: NotificationTypeValue | undefined;
  incidentId?: string | undefined;
  monitorId: string;
  monitorName: string;
  url: string;
  status: "UP" | "DOWN" | "DEGRADED";
  latency?: number | undefined;
  previousStatus?: "UP" | "DOWN" | "DEGRADED" | undefined;
  timestamp: string;
  reason?: string | undefined;
  failedRegions?: string[] | undefined;
  runbookUrl?: string | undefined;
  daysRemaining?: number | undefined;
}

function syncEnv(env: Env) {
  if (typeof process !== "undefined" && process.env) {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") {
        process.env[key] = value;
      }
    }
  }
}

export default {
  // Notification Queue Consumer
  async queue(batch: MessageBatch<NotificationMessage>, env: Env, _ctx: ExecutionContext) {
    syncEnv(env);
    const prisma = getPrisma(env.DATABASE_URL);

    console.log(`[Notification] Processing ${batch.messages.length} notification(s)...`);

    const monitorIds = Array.from(new Set(batch.messages.map((msg) => msg.body.monitorId)));

    // Fetch all monitors in one query
    const monitors = await prisma.monitor.findMany({
      where: { id: { in: monitorIds } },
      include: {
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

    const monitorMap = new Map(monitors.map((m) => [m.id, m]));

    // --- Pre-fetch LAST DOWN EVENTS FOR UP TRANSITIONS (to avoid N+1 queries) ---
    const upNotifications = batch.messages.filter((msg) => msg.body.status === Status.UP);
    const upMonitorIds = Array.from(new Set(upNotifications.map((msg) => msg.body.monitorId)));

    const lastDownEventMap = new Map<string, Date>();
    if (upMonitorIds.length > 0) {
      const lastDownEvents = await prisma.monitorEvent.groupBy({
        by: ["monitorId"],
        where: {
          monitorId: { in: upMonitorIds },
          status: Status.DOWN,
        },
        _max: {
          timestamp: true,
        },
      });

      for (const group of lastDownEvents) {
        if (group._max.timestamp) {
          lastDownEventMap.set(group.monitorId, new Date(group._max.timestamp));
        }
      }
    }

    // --- Pre-fetch STATUS PAGE SUBSCRIBER ALERTS ---
    const incidentMonitorIds = Array.from(
      new Set(
        batch.messages
          .filter(
            (msg) =>
              msg.body.type === NotificationType.INCIDENT_CREATED ||
              msg.body.type === NotificationType.INCIDENT_RESOLVED,
          )
          .map((msg) => msg.body.monitorId),
      ),
    );

    let allStatusPages: any[] = [];
    if (incidentMonitorIds.length > 0) {
      allStatusPages = await prisma.statusPage.findMany({
        where: {
          monitors: { some: { monitorId: { in: incidentMonitorIds } } },
        },
        include: {
          monitors: true,
          subscribers: {
            where: { verified: true },
            include: { monitorSubscriptions: true },
          },
        },
      });
    }

    const statusPageMap = new Map<string, any[]>();
    for (const page of allStatusPages) {
      for (const sm of page.monitors) {
        if (!statusPageMap.has(sm.monitorId)) {
          statusPageMap.set(sm.monitorId, []);
        }
        statusPageMap.get(sm.monitorId)!.push(page);
      }
    }

    // Process notifications with controlled concurrency to prevent memory/connection issues
    await runWithLimit(
      batch.messages.map((msg) => async () => {
        const notification = msg.body;

        try {
          // Fetch alert rules for this monitor
          const monitor = monitorMap.get(notification.monitorId);

          if (!monitor) {
            console.error(`[Notification] Monitor ${notification.monitorId} not found`);
            msg.ack();
            return;
          }

          // Check if any alert rules match this notification
          const matchingRules = monitor.alertRules.filter((rule: any) => {
            // 1. Explicit LATENCY trigger
            if (rule.trigger === "LATENCY" && notification.type === NotificationType.HIGH_LATENCY) {
              if (rule.threshold && notification.latency) {
                if (rule.comparison === "GT") return notification.latency > rule.threshold;
                if (rule.comparison === "LT") return notification.latency < rule.threshold;
              }
              return true; // Match if no specific threshold set in rule
            }

            // 2. STATUS_CHANGE trigger
            if (rule.trigger === "STATUS_CHANGE") {
              // If High Latency or SSL Expiry, only alert if rule is "Any Status Change" (no specific target)
              if (
                notification.type === NotificationType.HIGH_LATENCY ||
                notification.type === NotificationType.SSL_EXPIRY
              ) {
                return !rule.targetStatus;
              }

              // Normal UP/DOWN logic
              if (rule.targetStatus) {
                return notification.status === rule.targetStatus;
              }
              return true; // Any status change matches (UP->DOWN, DOWN->UP)
            }

            // 3. SSL_EXPIRY trigger
            if (
              rule.trigger === "SSL_EXPIRY" &&
              notification.type === NotificationType.SSL_EXPIRY
            ) {
              if (rule.threshold && notification.daysRemaining !== undefined) {
                if (rule.comparison === "LT" || !rule.comparison) {
                  return notification.daysRemaining <= rule.threshold;
                }
                if (rule.comparison === "GT") {
                  return notification.daysRemaining > rule.threshold;
                }
              }
              return true;
            }

            return false;
          });

          const deliveryPromises: Promise<any>[] = [];

          // Monitor Alert Data (Owner/Team)
          let downtimeDuration: string | undefined;
          if (notification.status === "UP") {
            const lastDownTimestamp = lastDownEventMap.get(notification.monitorId);

            if (lastDownTimestamp) {
              const downtime =
                new Date(notification.timestamp).getTime() - lastDownTimestamp.getTime();
              const minutes = Math.floor(downtime / 60000);
              const seconds = Math.floor((downtime % 60000) / 1000);
              downtimeDuration = `${minutes}m ${seconds}s`;
            }
          }

          const emailData: MonitorAlertData = {
            monitorId: notification.monitorId,
            monitorName: notification.monitorName,
            url: notification.url,
            status: notification.status,
            previousStatus:
              notification.previousStatus || (notification.status === "UP" ? "DOWN" : "UP"),
            timestamp: notification.timestamp,
            reason: notification.reason,
            downtimeDuration,
            failedRegions: notification.failedRegions,
            runbookUrl: notification.runbookUrl || monitor?.runbookUrl || undefined,
          };

          // --- 1. OWNER ALERTS (Email, Slack, Discord) ---
          if (matchingRules.length > 0) {
            const emailChannels = new Set<string>();
            const slackChannels = new Set<{ url: string; token?: string }>();
            const discordChannels = new Set<{ url: string; token?: string }>();
            const pagerdutyChannels = new Set<string>();
            const opsgenieChannels = new Map<string, OpsgenieConfig>();

            if (monitor.user.email) {
              emailChannels.add(monitor.user.email);
            }

            matchingRules.forEach((rule: any) => {
              rule.channels.forEach((channel: any) => {
                const config = channel.config as any;

                if (channel.type === "EMAIL" && config?.email) {
                  emailChannels.add(config.email);
                } else if (channel.type === "SLACK" && config?.webhookUrl) {
                  slackChannels.add({
                    url: config.webhookUrl,
                    token: config.accessToken,
                  });
                } else if (channel.type === "DISCORD" && config?.webhookUrl) {
                  discordChannels.add({ url: config.webhookUrl });
                } else if (channel.type === "PAGERDUTY" && config?.routingKey) {
                  pagerdutyChannels.add(config.routingKey);
                } else if (channel.type === "OPSGENIE" && config?.apiKey) {
                  opsgenieChannels.set(channel.id, {
                    apiKey: config.apiKey,
                    region: config.region || "us",
                  });
                }
              });
            });

            Array.from(emailChannels).forEach((email) => {
              deliveryPromises.push(sendMonitorAlert(email, emailData, env.RESEND_API_KEY));
            });
            Array.from(slackChannels).forEach((target) => {
              deliveryPromises.push(
                sendSlackAlert(target.url, emailData, notification.type, notification.incidentId),
              );
            });
            Array.from(discordChannels).forEach((target) => {
              deliveryPromises.push(sendDiscordAlert(target.url, emailData, notification.type));
            });
            Array.from(pagerdutyChannels).forEach((routingKey) => {
              deliveryPromises.push(
                sendPagerDutyAlert(
                  routingKey,
                  emailData,
                  notification.type,
                  notification.incidentId,
                ),
              );
            });
            Array.from(opsgenieChannels.values()).forEach((opsConfig) => {
              deliveryPromises.push(
                sendOpsgenieAlert(opsConfig, emailData, notification.type, notification.incidentId),
              );
            });
          } else if (
            monitor.user?.email &&
            (notification.status === "DOWN" ||
              notification.status === "DEGRADED" ||
              notification.status === "UP" ||
              notification.type === NotificationType.INCIDENT_CREATED ||
              notification.type === NotificationType.REGIONAL_DEGRADATION ||
              notification.type === NotificationType.INCIDENT_RESOLVED)
          ) {
            // Default fallback: Always notify monitor owner on status changes even if custom alert rules are unset
            console.log(
              `[Notification] No custom alert rules for ${notification.monitorName}, falling back to owner email: ${monitor.user.email}`,
            );
            deliveryPromises.push(
              sendMonitorAlert(monitor.user.email, emailData, env.RESEND_API_KEY),
            );
          } else {
            console.log(`[Notification] No matching alert rules for ${notification.monitorName}`);
          }

          // --- 2. STATUS PAGE SUBSCRIBER ALERTS ---
          // Only send if it's an incident-related event (not just high latency, unless we want to)
          if (
            notification.type === NotificationType.INCIDENT_CREATED ||
            notification.type === NotificationType.INCIDENT_RESOLVED
          ) {
            const statusPages = statusPageMap.get(notification.monitorId) || [];

            for (const page of statusPages) {
              const mappedStatus =
                notification.type === NotificationType.INCIDENT_CREATED
                  ? "INVESTIGATING"
                  : "RESOLVED";

              const incidentTitle =
                notification.reason ||
                (notification.type === NotificationType.INCIDENT_CREATED
                  ? `${notification.monitorName} is experiencing issues`
                  : `${notification.monitorName} has recovered`);

              // Filter subscribers
              const subscribersToNotify = page.subscribers.filter((sub: any) => {
                // Check preferences
                if (notification.type === NotificationType.INCIDENT_CREATED && !sub.notifyIncidents)
                  return false;
                if (
                  notification.type === NotificationType.INCIDENT_RESOLVED &&
                  !sub.notifyIncidents
                )
                  return false;

                // Check monitor subscription
                const isSubscribedToMonitor = sub.monitorSubscriptions.some(
                  (ms: any) => ms.monitorId === notification.monitorId,
                );
                return isSubscribedToMonitor;
              });

              // Send emails
              subscribersToNotify.forEach((sub: any) => {
                const updateData: StatusUpdateData = {
                  pageTitle: page.title,
                  incidentTitle: incidentTitle,
                  incidentStatus: mappedStatus,
                  description:
                    notification.type === NotificationType.INCIDENT_CREATED
                      ? `We are investigating reports of issues with ${notification.monitorName}.`
                      : `The issue with ${notification.monitorName} has been resolved.`,
                  affectedMonitors: [notification.monitorName],
                  manageUrl: `https://steadystack.dev/subscribe/manage/${sub.manageToken}`,
                  pageUrl: `https://steadystack.dev/status-page/${page.slug}`,
                };

                deliveryPromises.push(sendStatusUpdate(sub.email, updateData, env.RESEND_API_KEY));
              });

              if (subscribersToNotify.length > 0) {
                console.log(
                  `[Notification] Queueing updates for ${subscribersToNotify.length} subscribers of ${page.title}`,
                );
              }
            }
          }

          const results = await Promise.allSettled(deliveryPromises);

          let successful = 0;
          let failed = 0;

          for (const r of results) {
            if (r.status === "rejected") {
              failed++;
              console.error(
                `[Notification] Delivery channel rejected for ${notification.monitorName}:`,
                r.reason,
              );
            } else if (
              r.status === "fulfilled" &&
              r.value &&
              typeof r.value === "object" &&
              "error" in r.value &&
              (r.value as any).error
            ) {
              failed++;
              console.error(
                `[Notification] Delivery channel returned error for ${notification.monitorName}:`,
                (r.value as any).error,
              );
            } else {
              successful++;
            }
          }

          console.log(
            `[Notification] Processed ${successful} deliveries for ${notification.monitorName} (${failed} failed)`,
          );

          if (failed > 0) {
            console.error(
              `[Notification] One or more deliveries failed for ${notification.monitorName} (${failed}/${deliveryPromises.length}), triggering queue retry.`,
            );
            msg.retry();
          } else {
            msg.ack();
          }
        } catch (error) {
          console.error(`[Notification] Error processing notification:`, error);
          msg.retry();
        }
      }),
      50, // Process up to 50 notifications concurrently
    );
  },
};
