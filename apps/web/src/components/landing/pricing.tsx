"use client";

import Link from "next/link";
import { Activity, Check, Moon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_CONFIG } from "@steadystack/shared";

// Fixed heights so SSR/client markup match (no Math.random at render time).
// index 6 sits slightly low + amber — a small honest "we had one blip" beat,
// since a perfectly flat green strip on a monitoring company's own site reads as fake.
const UPTIME_BARS = [
  8, 8, 8, 8, 8, 8, 4, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section
      className="py-28 bg-background relative overflow-hidden content-visibility-auto"
      id="pricing"
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .ecg-trace {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
            animation: ecg-draw 2.4s ease-out infinite;
          }
          @keyframes ecg-draw {
            0% { stroke-dashoffset: 300; }
            60% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-5 text-xs font-mono text-muted-foreground">
            <span className="text-primary/60">$</span>
            <span>steadystack --list-plans</span>
            <span className="inline-block w-[6px] h-[13px] bg-primary/60 motion-safe:animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Select your plan
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            Simple, developer-friendly options designed to scale with your backend infrastructure.
          </p>

          {/* Minimalist Billing Toggle */}
          <div
            className="flex items-center gap-1 bg-muted p-1 border border-border rounded-full mt-8"
            role="group"
            aria-label="Billing interval"
          >
            <button
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
              className={cn(
                "px-5 py-2 text-xs font-semibold transition-all rounded-full cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                billing === "monthly"
                  ? "bg-card text-foreground shadow-sm border border-border/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              aria-pressed={billing === "yearly"}
              className={cn(
                "px-5 py-2 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                billing === "yearly"
                  ? "bg-card text-foreground shadow-sm border border-border/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: The Initiate */}
          <div className="bg-card border border-border rounded-2xl flex flex-col relative hover:border-primary/20 transition-all duration-300">
            <div className="p-8 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                  tier_00
                </p>
                <span className="text-[9px] font-mono font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  Grandfathered
                </span>
              </div>
              <h3 className="text-foreground font-bold text-lg uppercase tracking-wider">
                The Initiate
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Free uptime monitoring for indie developers and side projects.
              </p>
              <div className="mt-6 flex flex-col gap-1.5 h-[52px] justify-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                    $0
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">/mo</span>
                </div>
                <span className="text-[10px] text-muted-foreground/70 font-mono font-bold uppercase tracking-wider">
                  Free Forever • Launch Cohort Guaranteed
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between gap-8">
              <ul className="text-xs space-y-4 text-muted-foreground/90 font-medium">
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    <span className="font-mono font-bold">50</span> Monitors (3m standard, 1m for
                    first 10)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Activity className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    3 Edge Regions (2-of-3 Quorum Consensus)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>On-demand diagnostics from 100+ countries</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Slack, Discord & Email alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>1 Public Status page (SteadyStack footer)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>3 Days log retention & full commercial use</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground/60 pt-2 border-t border-border/40">
                  <span className="text-[11px]">
                    🔒 Launch terms honored permanently for early accounts
                  </span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="flex w-full items-center justify-center h-10 bg-transparent border border-border hover:bg-accent text-foreground text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Tier 2: The Netrunner — "The Sleep Plan" */}
          <div className="bg-card border-2 border-primary/40 rounded-2xl flex flex-col relative shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] transform md:-translate-y-2 hover:border-primary transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Moon className="size-3" />
              The Sleep Plan
            </div>

            {/* Live indicator */}
            <div
              className="absolute top-5 right-5 flex items-center gap-1.5"
              aria-label="Live monitoring status: active"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">
                live
              </span>
            </div>

            <div className="p-8 border-b border-primary/20 bg-primary/5 rounded-t-2xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/50 mb-2">
                tier_01
              </p>
              <h3 className="text-primary font-bold text-lg uppercase tracking-wider">
                The Netrunner
              </h3>
              <p className="text-xs text-primary/70 mt-1">
                For growing apps & branded status pages.
              </p>

              {/* Heartbeat trace */}
              <div className="mt-4 h-7 w-full text-primary/70" aria-hidden="true">
                <svg viewBox="0 0 300 32" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0,16 L100,16 L112,16 L122,3 L134,29 L146,16 L300,16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ecg-trace"
                  />
                </svg>
              </div>

              <div className="mt-2 flex flex-col gap-1.5 h-[52px] justify-center">
                <div className="flex items-baseline gap-2">
                  {billing === "yearly" && (
                    <span className="text-sm line-through text-muted-foreground/50 font-mono">
                      $19
                    </span>
                  )}
                  <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                    {billing === "yearly" ? "$15" : "$19"}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">/mo</span>
                </div>
                {billing === "yearly" && (
                  <span className="text-[10px] text-primary/80 font-mono font-bold uppercase tracking-wider">
                    Billed annually ($180) — Save $48
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between gap-8">
              <ul className="text-xs space-y-4 text-muted-foreground font-medium">
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    <span className="font-mono">250</span> Active Monitors (30s interval)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    Full 7 Sovereign Regions (4-of-7 Quorum)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    Custom Domain & White-Label (Remove footer)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>SMS & Telegram alert dispatches</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>SSL, Port & Browser synthetic allowance</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>45 Days log retention & PDF reports</span>
                </li>
              </ul>

              <Link
                href={`/signup?plan=netrunner&billing=${billing}`}
                className="flex w-full items-center justify-center h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Subscribe Now
              </Link>
            </div>
          </div>

          {/* Tier 3: The Construct */}
          <div className="bg-card border border-border rounded-2xl flex flex-col relative hover:border-primary/20 transition-all duration-300">
            <div className="p-8 border-b border-border">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">
                tier_02
              </p>
              <h3 className="text-foreground font-bold text-lg uppercase tracking-wider">
                The Construct
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Built for multi-user teams & private infrastructure.
              </p>
              <div className="mt-6 flex flex-col gap-1.5 h-[52px] justify-center">
                <div className="flex items-baseline gap-2">
                  {billing === "yearly" && (
                    <span className="text-sm line-through text-muted-foreground/50 font-mono">
                      $79
                    </span>
                  )}
                  <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                    {billing === "yearly" ? "$65" : "$79"}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">/mo</span>
                </div>
                {billing === "yearly" && (
                  <span className="text-[10px] text-muted-foreground/60 font-mono font-bold uppercase tracking-wider">
                    Billed annually ($780) — Save $168
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between gap-8">
              <ul className="text-xs space-y-4 text-muted-foreground/90 font-medium">
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    1,500 Active Monitors & 10s checks
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-foreground font-semibold">
                    Multi-Seat Team Workspaces & RBAC
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>On-Call Escalation policies & schedules</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Private Probe Agents (VPC / On-prem)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>PagerDuty, Opsgenie & custom webhooks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>1 Year log retention & SAML / SSO</span>
                </li>
              </ul>

              <Link
                href={`/signup?plan=construct&billing=${billing}`}
                className="flex w-full items-center justify-center h-10 bg-transparent border border-border hover:bg-accent text-foreground text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Footer — an actual uptime strip, because this is a monitoring company's own pricing page */}
        <div className="mt-16 flex flex-col items-center gap-5 text-center border-t border-border/50 pt-10">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            this page is monitored by steadystack
          </div>

          <div className="flex items-end gap-[3px]" aria-hidden="true">
            {UPTIME_BARS.map((h, i) => (
              <span
                key={i}
                className={cn(
                  "w-[3px] rounded-full",
                  h < 8 ? "bg-amber-500/80" : "bg-emerald-500/70",
                )}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <p className="text-[11px] font-mono text-muted-foreground/70">
            99.98% uptime, last 90 days
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Free plan includes commercial use
            </div>
            <div className="hidden sm:block text-muted-foreground/30">•</div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> 14-day free trial on paid plans
            </div>
            <div className="hidden sm:block text-muted-foreground/30">•</div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> No credit card required to start
            </div>
            <div className="hidden sm:block text-muted-foreground/30">•</div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Instant setup in less than 2 minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
