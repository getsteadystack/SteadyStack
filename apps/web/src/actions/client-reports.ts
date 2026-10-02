"use server";

import prisma, { resetPrisma } from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getComprehensiveSlaReport } from "./sla-reports";
import {
  renderSlaReportToBuffer,
  sendEmail,
  type SlaReportData,
  EMAIL_SENDERS,
} from "@steadystack/email";
import { getActiveWorkspace } from "./team";
import { z } from "zod";

const reportSettingsSchema = z.object({
  emailReportsEnabled: z.boolean(),
  reportRecipientEmails: z.string().optional().nullable(),
  reportTargetSla: z.number().min(90).max(100).default(99.9),
});

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function updateClientReportSettings(
  clientId: string,
  data: z.infer<typeof reportSettingsSchema>,
) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const parsed = reportSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid settings",
      };
    }

    const active = await getActiveWorkspace();
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [{ userId: session.user.id }, ...(active?.id ? [{ organizationId: active.id }] : [])],
      },
    });
    if (!client) return { success: false, error: "Client not found" };

    try {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          emailReportsEnabled: parsed.data.emailReportsEnabled,
          reportRecipientEmails: parsed.data.reportRecipientEmails?.trim() || null,
          reportTargetSla: parsed.data.reportTargetSla,
        },
      });
    } catch (updateErr: any) {
      if (
        updateErr?.message?.includes("Unknown argument") ||
        updateErr?.message?.includes("emailReportsEnabled")
      ) {
        await resetPrisma();
        await prisma.client.update({
          where: { id: clientId },
          data: {
            emailReportsEnabled: parsed.data.emailReportsEnabled,
            reportRecipientEmails: parsed.data.reportRecipientEmails?.trim() || null,
            reportTargetSla: parsed.data.reportTargetSla,
          },
        });
      } else {
        throw updateErr;
      }
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (err: any) {
    console.error("[updateClientReportSettings] Error:", err);
    return {
      success: false,
      error: err.message || "Failed to update report settings",
    };
  }
}

/**
 * Builds the SlaReportData payload and renders the PDF buffer for a client.
 */
