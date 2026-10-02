import type { Metadata } from "next";
import { LatencyChecker } from "./checker";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";
import { Globe, Sparkles, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global Website Latency Test & Multi-Region Ping | SteadyStack",
  description:
    "Instantly test your website's latency and TTFB from 10+ global edge locations. Detect regional routing bottlenecks, CDN edge cache misses, and peering issues for free.",
  keywords: [
    "global latency test",
    "multi region ping",
    "ttfb checker",
    "cdn performance test",
    "edge response time",
    "global website speed",
  ],
  alternates: {
    canonical: "/tools/global-latency",
  },
};

export default function GlobalLatencyPage() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] flex flex-col font-sans">
      <ToolSchema
        name="Global Website Latency Test"
        description="Instantly ping your website from 10 global locations. Check server latency, uptime, and regional performance for free."
        url="https://steadystack.dev/tools/global-latency"
      />
      <LandingHeader />

      <main className="container mx-auto pt-32 pb-20 px-4 sm:px-6 md:px-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
              <Globe className="size-3.5 text-[#ffd439]" />
              <span>Free Network Telemetry</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
              Global Latency Checker
            </h1>
            <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans text-balance">
              Test your endpoint&apos;s round-trip time and TTFB from 10+ global edge locations in
              real-time. Detect regional bottlenecks and CDN cache misses instantly.
            </p>
          </div>

          <LatencyChecker />

          <ToolContentSection
            toolName="Global Latency Checker"
            overviewTitle="Why Geographic Latency Dictates User Conversion and Core Web Vitals"
            overviewDescription="The speed of light in fiber optic cables introduces physical round-trip limits (~5ms per 1,000km). If your origin server resides exclusively in US-East (Virginia), users in Tokyo or Sydney incur at least 150ms–220ms of pure transmission delay for every un-cached TCP handshake and dynamic database request."
            howItWorks={[
              {
                title: "1. Distributed Edge Dispatch",
                content:
                  "Concurrent HTTP GET probes are dispatched simultaneously from North America, Europe, Asia-Pacific, South America, and Africa edge points of presence.",
                codeSnippet: "Probing: IAD | FRA | NRT | SYD | GRU | JNB",
              },
              {
                title: "2. Waterfall Timing Breakdown",
                content:
                  "Each edge node dissects the exact duration spent in DNS Lookup, TCP Connect, TLS Handshake, TTFB (Time to First Byte), and Content Download.",
                codeSnippet: "Total = DNS(12ms) + Connect(24ms) + TLS(38ms) + TTFB(45ms)",
              },
              {
                title: "3. Regional Variance & Outlier Scoring",
                content:
                  "We analyze regional latency standard deviation to highlight whether routing sub-optimality or CDN origin cache misses are penalizing specific continents.",
                codeSnippet: "Variance: US (35ms) vs APAC (280ms)",
              },
            ]}
            useCasesTitle="Common Reasons for High Regional Latency"
            useCases={[
              {
                title: "CDN Edge Cache Misses (cf-cache-status: DYNAMIC)",
                description:
                  "When HTML pages lack public Cache-Control headers, edge CDNs are forced to proxy every request across ocean cables back to your origin server.",
                badge: "Cache Miss",
              },
              {
                title: "DNS Anycast vs GeoDNS Sub-Optimality",
                description:
                  "If your DNS provider lacks global Anycast routing, international users must resolve DNS queries against distant nameservers before initiating a connection.",
                badge: "DNS Routing",
              },
              {
                title: "Transcontinental Database Queries",
                description:
                  "Serverless edge compute functions running in Europe that make 5 sequential queries to a PostgreSQL database located in us-east-1 compound hundreds of milliseconds of delay.",
                badge: "Architecture",
              },
              {
                title: "Sub-Optimal BGP Peering and Route Hijacking",
                description:
                  "Tier 1 ISP congestion or misrouted BGP paths can suddenly route European traffic through North American transit points, quadrupling round-trip time.",
                badge: "Peering Issue",
              },
            ]}
            faqs={[
              {
                question: "What is an acceptable global latency for a modern web application?",
                answer:
                  "For cached static content, latency should be sub-50ms globally via an edge CDN. For dynamic API endpoints, sub-150ms in your primary market and sub-350ms transcontinentally is considered high performance.",
              },
              {
                question: "How does TTFB (Time to First Byte) differ from total latency?",
                answer:
                  "TTFB measures the duration from when the client sends the HTTP request to when the first byte of response arrives. Total latency includes the complete content payload download.",
              },
              {
                question: "How can I automate global latency monitoring 24/7?",
                answer:
                  "SteadyStack monitors your endpoints continuously every 60 seconds from 7 sovereign regions, alerting you when regional latency spikes beyond dynamic SLA thresholds.",
              },
            ]}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
