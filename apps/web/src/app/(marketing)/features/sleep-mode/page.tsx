import type { Metadata } from "next";
import { SleepModeClient } from "./sleep-mode-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sleep Mode — SteadyStack",
  description:
    "False-positive prevention that lets solo devs sleep through the night. SteadyStack filters out 2-second blips so if we call you, it's real.",
  alternates: {
    canonical: "/features/sleep-mode",
  },
  openGraph: {
    title: "Sleep Mode — SteadyStack",
    description:
      "Multi-vector verification, flapping detection, and dynamic thresholding. If SteadyStack calls you at 3 AM, it's a real outage.",
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
