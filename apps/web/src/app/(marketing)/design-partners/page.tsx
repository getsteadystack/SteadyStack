import type { Metadata } from "next";
import DesignPartnerClient from "./design-partner-client";
import { getDesignPartnerSpots } from "@/actions/design-partners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design Partner Program: 1-Year Free Pro | SteadyStack",
  description:
    "Join the SteadyStack Design Partner Program. Get 1 year of free Netrunner Pro ($228 value) with 250 monitors, 30s checks, and founder support.",
  alternates: {
    canonical: "/design-partners",
  },
  openGraph: {
    title: "Design Partner Program: 1-Year Free Pro | SteadyStack",
    description:
      "Join the SteadyStack Design Partner Program. Get 1 year of free Netrunner Pro ($228 value) with 250 monitors, 30s checks, and founder support.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Partner Program: 1-Year Free Pro | SteadyStack",
    description:
      "Claim 1 year of free Netrunner Pro ($228 value) for your engineering team. 15 spots available.",
  },
};

export default async function DesignPartnersPage() {
  const spotsInfo = await getDesignPartnerSpots();
  return <DesignPartnerClient initialSpotsInfo={spotsInfo} />;
}
