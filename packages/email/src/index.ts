import { Resend } from "resend";
import * as React from "react";
import { env } from "@steadystack/env/server";
import type { PasswordResetEmailData } from "./templates/password-reset";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SendEmailResult = { id: string; error?: undefined } | { error: string; id?: undefined };

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string | undefined;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string | undefined;
  from?: string | undefined;
  replyTo?: string | string[] | undefined;
  cc?: string | string[] | undefined;
  bcc?: string | string[] | undefined;
  attachments?: EmailAttachment[] | undefined;
  apiKey?: string | undefined;
  headers?: Record<string, string> | undefined;
  tags?: Array<{ name: string; value: string }> | undefined;
}

export interface MonitorAlertData {
  monitorId: string;
  monitorName: string;
  url: string;
  status: "UP" | "DOWN" | "DEGRADED";
  previousStatus: "UP" | "DOWN" | "DEGRADED";
  timestamp: string;
  reason?: string | undefined;
  downtimeDuration?: string | undefined;
  failedRegions?: string[] | undefined;
  runbookUrl?: string | undefined;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export interface VerificationEmailData {
  userName: string;
  verificationUrl: string;
}

export type { PasswordResetEmailData };

export interface WeeklyDigestData {
  userName: string;
  weekRange: string;
  totalMonitors: number;
  uptimePercentage: number;
  totalIncidents: number;
  topPerformers: Array<{ name: string; uptime: number }>;
}

export interface UsageLimitWarningEmailData {
  userName: string;
  planName: string;
  warnings: Array<{
    resource: string;
    label: string;
    used: number;
    limit: number;
    percentage: number;
  }>;
  upgradeUrl?: string | undefined;
}

export interface DunningNoticeEmailData {
  userName: string;
  planName: string;
  amountDue: string;
  failureReason?: string | undefined;
  billingPortalUrl?: string | undefined;
}

export type { SubscriptionConfirmData } from "./templates/subscription-confirm";
export type { StatusUpdateData } from "./templates/status-update";
export type { SlaReportData } from "./templates/sla-report";
export { SlaReportDocument } from "./templates/sla-report";
export type { TeamInvitationEmailData } from "./templates/team-invitation";
export * from "./styles/theme";

// ============================================================================
// Sender Directory
// ============================================================================

export const EMAIL_SENDERS = {
  alerts: "SteadyStack <alerts@steadystack.dev>",
  auth: "SteadyStack <auth@steadystack.dev>",
  billing: "SteadyStack Billing <billing@steadystack.dev>",
  general: "SteadyStack <hello@steadystack.dev>",
  reports: "SteadyStack <reports@steadystack.dev>",
  status: "SteadyStack <status@steadystack.dev>",
  teams: "SteadyStack Teams <invitations@steadystack.dev>",
  updates: "SteadyStack <updates@steadystack.dev>",
  verify: "SteadyStack <verify@steadystack.dev>",
} as const;

// ============================================================================
// Resend Client Lifecycle Management
// ============================================================================

const resendClientCache = new Map<string, Resend>();

export function getResendClient(apiKey?: string): Resend {
  const key = apiKey ?? env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }

  let client = resendClientCache.get(key);
  if (!client) {
    client = new Resend(key);
    resendClientCache.set(key, client);
  }
  return client;
}

// ============================================================================
// Core Email Dispatch Pipeline
// ============================================================================

function stripHtmlTagsToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    text,
    from = process.env.EMAIL_FROM || EMAIL_SENDERS.general,
    attachments,
    apiKey,
    replyTo = "hello@steadystack.dev",
    cc,
    bcc,
    headers,
    tags,
  } = options;

  const key = apiKey ?? env.RESEND_API_KEY;
  // Treat as dev/test only when NODE_ENV is explicitly set to those values.
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  if (!key) {
    if (isDevOrTest) {
      const recipient = Array.isArray(to) ? to.join(", ") : to;
      console.log(`\n==================================================`);
      console.log(`📧 [DEV EMAIL FALLBACK] Email Simulation`);
      console.log(`📬 From:    ${from}`);
      console.log(`👤 To:      ${recipient}`);
      console.log(`📝 Subject: ${subject}`);
      if (attachments && attachments.length > 0) {
        console.log(`📎 Attachments: ${attachments.map((a) => a.filename).join(", ")}`);
      }
      console.log(`==================================================\n`);
      return { id: "dev-mock-email-id" };
    }
    throw new Error("[SteadyStack Email] RESEND_API_KEY is not configured. Email cannot be sent.");
  }

  try {
    const resend = getResendClient(key);
    const plainText = text || stripHtmlTagsToPlainText(html);

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: plainText,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(cc ? { cc } : {}),
      ...(bcc ? { bcc } : {}),
      ...(headers ? { headers } : {}),
      ...(tags ? { tags } : {}),
    } as Parameters<typeof resend.emails.send>[0]);

    if (result.data && "id" in result.data) {
      return { id: result.data.id };
    }

    const errorMessage = result.error?.message || "Failed to send email";
    console.error(`[SteadyStack Email] Error sending to ${to}:`, errorMessage);
    return { error: errorMessage };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown email error";
    console.error(`[SteadyStack Email] Exception sending to ${to}:`, error);
    return { error: errorMessage };
  }
}

// ============================================================================
// PDF Rendering Utilities
// ============================================================================

export async function renderPdfToBuffer(document: React.ReactElement): Promise<Buffer> {
  const { renderToStream } = await import("@react-pdf/renderer");
  const stream = await renderToStream(document as any);
  const chunks: Uint8Array[] = [];
  // @ts-ignore - ReadableStream iteration
  for await (const chunk of stream) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks);
}

export async function renderMonthlyReportToBuffer(stats: any): Promise<Buffer> {
  const { MonthlyReportDocument } = await import("./templates/monthly-report");
  return renderPdfToBuffer(React.createElement(MonthlyReportDocument, { stats }));
}

export async function renderSlaReportToBuffer(
  data: import("./templates/sla-report").SlaReportData,
): Promise<Buffer> {
  const { SlaReportDocument } = await import("./templates/sla-report");
  return renderPdfToBuffer(React.createElement(SlaReportDocument, { data }));
}

// ============================================================================
// Email Template Senders
// ============================================================================

export async function sendMonitorAlert(
  to: string,
  data: MonitorAlertData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderMonitorAlert } = await import("./templates/monitor-alert");

  let subject =
    data.status === "DOWN"
      ? `🔴 [CRITICAL] ${data.monitorName} is DOWN`
      : data.status === "DEGRADED"
        ? `🟡 [DEGRADED] ${data.monitorName} Partial Regional Failure`
        : `✅ [RESOLVED] ${data.monitorName} is UP`;

  if (data.reason?.includes("expires in") || data.reason?.includes("SSL certificate expires")) {
    subject = `⚠️ [EXPIRY WARNING] ${data.monitorName} SSL Certificate Expires Soon`;
  }

  const html = await renderMonitorAlert(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.alerts,
    subject,
    html,
    apiKey,
  });
}

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderWelcome, renderWelcomeText } = await import("./templates/welcome");
  const html = await renderWelcome(data);
  const text = renderWelcomeText(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.general,
    replyTo: "hello@steadystack.dev",
    subject: "Welcome to SteadyStack - Your Monitors Await",
    html,
    text,
    apiKey,
  });
}

export async function sendVerificationEmail(
  to: string,
  data: VerificationEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderVerification } = await import("./templates/verification");
  const html = await renderVerification(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.verify,
    subject: "Verify Your Email - SteadyStack",
    html,
    apiKey,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderPasswordReset } = await import("./templates/password-reset");
  const html = await renderPasswordReset(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.auth,
    subject: "🔑 Reset Your Password - SteadyStack",
    html,
    apiKey,
  });
}

export async function sendWeeklyDigest(
  to: string,
  data: WeeklyDigestData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderWeeklyDigest } = await import("./templates/weekly-digest");
  const html = await renderWeeklyDigest(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.reports,
    subject: `📊 Weekly Uptime Report - ${data.weekRange}`,
    html,
    apiKey,
  });
}

export async function sendSubscriptionConfirm(
  to: string,
  data: import("./templates/subscription-confirm").SubscriptionConfirmData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderSubscriptionConfirm } = await import("./templates/subscription-confirm");
  const html = await renderSubscriptionConfirm(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.updates,
    subject: `Confirm subscription to ${data.pageTitle}`,
    html,
    apiKey,
  });
}

