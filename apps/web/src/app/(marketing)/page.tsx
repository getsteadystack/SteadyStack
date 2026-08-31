import type { Metadata } from "next";
import FAQ from "@/components/landing/faq";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import Pricing from "@/components/landing/pricing";
import HowItWorks from "@/components/landing/how-it-works";
import ComparisonTable from "@/components/landing/comparison-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SteadyStack - Uptime Monitoring With Zero False Positives",
  description:
    "Multi-region uptime monitoring that confirms failures across 7 global regions before alerting you. Free for 50 endpoints, commercial use included.",
  alternates: {
    canonical: "https://steadystack.dev/",
  },
  openGraph: {
    title: "SteadyStack - Uptime Monitoring With Zero False Positives",
    description:
      "Multi-region uptime monitoring that confirms failures across 7 global regions before alerting you. Free for 50 endpoints, commercial use included.",
    url: "https://steadystack.dev/",
    siteName: "SteadyStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteadyStack - Uptime Monitoring With Zero False Positives",
    description:
      "Multi-region uptime monitoring that confirms failures across 7 global regions before alerting you. Free for 50 endpoints, commercial use included.",
    creator: "@steadystack",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <ComparisonTable />
      <Pricing />
      <FAQ />
    </>
  );
}
