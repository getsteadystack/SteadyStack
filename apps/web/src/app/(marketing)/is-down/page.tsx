import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { getAllServices } from "@/content/is-down-services";
import { IsDownDirectory } from "@/components/is-down/is-down-directory";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Is It Down? Live Outage Tracker & Global Service Status Directory | SteadyStack",
  description:
    "Real-time outage checker and uptime status directory for 400+ cloud, AI, developer, payment, gaming, and streaming services including Stripe, GitHub, OpenAI, AWS, Steam, Netflix, and Gemini. Stop checking manually.",
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
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hub Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>400+ Monitored Developer, Cloud & Consumer Services</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight">
            Is it down? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Real-time outage tracker.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
            Live multi-region status checks, latency telemetry, and incident diagnostics for 400+
            APIs, cloud providers, streaming, gaming, and SaaS platforms. Stop checking manually.
          </p>
        </div>

        {/* Directory Component with Search and Categories */}
        <IsDownDirectory services={services} />

        {/* Bottom Banner: Custom Monitoring Pitch */}
        <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-12 backdrop-blur-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl font-bold text-foreground">
              Don't see your internal service or custom API?
            </h3>
            <p className="text-sm text-muted-foreground">
              SteadyStack gives you 50 free synthetic monitors with 10-second checks from 15 global
              edge locations, multi-region consensus, and instant Slack / Discord alerts.
            </p>
          </div>

          <Link
            href={"/signup" as any}
            className={cn(buttonVariants({ size: "lg" }), "shrink-0 font-bold")}
          >
            <span>Create Free Account</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
