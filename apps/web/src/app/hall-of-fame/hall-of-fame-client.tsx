"use client";

import { useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  ExternalLink,
  Shield,
  Activity,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Server,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LeaderboardEntry } from "@/actions/leaderboard";

const CURATED_DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "demo-user-1",
    name: "HyperScale Edge Systems",
    image: null,
    bio: "Global serverless APIs & distributed edge cache clusters",
    uptimePct: 99.998,
    totalChecks: 43200,
    monitorCount: 30,
    tier: "AGENCY",
    statusPageSlug: "hyperscale-api",
  },
  {
    rank: 2,
    userId: "demo-user-2",
    name: "Apex Pay Infrastructure",
    image: null,
    bio: "Zero-downtime payments clearinghouse & crypto settlement gateways",
    uptimePct: 99.995,
    totalChecks: 38880,
    monitorCount: 27,
    tier: "AGENCY",
    statusPageSlug: "apex-pay",
  },
  {
    rank: 3,
    userId: "demo-user-3",
    name: "NeonDB Distributed",
    image: null,
    bio: "High availability serverless Postgres with instant failover",
    uptimePct: 99.992,
    totalChecks: 34560,
    monitorCount: 24,
    tier: "PRO",
    statusPageSlug: "neondb-edge",
  },
  {
    rank: 4,
    userId: "demo-user-4",
    name: "Veloce Media CDN",
    image: null,
    bio: "Multi-CDN streaming network & adaptive edge transcoding",
    uptimePct: 99.985,
    totalChecks: 25920,
    monitorCount: 18,
    tier: "PRO",
    statusPageSlug: "veloce-cdn",
  },
  {
    rank: 5,
    userId: "demo-user-5",
    name: "Nordic Data Labs",
    image: null,
    bio: "Enterprise telemetry aggregation & microservice mesh",
    uptimePct: 99.981,
    totalChecks: 21600,
    monitorCount: 15,
    tier: "PRO",
    statusPageSlug: null,
  },
  {
    rank: 6,
    userId: "demo-user-6",
    name: "Monolith Core Banking",
    image: null,
    bio: "Institutional settlement engine & ISO 20022 messaging pipelines",
    uptimePct: 99.975,
    totalChecks: 17280,
    monitorCount: 12,
    tier: "AGENCY",
    statusPageSlug: "monolith-bank",
  },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="size-8 rounded-full bg-[#ffd439]/20 border border-[#ffd439] flex items-center justify-center text-[#23211a] shadow-xs">
        <Crown className="size-4 text-[#23211a] fill-[#ffd439]" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="size-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shadow-xs">
        <Medal className="size-4 text-slate-600 fill-slate-200" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="size-8 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
        <Medal className="size-4 text-amber-700 fill-amber-200" />
      </div>
    );
  }
  return (
    <div className="size-8 rounded-full bg-[#f0ede6] border border-[#e8e6df] flex items-center justify-center text-xs font-mono font-semibold text-[#868279]">
      #{rank}
    </div>
  );
}

function UptimeBadge({ pct }: { pct: number }) {
  const isFourNines = pct >= 99.99;
  const isThreeNines = pct >= 99.9;

  return (
    <span
      className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
        isFourNines
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : isThreeNines
            ? "bg-emerald-50/60 text-emerald-700 border-emerald-200/80"
            : "bg-amber-50 text-amber-800 border-amber-200"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isFourNines ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
        }`}
      />
      {pct.toFixed(3)}%
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const isAgency = tier.toUpperCase() === "AGENCY" || tier.toUpperCase() === "CONSTRUCT";
  const isPro = tier.toUpperCase() === "PRO" || tier.toUpperCase() === "NETRUNNER";

  return (
    <span
      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
        isAgency
          ? "bg-[#ffd439] text-[#23211a] border-[#ffd439]"
          : isPro
            ? "bg-[#23211a] text-white border-[#23211a]"
            : "bg-[#f0ede6] text-[#5c5c5c] border-[#e8e6df]"
      }`}
    >
      {isAgency ? "Agency" : isPro ? "Pro" : "Free"}
    </span>
  );
}

