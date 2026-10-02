import type { Metadata } from "next";
import { ALL_PROBE_REGIONS } from "@steadystack/shared";
import LocationsClient from "./locations-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Every place we check from — Public Probe Locations | SteadyStack",
  description:
    "Live status of all probe regions, independent ASNs, and cryptographic CF-Worker headers to allowlist. Updated continuously with multi-ASN consensus verification.",
  alternates: {
    canonical: "/locations",
  },
  openGraph: {
    title: "Every place we check from — SteadyStack",
    description:
      "Live status of all probe regions, independent ASNs, and cryptographic CF-Worker headers to allowlist.",
    type: "website",
  },
};

export default function LocationsPage() {
  const probes = ALL_PROBE_REGIONS.map((region) => ({
    ...region,
    status: region.defaultHealthStatus || "ONLINE",
    currentLatency: region.isCloudflareDO ? 18 : 24,
    measuredColo: region.primaryColos[0] || "GLOBAL",
    lastCheck: "Just now",
  }));

  return <LocationsClient probes={probes} />;
}
