import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { HallOfFameClient } from "./hall-of-fame-client";
import { getLeaderboard } from "@/actions/leaderboard";
import {
  ArrowRight,
  HelpCircle,
  Trophy,
  Award,
  ShieldCheck,
  Activity,
  Globe,
  Cpu,
} from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Hall of Fame & 99.99% Uptime Leaderboard | SteadyStack",
  description:
    "Meet the top indie developers, dev shops, and engineering teams achieving 99.99% uptime on SteadyStack. Verified by continuous multi-region edge quorum monitoring.",
  alternates: {
    canonical: "/hall-of-fame",
  },
  openGraph: {
    title: "Community Hall of Fame & 99.99% Uptime Leaderboard | SteadyStack",
    description:
      "Top-tier uptime performers ranked by verified SLA and multi-region quorum consensus.",
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
        "SteadyStack utilizes multi-region edge quorum consensus: an outage is only logged if multiple independent edge nodes (2-of-3 on Free, 4-of-7 on Paid) agree that the endpoint is down, filtering out single-node transit blips.",
    },
    {
      question: "What is the difference between 99.9% and 99.99% uptime?",
      answer:
        "Three nines (99.9%) allows up to 43 minutes and 49 seconds of downtime per month. Four nines (99.99%) allows only 4 minutes and 22 seconds of downtime per month, requiring automated origin failover and edge-first caching.",
    },
    {
      question: "How can my team appear on the Community Hall of Fame?",
      answer:
        "Enable public leaderboard broadcasting in your SteadyStack project settings under Privacy. Your ranking updates automatically based on verified 30-day SLA performance once you hit 100+ continuous checks.",
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
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingHeader />

      <main className="flex-1 container mx-auto pt-32 pb-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-20">
          <HallOfFameClient initialEntries={leaderboard} />

          {/* SLA Guide & Four Nines Philosophy */}
          <div id="sla-guide" className="border-t border-[#e8e6df] pt-20 space-y-16">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
                <Trophy className="size-3 text-[#ffd439]" />
                <span>The Pursuit of Four Nines</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a]">
                High availability engineered: What it takes to reach 99.99%
              </h2>
              <p className="text-[#5c5c5c] text-base leading-relaxed font-sans">
                Achieving 99.99% (&ldquo;four nines&rdquo;) uptime isn&apos;t luck — it is the
                result of deliberate systems architecture: multi-region origin failover, automated
                health checks, zero-downtime canary deployments, and edge-first DNS routing.
              </p>
            </div>

            {/* 3 Engineering Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Activity className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  Quorum-Verified Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Every data point is independently validated across global Cloudflare edge zones,
                  ensuring rankings reflect true origin reachability rather than synthetic probe
                  blips.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Globe className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  Edge Redundancy & Failover
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Top performers run multi-region active-active deployments with automated DNS
                  health routing that shifts traffic away from failing origin instances in under 15
                  seconds.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-xs">
                <div className="size-10 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center border border-[#ffd439]/50">
                  <Award className="size-5" />
                </div>
                <h3 className="font-serif font-medium text-xl text-[#23211a]">
                  Radical Public Proof
                </h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  Hall of Fame members use their verified 99.99% uptime badges on landing pages and
                  sales proposals to prove engineering competence to enterprise clients.
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
                  How the Hall of Fame rankings work
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hallOfFameFaqs.map((faq, idx) => (
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
                <ShieldCheck className="size-3.5 text-[#ffd439]" />
                <span>Join the Top 1%</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-white mb-4 max-w-2xl text-balance">
                Benchmark your infrastructure against the community
              </h3>

              <p className="text-white/80 text-sm sm:text-base max-w-xl mb-8 font-sans leading-relaxed text-balance">
                Set up 50 free monitors with 1-minute check intervals, test your failover
                redundancy, and broadcast your verified uptime.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <span>Start Free Monitoring</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/showcase"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
                >
                  <span>View Status Page Gallery</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3.5 text-emerald-400" />
                  <span>Continuous 1-minute checks</span>
                </div>
                <span>·</span>
                <span>Multi-region quorum consensus</span>
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
