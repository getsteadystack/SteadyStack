"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Trophy,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { updateLeaderboardPrivacy } from "@/actions/privacy";
import { toast } from "@/components/ui/sonner";

interface ShowcaseSubmitPanelProps {
  /** Slug of the status page — used to build the badge embed URL */
  pageSlug: string;
  /** Referral code of the status page owner */
  referralCode?: string;
  /** Whether the user is already opted in to the Hall of Fame */
  defaultOptedIn?: boolean;
  /** Existing leaderboard bio */
  defaultBio?: string;
}

function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), resetMs);
  }
  return { copied, copy };
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="relative group">
        <pre className="bg-muted/40 border border-border rounded-xl p-3 pr-10 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          {code}
        </pre>
        <button
          type="button"
          onClick={() => copy(code)}
          className="absolute top-2 right-2 p-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-all opacity-0 group-hover:opacity-100 shadow-2xs cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ShowcaseSubmitPanel({
  pageSlug,
  referralCode,
  defaultOptedIn = false,
  defaultBio = "",
}: ShowcaseSubmitPanelProps) {
  const [optedIn, setOptedIn] = useState(defaultOptedIn);
  const [bio, setBio] = useState(defaultBio);
  const [badgeExpanded, setBadgeExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Keep local state in sync with parent prop changes (e.g. after page reload)
  useEffect(() => {
    setOptedIn(defaultOptedIn);
    setBio(defaultBio);
  }, [defaultOptedIn, defaultBio]);

  function handleToggleOptIn() {
    const next = !optedIn;
    startTransition(async () => {
      try {
        await updateLeaderboardPrivacy(next, bio);
        setOptedIn(next);
        toast.success(
          next ? "You're now listed on the Hall of Fame!" : "Removed from Hall of Fame.",
        );
      } catch {
        toast.error("Failed to update Hall of Fame settings.");
      }
    });
  }

  function handleBioSave() {
    startTransition(async () => {
      try {
        await updateLeaderboardPrivacy(optedIn, bio);
        toast.success("Bio saved.");
      } catch {
        toast.error("Failed to save bio.");
      }
    });
  }

  // Badge embed strings
  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "https://app.steadystack.dev";

  const badgeUrl = `${appUrl}/api/badge/powered-by?theme=dark&style=flat&size=sm`;
  const statusBadgeUrl = `${appUrl}/api/badge/${pageSlug}?theme=dark&style=flat`;
  const trackedBadgeLink = referralCode
    ? `${appUrl}/r/${referralCode}?utm_source=badge_embed&utm_medium=readme&utm_campaign=status_page_loop&utm_content=${pageSlug}`
    : `${appUrl}/signup?utm_source=badge_embed&utm_medium=readme&utm_campaign=status_page_loop&utm_content=${pageSlug}`;
  const trackedStatusPageUrl = `${appUrl}/status-page/${pageSlug}?utm_source=status_badge&utm_medium=embed&utm_campaign=status_page_loop`;

  const markdownPowered = `[![Powered by SteadyStack](${badgeUrl})](${trackedBadgeLink})`;
  const htmlPowered = `<a href="${trackedBadgeLink}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="Powered by SteadyStack" />\n</a>`;
  const markdownStatus = `[![Status](${statusBadgeUrl})](${trackedStatusPageUrl})`;
  const htmlStatus = `<a href="${trackedStatusPageUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${statusBadgeUrl}" alt="Status" />\n</a>`;

  return (
    <div className="space-y-4">
      {/* Hall of Fame Opt-in */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-base font-serif font-medium text-foreground flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          Hall of Fame
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Opt this status page into the public Hall of Fame. Your weighted SLA across all monitors
          will be ranked against the community. Only accounts with 100+ checks qualify.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Show on Hall of Fame Leaderboard
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your name, uptime %, and monitor count will be visible publicly.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleOptIn}
            disabled={isPending}
            className={`relative w-11 h-6 rounded-full border transition-all flex items-center shrink-0 cursor-pointer ${
              optedIn ? "bg-foreground border-foreground shadow-2xs" : "bg-muted border-border"
            }`}
            aria-pressed={optedIn}
            aria-label="Toggle Hall of Fame opt-in"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <span
                className={`absolute size-4.5 rounded-full bg-background transition-transform shadow-2xs ${
                  optedIn ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            )}
          </button>
        </div>

        {/* Bio */}
        {optedIn && (
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Leaderboard Bio{" "}
              <span className="text-muted-foreground/60 normal-case tracking-normal font-normal">
                (optional — shown under your name)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={120}
                placeholder="e.g. Founder of Acme SaaS — 99.99% SLA since 2023"
                className="flex-1 bg-background border border-border p-2.5 rounded-xl text-xs focus:border-foreground/40 outline-none transition-colors shadow-2xs text-foreground"
              />
              <button
                type="button"
                onClick={handleBioSave}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider font-mono bg-foreground text-background hover:bg-foreground/90 transition-all rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {bio.length}/120 characters
            </p>
          </div>
        )}

        <a
          href="/hall-of-fame"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="size-3.5" />
          View Hall of Fame →
        </a>
      </div>

      {/* Powered by SteadyStack Badge */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setBadgeExpanded((v) => !v)}
          className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <h3 className="text-base font-serif font-medium text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-foreground" />
            "Powered by SteadyStack" Badge
          </h3>
          {badgeExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {badgeExpanded && (
          <div className="px-6 pb-6 space-y-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add these badges to your README, website, or docs to show your infrastructure is
              monitored by SteadyStack. Click any badge to copy the embed code.
            </p>

            {/* Live previews */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                Badge Preview
              </p>
              <div className="flex flex-wrap gap-3 items-center bg-muted/30 border border-border rounded-xl p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${badgeUrl}`} alt="Powered by SteadyStack" className="h-5" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${badgeUrl}&style=outline`}
                  alt="Powered by SteadyStack outline"
                  className="h-5"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${badgeUrl}&size=lg`}
                  alt="Powered by SteadyStack large"
                  className="h-8"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${statusBadgeUrl}`} alt="Status" className="h-5" />
              </div>
            </div>

            {/* Embed codes */}
            <div className="grid gap-4">
              <CodeBlock label="Powered by SteadyStack — Markdown" code={markdownPowered} />
              <CodeBlock label="Powered by SteadyStack — HTML" code={htmlPowered} />
              <CodeBlock label="Live Status Badge — Markdown" code={markdownStatus} />
              <CodeBlock label="Live Status Badge — HTML" code={htmlStatus} />
            </div>

            {/* Style variants reference */}
            <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-1.5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Customise via URL params
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-muted-foreground">
                <span>
                  <span className="text-foreground font-semibold">theme</span>=dark|light
                </span>
                <span>
                  <span className="text-foreground font-semibold">style</span>=flat|outline
                </span>
                <span>
                  <span className="text-foreground font-semibold">size</span>=sm|lg
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