export async function buildClientSlaReportData(
  clientId: string,
  userId: string,
  options: {
    range?: "7d" | "30d" | "90d" | "last-month" | "this-month";
    targetSla?: number;
    notes?: string;
  } = {},
) {
  const active = await getActiveWorkspace();
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      OR: [{ userId }, ...(active?.id ? [{ organizationId: active.id }] : [])],
    },
    include: {
      organization: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!client) throw new Error("Client not found");

  const targetSla = options.targetSla ?? client.reportTargetSla ?? 99.9;
  const range = options.range ?? "30d";

  const activeWorkspace = await getActiveWorkspace();
  const agencyName =
    activeWorkspace?.name || client.organization?.name || client.user?.name || "Client Services";

  const slaReport = await getComprehensiveSlaReport({
    clientId: client.id,
    range,
    targetSla,
    agencyName,
    clientName: client.name,
    notes: options.notes,
  });

  const reportId = `SLA-${new Date().toISOString().split("T")[0]!.replaceAll("-", "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const reportData: SlaReportData = {
    reportId,
    generatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    agencyName,
    clientName: client.name,
    scopeName: `${client.name} — Service Deliverables`,
    startDate: slaReport.startDate,
    endDate: slaReport.endDate,
    targetSla: slaReport.targetSla,
    actualUptime: slaReport.aggregate.uptimePct,
    isSlaMet: slaReport.isSlaMet,
    totalMonitoredMinutes: Math.max(
      1,
      Math.round(
        slaReport.aggregate.allowedDowntimeMinutes / ((100 - slaReport.targetSla) / 100 || 0.001),
      ),
    ),
    allowedDowntimeMinutes: slaReport.aggregate.allowedDowntimeMinutes,
    consumedDowntimeMinutes: slaReport.aggregate.totalDowntimeMinutes,
    remainingErrorBudgetPct: slaReport.aggregate.remainingErrorBudgetPct,
    totalChecks: slaReport.aggregate.totalChecks,
    totalIncidents: slaReport.aggregate.totalIncidents,
    mttrMinutes: slaReport.aggregate.mttrMinutes,
    mttdSeconds: slaReport.aggregate.mttdSeconds,
    avgLatencyMs: slaReport.aggregate.avgLatencyMs,
    p95LatencyMs: slaReport.aggregate.p95LatencyMs,
    p99LatencyMs: slaReport.aggregate.p99LatencyMs,
    notes: options.notes,
    services: slaReport.services.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      checks: s.checks,
      uptimePct: s.uptimePct,
      downtimeMinutes: s.downtimeMinutes,
      status: s.status,
    })),
    incidents: slaReport.incidents.map((inc) => ({
      id: inc.id,
      startedAt: inc.startedAt,
      durationMinutes: inc.durationMinutes,
      serviceName: inc.serviceName,
      reason: inc.reason,
      status: inc.status,
    })),
    dailyBreakdown: slaReport.dailyBreakdown,
  };

  return { client, reportData };
}

/**
 * Triggers an immediate report email dispatch (test or on-demand).
 */
export async function sendClientReportEmailAction({
  clientId,
  customRecipient,
  isTest = false,
  notes,
}: {
  clientId: string;
  customRecipient?: string;
  isTest?: boolean;
  notes?: string;
}): Promise<
  | { success: true; recipients: string[]; reportId: string }
  | { success: false; error: string; recipients?: never; reportId?: never }
> {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const { client, reportData } = await buildClientSlaReportData(clientId, session.user.id, {
      range: "30d",
      notes,
    });

    // Resolve recipients
    let recipients: string[] = [];
    if (customRecipient?.trim()) {
      recipients = customRecipient
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    } else if (client.reportRecipientEmails?.trim()) {
      recipients = client.reportRecipientEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    } else if (client.contactEmail?.trim()) {
      recipients = [client.contactEmail.trim()];
    } else {
      recipients = [session.user.email];
    }

    if (recipients.length === 0) {
      return { success: false, error: "No recipient email address available" };
    }

    // Render PDF Buffer
    const pdfBuffer = await renderSlaReportToBuffer(reportData);

    const periodStr = `${reportData.startDate} to ${reportData.endDate}`;
    const subject = isTest
      ? `[TEST] 📊 Monthly SLA & Reliability Report: ${client.name} (${periodStr})`
      : `📊 Monthly SLA & Reliability Report: ${client.name} (${periodStr})`;

    const agencyName = reportData.agencyName || "SteadyStack Monitoring";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: 700; margin: 0; color: #0f172a;">${agencyName}</h1>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Client Service Level Report</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Hello,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Please find attached the official monthly Service Level Agreement (SLA) & Reliability Report for <strong>${client.name}</strong> covering the period <strong>${periodStr}</strong>.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target SLA:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${reportData.targetSla}%</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Actual Uptime:</td>
              <td style="padding: 6px 0; font-weight: 700; text-align: right; color: ${reportData.isSlaMet ? "#16a34a" : "#dc2626"};">
                ${reportData.actualUptime.toFixed(2)}% (${reportData.isSlaMet ? "PASSED" : "BREACHED"})
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Total Downtime:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${reportData.consumedDowntimeMinutes} mins</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Avg Response Time:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${reportData.avgLatencyMs} ms</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Monitored Services:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${reportData.services.length} endpoints</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          A detailed executive PDF containing individual service metrics, latency breakdowns, and incident logs is attached to this email.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Sent by ${agencyName} Reliability Monitoring
        </div>
      </div>
    `;

    const sendRes = await sendEmail({
      to: recipients,
      cc: session.user.email ? [session.user.email] : undefined,
      from: EMAIL_SENDERS.reports,
      replyTo: session.user.email || "hello@steadystack.dev",
      subject,
      html: emailHtml,
      attachments: [
        {
          filename: `SLA-Report-${client.name.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}-${reportData.startDate}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (sendRes.error) {
      return { success: false, error: sendRes.error };
    }

    // Update last report sent timestamp
    await prisma.client.update({
      where: { id: client.id },
      data: { lastReportSentAt: new Date() },
    });

    revalidatePath("/dashboard/clients");

    return {
      success: true,
      recipients,
      reportId: reportData.reportId,
    };
  } catch (err: any) {
    console.error("[sendClientReportEmailAction] Error:", err);
    return {
      success: false,
      error: err.message || "Failed to generate and send report",
    };
  }
}
