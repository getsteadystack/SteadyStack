import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ShowcaseGallery } from "./showcase-gallery";
import { getShowcaseEntries } from "@/actions/showcase";
import {
  ArrowRight,
  HelpCircle,
  Shield,
  Sparkles,
  Globe,
  Palette,
  Bell,
  ShieldCheck,
  Activity,
} from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Status Page Showcase & Design Gallery | SteadyStack",
  description:
    "Explore beautifully crafted modern status pages built with SteadyStack. Discover custom domains, multi-region telemetry, and subscriber workflows.",
  alternates: {
    canonical: "/showcase",
  },
  openGraph: {
    title: "Status Page Showcase & Design Gallery | SteadyStack",
    description:
      "Explore beautifully crafted modern and client-ready status pages built with SteadyStack.",
  },
};

export default async function ShowcasePage() {
  const entries = await getShowcaseEntries(18);

  const showcaseFaqs = [
    {
      question: "Why should my SaaS or agency have a public status page?",
      answer:
        "A public status page dramatically reduces customer support ticket volume during outages, builds transparency with enterprise clients, and proves historical SLA reliability to prospective buyers.",
    },
    {
      question: "Can I connect my own custom domain to a SteadyStack status page?",
      answer:
        "Yes. All SteadyStack plans allow you to host your status page on custom subdomains (e.g. status.yourdomain.com) with automatic SSL provisioning via Cloudflare edge routing.",
    },
    {
      question: "How do subscriber notifications work during an incident?",
      answer:
        "Users can subscribe to your status page via Email, Slack, Discord, or Webhooks. When you post an incident update or an automated probe detects downtime, subscribers receive real-time notifications.",
    },
    {
      question: "What makes SteadyStack's status pages unique?",
      answer:
        "Unlike generic corporate status pages, SteadyStack offers polished, modern themes with real-time multi-region latency graphs, dark and light modes, custom logos, and white-labeling suitable for client deliverables.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: showcaseFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingHeader />

      <main className="flex-1 container mx-auto pt-32 pb-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-20">
          <ShowcaseGallery initialEntries={entries} />

          {/* Design Guide & Principles */}
          <div id="guidelines" className="border-t border-[#e8e6df] pt-20 space-y-16">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
                <Sparkles className="size-3 text-[#ffd439]" />
                <span>Status Page Standards</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a]">
                Building trust through radical uptime transparency
              </h2>
              <p className="text-[#5c5c5c] text-base leading-relaxed font-sans">
                When cloud infrastructure suffers an outage, customers don&apos;t want corporate
                silence. A beautifully branded, real-time status page turns an unexpected incident
                into a clear demonstration of engineering competence.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Palette className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  5 Tailored Theme Modes
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Customize colorways, custom company logos, responsive latency charts, and
                  dark/light modes to match your brand guidelines with zero CSS headaches.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Globe className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  Instant CNAME Custom Domains
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Point{" "}
                  <code className="px-1.5 py-0.5 rounded bg-[#f0ede6] text-[#23211a] font-mono text-xs">
                    status.yourbrand.com
                  </code>{" "}
                  in one click with automatic TLS certificate issuance and DDoS protection via
                  Cloudflare edge.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Bell className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  Multi-Channel Subscriptions
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Allow your end users to subscribe via email, Slack webhooks, Discord channels, and
                  SMS for instant incident post-mortem alerts.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-8 pt-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
                  <HelpCircle className="size-4" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a]">
                  Everything you need to know about status pages
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcaseFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-[#e8e6df] bg-white space-y-2 shadow-xs"
                  >
                    <h3 className="font-serif font-medium text-base text-[#23211a]">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Dark CTA Banner */}
            <div className="rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-16 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
                <Activity className="size-3.5 text-[#ffd439]" />
                <span>Instant Setup</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-white mb-4 max-w-2xl text-balance">
                Launch your branded status page in 60 seconds
              </h3>

              <p className="text-white/80 text-sm sm:text-base max-w-xl mb-8 font-sans leading-relaxed text-balance">
                Connect 50 monitors for free, bind your custom subdomain, and start broadcasting
                real-time health telemetry today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <span>Create Free Status Page</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/agencies"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
                >
                  <span>Agency White-Labeling</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  <span>Free forever plan</span>
                </div>
                <span>·</span>
                <span>Custom CNAME included</span>
                <span>·</span>
                <span>Zero credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
