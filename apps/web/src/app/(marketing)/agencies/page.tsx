import type { Metadata } from "next";
import AgencyHero from "@/components/agencies/agency-hero";
import AgencyManifesto from "@/components/agencies/agency-manifesto";
import AgencyPillars from "@/components/agencies/agency-pillars";
import AgencyCalculator from "@/components/agencies/agency-calculator";
import ProofShowcase from "@/components/landing/proof-showcase";
import AgencyExistingUsers from "@/components/agencies/agency-existing-users";
import AgencyFAQ from "@/components/agencies/agency-faq";
import AgencyCTA from "@/components/agencies/agency-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SteadyStack for Agencies | White-Label Uptime & SLA Reports",
  description:
    "Learn why SteadyStack shifted to digital agencies. Deliver white-label status pages, automated monthly client SLA PDF reports, and far fewer false alarms.",
  alternates: {
    canonical: "/agencies",
  },
  openGraph: {
    title: "SteadyStack for Agencies | White-Label Uptime & Client SLA Reports",
    description:
      "Uptime monitoring your clients can see. Multi-client workspaces, custom CNAME status portals, automated monthly SLA PDF exports, and 4-of-7 quorum verification.",
    url: "https://steadystack.dev/agencies",
    siteName: "SteadyStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteadyStack for Agencies | White-Label Uptime & Client SLA Reports",
    description:
      "Why SteadyStack shifted to agencies: white-label status pages, automated monthly PDF SLA audits, and far fewer 3 AM false alarms.",
    creator: "@steadystack",
  },
};

export default function AgenciesPage() {
  return (
    <div className="flex flex-col">
      <AgencyHero />
      <AgencyManifesto />
      <AgencyPillars />
      <ProofShowcase />
      <AgencyCalculator />
      <AgencyExistingUsers />
      <AgencyFAQ />
      <AgencyCTA />
    </div>
  );
}
