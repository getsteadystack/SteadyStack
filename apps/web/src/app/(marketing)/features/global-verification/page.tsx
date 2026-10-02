import type { Metadata } from "next";
import { VerificationClient } from "./verification-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Multi-Region Global Verification | SteadyStack Features",
  description:
    "Multi-region quorum consensus checking. Avoid alert fatigue by cross-referencing outages using multiple global vantage nodes before triggering alarms.",
  alternates: {
    canonical: "/features/global-verification",
  },
  openGraph: {
    title: "Multi-Region Global Verification | SteadyStack",
    description:
      "Avoid alert fatigue. Nodes verify outage consensus across global centers to prevent false downtime alerts.",
    type: "website",
  },
};

export default function GlobalVerificationPage() {
  return (
    <div className="container mx-auto pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <VerificationClient />
      </div>
    </div>
  );
}
