"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  MousePointer,
  Users,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Repeat,
  Share2,
} from "lucide-react";
import { getStatusPageLoopMetrics } from "@/actions/referrals";
import { toast } from "@/components/ui/sonner";

interface StatusPageLoopCardProps {
  pageId: string;
  pageSlug: string;
  onNavigateToShowcase?: () => void;
}

export function StatusPageLoopCard({
  pageId,
  pageSlug,
  onNavigateToShowcase,
}: StatusPageLoopCardProps) {
  const [copied, setCopied] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["status-page-loop-metrics", pageId, pageSlug],
    queryFn: () => getStatusPageLoopMetrics(pageId, pageSlug),
  });

  const handleCopyLink = () => {
    if (!metrics?.referralUrl) return;
    navigator.clipboard.writeText(metrics.referralUrl);
    setCopied(true);
    toast.success("Tracked referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = metrics?.referralUrl || "";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-muted border border-border text-foreground">
              <Repeat className="size-4" />
            </div>
            <h3 className="text-base font-serif font-medium text-foreground flex items-center gap-2">
              The Status Page Loop
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Active Channel
              </span>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every public visitor sees the{" "}
            <strong className="text-foreground font-medium">"Powered by SteadyStack"</strong> badge.
            Badge discovery compounds as traffic increases — all clicks and referred accounts are
            attributed directly to you.
          </p>
        </div>

        {onNavigateToShowcase && (
          <button
            type="button"
            onClick={onNavigateToShowcase}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/60 text-foreground text-xs font-semibold uppercase tracking-wider font-mono transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            Embed Badges
          </button>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-border rounded-xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-mono uppercase tracking-wider">Impressions</span>
            <Eye className="size-3.5 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground">
            {isLoading ? "..." : (metrics?.statusPageViews ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Status page views</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-mono uppercase tracking-wider">Badge Clicks</span>
            <MousePointer className="size-3.5 text-foreground" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground">
            {isLoading ? "..." : (metrics?.referralClicks ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Tracked badge hits</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-mono uppercase tracking-wider">Loop Signups</span>
            <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : (metrics?.totalSignups ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Converted accounts</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-mono uppercase tracking-wider">Conversion</span>
            <TrendingUp className="size-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : `${metrics?.conversionRate ?? 0}%`}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Signups / views</p>
        </div>
      </div>

      {/* Tracked Link Section */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Share2 className="size-3 text-muted-foreground" />
            Tracked Referral Endpoint (Auto-linked in footer badge)
          </label>
          {metrics?.referralCode && (
            <span className="text-[11px] font-mono text-foreground font-semibold">
              Code: {metrics.referralCode}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl || "Loading tracked referral link..."}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none select-all shadow-2xs"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!referralUrl}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-foreground text-background font-mono font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-foreground/90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>

            {referralUrl && (
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-border bg-background hover:bg-muted/60 rounded-xl text-muted-foreground hover:text-foreground transition-all shadow-2xs"
                title="Test referral link"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
