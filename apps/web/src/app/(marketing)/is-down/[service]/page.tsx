import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home, Layers, ArrowRight } from "lucide-react";
import {
  getAllServices,
  getServiceBySlug,
  CATEGORY_LABELS,
  type ServiceDownInfo,
} from "@/content/is-down-services";
import { checkServiceLiveStatus } from "@/actions/service-probe";
import { ServiceStatusCard } from "@/components/is-down/service-status-card";
import { ConversionCta } from "@/components/is-down/conversion-cta";
import { ServiceDiagnostics } from "@/components/is-down/service-diagnostics";
import { ServiceFaq } from "@/components/is-down/service-faq";
import { AgencyOutageCta } from "@/components/is-down/agency-outage-cta";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const services = getAllServices();
  return services.map((s) => ({
    service: s.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Status Not Found | SteadyStack",
      description: "The requested service status page could not be located.",
    };
  }

  const title = `Is ${service.name} Down Right Now? Live Status, Outage Tracker & Latency | SteadyStack`;
  const description = `Check if ${service.name} (${service.domain}) is down or experiencing service degradation. Real-time global uptime, edge latency telemetry, official status links, and automated monitoring. Stop checking manually.`;
  const url = `https://steadystack.dev/is-down/${service.slug}`;

  return {
    title,
    description,
    keywords: [
      `is ${service.name.toLowerCase()} down`,
      `is ${service.name.toLowerCase()} down right now`,
      `${service.name.toLowerCase()} outage`,
      `${service.name.toLowerCase()} status`,
      `${service.name.toLowerCase()} status page`,
      `is ${service.domain} down`,
      `${service.name.toLowerCase()} api down`,
      `${service.name.toLowerCase()} down detector`,
      `${service.name.toLowerCase()} downtime`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "SteadyStack",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ServiceDownPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Perform live edge status check at request time
  const initialProbe = await checkServiceLiveStatus(service.domain, service.apiEndpoint);

  // Retrieve related services in the same ecosystem
  const relatedServices: ServiceDownInfo[] = service.relatedServices
    .map((sSlug) => getServiceBySlug(sSlug))
    .filter((s): s is ServiceDownInfo => s !== undefined)
    .slice(0, 6);

  const baseUrl = "https://steadystack.dev";
  const pageUrl = `${baseUrl}/is-down/${service.slug}`;

  // Structured Data (JSON-LD) for FAQPage, Breadcrumbs, and SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Outage Directory",
            item: `${baseUrl}/is-down`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `Is ${service.name} Down?`,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Is ${service.name} down right now?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `SteadyStack real-time edge probes test ${service.name} (${service.domain}) across multiple global locations. Check our live status indicator and regional latency metrics for instantaneous verification.`,
            },
          },
          {
            "@type": "Question",
            name: `How can I tell if ${service.name} is down vs my own application?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Check for 502 Bad Gateway, 504 Gateway Timeout, and connection reset error codes on ${service.domain}. Compare with our live edge probe and ${service.name}'s official status page at ${service.officialStatusUrl}.`,
            },
          },
          {
            "@type": "Question",
            name: `Why should I automate ${service.name} status checks?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `SteadyStack monitors ${service.name} every 10 seconds from 15 global edge nodes with consensus verification, alerting your engineering team on Slack, Discord, SMS, or PagerDuty the second degradation begins so you can stop checking manually.`,
            },
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: `SteadyStack ${service.name} Status Sentinel`,
        url: pageUrl,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Cloud Edge",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        creator: {
          "@type": "Organization",
          name: "SteadyStack",
          url: baseUrl,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-mono text-[#868279] uppercase tracking-wider"
        >
          <Link
            href="/"
            className="hover:text-[#23211a] transition-colors flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#868279]/50" />
          <Link href={"/is-down" as any} className="hover:text-[#23211a] transition-colors">
            Outage Directory
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#868279]/50" />
          <span className="text-[#23211a] font-semibold">Is {service.name} Down?</span>
        </nav>

        {/* Hero Title Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#ffd439]/20 text-[#23211a] border border-[#ffd439]/40">
              {CATEGORY_LABELS[service.category]}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs text-[#868279] border border-[#e8e6df] bg-white">
              {service.domain}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
            Is {service.name} Down Right Now?
          </h1>

          <p className="text-base sm:text-lg text-[#5c5c5c] max-w-3xl leading-relaxed font-sans text-balance">
            Live global uptime status, multi-region edge latency, official incident reports, and
            automated monitoring for{" "}
            <strong className="text-[#23211a] font-semibold">{service.name}</strong>.
          </p>
        </div>

        {/* 1. Real-Time Status & Probe Card */}
        <ServiceStatusCard service={service} initialProbe={initialProbe} />

        {/* 2. Relentless Core Conversion CTA ("Stop checking manually.") */}
        <ConversionCta service={service} />

        {/* 2b. Agency Fleet Monitoring & Lead Magnet CTA */}
        <AgencyOutageCta service={service} />

        {/* 3. Detailed Regional Diagnostics, Symptoms & Resilience Guide */}
        <ServiceDiagnostics service={service} probeResult={initialProbe} />

        {/* 4. Structured FAQ Accordion */}
        <ServiceFaq service={service} />

        {/* 5. Related Services Cluster for Topical Authority & Indexing */}
        {relatedServices.length > 0 && (
          <div className="rounded-2xl border border-[#e8e6df] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#868279]">
              <Layers className="h-4 w-4 text-[#23211a]" />
              <span>Related {CATEGORY_LABELS[service.category]} Dependencies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/is-down/${rel.slug}` as any}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] hover:bg-[#f5f3ec] hover:border-[#23211a]/30 transition-all text-xs font-medium text-[#23211a] group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Is {rel.name} down?</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#868279] group-hover:text-[#23211a] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
