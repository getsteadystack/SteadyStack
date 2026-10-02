"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Shield,
  Database,
  Clock,
  Download,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  FileJson,
  Trophy,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import type { PrivacyReport } from "@/actions/privacy";
import { cn } from "@/lib/utils";

export function PrivacyForm() {
  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [anonymizing, setAnonymizing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardBio, setLeaderboardBio] = useState("");
  const [savingLeaderboard, setSavingLeaderboard] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const { getPrivacyReport } = await import("@/actions/privacy");
      const data = await getPrivacyReport();
      setReport(data);
      setShowLeaderboard(data.showOnLeaderboard);
      setLeaderboardBio(data.leaderboardBio);
    } catch {
      toast.error("Failed to load privacy report");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveLeaderboard = async () => {
    setSavingLeaderboard(true);
    try {
      const { updateLeaderboardPrivacy } = await import("@/actions/privacy");
      const result = await updateLeaderboardPrivacy(showLeaderboard, leaderboardBio);
      if (result.success) {
        toast.success("Leaderboard privacy settings saved");
      }
    } catch {
      toast.error("Failed to save leaderboard settings");
    } finally {
      setSavingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleToggleAnonymization = async () => {
    if (!report) return;
    setAnonymizing(true);
    try {
      const { updateAnalyticsAnonymization } = await import("@/actions/privacy");
      const result = await updateAnalyticsAnonymization(!report.anonymizeAnalytics);
      if (result.success) {
        setReport({
          ...report,
          anonymizeAnalytics: result.anonymized,
          dataInventory: report.dataInventory.map((item) =>
            item.category === "Status Page Analytics"
              ? { ...item, anonymized: result.anonymized }
              : item,
          ),
        });
        toast.success(
          result.anonymized
            ? "Status page analytics anonymization enabled"
            : "Status page analytics anonymization disabled",
        );
      }
    } catch {
      toast.error("Failed to update privacy setting");
    } finally {
      setAnonymizing(false);
    }
  };

  const handleExportPersonalData = async () => {
    setExporting(true);
    try {
      const { exportPersonalData } = await import("@/actions/privacy");
      const data = await exportPersonalData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `steadystack-personal-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Personal data exported successfully");
    } catch {
      toast.error("Failed to export personal data");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            Loading intelligence report...
          </span>
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5 text-red-600" />
          <span className="text-xs font-mono text-red-600">Failed to load privacy report</span>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-serif font-medium text-foreground tracking-tight">
          Privacy Intelligence
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed font-mono">
          Full transparency on what data SteadyStack collects, how it is used, and how long it is
          retained. Your uptime metrics belong to you.
        </p>
      </div>

      {/* Account Summary */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-foreground" />
            <h3 className="text-sm font-serif font-medium text-foreground">
              Data Subject Overview
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-border bg-accent/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
                Account
              </span>
              <p className="text-xs font-mono text-foreground mt-1 truncate font-semibold">
                {report.userName}
              </p>
            </div>
            <div className="border border-border bg-accent/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
                Email
              </span>
              <p className="text-xs font-mono text-foreground mt-1 truncate font-semibold">
                {report.userEmail}
              </p>
            </div>
            <div className="border border-border bg-accent/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
                Tier
              </span>
              <p className="text-xs font-mono text-foreground mt-1 font-semibold">{report.tier}</p>
            </div>
            <div className="border border-border bg-accent/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
                Created
              </span>
              <p className="text-xs font-mono text-foreground mt-1 font-semibold">
                {new Date(report.accountCreated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Inventory */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-foreground" />
            <h3 className="text-sm font-serif font-medium text-foreground">Data Inventory</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {report.totalMonitors} monitors &bull; {report.totalEvents.toLocaleString()} events
            &bull; {report.totalIncidents} incidents &bull; {report.totalStatusPages} status pages
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left py-3 px-3 text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
                    Category
                  </th>
                  <th className="text-left py-3 px-3 text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
                    Description
                  </th>
                  <th className="text-left py-3 px-3 text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
                    Retention
                  </th>
                  <th className="text-left py-3 px-3 text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
                    Purpose
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
                    Control
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {report.dataInventory.map((item) => (
                  <tr key={item.category} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-3 text-foreground font-semibold text-xs">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px] max-w-[200px] leading-relaxed">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px]">
                      {item.retention}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px] max-w-[160px] leading-relaxed">
                      {item.purpose}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.canAnonymize ? (
                        <button
                          onClick={handleToggleAnonymization}
                          disabled={anonymizing}
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all font-mono",
                            item.anonymized
                              ? "bg-foreground text-background border-foreground"
                              : "bg-accent text-muted-foreground border-border hover:text-foreground",
                            anonymizing ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                          )}
                        >
                          {anonymizing ? (
                            <Loader2 className="size-2.5 animate-spin inline mr-1" />
                          ) : null}
                          {item.anonymized ? "ANONYMIZED" : "RAW"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Privacy Controls */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-foreground" />
            <h3 className="text-sm font-serif font-medium text-foreground">Privacy Controls</h3>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border border-border p-4 bg-accent/20 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold font-mono text-foreground">
                Status Page Analytics Anonymization
              </span>
              <span className="text-[11px] text-muted-foreground font-mono leading-relaxed max-w-lg">
                When enabled, visitor IP addresses are hashed with a salt before storage. No raw IPs
                are retained in analytics. Recommended for GDPR compliance.
              </span>
            </div>
            <button
              onClick={handleToggleAnonymization}
              disabled={anonymizing}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                report.anonymizeAnalytics ? "bg-foreground" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 rounded-full bg-background shadow-sm transition-transform duration-200",
                  report.anonymizeAnalytics ? "translate-x-[24px]" : "translate-x-[4px]",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border border-border p-4 bg-accent/20 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold font-mono text-foreground">
                Export Personal Data
              </span>
              <span className="text-[11px] text-muted-foreground font-mono leading-relaxed max-w-lg">
                Download a complete archive of all personal data associated with your account,
                formatted as JSON. Includes account details, monitors, events, incidents, and
                notification configurations.
              </span>
            </div>
            <button
              onClick={handleExportPersonalData}
              disabled={exporting}
              className="bg-card hover:bg-accent text-foreground text-xs font-semibold px-3.5 py-2 border border-border rounded-xl transition-all font-mono flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {exporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <FileJson className="size-3.5 text-muted-foreground" />
              )}
              {exporting ? "Exporting..." : "Export JSON"}
            </button>
          </div>
        </div>
      </section>

      {/* Data Handling Principles */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-foreground" />
            <h3 className="text-sm font-serif font-medium text-foreground">
              Data Processing Principles
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-accent/20 rounded-xl p-4 flex gap-3">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold font-mono text-foreground block">
                  Data Minimization
                </span>
                <span className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                  SteadyStack collects only the data necessary to perform monitoring and alerting.
                  No superfluous tracking, telemetry, or behavioral analytics.
                </span>
              </div>
            </div>
            <div className="border border-border bg-accent/20 rounded-xl p-4 flex gap-3">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold font-mono text-foreground block">
                  Purpose Limitation
                </span>
                <span className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                  Data is used exclusively for the purpose it was collected: monitoring your
                  services. Your uptime metrics are never sold, shared, or used for advertising.
                </span>
              </div>
            </div>
            <div className="border border-border bg-accent/20 rounded-xl p-4 flex gap-3">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold font-mono text-foreground block">
                  Data Portability
                </span>
                <span className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                  Export your data at any time in open JSON format. We provide zero-vendor-lock-in
                  guarantees with multi-format migration tools.
                </span>
              </div>
            </div>
            <div className="border border-border bg-accent/20 rounded-xl p-4 flex gap-3">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold font-mono text-foreground block">
                  Right to Deletion
                </span>
                <span className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                  Delete your account and all associated data at any time from the General settings
                  tab. Data is permanently purged with no residual copies.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LeaderboardSection
        show={showLeaderboard}
        onChangeShow={setShowLeaderboard}
        bio={leaderboardBio}
        onChangeBio={setLeaderboardBio}
        onSave={handleSaveLeaderboard}
        saving={savingLeaderboard}
      />
    </div>
  );
}

function LeaderboardSection({
  show,
  onChangeShow,
  bio,
  onChangeBio,
  onSave,
  saving,
}: {
  show: boolean;
  onChangeShow: (val: boolean) => void;
  bio: string;
  onChangeBio: (val: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <h3 className="text-sm font-serif font-medium text-foreground">Community Leaderboard</h3>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between border border-border p-4 bg-accent/20 rounded-xl">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold font-mono text-foreground">
              Show on Leaderboard (Opt-In)
            </span>
            <span className="text-[11px] text-muted-foreground font-mono leading-relaxed max-w-lg">
              Toggle this setting to feature your name, avatar, and monitor uptime percentage on the
              public Hall of Fame. Enabling this is required to participate.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChangeShow(!show)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer",
              show ? "bg-foreground" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "inline-block size-4 rounded-full bg-background shadow-sm transition-transform duration-200",
                show ? "translate-x-[24px]" : "translate-x-[4px]",
              )}
            />
          </button>
        </div>

        {/* Bio Text Input */}
        {show && (
          <div className="border border-border p-4 bg-accent/20 rounded-xl space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                Leaderboard Biography
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">
                A brief description about you or your stack. Shown next to your ranking on the Hall
                of Fame.
              </span>
            </div>
            <textarea
              placeholder="e.g. Indie developer monitoring 10 side-projects with SteadyStack..."
              rows={2}
              maxLength={150}
              className="w-full p-3 rounded-xl bg-background border border-border font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground/40"
              value={bio}
              onChange={(e) => onChangeBio(e.target.value)}
            />
            <div className="text-[10px] font-mono text-right text-muted-foreground">
              {bio.length}/150 characters
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-9 px-5 bg-foreground hover:bg-foreground/90 text-background font-mono font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center justify-center rounded-xl cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-3 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="size-3 mr-2" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
