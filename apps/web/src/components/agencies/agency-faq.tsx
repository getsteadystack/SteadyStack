"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const agencyFaqs = [
  {
    q: "How does white-label custom domain CNAME setup work?",
    a: "Point a CNAME record (such as status.clientbrand.com) to custom.steadystack.dev. Our Cloudflare edge infrastructure automatically provisions an SSL certificate and serves your client's unbranded status portal within 60 seconds.",
  },
  {
    q: "Can clients log into a portal without seeing other clients?",
    a: "Yes. With Multi-Client Workspaces, each client project has isolated role permissions. You can invite client stakeholders with read-only viewer privileges so they can inspect their live status and metrics without viewing other client accounts or your secret webhook keys.",
  },
  {
    q: "How are the monthly client SLA PDF reports generated?",
    a: "On the 1st of every month (or on-demand via the dashboard), SteadyStack automatically compiles 30-day uptime stats, regional latency metrics across 7 global regions, and incident resolution summaries into a high-resolution PDF branded with your agency's logo and contact details.",
  },
  {
    q: "How does 4-of-7 quorum consensus eliminate 3 AM false alarms?",
    a: "Unlike single-poller monitoring services that trigger panics when a single data center has a network blip, SteadyStack requires 4 out of 7 sovereign edge nodes (US West, US East, EU West, APAC, etc.) to mathematically confirm downtime before an alert or client email is triggered.",
  },
  {
    q: "Can I bundle SteadyStack into my existing maintenance retainers?",
    a: "Absolutely. In fact, that is what the platform is designed for. Most partner agencies package 24/7 uptime monitoring, SLA audit reports, and dedicated status portals into $500–$2,500/month recurring maintenance contracts.",
  },
  {
    q: "What if I need custom terms, hundreds of monitors, or an enterprise SLA?",
    a: "Our Agency Pro tier ($99/mo) includes unlimited client accounts, 100% white-label everything, priority support, and custom integrations. For larger fleets with custom requirements, reach out to our engineering team.",
  },
];

export default function AgencyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative border-b border-[#e8e6df]"
      id="faq"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>Agency Questions & Answers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08]">
            Frequently Asked Agency Questions
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans">
            Everything you need to know about white-label status pages, client SLA reports, and
            agency billing.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {agencyFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#e8e6df] bg-white shadow-xs transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif font-medium text-[#23211a] text-base sm:text-lg cursor-pointer hover:bg-[#fbfbf9] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-[#868279] shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-[#23211a]",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#5c5c5c] text-xs sm:text-sm leading-relaxed border-t border-[#e8e6df] font-sans">
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
