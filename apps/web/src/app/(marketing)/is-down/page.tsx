import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Sparkles } from "lucide-react";
import { getAllServices } from "@/content/is-down-services";
import { IsDownDirectory } from "@/components/is-down/is-down-directory";
import { AgencyOutageCta } from "@/components/is-down/agency-outage-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Is It Down? Live Outage Tracker & Global Service Status Directory | SteadyStack",
  description:
    "Real-time outage checker and uptime status directory for 400+ cloud, AI, developer, payment, gaming, and streaming services including Stripe, GitHub, OpenAI, AWS, Steam, Netflix, and Gemini.",
  keywords: [
    "is it down",
    "is service down",
    "live outage tracker",
    "is github down",
    "is stripe down",
    "is openai down",
    "is vercel down",
    "is aws down",
    "is steam down",
    "api status checker",
    "cloud status monitoring",
  ],
  alternates: {
    canonical: "https://steadystack.dev/is-down",
  },
  openGraph: {
    type: "website",
    url: "https://steadystack.dev/is-down",
    title: "Is It Down? Live Outage Tracker & Global Service Status Directory | SteadyStack",
    description:
      "Check live status, multi-region edge latency, and outage reports for 400+ developer, cloud, gaming, and SaaS services.",
    siteName: "SteadyStack",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is It Down? Live Outage Tracker & Global Service Status Directory",
    description:
      "Real-time outage checker for 400+ services. Stop checking manually — get instant edge alerts with SteadyStack.",
  },
};

export default function IsDownHubPage() {
  const services = getAllServices();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SteadyStack Outage Tracker & Service Status Directory",
    description:
      "Real-time status, latency, and outage tracking directory for 400+ developer, cloud, and tech services.",
    url: "https://steadystack.dev/is-down",
    publisher: {
      "@type": "Organization",
      name: "SteadyStack",
      url: "https://steadystack.dev",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: services.slice(0, 50).map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Is ${service.name} Down?`,
        url: `https://steadystack.dev/is-down/${service.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hub Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <Activity className="size-3.5 text-[#ffd439]" />
            <span>400+ Monitored Developer, Cloud & Consumer Services</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
            Is it down? <br className="hidden sm:inline" />
            Real-time outage tracker.
          </h1>

          <p className="text-base sm:text-lg text-[#5c5c5c] leading-relaxed max-w-2xl mx-auto font-sans text-balance">
            Live multi-region status checks, latency telemetry, and incident diagnostics for 400+
            APIs, cloud providers, streaming, gaming, and SaaS platforms. Stop checking manually.
          </p>
        </div>

        {/* Directory Search & Grid */}
        <IsDownDirectory services={services} />

        {/* Agency Outage Callout */}
        <AgencyOutageCta />
      </div>
    </div>
  );
}