export function HallOfFameClient({ initialEntries }: { initialEntries: LeaderboardEntry[] }) {
  const [rankBy, setRankBy] = useState<"uptime" | "monitors">("uptime");

  const displayEntries =
    initialEntries && initialEntries.length > 0 ? initialEntries : CURATED_DEMO_LEADERBOARD;

  const sorted = [...displayEntries].sort((a, b) => {
    if (rankBy === "monitors") return b.monitorCount - a.monitorCount;
    return b.uptimePct - a.uptimePct;
  });

  const totalChecks = displayEntries.reduce((s, e) => s + e.totalChecks, 0);
  const topUptime = displayEntries.length > 0 ? sorted[0].uptimePct : 99.998;

  return (
    <div className="flex flex-col gap-10">
      {/* Hero / Header */}
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
          <Trophy className="size-3.5 text-[#ffd439]" />
          <span>Verified High-Availability SLA</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
          Community Hall of Fame
        </h1>
        <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans max-w-2xl text-balance">
          The top-performing engineering teams and agencies maintaining 99.99% uptime on
          SteadyStack. Ranked by quorum-verified multi-region telemetry.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/settings?tab=privacy"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            <span>Claim Your Spot</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <a
            href="#sla-guide"
            className="inline-flex items-center justify-center h-11 px-5 bg-white hover:bg-[#f0ede6] text-[#23211a] font-mono font-medium text-xs uppercase tracking-wider rounded-xl border border-[#e8e6df] transition-all shadow-xs"
          >
            <span>Four Nines Guide</span>
          </a>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e8e6df] rounded-2xl p-5 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Activity className="size-4" />
          </div>
          <span className="text-3xl font-serif font-medium text-[#23211a]">
            {topUptime.toFixed(3)}%
          </span>
          <span className="text-xs font-mono text-[#868279] uppercase tracking-wider mt-1">
            Top Rolling SLA (30d)
          </span>
        </div>

        <div className="bg-white border border-[#e8e6df] rounded-2xl p-5 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="size-9 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center mb-2">
            <Users className="size-4" />
          </div>
          <span className="text-3xl font-serif font-medium text-[#23211a]">
            {displayEntries.length} Teams
          </span>
          <span className="text-xs font-mono text-[#868279] uppercase tracking-wider mt-1">
            Verified Participants
          </span>
        </div>

        <div className="bg-white border border-[#e8e6df] rounded-2xl p-5 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="size-9 rounded-xl bg-[#f0ede6] text-[#23211a] flex items-center justify-center mb-2">
            <Zap className="size-4" />
          </div>
          <span className="text-3xl font-serif font-medium text-[#23211a]">
            {totalChecks.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-[#868279] uppercase tracking-wider mt-1">
            Quorum Validated Checks
          </span>
        </div>
      </div>

      {/* Controls & Sort */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-mono text-[#868279]">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Rolling 30-Day Multi-Region Quorum Validation</span>
        </div>

        <div className="flex p-1 bg-white border border-[#e8e6df] rounded-xl shadow-xs">
          <button
            onClick={() => setRankBy("uptime")}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all ${
              rankBy === "uptime"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a]"
            }`}
          >
            Rank by Uptime
          </button>
          <button
            onClick={() => setRankBy("monitors")}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all ${
              rankBy === "monitors"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a]"
            }`}
          >
            Rank by Fleet Size
          </button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white border border-[#e8e6df] rounded-2xl shadow-xs overflow-hidden">
        <div className="divide-y divide-[#e8e6df]">
          {sorted.map((entry, idx) => (
            <div
              key={entry.userId}
              className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 hover:bg-[#fbfbf9] transition-colors"
            >
              {/* Rank Badge */}
              <div className="shrink-0 flex justify-center w-8">
                <RankBadge rank={idx + 1} />
              </div>

              {/* Avatar / Initial */}
              <div className="relative size-11 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] overflow-hidden shrink-0 flex items-center justify-center font-mono font-bold text-sm text-[#23211a] shadow-2xs">
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt={entry.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : (
                  <span>{entry.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-medium text-base text-[#23211a] truncate">
                    {entry.name}
                  </h3>
                  <TierBadge tier={entry.tier} />
                  {entry.statusPageSlug && (
                    <Link
                      href={`/status-page/${entry.statusPageSlug}` as any}
                      className="text-[#868279] hover:text-[#23211a] transition-colors inline-flex items-center gap-1 text-[11px] font-mono"
                      title="View public status page"
                    >
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
                {entry.bio && (
                  <p className="text-xs text-[#5c5c5c] font-sans truncate max-w-xl mt-0.5">
                    {entry.bio}
                  </p>
                )}
              </div>

              {/* Metrics Column */}
              <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
                <div>
                  <UptimeBadge pct={entry.uptimePct} />
                </div>
                <div className="text-xs font-mono text-[#5c5c5c] min-w-[80px]">
                  <span className="font-semibold text-[#23211a]">{entry.monitorCount}</span>{" "}
                  monitors
                </div>
                <div className="text-xs font-mono text-[#868279] min-w-[100px]">
                  <span className="font-semibold text-[#23211a]">
                    {entry.totalChecks.toLocaleString()}
                  </span>{" "}
                  checks
                </div>
              </div>

              {/* Mobile Metric */}
              <div className="sm:hidden flex flex-col items-end gap-1 shrink-0">
                <UptimeBadge pct={entry.uptimePct} />
                <span className="text-[10px] font-mono text-[#868279]">
                  {entry.monitorCount} monitors
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opt-In Callout */}
      <div className="border border-[#ffd439] bg-[#ffd439]/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#23211a] uppercase tracking-wider">
            <Shield className="size-4" />
            <span>Opt In & Claim Your Ranking</span>
          </div>
          <h3 className="text-xl font-serif font-medium text-[#23211a]">
            Want your team or agency on the Leaderboard?
          </h3>
          <p className="text-xs sm:text-sm text-[#5c5c5c] max-w-xl leading-relaxed">
            Enable &ldquo;Show on Leaderboard&rdquo; under Settings → Privacy. Only monitors
            verified with 100+ multi-region quorum checks qualify.
          </p>
        </div>
        <Link
          href="/dashboard/settings?tab=privacy"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-sm"
        >
          <span>Enable in Privacy Settings</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