export async function sendStatusUpdate(
  to: string,
  data: import("./templates/status-update").StatusUpdateData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderStatusUpdate } = await import("./templates/status-update");

  let subjectPrefix = "";
  switch (data.incidentStatus) {
    case "INVESTIGATING":
      subjectPrefix = "⚠️ [Investigating]";
      break;
    case "IDENTIFIED":
      subjectPrefix = "🔍 [Identified]";
      break;
    case "MONITORING":
      subjectPrefix = "👀 [Monitoring]";
      break;
    case "RESOLVED":
      subjectPrefix = "✅ [Resolved]";
      break;
    case "SCHEDULED":
      subjectPrefix = "📅 [Maintenance]";
      break;
    case "IN_PROGRESS":
      subjectPrefix = "🔨 [In Progress]";
      break;
    case "COMPLETED":
      subjectPrefix = "✨ [Completed]";
      break;
  }

  const html = await renderStatusUpdate(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.status,
    subject: `${subjectPrefix} ${data.incidentTitle} - ${data.pageTitle}`,
    html,
    apiKey,
  });
}

export async function sendMonthlyReport(
  to: string,
  pdfBuffer: Buffer,
  monthName: string,
  apiKey?: string,
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    from: EMAIL_SENDERS.reports,
    subject: `📊 Monthly Performance Report - ${monthName}`,
    html: `<p>Please find attached your monthly performance report for <strong>${monthName}</strong>.</p>`,
    attachments: [
      {
        filename: `SteadyStack-Report-${monthName}.pdf`,
        content: pdfBuffer,
      },
    ],
    apiKey,
  });
}

export async function sendUsageLimitWarning(
  to: string,
  data: UsageLimitWarningEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderUsageLimitWarning } = await import("./templates/usage-limit-warning");
  const html = await renderUsageLimitWarning({
    userName: data.userName,
    planName: data.planName,
    warnings: data.warnings,
    upgradeUrl: data.upgradeUrl ?? "https://steadystack.dev/dashboard/settings?tab=billing",
  });

  return sendEmail({
    to,
    from: EMAIL_SENDERS.billing,
    subject: "⚠️ Workspace Plan Usage Warning",
    html,
    apiKey,
  });
}

export async function sendDunningNotice(
  to: string,
  data: DunningNoticeEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderDunningNotice } = await import("./templates/dunning-notice");
  const html = await renderDunningNotice({
    userName: data.userName,
    planName: data.planName,
    amountDue: data.amountDue,
    failureReason: data.failureReason ?? "Card declined",
    billingPortalUrl:
      data.billingPortalUrl ?? "https://steadystack.dev/dashboard/settings?tab=billing",
  });

  return sendEmail({
    to,
    from: EMAIL_SENDERS.billing,
    subject: "⚠️ Payment Failed: Action Required for Your SteadyStack Subscription",
    html,
    apiKey,
  });
}

export async function sendTeamInvitationEmail(
  to: string,
  data: import("./templates/team-invitation").TeamInvitationEmailData,
  apiKey?: string,
): Promise<SendEmailResult> {
  const { renderTeamInvitation } = await import("./templates/team-invitation");
  const html = await renderTeamInvitation(data);

  return sendEmail({
    to,
    from: EMAIL_SENDERS.teams,
    subject: `👋 You've been invited to join ${data.organizationName} on SteadyStack`,
    html,
    apiKey,
  });
}

// ============================================================================
// Service Facade Export
// ============================================================================

export const emailService = {
  send: sendEmail,
  sendAlert: sendMonitorAlert,
  sendWelcome: sendWelcomeEmail,
  sendVerification: sendVerificationEmail,
  sendPasswordReset: sendPasswordResetEmail,
  sendWeeklyDigest: sendWeeklyDigest,
  sendSubscriptionConfirm: sendSubscriptionConfirm,
  sendStatusUpdate: sendStatusUpdate,
  sendMonthlyReport: sendMonthlyReport,
  sendUsageLimitWarning: sendUsageLimitWarning,
  sendDunningNotice: sendDunningNotice,
  sendTeamInvitation: sendTeamInvitationEmail,
  renderPdf: renderPdfToBuffer,
  renderMonthlyReportPdf: renderMonthlyReportToBuffer,
  renderSlaReportPdf: renderSlaReportToBuffer,
  getClient: getResendClient,
};
