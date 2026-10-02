"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Check, X, Sparkles, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
import { competitors, featureComparisons } from "./comparison-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ComparisonTable() {
  const steadystack = competitors.find((c) => c.id === "steadystack")!;
  const otherCompetitors = competitors.filter((c) => c.id !== "steadystack");

  const renderValue = (val: string | boolean, isSteadyStack = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="inline-flex items-center justify-center size-6 rounded-full bg-primary/10 border border-primary/30 text-primary">
          <Check className="size-3.5 stroke-[3]" />
        </div>
      ) : (
        <div className="inline-flex items-center justify-center size-6 rounded-full bg-muted/60 border border-border text-muted-foreground/60">
          <X className="size-3.5" />
        </div>
      );
    }

    return (
      <span
        className={`text-xs font-mono font-semibold ${
          isSteadyStack
            ? "text-primary font-bold px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20"
            : "text-muted-foreground"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden border-b border-border">
      {/* Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="size-3.5" />
            Competitive Analysis
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Why Engineering Teams Choose <span className="text-primary">SteadyStack</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
            Compare SteadyStack head-to-head against legacy uptime monitoring tools. Our core
            difference is the confirmation rule: four of seven independent global regions must agree
            before you are paged. Faster check intervals, broader edge coverage, and native
            synthetic testing are included - but the quorum model is what eliminates false positives
            at the source.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="border border-border bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Header Row */}
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground w-1/3">
                    Monitoring Capabilities
                  </th>

                  {/* SteadyStack Column Header */}
                  <th className="p-5 w-1/6 bg-primary/5 border-x border-primary/20 relative">
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        {steadystack.badge}
                      </span>
                      <span className="text-base font-extrabold text-foreground font-mono">
                        {steadystack.name}
                      </span>
                      <Link
                        href="/signup"
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "h-7 px-3 text-[10px] font-mono font-bold bg-primary text-primary-foreground hover:opacity-90 uppercase tracking-wider mt-1 w-full",
                        )}
                      >
                        Try Free <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </div>
                  </th>

                  {/* Competitor Columns Headers */}
                  {otherCompetitors.map((comp) => (
                    <th key={comp.id} className="p-5 w-1/6 text-center">
                      <div className="flex flex-col items-center text-center gap-1">
                        <a
                          href={comp.pricingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-bold text-foreground/80 font-mono hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4"
                          title={`Verify ${comp.name} pricing & plan details`}
                        >
                          {comp.name}
                          <ExternalLink className="size-3 text-muted-foreground/70" />
                        </a>
                        <span className="text-[10px] text-muted-foreground font-sans line-clamp-2 font-normal max-w-[140px]">
                          {comp.description}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-border/40 font-sans text-xs">
                {featureComparisons.map((feature, idx) => {
                  const isNewCategory =
                    idx === 0 || featureComparisons[idx - 1]?.category !== feature.category;

                  return (
                    <Fragment key={idx}>
                      {isNewCategory && (
                        <tr className="bg-muted/60 border-y border-border/80">
                          <td
                            colSpan={5}
                            className="px-5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-primary"
                          >
                            // {feature.category}
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-muted/40 transition-colors group">
                        {/* Feature Name & Description */}
                        <td className="p-4 sm:p-5">
                          <div className="font-semibold text-foreground text-sm font-sans flex items-center gap-2">
                            {feature.name}
                            {feature.name.includes("AI") && (
                              <Sparkles className="size-3.5 text-primary animate-pulse" />
                            )}
                          </div>
                          {feature.description && (
                            <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                              {feature.description}
                            </div>
                          )}
                        </td>

                        {/* SteadyStack Value Cell */}
                        <td className="p-4 sm:p-5 text-center bg-primary/5 border-x border-primary/15 group-hover:bg-primary/10 transition-colors">
                          {renderValue(feature.steadystack, true)}
                        </td>

                        {/* UptimeRobot Cell */}
                        <td className="p-4 sm:p-5 text-center">
                          {renderValue(feature.uptimerobot)}
                        </td>

                        {/* Better Uptime Cell */}
                        <td className="p-4 sm:p-5 text-center">
                          {renderValue(feature.betteruptime)}
                        </td>

                        {/* Checkly Cell */}
                        <td className="p-4 sm:p-5 text-center">{renderValue(feature.checkly)}</td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footnotes Section */}
          <div className="p-5 sm:p-6 bg-muted/20 border-t border-border/60 space-y-4 text-xs font-sans text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground font-mono font-bold uppercase text-[11px] mr-1.5">
                Note 1:
              </strong>
              Being straight with you: Checkly runs 22 locations to our 7, and Better Uptime&apos;s
              3-of-4 quorum is a genuinely good design that solves the same problem we do. We think
              4-of-7 across published, health-monitored regions is better — and unlike anyone else
              here, we publish enough detail for you to verify it yourself. Pingdom runs 100+
              locations and still gets false-positive complaints, which is rather the point: the
              confirmation rule matters more than the count.
            </p>
            <p className="pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground/80">
              <strong className="text-foreground">Note 2:</strong> Last verified August 2026 against
              vendor pricing pages and public documentation. Found something out of date? Tell us
              and we&apos;ll fix it.
            </p>
          </div>

          {/* Table Footer Banner */}
          <div className="p-4 sm:p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground font-mono">
              ⚡ Free monitoring for up to 50 endpoints (3m standard, 1m for first 10) with 3-region
              quorum consensus. No credit card required.
            </div>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-8 px-4 text-xs font-mono font-bold border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 uppercase tracking-wider",
              )}
            >
              Start free — 50 monitors &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
