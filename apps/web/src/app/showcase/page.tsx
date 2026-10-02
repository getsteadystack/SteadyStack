import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ShowcaseGallery } from "./showcase-gallery";
import { getShowcaseEntries } from "@/actions/showcase";
import { ArrowRight, HelpCircle, Shield, Sparkles, Globe, Palette, Bell } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cyberpunk Status Page Showcase & Design Gallery | SteadyStack",
  description:
    "Explore beautifully crafted cyberpunk and modern developer status pages built with SteadyStack. Discover custom domains, incident communication workflows, and live SLAs.",
  alternates: {
    canonical: "/showcase",
  },
  openGraph: {
    title: "Cyberpunk Status Page Showcase & Design Gallery",
    description:
      "Explore beautifully crafted cyberpunk and modern developer status pages built with SteadyStack.",
  },
};

export default async function ShowcasePage() {
  // Fetch live community entries — falls back to empty array if none have opted in yet
  const entries = await getShowcaseEntries(18);

  const showcaseFaqs = [
    {
      question: "Why should my SaaS or API have a public status page?",
      answer:
        "A public status page dramatically reduces customer support ticket volume during outages, builds transparency with enterprise buyers, and proves historical SLA reliability to prospective customers.",
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
      question: "What makes SteadyStack's cyberpunk status pages unique?",
      answer:
        "Unlike generic corporate status pages, SteadyStack offers developer-first aesthetics with dark themes, phosphor CRT scanlines, retro-terminal palettes, and clean ASCII telemetry that engineers love.",
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
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingHeader />
      <main className="flex-1 container mx-auto pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <ShowcaseGallery initialEntries={entries} />

          {/* Editorial & Design Guide */}
          <div className="border-t border-border/60 pt-16 space-y-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
                <Sparkles className="size-3.5" />
                <span>Developer-First Status Pages</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Building Trust Through Transparent Incident Communication
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
                When critical cloud services experience degraded latency or unexpected downtime,
                customers don't want corporate silence. A beautifully branded, real-time status page
                turns an incident from a customer frustration into a demonstration of engineering
                competence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <Palette className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  Cyberpunk & Modern Dark Themes
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Customize colors, CRT scanline effects, custom logos, and monospace typography to
                  match your brand's developer aesthetic.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <Globe className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  Instant Custom Domain CNAMEs
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Point a CNAME record from status.yourcompany.com with zero configuration,
                  automatic TLS certificate management, and DDoS protection.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <Bell className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  Multi-Channel Subscriptions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep users in the loop with automated alerts via email, Slack webhooks, Discord
                  channels, and RSS feeds.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <HelpCircle className="size-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Learn more about configuring, customizing, and hosting public status pages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcaseFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-border/80 bg-card/30 space-y-2 hover:bg-card/50 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground text-sm">{faq.question}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                  <Shield className="size-4" />
                  <span>Free Forever Status Pages</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Launch Your Custom Status Page in Under 60 Seconds
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Deploy a live status page with 50 free monitors, multi-region quorum consensus,
                  and custom domains.
                </p>
              </div>
              <Link
                href={"/signup" as any}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-primary/20 shrink-0"
              >
                <span>Create Your Status Page</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
