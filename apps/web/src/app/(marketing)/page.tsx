import type { Metadata } from "next";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import ProblemSection from "@/components/landing/problem-section";
import SolutionSection from "@/components/landing/solution-section";
import ProofShowcase from "@/components/landing/proof-showcase";
import Pricing from "@/components/landing/pricing";
import FAQ from "@/components/landing/faq";
import CTA from "@/components/landing/cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SteadyStack - Multi-Client Edge Uptime Monitoring & SLA Proof for Agencies",
  description:
    "Multi-region edge uptime monitoring built for agencies. Eliminate false alarms with 7-region quorum consensus, provide white-label client status portals, and automate monthly SLA reports.",
  alternates: {
    canonical: "https://steadystack.dev/",
  },
  openGraph: {
    title: "SteadyStack - Multi-Client Edge Uptime Monitoring & SLA Proof for Agencies",
    description:
      "Multi-region edge uptime monitoring built for agencies. Eliminate false alarms with 7-region quorum consensus, provide white-label client status portals, and automate monthly SLA reports.",
    url: "https://steadystack.dev/",
    siteName: "SteadyStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteadyStack - Multi-Client Edge Uptime Monitoring & SLA Proof for Agencies",
    description:
      "Multi-region edge uptime monitoring built for agencies. Eliminate false alarms with 7-region quorum consensus, provide white-label client status portals, and automate monthly SLA reports.",
    creator: "@steadystack",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ProblemSection />
      <SolutionSection />
      <ProofShowcase />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
