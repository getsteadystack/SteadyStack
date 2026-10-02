import type { Metadata } from "next";
import { DispatchClient } from "./dispatch-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Automated Incident Alert Dispatching | SteadyStack Features",
  description:
    "Zero delay dispatch pipeline. Automatically send alerts, invoke custom webhooks, and page on-call teams the instant an outage is confirmed.",
  alternates: {
    canonical: "/features/automated-dispatch",
  },
  openGraph: {
    title: "Automated Incident Alert Dispatching | SteadyStack",
    description:
      "Configure instant webhook triggers and on-call routing to minimize incident response times.",
    type: "website",
  },
};

export default function AutomatedDispatchPage() {
  return (
    <div className="container mx-auto pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <DispatchClient />
      </div>
    </div>
  );
}
