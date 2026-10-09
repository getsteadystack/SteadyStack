"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LTD_CONFIG } from "@/lib/ltd-config";
import { useLtdStats } from "@/lib/use-ltd-stats";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const ltdStats = useLtdStats();
  const isSoldOut = ltdStats.isSoldOut;

  const recurringPlans = [
    {
      id: "pro",
      tag: "Growth & Agencies",
      name: "Pro Agency",
      description:
        "Complete reliability toolkit with white-label status portals, multi-region quorum consensus, and automated SLA reports.",
      priceMonthly: 29,
      priceYearly: 22,
      priceLifetime: 99,
      period: "/ month",
      ctaLabel: "Start 14-Day Free Trial",
      ctaHref: "/signup?plan=pro",
      highlighted: true,
      badge: "★ Most Popular",
      isSoldOut: false,
      features: [
        "250 Endpoints included",
        "30-second check frequency",
        "All 7 Global edge probe regions",
        "4-of-7 Quorum consensus verification",
        "Unlimited white-label status portals",
        "Custom CNAME domain per client",
        "Automated monthly client SLA PDFs",
        "PagerDuty, OpsGenie & Webhook routing",
        "1-year high-resolution telemetry retention",
      ],
    },
    {
      id: "enterprise",
      tag: "Scale",
      name: "Enterprise Scale",
      description:
        "Dedicated consensus infrastructure with high-frequency heartbeats, custom webhook pipelines, and SLA guarantees.",
      priceMonthly: 79,
      priceYearly: 62,
      priceLifetime: 199,
      period: "/ month",
      ctaLabel: "Start 14-Day Free Trial",
      ctaHref: "/signup?plan=enterprise",
      highlighted: false,
      badge: "★ Scale Choice",
      isSoldOut: false,
      features: [
        "1,500 Endpoints included",
        "10-second check frequency",
        "100 White-Label Client Status Portals",
        "50 Team Seats & Role Permissions",
        "Automated monthly client SLA PDFs",
        "Unlimited manual run-checks",
        "Priority probe execution queue",
        "1-Year Telemetry Retention",
      ],
    },
  ];

  const lifetimePlans = [
    {
      id: "free",
      tag: "Lifetime Tier 1 • Starter",
      name: "Solo Founder Lifetime",
      description:
        "Lifetime edge monitoring for solo developers and freelancers (Maps to Starter tier).",
      priceMonthly: 0,
      priceYearly: 0,
      priceLifetime: 49,
      period: "one-time payment",
      ctaLabel: isSoldOut
        ? `Sold Out (${ltdStats.claimedCount}/${ltdStats.totalCap} Claimed)`
        : "Claim $49 Founder License",
      ctaHref: isSoldOut ? "/signup?plan=pro" : "/signup?deal=ltd-tier-1",
      highlighted: false,
      isSoldOut,
      features: [
        "50 Endpoints included",
        "1-minute check frequency",
        "3 Global edge probe regions",
        "2-of-3 Quorum consensus",
        "2 Custom CNAME status portals",
        "1 Team seat",
        "Slack & Discord webhook alerts",
        "30-day metrics retention",
      ],
    },
    {
      id: "pro",
      tag: "Lifetime Tier 2 • Pro Agency",
      name: "Agency Growth Lifetime",
      description:
        "Reliability suite with 5 white-label portals for boutique agencies (Maps to Pro Agency tier).",
      priceMonthly: 29,
      priceYearly: 22,
      priceLifetime: 99,
      period: "one-time payment",
      ctaLabel: isSoldOut ? "Sold Out (100/100 Claimed)" : "Claim $99 Agency License",
      ctaHref: isSoldOut ? "/signup?plan=pro" : "/signup?deal=ltd-tier-2",
      highlighted: true,
      badge: "★ Most Popular",
      isSoldOut,
      features: [
        "120 Endpoints included",
        "60-second check frequency",
        "All 7 Global edge probe regions",
        "4-of-7 Quorum consensus verification",
        "5 White-label client status portals",
        "3 Team seats",
        "Automated monthly client SLA PDFs",
        "45-day telemetry retention",
      ],
    },
    {
      id: "enterprise",
      tag: "Lifetime Tier 3 • Scale Fleet",
      name: "Scale Fleet Lifetime",
      description:
        "High-capacity fleet with 15 white-label portals for scaling dev shops (Maps to Enterprise tier).",
      priceMonthly: 79,
      priceYearly: 62,
      priceLifetime: 199,
      period: "one-time payment",
      ctaLabel: isSoldOut ? "Sold Out (100/100 Claimed)" : "Claim $199 Scale License",
      ctaHref: isSoldOut ? "/signup?plan=enterprise" : "/signup?deal=ltd-tier-3",
      highlighted: false,
      badge: "★ Best Value • Founder Edition",
      isSoldOut,
      features: [
        "250 Endpoints included",
        "30-second check frequency",
        "All 7 Global edge probe regions",
        "4-of-7 Quorum consensus",
        "15 White-label client status portals",
        "5 Team seats & role permissions",
        "Automated monthly client SLA PDFs",
        "90-day telemetry retention",
      ],
    },
  ];

  const plans = billing === "lifetime" ? lifetimePlans : recurringPlans;

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>
              {billing === "lifetime"
                ? isSoldOut
                  ? "🔴 Founder Batch 1 · 100/100 Sold Out"
                  : `Founder Batch • ${LTD_CONFIG.claimedCount}/${LTD_CONFIG.totalCap} Claimed`
                : "Transparent Pricing"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08] text-balance">
            {billing === "lifetime"
              ? isSoldOut
                ? "Founder lifetime deals are currently sold out."
                : "Capped lifetime deals for early agency partners."
              : "Simple, predictable plans for growing teams."}
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-balance">
            {billing === "lifetime"
              ? isSoldOut
                ? "All 100 founder licenses have been claimed. Monthly and annual agency subscription plans remain active with 7-day free trials."
                : `Strictly capped at ${LTD_CONFIG.totalCap} licenses (${LTD_CONFIG.totalCap - LTD_CONFIG.claimedCount} remaining) before transitioning exclusively to monthly subscriptions.`
              : "Start with a 14-day full agency trial. Unlock 7-region edge quorum, white-label client portals, or lock in lifetime access with no recurring bills."}
          </p>

          {/* Billing Switcher (Twin.so Style with Lifetime Option) */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-[#e8e6df] bg-white mt-8 shadow-xs">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer",
                billing === "monthly"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                billing === "yearly"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <span>Annual</span>
              <span className="text-[10px] font-bold bg-[#ffd439] text-[#23211a] px-1.5 py-0.2 rounded-full">
                -25%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBilling("lifetime")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                billing === "lifetime"
                  ? "bg-[#23211a] text-white shadow-xs font-bold ring-2 ring-[#ffd439]"
                  : "text-[#23211a] font-bold bg-[#ffd439]/20 hover:bg-[#ffd439]/40",
              )}
            >
              <span>⚡ Lifetime Deal</span>
              <span className="text-[10px] font-bold bg-[#ffd439] text-[#23211a] px-1.5 py-0.2 rounded-full">
                {isSoldOut ? "Sold Out" : "Pay Once"}
              </span>
            </button>
          </div>

          {/* Scarcity Progress bar in Lifetime mode */}
          {billing === "lifetime" && (
            <div className="max-w-xs mx-auto mt-6 p-3 rounded-2xl bg-white border border-[#e8e6df] shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-[#868279]">Founder Batch Allocation</span>
                <span className="font-bold text-[#23211a]">
                  {ltdStats.claimedCount} / {ltdStats.totalCap}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f4f2eb] overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isSoldOut ? "bg-red-500" : "bg-[#ffd439]",
                  )}
                  style={{
                    width: `${ltdStats.percentage}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div
          className={cn(
            "grid items-stretch mb-16 text-left",
            plans.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8"
              : "grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8",
          )}
        >
          {plans.map((plan) => {
            const price =
              billing === "monthly"
                ? plan.priceMonthly
                : billing === "yearly"
                  ? plan.priceYearly
                  : plan.priceLifetime;

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-3xl border flex flex-col justify-between transition-all duration-300 relative bg-white",
                  plan.highlighted
                    ? "border-[#23211a] shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:-translate-y-2 ring-2 ring-[#23211a]"
                    : "border-[#e8e6df] shadow-sm hover:border-black/20",
                )}
              >
                {/* Popular Pill Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap bg-[#ffd439] text-[#23211a] text-[11px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#e2be2b] shadow-xs">
                      {plan.badge || "★ Most Popular"}
                    </span>
                  </div>
                )}

                <div className="p-7 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#868279] uppercase tracking-wider">
                      {plan.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-medium text-[#23211a] tracking-tight mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-xs text-[#5c5c5c] leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e8e6df]">
                    <span className="text-4xl sm:text-5xl font-serif font-semibold text-[#23211a]">
                      ${price}
                    </span>
                    <span className="text-xs font-mono text-[#868279]">
                      {plan.priceMonthly === 0 ? "forever" : plan.period}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 text-xs text-[#23211a] font-medium"
                      >
                        <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-7 sm:p-8 pt-0">
                  <Link
                    href={plan.ctaHref as any}
                    className={cn(
                      "w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold py-3.5 transition-all cursor-pointer",
                      plan.isSoldOut
                        ? "bg-[#f4f2eb] text-[#868279] border border-[#e8e6df] hover:bg-[#eae8df]"
                        : plan.highlighted
                          ? "bg-[#23211a] text-white shadow-md hover:bg-[#373428]"
                          : "border border-[#e8e6df] bg-[#fbfbf9] text-[#23211a] hover:bg-[#f4f2eb]",
                    )}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout Footer */}
        <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-left shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-[#23211a]">
                Need a custom enterprise SLA or on-premise private probe clusters?
              </strong>
              <div className="text-[#5c5c5c]">
                We support custom contract agreements, custom check frequencies, and dedicated
                technical onboarding.
              </div>
            </div>
          </div>
          <Link
            href={"/signup?plan=enterprise" as any}
            className="inline-flex items-center gap-1.5 font-bold text-[#23211a] hover:underline shrink-0"
          >
            <span>Contact Enterprise Sales</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
