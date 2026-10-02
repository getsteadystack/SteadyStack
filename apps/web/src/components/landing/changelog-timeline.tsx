"use client";

import { useState } from "react";
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  Terminal,
  Activity,
} from "lucide-react";
import Link from "next/link";

export interface ChangelogHighlight {
  category: string;
  title: string;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlights: ChangelogHighlight[];
}

const CATEGORIES = ["All", "Feature", "Performance", "Security", "CLI", "Self-Hosted"] as const;
type Category = (typeof CATEGORIES)[number];

export function ChangelogTimeline({ entries }: { entries: ChangelogEntry[] }) {
  const [active, setActive] = useState<Category>("All");

  const filtered = entries
    .map((entry) => ({
      ...entry,
      highlights:
        active === "All" ? entry.highlights : entry.highlights.filter((h) => h.category === active),
    }))
    .filter((entry) => entry.highlights.length > 0);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Category Filter Pills */}
      <div className="max-w-4xl mx-auto px-4 w-full pt-8 flex flex-wrap items-center justify-center gap-2">
        <div className="flex gap-1.5 flex-wrap p-1.5 bg-white border border-[#e8e6df] rounded-2xl shadow-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-xl transition-all cursor-pointer ${
                active === cat
                  ? "bg-[#23211a] text-white font-semibold shadow-xs"
                  : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <section className="py-14 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#e8e6df] rounded-2xl">
            <p className="text-sm font-mono text-[#5c5c5c]">
              No releases found for the &ldquo;{active}&rdquo; category.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#e8e6df] ml-4 md:ml-8 pl-6 md:pl-12 space-y-16">
            {filtered.map((entry) => (
              <div key={entry.version} className="relative group">
                {/* Bullet */}
                <div className="absolute -left-[31px] md:-left-[55px] top-1 size-4 rounded-full bg-white border-4 border-[#23211a] group-hover:scale-125 transition-transform shadow-xs" />

                {/* Header: Version, Date, Badge */}
                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                  <span className="text-xl font-mono font-bold text-[#23211a] tracking-tight">
                    {entry.version}
                  </span>
                  <time className="text-xs font-mono text-[#868279]">{entry.date}</time>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md border ${
                      entry.badge.toLowerCase().includes("latest")
                        ? "bg-[#ffd439] text-[#23211a] border-[#ffd439]"
                        : "bg-[#f0ede6] text-[#23211a] border-[#e8e6df]"
                    }`}
                  >
                    {entry.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a] mb-3 leading-snug">
                  {entry.title}
                </h2>
                <p className="text-sm text-[#5c5c5c] leading-relaxed mb-6 max-w-3xl font-sans">
                  {entry.description}
                </p>

                {/* Highlights Grid */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {entry.highlights.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-4 sm:p-5 rounded-xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 hover:shadow-xs transition-all space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                            h.category === "Security"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : h.category === "Performance"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-[#ffd439]/20 text-[#23211a] border-[#ffd439]/40"
                          }`}
                        >
                          {h.category}
                        </span>
                        <h3 className="text-xs font-serif font-medium text-[#23211a] truncate">
                          {h.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#5c5c5c] leading-relaxed font-sans">
                        {h.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Container */}
      <section className="w-full max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#ffd439]/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Activity className="size-3.5 text-[#ffd439]" />
            <span>Ready for Continuous Uptime</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-white mb-3">
            Start monitoring with the latest release
          </h3>

          <p className="text-white/80 text-sm max-w-lg mb-8 font-sans leading-relaxed">
            Deploy with 50 free monitors, 1-minute check intervals, and distributed edge quorum
            consensus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/comparison"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs font-mono uppercase tracking-wider rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <span>Feature Comparison</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ChangelogHero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-20 border-b border-[#e8e6df] bg-[#fbfbf9] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-5 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
          <Sparkles className="size-3 text-[#ffd439]" />
          <span>Product Releases & Engine Updates</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
          What&apos;s new in SteadyStack
        </h1>

        <p className="text-[#5c5c5c] text-base sm:text-lg max-w-2xl leading-relaxed font-sans text-balance">
          Follow the latest synthetic engine releases, edge quorum upgrades, agency tools, and
          performance enhancements shipped by the SteadyStack team.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="https://github.com/getsteadystack/SteadyStack/releases"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f0ede6] text-[#23211a] transition-all shadow-xs"
          >
            <GitBranch className="size-3.5 text-[#23211a]" />
            <span>GitHub Releases</span>
          </Link>
          <Link
            href="https://github.com/getsteadystack/SteadyStack/blob/master/docs/self-hosted.md"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold rounded-xl border border-[#ffd439] bg-[#ffd439]/15 hover:bg-[#ffd439]/25 text-[#23211a] transition-all"
          >
            <ShieldCheck className="size-3.5 text-[#23211a]" />
            <span>Self-Host Guide</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
