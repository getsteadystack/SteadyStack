"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LtdFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the Lifetime Deal work?",
      a: "You pay once and get permanent access to SteadyStack with no monthly or annual subscription fees ever. Your account receives the full feature set corresponding to your purchased tier (150, 250, or 1,500 monitors, white-label portals, and automated SLA reports).",
    },
    {
      q: "Can I stack codes later to upgrade my tier?",
      a: "Yes! If you start with Tier 1 ($49), you can purchase another code anytime and redeem it in your dashboard under Settings → Billing or at /redeem. The platform will automatically calculate your total stacked count and elevate your account limits to Tier 2 or Tier 3.",
    },
    {
      q: "Are future product updates and new probe locations included?",
      a: "Yes, 100%. All lifetime deal tiers receive access to future platform roadmap updates, new global Cloudflare edge probe regions, protocol additions (gRPC, TCP, WebSocket monitoring), and security enhancements without extra charges.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 60-day, no-questions-asked money-back guarantee. If SteadyStack doesn't completely satisfy your agency monitoring needs or save you hours of false-alarm chasing, just email us at support@steadystack.dev and we'll issue a full refund immediately.",
    },
    {
      q: "How do white-label status portals and custom CNAME domains work?",
      a: "On Tier 2 and Tier 3, you can create dedicated status portals for each of your clients (e.g. status.yourclient.com or status.youragency.com). We automatically issue free Let's Encrypt / Cloudflare SSL certificates, remove all SteadyStack branding, and allow custom logos, favicon, and accent colors.",
    },
    {
      q: "How do automated monthly SLA reports work?",
      a: "SteadyStack compiles 30-day uptime metrics, outage logs, and latency percentiles into an editorial, client-ready PDF report on the 1st of every month. You can preview, white-label with your agency mark, and automatically deliver them to your retainer clients.",
    },
    {
      q: "What makes SteadyStack's Edge Quorum different from traditional ping tools?",
      a: "Traditional tools ping your server from a single datacenter. If that datacenter has a minor route hiccup, you get woken up by false alarms. SteadyStack deploys multi-region edge consensus: an incident is only declared when a quorum of independent global regions (e.g. 4-of-7) confirms the failure simultaneously.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#fbfbf9] border-b border-[#e8e6df]" id="ltd-faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <HelpCircle className="size-3.5 text-[#ffd439]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a] mb-4">
            Lifetime Deal FAQ
          </h2>
          <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed">
            Everything you need to know about purchasing, redeeming, and scaling your SteadyStack
            lifetime license.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg font-medium text-[#23211a] hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-[#868279] transition-transform duration-200 shrink-0",
                      isOpen && "rotate-180 text-[#23211a]",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#5c5c5c] leading-relaxed font-sans border-t border-[#f0eee6]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
