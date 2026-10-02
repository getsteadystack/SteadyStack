"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Clock,
  Layers,
  Infinity as InfinityIcon,
  FileText,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LTD_CONFIG } from "@/lib/ltd-config";

export default function LtdSpotlight() {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(2);

  const tiers = [
    {
      tier: 1,
      name: "Tier 1: Solo Pro",
      price: 49,
      originalValue: 348,
      popular: false,
      monitors: 50,
      interval: "60s",
      portals: "2 Portals",
      seats: "1 Seat",
      quorum: "3-Region Quorum (2-of-3)",
      description: "For freelance developers, solo founders, and side-project builders.",
      highlights: [
        "50 Active Edge Endpoints",
        "60s check intervals",
        "2 Custom CNAME Status Portals",
        "1 Team Seat",
        "Email, Discord & Slack alerts",
        "30-day telemetry retention",
        "Lifetime access — zero recurring fees",
      ],
      ctaHref: "/signup?deal=ltd-tier-1",
    },
    {
      tier: 2,
      name: "Tier 2: Growth Agency",
      price: 99,
      originalValue: 588,
      popular: true,
      monitors: 120,
      interval: "60s",
      portals: "5 Portals",
      seats: "3 Seats",
      quorum: "7-Region Quorum (4-of-7)",
      description: "For digital agencies and studios managing up to 5 retainer clients.",
      highlights: [
        "120 Active Edge Endpoints",
        "60s check intervals",
        "5 100% White-Label Status Portals",
        "3 Team Seats",
        "Automated Monthly Client SLA PDFs",
        "45-day metrics & telemetry retention",
        "Lifetime access — zero recurring fees",
      ],
      ctaHref: "/signup?deal=ltd-tier-2",
    },
    {
      tier: 3,
      name: "Tier 3: Agency Fleet",
      price: 199,
      originalValue: 1188,
      popular: false,
      monitors: 250,
      interval: "30s",
      portals: "15 Portals",
      seats: "5 Seats",
      quorum: "7-Region Quorum (4-of-7)",
      description: "The scale fleet tier for established agencies and multi-client retainers.",
      highlights: [
        "250 Active Edge Endpoints",
        "30s high-frequency checks",
        "15 White-Label Portals (Custom CNAMEs)",
        "5 Team Seats & Role Permissions",
        "Automated Monthly Client PDF SLA Sign-offs",
        "Priority probe queue execution",
        "90-Day Full Telemetry Retention",
        "Lifetime access — zero recurring fees",
      ],
      ctaHref: "/signup?deal=ltd-tier-3",
    },
  ];

  return (
    <section
      className="py-20 md:py-28 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]"
      id="ltd-pricing"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs whitespace-nowrap">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>
              Lifetime Deal Pricing •{" "}
              {LTD_CONFIG.isGloballySoldOut
                ? "Sold Out"
                : `${LTD_CONFIG.claimedCount}/${LTD_CONFIG.totalCap} Claimed`}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08] text-balance">
            Pay once, monitor forever.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-balance">
            Get up to 250 endpoints, 7-region edge quorum, white-label client portals, and automated
            SLA PDFs for a capped founder allocation.
          </p>
        </div>

        {/* LTD Pricing Cards Grid (Matching Twin.so Aesthetic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-16 text-left">
          {tiers.map((tier) => {
            const isSelected = activeTier === tier.tier;

            return (
              <div
                key={tier.tier}
                onClick={() => setActiveTier(tier.tier as 1 | 2 | 3)}
                className={cn(
                  "rounded-3xl border flex flex-col justify-between transition-all duration-300 relative bg-white cursor-pointer",
                  tier.popular
                    ? "border-[#23211a] shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:-translate-y-2 ring-2 ring-[#23211a]"
                    : "border-[#e8e6df] shadow-sm hover:border-black/20",
                )}
              >
                {/* Popular Pill Badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap bg-[#ffd439] text-[#23211a] text-[11px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#e2be2b] shadow-xs">
                      ★ Best Value • Founder Edition
                    </span>
                  </div>
                )}

                <div className="p-7 sm:p-8">
                  {/* Tier Tag & Retail Reference */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#868279] uppercase tracking-wider">
                      Tier {tier.tier}
                    </span>
                    <span className="text-[11px] font-mono text-[#868279] line-through">
                      ${tier.originalValue}/yr value
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-medium text-[#23211a] tracking-tight mb-2">
                    {tier.name}
                  </h3>

                  <p className="text-xs text-[#5c5c5c] leading-relaxed mb-6 min-h-[36px]">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#e8e6df]">
                    <span className="text-4xl sm:text-5xl font-serif font-semibold text-[#23211a]">
                      ${tier.price}
                    </span>
                    <span className="text-xs font-mono text-[#868279]">
                      one-time payment / lifetime
                    </span>
                  </div>

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8e6df]">
                      <span className="text-[10px] text-[#868279] block">ENDPOINTS</span>
                      <strong className="text-[#23211a] text-sm">{tier.monitors}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8e6df]">
                      <span className="text-[10px] text-[#868279] block">INTERVAL</span>
                      <strong className="text-[#23211a] text-sm">{tier.interval}</strong>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    {tier.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-[#23211a] font-medium"
                      >
                        <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-7 sm:p-8 pt-0">
                  {LTD_CONFIG.isGloballySoldOut ? (
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold py-3.5 bg-[#e8e6df] text-[#868279] cursor-not-allowed"
                    >
                      <span>Sold Out</span>
                    </button>
                  ) : (
                    <Link
                      href={tier.ctaHref as any}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold py-3.5 transition-all",
                        tier.popular
                          ? "bg-[#23211a] text-white shadow-md hover:bg-[#373428]"
                          : "border border-[#e8e6df] bg-[#fbfbf9] text-[#23211a] hover:bg-[#f4f2eb]",
                      )}
                    >
                      <span>Get Lifetime Access (${tier.price})</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee and Stacking Assurance Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#ffd439]/20 text-[#23211a] shrink-0">
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#23211a] mb-1">
                60-Day Money-Back Guarantee
              </h4>
              <p className="text-xs text-[#5c5c5c] leading-relaxed">
                Test SteadyStack on all your client domains. If you&apos;re not blown away by far
                fewer false alarms, get a 100% refund.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#ffd439]/20 text-[#23211a] shrink-0">
              <Layers className="size-5 text-[#23211a]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#23211a] mb-1">Flexible Code Stacking</h4>
              <p className="text-xs text-[#5c5c5c] leading-relaxed">
                Buy Tier 1 now and stack additional codes later to unlock Tier 2 or Tier 3 as your
                client roster scales.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#ffd439]/20 text-[#23211a] shrink-0">
              <InfinityIcon className="size-5 text-[#23211a]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#23211a] mb-1">Grandfathered For Life</h4>
              <p className="text-xs text-[#5c5c5c] leading-relaxed">
                All future core features, new global edge probe locations, and protocol updates are
                included automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
