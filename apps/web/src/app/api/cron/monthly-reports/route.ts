import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { buildClientSlaReportData } from "@/actions/client-reports";
import { renderSlaReportToBuffer, sendEmail, EMAIL_SENDERS } from "@steadystack/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const urlSecret = req.nextUrl.searchParams.get("key");
    if (urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Find all clients with scheduled email reports enabled
    const eligibleClients = await prisma.client.findMany({
      where: { emailReportsEnabled: true },
      include: {
        user: { select: { id: true, email: true, name: true } },
        organization: { select: { name: true } },
      },
    });

    const results: Array<{
      clientId: string;
      clientName: string;
      status: "SENT" | "FAILED";
      error?: string;
    }> = [];

    for (const client of eligibleClients) {
      try {
        const { reportData } = await buildClientSlaReportData(client.id, client.userId, {
          range: "last-month",
        });

        // Resolve recipients
        let recipients: string[] = [];
        if (client.reportRecipientEmails?.trim()) {
          recipients = client.reportRecipientEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
        } else if (client.contactEmail?.trim()) {
          recipients = [client.contactEmail.trim()];
        } else if (client.user.email) {
          recipients = [client.user.email];
        }

        if (recipients.length === 0) {
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: "FAILED",
            error: "No recipient email",
          });
          continue;
        }

        const pdfBuffer = await renderSlaReportToBuffer(reportData);
        const periodStr = `${reportData.startDate} to ${reportData.endDate}`;
        const agencyName = reportData.agencyName || client.organization?.name || "Client Services";

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
              <h1 style="font-size: 20px; font-weight: 700; margin: 0; color: #0f172a;">${agencyName}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Monthly Service Level Report</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Hello,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Here is your monthly Service Level Agreement (SLA) & Reliability Report for <strong>${client.name}</strong> covering <strong>${periodStr}</strong>.
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
                  <td style="padding: 6px 0; color: #64748b;">Avg Latency:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${reportData.avgLatencyMs} ms</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              The complete executive PDF breakdown is attached.
            </p>
          </div>
        `;

        const sendRes = await sendEmail({
          to: recipients,
          cc: client.user.email ? [client.user.email] : undefined,
          from: EMAIL_SENDERS.reports,
          replyTo: client.user.email || "hello@steadystack.dev",
          subject: `📊 Monthly SLA & Reliability Report: ${client.name} (${periodStr})`,
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
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: "FAILED",
            error: sendRes.error,
          });
        } else {
          await prisma.client.update({
            where: { id: client.id },
            data: { lastReportSentAt: new Date() },
          });
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: "SENT",
          });
        }
      } catch (clientErr: any) {
        results.push({
          clientId: client.id,
          clientName: client.name,
          status: "FAILED",
          error: clientErr.message || String(clientErr),
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: any) {
    console.error("[MonthlyReportsCron] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process monthly reports" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
