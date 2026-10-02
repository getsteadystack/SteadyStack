"use client";

import { useState } from "react";
import { Sparkles, GitBranch, ShieldCheck, ArrowRight } from "lucide-react";
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

const CATEGORIES = ["All", "Feature", "Performance", "CLI", "Self-Hosted", "Security"] as const;
type Category = (typeof CATEGORIES)[number];

/**
 * Changelog timeline with category filter chips. Filtering keeps an entry
 * visible when any highlight matches the selected category (the entry
 * description is release-level context and is not filtered away).
 */
export function ChangelogTimeline({ entries }: { entries: ChangelogEntry[] }) {
  const [active, setActive] = useState<Category>("All");

  const filtered = entries
    .map((entry) => ({
      ...entry,
      highlights:
        active === "All"
          ? entry.highlights
          : entry.highlights.filter((h) => h.category === active),
    }))
    .filter((entry) => entry.highlights.length > 0);

  return (
    <>
      {/* Filter chips */}
      <div className="max-w-4xl mx-auto px-6 w-full pt-10 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            aria-pressed={active === cat}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
              active === cat
                ? "bg-primary text-black border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 w-full flex-1">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No {active} entries yet.
          </p>
        ) : (
          <div className="relative border-l border-border/60 ml-4 md:ml-6 pl-6 md:pl-10 space-y-16">
            {filtered.map((entry) => (
              <div key={entry.version} className="relative group">
                {/* Timeline Bullet */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1 size-3.5 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />

                {/* Version & Date Header */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-lg font-mono font-extrabold text-foreground tracking-tight">
                    {entry.version}
                  </span>
                  <time className="text-xs font-mono text-muted-foreground">{entry.date}</time>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${entry.badgeColor}`}
                  >
                    {entry.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-xl font-bold text-foreground mb-2">{entry.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  {entry.description}
                </p>

                {/* Highlights Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {entry.highlights.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-4 rounded-lg border border-border/60 bg-muted/[0.15] hover:border-primary/30 hover:bg-muted/[0.3] transition-all space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
                          {h.category}
                        </span>
                        <h3 className="text-xs font-bold text-foreground truncate">{h.title}</h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
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

      {/* CTA Footer */}
      <section className="py-16 border-t border-border bg-muted/[0.1]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Ready to test SteadyStack?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Self-host the full stack on Docker or start free with 3-region 2-of-3 quorum consensus.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-lg hover:bg-primary/90 transition-all font-mono uppercase tracking-wider"
            >
              Get Started Free <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/vs/uptime-kuma"
              className="inline-flex items-center px-5 py-2.5 border border-border text-foreground font-semibold text-xs rounded-lg hover:border-primary/40 transition-all font-mono"
            >
              SteadyStack vs Uptime Kuma
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ChangelogHero() {
  return (
    <section className="py-20 md:py-28 border-b border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-5 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest">
          <Sparkles className="size-3" />
          Product Releases & Updates
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          What&apos;s New in SteadyStack
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
          Follow the latest engine improvements, CLI features, edge consensus upgrades, and
          platform releases shipped by the SteadyStack team.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="https://github.com/getsteadystack/SteadyStack/releases"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-all"
          >
            <GitBranch className="size-3.5 text-primary" />
            GitHub Releases
          </Link>
          <Link
            href="https://github.com/getsteadystack/SteadyStack/blob/master/docs/self-hosted.md"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <ShieldCheck className="size-3.5" />
            Self-Host Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
