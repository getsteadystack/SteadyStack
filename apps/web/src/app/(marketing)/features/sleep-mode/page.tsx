import type { Metadata } from "next";
import { SleepModeClient } from "./sleep-mode-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "False-Positive Elimination — SteadyStack",
  description:
    "Uptime monitoring that eliminates 3 AM false alarms. SteadyStack confirms outages across multi-region quorum consensus before paging your team.",
  alternates: {
    canonical: "/features/sleep-mode",
  },
  openGraph: {
    title: "Zero False Positives — SteadyStack",
    description:
      "Multi-region quorum verification and flapping protection. When SteadyStack pages you at 3 AM, it's a real outage.",
  },
};

export default function SleepModePage() {
  return (
    <div className="container mx-auto pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <SleepModeClient />
      </div>
    </div>
  );
}
