"use client";

import { useState } from "react";
import { FileText, Send, Download, Loader2, Check, Calendar } from "lucide-react";
import { updateClientReportSettings, sendClientReportEmailAction } from "@/actions/client-reports";
import { toast } from "@/components/ui/sonner";

interface MonthlyReportPanelProps {
  clientId: string;
  clientName?: string;
  clientColor?: string;
  contactEmail?: string | null;
  initialSettings: {
    emailReportsEnabled: boolean;
    reportRecipientEmails?: string | null;
    reportTargetSla: number;
    lastReportSentAt?: Date | string | null;
  };
}

export function MonthlyReportPanel({
  clientId,
  contactEmail,
  initialSettings,
}: MonthlyReportPanelProps) {
  const [enabled, setEnabled] = useState(initialSettings.emailReportsEnabled);
  const [recipientEmails, setRecipientEmails] = useState(
    initialSettings.reportRecipientEmails || "",
  );
  const [targetSla, setTargetSla] = useState<number>(initialSettings.reportTargetSla || 99.9);
  const [lastSent, setLastSent] = useState<Date | string | null>(
    initialSettings.lastReportSentAt || null,
  );

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [customTestEmail, setCustomTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);

  const defaultRecipient = contactEmail || "account owner";

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await updateClientReportSettings(clientId, {
        emailReportsEnabled: Boolean(enabled),
        reportRecipientEmails: recipientEmails.trim() || null,
        reportTargetSla: Number(targetSla) || 99.9,
      });

      if (res?.success) {
        toast.success("Report delivery settings saved");
      } else {
        toast.error(res?.error || "Failed to save settings");
      }
    } catch (err: any) {
      console.error("[handleSaveSettings] Error:", err);
      toast.error(err?.message || "Unexpected error saving report settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async (recipient?: string) => {
    setSending(true);
    try {
      const res = await sendClientReportEmailAction({
        clientId,
        customRecipient: recipient,
        isTest: Boolean(recipient),
      });

      if (res.success && res.recipients) {
        toast.success(`Report successfully sent to: ${res.recipients.join(", ")}`);
        setLastSent(new Date());
        setShowTestModal(false);
        setCustomTestEmail("");
      } else {
        toast.error(res.error || "Failed to send report");
      }
    } catch {
      toast.error("An error occurred while sending the report email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-5 py-4 border-t border-border/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Monthly SLA Reports
          </span>
        </div>
        {enabled ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AUTO-MONTHLY ON 1ST
          </span>
        ) : (
          <span className="text-[10px] font-mono text-muted-foreground/70 bg-muted/20 px-2 py-0.5 border border-border/30">
            ON-DEMAND ONLY
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Toggle & Settings Form */}
        <div className="flex flex-col gap-3 bg-muted/10 border border-border/40 p-3.5">
          {/* Enable toggle */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 size-4 accent-primary rounded cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Automatic monthly PDF delivery
              </span>
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                Sends a branded SLA uptime and incident audit PDF to the client and your agency on
                the 1st of every month.
              </span>
            </div>
          </label>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/30">
            {/* Recipient Emails */}
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Report Recipients (comma-separated)
              </label>
              <input
                type="text"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                placeholder={
                  contactEmail ? `Default: ${contactEmail}` : "client@company.com, team@company.com"
                }
                className="bg-background/80 border border-border/60 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
              />
              <span className="text-[10px] text-muted-foreground/70">
                {recipientEmails ? "Custom recipients configured" : `Fallback: ${defaultRecipient}`}
              </span>
            </div>

            {/* Target SLA */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Target SLA (%)
              </label>
              <select
                aria-label="Target SLA"
                value={targetSla}
                onChange={(e) => setTargetSla(Number(e.target.value))}
                className="bg-background/80 border border-border/60 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value={99.0}>99.0% SLA</option>
                <option value={99.5}>99.5% SLA</option>
                <option value={99.9}>99.9% SLA (Standard)</option>
                <option value={99.95}>99.95% SLA</option>
                <option value={99.99}>99.99% SLA (Four Nines)</option>
              </select>
              <span className="text-[10px] text-muted-foreground/70">
                Threshold for audit pass/fail
              </span>
            </div>
          </div>

          {/* Save settings button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-3 py-1 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
              Save Delivery Settings
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {/* Preview PDF */}
            <a
              href={`/api/reports/client-pdf?clientId=${clientId}&range=30d`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/70 hover:border-border text-foreground text-xs font-mono transition-colors"
              title="Preview generated PDF in browser"
            >
              <Download className="size-3 text-muted-foreground" />
              Preview 30-Day PDF
            </a>

            {/* Send Report Now */}
            <button
              onClick={() => handleSendNow()}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
              title="Send report now to configured recipients"
            >
              {sending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              Send Report Now
            </button>

            {/* Send Test to custom email */}
            <button
              onClick={() => setShowTestModal((p) => !p)}
              className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Send test email...
            </button>
          </div>

          {/* Last sent date */}
          {lastSent && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <Calendar className="size-3 text-muted-foreground/60" />
              <span>Last sent: {new Date(lastSent).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Test Email Input Box (Toggleable) */}
        {showTestModal && (
          <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border/50">
            <input
              type="email"
              placeholder="Enter test recipient email..."
              value={customTestEmail}
              onChange={(e) => setCustomTestEmail(e.target.value)}
              className="flex-1 bg-background border border-border/60 px-3 py-1 text-xs font-mono focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSendNow(customTestEmail)}
              disabled={!customTestEmail.trim() || sending}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              {sending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              Send Test
            </button>
            <button
              onClick={() => setShowTestModal(false)}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
