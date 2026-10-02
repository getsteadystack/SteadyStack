import type { Metadata } from "next";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { HeaderAnalyzer as Analyzer } from "./analyzer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HTTP Security Header Analyzer & Audit Tool | SteadyStack",
  description:
    "Free HTTP header analyzer to audit website security. Scan HSTS, CSP, X-Frame-Options, Permissions-Policy, and CORS configurations with our security sentinel tool.",
  keywords: [
    "http headers analyzer",
    "security headers check",
    "hsts audit",
    "content security policy csp",
    "x-frame-options",
    "cors validator",
  ],
  alternates: {
    canonical: "/tools/http-headers",
  },
  openGraph: {
    title: "HTTP Security Header Analyzer",
    description:
      "Audit your website's security posture with SteadyStack's header analysis sentinel.",
    type: "website",
  },
};

export default function SecurityHeadersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="HTTP Security Header Analyzer"
        description="Free HTTP header analyzer to audit website security. Scan HSTS, CSP, X-Frame-Options and more with our security sentinel tool."
        url="https://steadystack.dev/tools/http-headers"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              HTTP Security Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-mono">
              [ANALYZING PROTOCOL INTEGRITY... ] Evaluate your endpoint's exposure via HTTP response
              header dissection.
            </p>
          </div>

          <Analyzer />

          <ToolContentSection
            toolName="HTTP Header Analyzer"
            overviewTitle="Why HTTP Response Headers Define Your Edge Security Posture"
            overviewDescription="HTTP headers pass critical metadata between your web server and the client browser. Modern web applications require properly structured defensive response headers to protect users against Cross-Site Scripting (XSS), clickjacking, MIME-type sniffing, and data leakage."
            howItWorks={[
              {
                title: "1. HTTP/2 & HTTP/3 Probing",
                content:
                  "Our edge probes execute a full HEAD/GET request against your URL, negotiating HTTP/2 or HTTP/3 to capture exact production server headers.",
                codeSnippet: "HTTP/2 200 OK -> headers map",
              },
              {
                title: "2. Security Header Parsing",
                content:
                  "We validate the presence and syntax of HSTS (Strict-Transport-Security), CSP (Content-Security-Policy), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.",
                codeSnippet: "Parse: CSP directives & HSTS preload",
              },
              {
                title: "3. Vulnerability Grading",
                content:
                  "Each header is scored against OWASP Secure Headers Project guidelines to provide clear remediation steps and security grades.",
                codeSnippet: "Grade: A+ | B | F (Actionable Fixes)",
              },
            ]}
            useCasesTitle="Essential Security Headers & What They Protect"
            useCases={[
              {
                title: "Strict-Transport-Security (HSTS)",
                description:
                  "Enforces TLS encryption and prevents downgrade attacks. Adding includeSubDomains; preload ensures browsers never attempt an unencrypted HTTP connection.",
                badge: "Mandatory",
              },
              {
                title: "Content-Security-Policy (CSP)",
                description:
                  "Restricts script, stylesheet, image, and iframe execution sources, neutralizing malicious inline script injection and cross-site scripting (XSS).",
                badge: "Anti-XSS",
              },
              {
                title: "X-Frame-Options & frame-ancestors",
                description:
                  "Instructs browsers whether your page can be embedded within <iframe> or <frame> tags, preventing UI redressing and clickjacking attacks.",
                badge: "Anti-Clickjack",
              },
              {
                title: "X-Content-Type-Options: nosniff",
                description:
                  "Prevents browsers from MIME-sniffing a response away from the declared content-type, blocking executable script attacks disguised as images.",
                badge: "MIME Protection",
              },
            ]}
            faqs={[
              {
                question: "What is HSTS preloading?",
                answer:
                  "HSTS preloading is a mechanism where domain owners register their sites in a hardcoded list built directly into major browsers (Chrome, Firefox, Safari), guaranteeing HTTPS on the very first visit.",
              },
              {
                question: "Why is Content-Security-Policy (CSP) hard to configure?",
                answer:
                  "CSP requires auditing all third-party analytics, fonts, and scripts. If a directive like script-src is too strict, legitimate scripts break; if too loose ('unsafe-inline'), XSS protection is weakened.",
              },
              {
                question: "Do security headers affect website performance?",
                answer:
                  "No. Security headers add only a few dozen bytes to the HTTP response header payload and do not require additional network round-trips.",
              },
              {
                question: "Can SteadyStack notify me if security headers disappear?",
                answer:
                  "Yes. SteadyStack monitors HTTP response headers on every check, alerting you immediately if a proxy change, deployment, or CDN misconfiguration strips your security headers.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
