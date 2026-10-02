"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Copy,
  Loader2,
  Award,
  Filter,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  approveDesignPartnerApplication,
  rejectDesignPartnerApplication,
  generatePartnerRenewalDiscount,
  syncPartnerToStripe,
  syncAllPartnersToStripe,
} from "@/actions/design-partners";
import type { DesignPartnerRecord } from "@/actions/design-partners";
import { grantSelfAdminAccess } from "@/actions/admin";

export default function AdminDesignPartnersClient({
  initialApplications,
  isAdmin: initialIsAdmin = false,
}: {
  initialApplications: DesignPartnerRecord[];
  isAdmin?: boolean;
}) {
  const [isAdminState, setIsAdminState] = useState(initialIsAdmin);
  const [grantingAdmin, setGrantingAdmin] = useState(false);
  const [applications, setApplications] = useState<DesignPartnerRecord[]>(initialApplications);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [syncingStripeId, setSyncingStripeId] = useState<string | null>(null);
  const [batchSyncing, setBatchSyncing] = useState(false);
  const [generatingRenewalId, setGeneratingRenewalId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSyncStripe = async (id: string) => {
    try {
      setSyncingStripeId(id);
      const res = await syncPartnerToStripe(id);
      if (res.success) {
        toast.success(
          res.isMock
            ? "Stripe is in mock/dev mode (no live secret key). Code saved locally."
            : "Successfully synced Coupon & Promotion Code to Stripe!",
        );
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, stripeSynced: !res.isMock } : app)),
        );
      } else {
        toast.error(res.error || "Failed to sync to Stripe");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync to Stripe");
    } finally {
      setSyncingStripeId(null);
    }
  };

  const handleSyncAllStripe = async () => {
    try {
      setBatchSyncing(true);
      const res = await syncAllPartnersToStripe();
      if (res.success) {
        toast.success(
          `Batch sync complete! ${res.syncedCount} partner coupons synced to Stripe (${res.failedCount} failed).`,
        );
        setApplications((prev) =>
          prev.map((app) => (app.status === "APPROVED" ? { ...app, stripeSynced: true } : app)),
        );
      } else {
        toast.error(res.error || "Failed to batch sync to Stripe");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to batch sync to Stripe");
    } finally {
      setBatchSyncing(false);
    }
  };

  const handleGrantAdmin = async () => {
    setGrantingAdmin(true);
    const res = await grantSelfAdminAccess();
    setGrantingAdmin(false);

    if (res.success) {
      setIsAdminState(true);
      toast.success(
        "ADMIN tier granted to your account! You can now review and approve partnerships.",
      );
    } else {
      toast.error(res.error || "Failed to grant admin access");
    }
  };

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;
  const remainingSpots = Math.max(1, 15 - approvedCount);

  const filteredApplications = applications.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const res = await approveDesignPartnerApplication(id);
    setProcessingId(null);

    if (res.success) {
      toast.success(`Partnership APPROVED! Generated & Synced VIP Code: ${res.vipCode}`);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: "APPROVED",
                vipCode: res.vipCode,
                stripeSynced: true,
              }
            : app,
        ),
      );
    } else {
      toast.error(res.error || "Failed to approve application");
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const res = await rejectDesignPartnerApplication(id);
    setProcessingId(null);

    if (res.success) {
      toast.info("Application set to REJECTED");
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: "REJECTED" } : app)),
      );
    } else {
      toast.error(res.error || "Failed to reject application");
    }
  };

  const handleGenerateRenewal = async (id: string, percentOff: number = 50) => {
    setGeneratingRenewalId(id);
    const res = await generatePartnerRenewalDiscount(id, percentOff);
    setGeneratingRenewalId(null);

    if (res.success && res.discountCode) {
      toast.success(`Created Stripe ${percentOff}% Renewal Discount Code: ${res.discountCode}`);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                renewalDiscountCode: res.discountCode,
                renewalDiscountPercent: percentOff,
              }
            : app,
        ),
      );
    } else {
      toast.error(res.error || "Failed to generate renewal discount code");
    }
  };

  const handleCopyCode = (code: string, label: string = "Code") => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Award className="size-3" />
            Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Design Partner Applications
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review, approve, or reject applicants for the 1-Year Free Agency Plan partnership, with
            automated Stripe SDK promotion codes.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-foreground font-bold">{remainingSpots} of 15 spots remaining</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
            Total Received
          </span>
          <span className="text-2xl font-bold text-foreground">{applications.length}</span>
        </div>
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
            Needs Review
          </span>
          <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
        </div>
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
            Approved Partners
          </span>
          <span className="text-2xl font-bold text-emerald-400">{approvedCount}</span>
        </div>
        <div className="bg-card border border-red-500/30 bg-red-500/5 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-red-400">Rejected</span>
          <span className="text-2xl font-bold text-red-400">{rejectedCount}</span>
        </div>
      </div>

      {/* Admin Privilege Guard */}
      {!isAdminState && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Admin Mode Required</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You are currently viewing as a standard operator. Grant your current session ADMIN
                privileges to approve/reject applications and generate Stripe promo codes.
              </p>
            </div>
          </div>
          <button
            onClick={handleGrantAdmin}
            disabled={grantingAdmin}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {grantingAdmin ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            Elevate to ADMIN
          </button>
        </div>
      )}

      {/* Filter Tabs & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground mr-1" />
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {approvedCount > 0 && (
          <button
            onClick={handleSyncAllStripe}
            disabled={batchSyncing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            title="Sync all approved partner VIP promo codes into Stripe"
          >
            {batchSyncing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Sync All Approved to Stripe
          </button>
        )}
      </div>

      {/* Application List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-2xl">
          <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No applications found</p>
          <p className="text-xs text-muted-foreground mt-1">
            No design partner submissions match the "{filter}" filter.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border/80 transition-all"
            >
              <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{app.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{app.email}</span>

                  {app.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Clock className="size-3" /> PENDING
                    </span>
                  )}
                  {app.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 className="size-3" /> APPROVED
                    </span>
                  )}
                  {app.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400">
                      <XCircle className="size-3" /> REJECTED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Company: <strong className="text-foreground">{app.company}</strong>
                  </span>
                  <span>
                    Endpoints:{" "}
                    <strong className="text-foreground font-mono">{app.monitorsCount}</strong>
                  </span>
                  <span>
                    Current Tool: <strong className="text-foreground">{app.currentTool}</strong>
                  </span>
                  {app.techStack && (
                    <span>
                      Stack: <strong className="text-foreground">{app.techStack}</strong>
                    </span>
                  )}
                  {app.socialHandle && (
                    <span>
                      Spotlight Handle:{" "}
                      <strong className="text-foreground font-mono">{app.socialHandle}</strong>
                    </span>
                  )}
                </div>

                {app.painPoint && (
                  <p className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-2.5 mt-1 italic">
                    "{app.painPoint}"
                  </p>
                )}

                {app.website && (
                  <a
                    href={app.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono w-fit mt-0.5"
                  >
                    {app.website} <ExternalLink className="size-3" />
                  </a>
                )}

                {app.status === "APPROVED" && (
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* VIP 1-Year Code */}
                    {app.vipCode && (
                      <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-flex items-center gap-2.5">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          VIP 100% Promo:
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {app.vipCode}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            app.stripeSynced
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {app.stripeSynced ? "Stripe Synced" : "Unsynced"}
                        </span>
                        <button
                          onClick={() => handleCopyCode(app.vipCode!, "VIP Code")}
                          className="p-1 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                          title="Copy VIP Code"
                        >
                          {copiedCode === app.vipCode ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSyncStripe(app.id)}
                          disabled={syncingStripeId === app.id}
                          className="p-1 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer disabled:opacity-50"
                          title="Sync/Re-sync Coupon to Stripe"
                        >
                          {syncingStripeId === app.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="size-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Post-Year Renewal Discount Code */}
                    {app.renewalDiscountCode ? (
                      <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg inline-flex items-center gap-2.5">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          Year-2 Renewal ({app.renewalDiscountPercent || 50}% Off):
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {app.renewalDiscountCode}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyCode(app.renewalDiscountCode!, "Renewal Discount Code")
                          }
                          className="p-1 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
                          title="Copy Renewal Code"
                        >
                          {copiedCode === app.renewalDiscountCode ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateRenewal(app.id, 50)}
                        disabled={generatingRenewalId === app.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono text-[11px] font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                        title="Generate 50% off renewal discount code in Stripe for this partner"
                      >
                        {generatingRenewalId === app.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Sparkles className="size-3" />
                        )}
                        Issue 50% Renewal Code
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {app.status !== "APPROVED" && (
                  <button
                    onClick={() => handleApprove(app.id)}
                    disabled={processingId === app.id}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {processingId === app.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="size-3.5" /> Approve Partnership
                      </>
                    )}
                  </button>
                )}

                {app.status !== "REJECTED" && (
                  <button
                    onClick={() => handleReject(app.id)}
                    disabled={processingId === app.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-muted-foreground font-bold text-xs hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
