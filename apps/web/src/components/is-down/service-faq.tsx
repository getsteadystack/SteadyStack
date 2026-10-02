"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { ServiceDownInfo } from "@/content/is-down-services";

interface ServiceFaqProps {
  service: ServiceDownInfo;
}

export function ServiceFaq({ service }: ServiceFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: `Is ${service.name} down right now?`,
      answer: `Our real-time global edge probes continuously test ${service.name} (${service.domain}) across multiple worldwide locations. You can check the live status badge and latency meter at the top of this page. If you are seeing errors while the global status is operational, it may be due to localized ISP routing, local DNS caching, or account-specific rate limiting.`,
    },
    {
      question: `How can I tell if ${service.name} is down vs my own application?`,
      answer: `During a third-party outage, errors often originate from outbound API calls (e.g. 502 Bad Gateway, 504 Gateway Timeout, connection reset, or SSL handshake timeouts). You can verify by running our Live Edge Probe, checking ${service.name}'s official status page at ${service.officialStatusUrl}, and confirming whether other external API endpoints from your servers are responding normally.`,
    },
    {
      question: `Why should we automate ${service.name} status checks instead of checking manually?`,
      answer: `When a core dependency like ${service.name} degrades, minutes of manual refreshing or searching Twitter can cost hours in customer support escalations, failed transactions, and SLA penalties. SteadyStack monitors ${service.name} every 10 seconds from 15 global edge nodes with multi-region consensus verification, alerting your engineering team on Slack, Discord, SMS, or PagerDuty the second degradation begins.`,
    },
    {
      question: `What should our engineering team do during a ${service.name} outage?`,
      answer: `Implement defensive architectural patterns: 1) Trip circuit breakers to serve cached or fallback data rather than blocking on upstream timeouts; 2) Enqueue background webhooks and write requests into a persistent queue with exponential backoff and jitter; 3) Update your own customer status page to communicate third-party vendor disruption transparently.`,
    },
    {
      question: `How do I set up free automated synthetic monitoring for ${service.name}?`,
      answer: `Click 'Monitor ${service.name} in 1 Click' on this page to create a free SteadyStack account. The endpoint and health check parameters for ${service.name} will be pre-configured. You can connect Slack or Discord channels in under 60 seconds to receive instant notifications on any future downtime.`,
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a]">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#23211a]">
            Frequently Asked Questions: {service.name} Availability & Monitoring
          </h3>
          <p className="text-xs sm:text-sm text-[#5c5c5c] font-sans">
            Everything you need to know about tracking {service.name} outages and SLA reliability.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-serif font-medium text-[#23211a] hover:bg-[#f5f3ec] transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#868279] transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#23211a]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-[#5c5c5c] font-sans leading-relaxed border-t border-[#e8e6df] bg-white/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
