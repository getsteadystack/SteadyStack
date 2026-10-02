import type { Metadata } from "next";
import DesignPartnerClient from "./design-partner-client";
import { getDesignPartnerSpots } from "@/actions/design-partners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design Partner Program: 1-Year Free Agency Plan | SteadyStack",
  description:
    "Join the SteadyStack Design Partner Program. Get 1 year of free Agency Plan ($348 value) with up to 10 clients, white-label portals, and founder support.",
  alternates: {
    canonical: "/design-partners",
  },
  openGraph: {
    title: "Design Partner Program: 1-Year Free Agency Plan | SteadyStack",
    description:
      "Join the SteadyStack Design Partner Program. Get 1 year of free Agency Plan ($348 value) with up to 10 clients, white-label portals, and founder support.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Partner Program: 1-Year Free Agency Plan | SteadyStack",
    description:
      "Claim 1 year of free Agency Plan ($348 value) for your agency or consultancy. 15 spots available.",
  },
};

export default async function DesignPartnersPage() {
  const spotsInfo = await getDesignPartnerSpots();
  return <DesignPartnerClient initialSpotsInfo={spotsInfo} />;
}
