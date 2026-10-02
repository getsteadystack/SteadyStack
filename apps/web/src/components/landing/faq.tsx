import { ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FAQ() {
  const faqs = [
    {
      q: "How fast are checks performed, and are there interval limits per tier?",
      a: `Verification checks execute natively across our global edge Durable Objects. The Free tier supports 3-minute checks for up to 50 active monitors with 3-region quorum consensus. The Pro plan supports checks down to 30 seconds across 7 global regions with 4-of-7 quorum consensus, and Enterprise Scale supports 10-second high-frequency telemetry.`,
    },
    {
      q: "What is multi-region quorum consensus, and how does it eradicate 3 AM false alarms?",
      a: "Internet routing glitches and localized carrier flukes often cause a single monitor probe to time out even when the website is online for 99.9% of real users. SteadyStack never pages your team on a single probe timeout; we query other edge nodes concurrently and require 4 of 7 global regions to confirm downtime before opening an incident. This voting system completely isolates transit hiccups from true global outages.",
    },
    {
      q: "How do white-label status pages and custom CNAME domains work for clients?",
      a: "Every client workspace in your agency account can have its own dedicated status portal on a custom domain (e.g., status.clientdomain.com). SteadyStack automatically provisions and renews SSL certificates, removes all third-party vendor watermarks, and allows you to customize the agency footer and client branding.",
    },
    {
      q: "Can I automate monthly client SLA audit reports (PDF)?",
      a: "Yes. The Pro Agency and Enterprise tiers include automated monthly SLA PDF exports. On the 1st of each month (or on-demand), SteadyStack compiles 99.99% uptime proof, regional latency breakdowns, and resolved incident logs into a branded executive PDF you can hand over to clients during retainer renewals.",
    },
    {
      q: "Can I monitor private infrastructure behind corporate firewalls?",
      a: "Our lightweight Dockerized probe runs inside your client's private VPC or on-premise subnet. It establishes an outbound-only WebSocket control channel to our edge mesh. It pulls monitoring jobs, executes them internally against staging APIs or private databases, and sends encrypted metrics back without opening any inbound firewall ports.",
    },
    {
      q: "What alert channels are supported for team and client notifications?",
      a: "Alerts can be routed dynamically based on severity. SteadyStack natively supports Slack, Discord webhooks, Microsoft Teams, email, SMS, PagerDuty, and OpsGenie. You can route dev team alerts to Slack while dispatching client-facing incident notifications only when an outage exceeds their SLA threshold.",
    },
    {
      q: "What protocols are supported beyond standard HTTP/HTTPS?",
      a: "SteadyStack supports full HTTP/HTTPS with custom headers and payload validation, SSL/TLS certificate transparency and expiry auditing (with 30-day proactive warnings), DNS record integrity (A, AAAA, MX, TXT, CAA), TCP port reachability, and Cron dead-man heartbeats.",
    },
    {
      q: "Is telemetry data encrypted, and what is your log retention policy?",
      a: "All client configurations, webhook secrets, and telemetry logs are encrypted at rest and in transit. Raw event logs and latency metrics are retained for 30 days on Free, and up to 1 full year on Pro Agency and Enterprise Scale, with automated S3/R2 backup capabilities.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]"
      id="faq"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>Support & Insights</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 text-balance leading-[1.08]">
            Frequently asked questions.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-lg mx-auto text-balance">
            Everything you need to know about SteadyStack&apos;s global consensus mesh, white-label
            portals, and agency workflows.
          </p>
        </div>

        {/* FAQ Accordion List (Twin.so Style) */}
        <div className="space-y-3.5 text-left">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-[#e8e6df] rounded-2xl bg-white p-5 sm:p-6 transition-all duration-200 open:shadow-md hover:border-black/20"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-base sm:text-lg font-serif font-medium text-[#23211a] gap-4">
                <span>{faq.q}</span>
                <div className="size-8 rounded-full bg-[#f4f2eb] border border-[#e8e6df] flex items-center justify-center shrink-0 text-[#868279] group-open:rotate-180 group-open:bg-[#ffd439]/30 group-open:text-[#23211a] transition-all">
                  <ChevronDown className="size-4" />
                </div>
              </summary>
              <div className="mt-4 pt-4 border-t border-[#e8e6df] text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* Helpdesk Callout Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-[#e8e6df] text-center text-xs font-mono shadow-xs">
          <span className="text-[#5c5c5c]">Have a specialized architecture question?</span>{" "}
          <Link href={"/docs" as any} className="font-bold text-[#23211a] hover:underline">
            Talk directly to our engineering team →
          </Link>
        </div>
      </div>
    </section>
  );
}
