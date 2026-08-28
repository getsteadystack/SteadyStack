import type { Metadata } from "next";
import { RoastMyStack } from "@/components/tools/roast-my-stack";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Tech Stack & Performance Roast Analyzer | SteadyStack",
  description:
    "Get roasted by SteadyStack: analyze your stack for slow TTFB, uncompressed assets, missing security headers, weak SSL, and DNS bottlenecks. Free instant audit.",
  keywords: [
    "website analyzer",
    "stack audit",
    "performance checker",
    "TTFB test",
    "SSL health",
    "DNS check",
    "security headers",
  ],
  alternates: {
    canonical: "/tools/roast-my-stack",
  },
};

export default function RoastMyStackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Free Roast My Stack Analyzer"
        description="Get roasted by SteadyStack: analyze your stack for slow TTFB, weak SSL, missing DNS records, and more. Free instant audit."
        url="https://steadystack.dev/tools/roast-my-stack"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-primary to-orange-400 bg-clip-text text-transparent pb-2">
              Roast My Stack
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Enter a URL and SteadyStack will ruthlessly analyze your tech stack. TTFB, SSL, DNS,
              headers &mdash; we check everything so you can fix what's broken.
            </p>
          </div>

          <RoastMyStack />

          <ToolContentSection
            toolName="Stack Analyzer"
            overviewTitle="What Makes a Production Web Stack Fast, Resilient, and Secure?"
            overviewDescription="Modern infrastructure failures rarely stem from pure code bugs. Instead, slow Time to First Byte (TTFB), misconfigured edge caching, missing security headers, and single-point-of-failure DNS setups quietly degrade user experience and search rankings."
            howItWorks={[
              {
                title: "1. Global Network Timing (TTFB)",
                content:
                  "We benchmark DNS resolution, TCP connection, TLS negotiation, and server processing latency to detect server-side rendering bottlenecks.",
                codeSnippet: "TTFB = DNS + Connect + TLS + Server Wait",
              },
              {
                title: "2. Security & Header Hardening",
                content:
                  "Our analyzer checks for mandatory headers (HSTS, CSP, Permissions-Policy, X-Content-Type-Options) that prevent XSS, clickjacking, and mime-sniffing.",
                codeSnippet: "Audit: HSTS | CSP | X-Frame | Referrer",
              },
              {
                title: "3. Edge Caching & Compression",
                content:
                  "We verify Brotli/Gzip compression ratios, Cache-Control directives, and CDN edge cache hit ratios across static and dynamic assets.",
                codeSnippet: "Content-Encoding: br | gzip",
              },
            ]}
            useCasesTitle="Top Culprits That Ruin Stack Performance"
            useCases={[
              {
                title: "Bloated Time to First Byte (>600ms)",
                description:
                  "Heavy database queries on un-cached SSR routes force users to wait hundreds of milliseconds before the first byte arrives. Edge caching resolves this.",
                badge: "Performance",
              },
              {
                title: "Uncompressed Payloads & Assets",
                description:
                  "Serving raw JSON or unminified JavaScript without Brotli compression wastes client bandwidth and increases page load times on mobile connections.",
                badge: "Optimization",
              },
              {
                title: "Missing Security Posture",
                description:
                  "Running production websites without Content Security Policy (CSP) or strict transport headers exposes end users to credential theft via malicious script injection.",
                badge: "Vulnerability",
              },
              {
                title: "No Multi-Region Failover",
                description:
                  "Hosting your backend in a single cloud availability zone without redundant health checks turns local provider outages into total downtime.",
                badge: "Reliability",
              },
            ]}
            faqs={[
              {
                question: "What is an acceptable TTFB for production websites?",
                answer:
                  "Google recommends a Time to First Byte under 200ms for static and edge-cached pages, and under 800ms for dynamic server-rendered pages.",
              },
              {
                question: "How does Brotli compression compare to Gzip?",
                answer:
                  "Brotli typically achieves 15–25% higher compression density than Gzip for HTML, CSS, and JavaScript, reducing network transmission times.",
              },
              {
                question: "Why are security headers critical for SEO?",
                answer:
                  "Search engines like Google prioritize secure sites with valid HTTPS, modern TLS, and robust headers that protect users against malicious redirects.",
              },
              {
                question: "How can SteadyStack help protect my web stack?",
                answer:
                  "SteadyStack monitors latency, SSL validity, DNS health, and uptime from global edge probes every 60 seconds with instant multi-channel alerting.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
