import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { HallOfFameClient } from "./hall-of-fame-client";
import { getLeaderboard } from "@/actions/leaderboard";
import { ArrowRight, HelpCircle, Trophy, Award, ShieldCheck, Activity } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Hall of Fame & 99.99% Uptime Leaderboard | SteadyStack",
  description:
    "Meet the top indie developers and engineering teams achieving 99.99% uptime on SteadyStack. Verified by continuous multi-region edge quorum monitoring.",
  alternates: {
    canonical: "/hall-of-fame",
  },
  openGraph: {
    title: "Community Hall of Fame & 99.99% Uptime Leaderboard",
    description: "Top-tier uptime performers ranked by verified SLA.",
  },
};

export default async function HallOfFamePage() {
  const leaderboard = await getLeaderboard(100);

  const hallOfFameFaqs = [
    {
      question: "How is uptime calculated for the Hall of Fame leaderboard?",
      answer:
        "Uptime percentage is calculated using total successful checks divided by total scheduled checks across a rolling 30-day window. Only outages confirmed by multi-region quorum consensus count against your SLA.",
    },
    {
      question: "How does SteadyStack prevent false downtime on the leaderboard?",
      answer:
        "SteadyStack utilizes multi-region quorum consensus: an outage is only logged if multiple independent edge nodes agree that the endpoint is down, filtering out local ISP hiccups and regional transit blips.",
    },
    {
      question: "What is the difference between 99.9% and 99.99% uptime?",
      answer:
        "Three nines (99.9%) allows up to 43 minutes and 49 seconds of downtime per month. Four nines (99.99%) allows only 4 minutes and 22 seconds of downtime per month, requiring automated failover and edge redundancy.",
    },
    {
      question: "How can my project appear on the Community Hall of Fame?",
      answer:
        "Enable public status page broadcasting in your SteadyStack project settings and opt in to the Community Hall of Fame leaderboard. Your ranking will update automatically based on verified 30-day SLA performance.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hallOfFameFaqs.map((faq) => ({
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
        <div className="max-w-5xl mx-auto space-y-16">
          <HallOfFameClient initialEntries={leaderboard} />

          {/* SLA Guide & Hall of Fame Philosophy */}
          <div className="border-t border-border/60 pt-16 space-y-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
                <Trophy className="size-3.5" />
                <span>The Pursuit of Four Nines</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                High Availability Engineered: What It Takes to Reach 99.99%
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
                Achieving 99.99% ("four nines") uptime isn't luck — it is the result of deliberate
                architecture: multi-region origin failover, automated health checks, zero-downtime
                canary deployments, and edge-first DNS routing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <Activity className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  Quorum-Verified Telemetry
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every data point is validated across Cloudflare edge nodes, ensuring leaderboard
                  positions reflect real global availability, not localized network jitter.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <Award className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Downtime Allowances</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  99.9% = 43.8m/month downtime <br />
                  99.95% = 21.9m/month downtime <br />
                  99.99% = 4.38m/month downtime
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Public Trust Badges</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Embed live SVG SLA badges directly into your GitHub READMEs, landing pages, and
                  documentation to showcase your uptime record.
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
                  Learn more about SLA calculations, leaderboard requirements, and verification
                  metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hallOfFameFaqs.map((faq, idx) => (
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
                  <Trophy className="size-4" />
                  <span>Claim Your Spot</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Put Your Infrastructure to the Test
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Start monitoring with SteadyStack and showcase your team's reliability on the
                  global leaderboard.
                </p>
              </div>
              <Link
                href={"/signup" as any}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-primary/20 shrink-0"
              >
                <span>Join the Leaderboard</span>
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
