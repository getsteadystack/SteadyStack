import type { Metadata } from "next";
import { LatencyChecker } from "./checker";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

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

/**
 * Renders the Global Latency Checker page with interactive pinging and networking performance guides.
 */
export default function GlobalLatencyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Global Website Latency Test"
        description="Instantly ping your website from 10 global locations. Check server latency, uptime, and regional performance for free."
        url="https://steadystack.dev/tools/global-latency"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent pb-2">
              Global Latency Checker
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Test your website's performance from 10+ cities worldwide in real-time. Identify
              bottlenecks and ensure global availability.
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
                badge: "ISP Peering",
              },
            ]}
            faqs={[
              {
                question: "What is an ideal global TTFB target?",
                answer:
                  "For global SaaS and e-commerce websites, an edge TTFB under 100ms for cached assets and under 300ms for dynamic API endpoints is considered world-class.",
              },
              {
                question: "How can I reduce latency for international users?",
                answer:
                  "Use a global CDN with edge caching (Cloudflare, Fastly), implement read-replica databases close to target markets, and enable TLS 1.3 with 0-RTT session resumption.",
              },
              {
                question: "Why do latency measurements vary between consecutive tests?",
                answer:
                  "Variables such as cold-start serverless container initialization, BGP route flapping, CDN cache warming, and transient ISP congestion cause minor variations between pings.",
              },
              {
                question: "How does SteadyStack track global latency over time?",
                answer:
                  "SteadyStack captures response times every minute from over 50 global vantage points, plotting regional latency grids and alerting you if response times spike above your SLA thresholds.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
