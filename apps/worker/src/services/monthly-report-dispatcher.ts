import type { PrismaClient } from "@steadystack/db";
import { renderMonthlyReportToBuffer, sendAgencyClientMonthlyReport } from "@steadystack/email";

export interface MonthlyReportDispatchResult {
  processedClients: number;
  emailsSent: number;
  errors: string[];
}

/**
 * Monthly background cron dispatcher for Agency Client SLA Reports.
 * Runs on the 1st of every month at 00:00 UTC.
 */
export async function runMonthlyReportDispatcher(
  prisma: PrismaClient,
  env: { RESEND_API_KEY?: string; APP_URL?: string },
): Promise<MonthlyReportDispatchResult> {
  console.log("[MonthlyReportDispatcher] Initiating agency client monthly SLA reports run...");

  const errors: string[] = [];
  let emailsSent = 0;

  // 1. Calculate previous month's exact UTC date bounds
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

  const monthName = startDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const startDateFormatted = startDate.toISOString().split("T")[0]!;
  const endDateFormatted = endDate.toISOString().split("T")[0]!;

  // 2. Fetch all clients with automated monthly email reports enabled
  const clients = await prisma.client.findMany({
    where: {
      emailReportsEnabled: true,
    },
    include: {
      user: { select: { name: true, email: true } },
      organization: { select: { name: true } },
      monitors: {
        select: {
          id: true,
          name: true,
          url: true,
          type: true,
          status: true,
        },
      },
    },
  });

  if (clients.length === 0) {
    console.log("[MonthlyReportDispatcher] No clients with emailReportsEnabled. Skipping.");
    return { processedClients: 0, emailsSent: 0, errors: [] };
  }

  console.log(
    `[MonthlyReportDispatcher] Found ${clients.length} client(s) with monthly reports enabled.`,
  );

  const appBaseUrl = env.APP_URL || "https://steadystack.dev";

  for (const client of clients) {
    try {
      // 3. Determine recipients
      const rawRecipients =
        client.reportRecipientEmails?.trim() || client.contactEmail?.trim() || client.user.email;
      const recipientList = rawRecipients
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0 && e.includes("@"));

      if (recipientList.length === 0) {
        console.warn(
          `[MonthlyReportDispatcher] No valid recipient emails found for client "${client.name}". Skipping.`,
        );
        continue;
      }

      const monitorIds = client.monitors.map((m) => m.id);
      const agencyName =
        client.organization?.name || client.user.name || "Agency Infrastructure Management";

      // 4. Calculate SLA telemetry for client monitors during the previous month
      let totalChecks = 0;
      let downChecks = 0;
      let avgResponseTime = 0;

      if (monitorIds.length > 0) {
        totalChecks = await prisma.monitorEvent.count({
          where: {
            monitorId: { in: monitorIds },
            timestamp: { gte: startDate, lte: endDate },
            status: { not: "MAINTENANCE" },
          },
        });

        downChecks = await prisma.monitorEvent.count({
          where: {
            monitorId: { in: monitorIds },
            timestamp: { gte: startDate, lte: endDate },
            status: "DOWN",
          },
        });

        const avgRes = await prisma.monitorEvent.aggregate({
          _avg: { latency: true },
          where: {
            monitorId: { in: monitorIds },
            timestamp: { gte: startDate, lte: endDate },
            status: "UP",
          },
        });
        avgResponseTime = Math.round(avgRes._avg.latency || 0);
      }

      const globalUptime =
        totalChecks > 0
          ? Number((((totalChecks - downChecks) / totalChecks) * 100).toFixed(2))
          : 100;

      const targetSla = client.reportTargetSla || 99.9;
      const slaMet = globalUptime >= targetSla;

      // 5. Fetch critical incidents for this client's monitors
      const incidents =
        monitorIds.length > 0
          ? await prisma.incident.findMany({
              where: {
                monitorId: { in: monitorIds },
                createdAt: { gte: startDate, lte: endDate },
              },
              include: { monitor: { select: { name: true } } },
              orderBy: { createdAt: "desc" },
              take: 5,
            })
          : [];

      const criticalEvents = incidents.map((inc) => {
        let duration = "Ongoing";
        if (inc.resolvedAt) {
          const diffMs = new Date(inc.resolvedAt).getTime() - new Date(inc.createdAt).getTime();
          const diffMins = Math.round(diffMs / 60000);
          duration =
            diffMins < 60 ? `${diffMins}m` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
        }
        return {
          id: inc.id,
          date: inc.createdAt.toISOString().split("T")[0]!,
          monitorName: inc.monitor?.name || "Client Service",
          description: inc.description || inc.title || "Service degradation detected",
          duration,
        };
      });

      // 6. Render Executive PDF Buffer
      const pdfStats = {
        globalUptime,
        totalIncidents: incidents.length,
        avgResponseTime,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        agencyName,
        clientName: client.name,
        criticalEvents,
      };

      const pdfBuffer = await renderMonthlyReportToBuffer(pdfStats);

      const portalUrl =
        client.portalToken && client.portalEnabled
          ? `${appBaseUrl}/portal/${client.portalToken}`
          : undefined;

      // 7. Dispatch Email
      console.log(
        `[MonthlyReportDispatcher] Sending SLA report for "${client.name}" to ${recipientList.join(", ")}...`,
      );

      const sendResult = await sendAgencyClientMonthlyReport({
        to: recipientList,
        clientName: client.name,
        agencyName,
        monthName,
        globalUptime,
        targetSla,
        slaMet,
        pdfBuffer,
        apiKey: env.RESEND_API_KEY,
        portalUrl,
      });

      if (sendResult.error) {
        errors.push(`Client "${client.name}": ${sendResult.error}`);
      } else {
        emailsSent += recipientList.length;
        // Update lastReportSentAt on Client
        await prisma.client.update({
          where: { id: client.id },
          data: { lastReportSentAt: new Date() },
        });
      }

      // Small delay between client dispatches to avoid provider rate limiting
      await new Promise((r) => setTimeout(r, 250));
    } catch (clientErr) {
      const msg = clientErr instanceof Error ? clientErr.message : "Unknown error";
      console.error(
        `[MonthlyReportDispatcher] Error processing client "${client.name}":`,
        clientErr,
      );
      errors.push(`Client "${client.name}": ${msg}`);
    }
  }

  console.log(
    `[MonthlyReportDispatcher] Completed run. Processed: ${clients.length} clients, Sent: ${emailsSent} emails.`,
  );
  return { processedClients: clients.length, emailsSent, errors };
}
