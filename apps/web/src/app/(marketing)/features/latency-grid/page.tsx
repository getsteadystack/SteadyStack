import type { Metadata } from "next";
import { LatencyGridClient } from "./latency-grid-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Latency Grid Monitoring | SteadyStack Features",
  description:
    "Track performance dynamically. Run high-frequency checks from global edge centers and inspect payload structures with our Live Latency Grid sentinel.",
  alternates: {
    canonical: "/features/latency-grid",
  },
  openGraph: {
    title: "Live Latency Grid Monitoring | SteadyStack",
    description:
      "High-frequency latency monitoring and regional analysis across a global network of testing nodes.",
    type: "website",
  },
};

export default function LatencyGridPage() {
  return (
    <div className="container mx-auto pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <LatencyGridClient />
      </div>
    </div>
  );
}
