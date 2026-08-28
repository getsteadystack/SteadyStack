import type { Metadata } from "next";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { PayloadTester } from "./tester";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regex Payload Monitor & HTML Expectation Tester | SteadyStack",
  description:
    "Free regex tester for website and API monitoring. Verify HTML expectations, validate JSON keys, and test regex match rules to catch silent failures and error pages.",
  keywords: [
    "regex tester",
    "payload monitor",
    "html verification",
    "synthetic response check",
    "api regex validator",
    "content integrity check",
  ],
  alternates: {
    canonical: "/tools/payload-regex",
  },
  openGraph: {
    title: "Regex Payload Monitor & Tester",
    description: "Verify your website's content with SteadyStack's payload analysis sentinel.",
    type: "website",
  },
};

export default function PayloadTesterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Regex Payload Monitor & Tester"
        description="Free regex tester for website monitoring. Verify HTML expectations, check for specific phrases, and validate payload integrity with our regex sentinel."
        url="https://steadystack.dev/tools/payload-regex"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              Payload Pulse Regex Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-mono">
              [ANALYZING CONTENT STREAM... ] Define and test "Expectation" sequences for HTML
              payload monitoring.
            </p>
          </div>

          <PayloadTester />

          <ToolContentSection
            toolName="Regex Payload Monitor"
            overviewTitle="Why Status Codes Alone Aren't Enough: The Power of Payload Assertions"
            overviewDescription="Many critical application outages return a misleading 200 OK status code — such as when a single-page app serves an empty div with an uncaught JavaScript error, or when an API gateway returns a generic JSON error payload with HTTP 200. Regex payload monitoring validates that the actual response body contains your required strings, tokens, and data fields."
            howItWorks={[
              {
                title: "1. Payload Body Fetching",
                content:
                  "Our edge probes execute a standard HTTP GET/POST request, fetching the raw response body stream up to configured byte limits.",
                codeSnippet: "GET /api/health -> 200 OK (application/json)",
              },
              {
                title: "2. Regex Pattern Matching",
                content:
                  "The response text is evaluated against your custom regular expression (PCRE compliant) supporting lookarounds, case insensitivity, and multiline flags.",
                codeSnippet: 'Regex: /"status"\\s*:\\s*"healthy"/i',
              },
              {
                title: "3. Assertion & Quorum Verdict",
                content:
                  "If the expected pattern is absent (or an inverted 'Must NOT Contain' error pattern matches), the check fails across multi-region nodes before triggering alerts.",
                codeSnippet: "Result: MATCH_FOUND | ASSERTION_FAILED",
              },
            ]}
            useCasesTitle="Common Scenarios for Regex Payload Monitoring"
            useCases={[
              {
                title: "Single Page App (SPA) Blank Screen Detection",
                description:
                  "Verify that your root HTML contains critical client hydration markers or specific SEO title strings, ensuring index.html wasn't corrupted.",
                badge: "Frontend Health",
              },
              {
                title: "JSON API Microservice Health",
                description:
                  'Assert that API responses contain valid {"status":"ok"} or database connection strings rather than {"error":"db_connection_timeout"}.',
                badge: "API Validation",
              },
              {
                title: "E-Commerce Checkout & Inventory Scrapes",
                description:
                  'Ensure high-value product landing pages do not display "Out of Stock" or "Payment Processing Disabled" error banners unexpectedly.',
                badge: "E-Commerce",
              },
              {
                title: "Authentication Token Expiration",
                description:
                  "Verify that protected webhook endpoints return valid cryptographic session tokens rather than unauthorized redirect payloads.",
                badge: "Auth Security",
              },
            ]}
            faqs={[
              {
                question: "What happens if my response payload is very large?",
                answer:
                  "SteadyStack probes inspect the first 256KB to 1MB of the response body, which is more than sufficient for HTML headers, API responses, and critical page markup.",
              },
              {
                question: "Can I use inverse matching (alert if a string is found)?",
                answer:
                  'Yes. You can configure "Must Contain" (assert presence) or "Must Not Contain" (assert absence of strings like "Database Error" or "502 Bad Gateway").',
              },
              {
                question: "Are regex checks case-sensitive?",
                answer:
                  "By default, regex evaluations can be configured with the 'i' flag for case-insensitive matching or exact character casing depending on your needs.",
              },
              {
                question:
                  "How does SteadyStack prevent false alerts on transient network glitches?",
                answer:
                  "SteadyStack uses a multi-region quorum consensus model — a failure is only declared when multiple independent edge nodes agree that the payload assertion failed.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
