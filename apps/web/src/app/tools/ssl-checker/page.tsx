import type { Metadata } from "next";
import { SSLChecker } from "@/components/tools/ssl-checker";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free SSL Certificate Checker & TLS Health Audit | SteadyStack",
  description:
    "Analyze your SSL/TLS security health. Check for expired certificates, legacy TLS 1.0/1.1 protocols, intermediate CA chain validity, and HSTS configuration issues instantly.",
  keywords: [
    "ssl checker",
    "tls health",
    "certificate expiry",
    "https check",
    "ssl chain validation",
    "hsts test",
    "security scan",
  ],
  alternates: {
    canonical: "/tools/ssl-checker",
  },
};

/**
 * Renders the SSL Checker page with interactive testing and comprehensive technical guides.
 */
export default function SSLCheckerPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Free SSL Certificate Checker"
        description="Analyze your SSL/TLS security health. Check for expired certificates, legacy protocols, and HSTS configuration issues instantly."
        url="https://steadystack.dev/tools/ssl-checker"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-primary to-blue-400 bg-clip-text text-transparent pb-2">
              SSL Health & Security Check
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Scan your website's SSL/TLS configuration, verify certificate chain validity, and
              detect deprecated protocols in seconds.
            </p>
          </div>

          <SSLChecker />

          <ToolContentSection
            toolName="SSL Certificate Checker"
            overviewTitle="Understanding SSL/TLS Handshakes and Chain Validation"
            overviewDescription="An SSL/TLS certificate encrypts communication between users and your web servers, establishing identity and data privacy. Modern web security mandates robust TLS 1.3 encryption, trusted Certificate Authority (CA) intermediate bundling, and strict expiration monitoring to prevent silent downtime."
            howItWorks={[
              {
                title: "1. TLS Handshake Negotiation",
                content:
                  "Our edge probe initiates a secure TLS handshake against your hostname, testing cipher suite negotiation and protocol support (TLS 1.2 and TLS 1.3).",
                codeSnippet: "ClientHello -> ServerHello (TLS_AES_256_GCM_SHA384)",
              },
              {
                title: "2. Certificate Chain Verification",
                content:
                  "We inspect the leaf certificate, intermediate CA certificates, and root trust store anchors to ensure mobile and browser clients do not encounter untrusted authority warnings.",
                codeSnippet: "Leaf -> Intermediate CA -> Root CA",
              },
              {
                title: "3. Expiry & Security Flags",
                content:
                  "We calculate exact days until expiration, SAN (Subject Alternative Names) matching, OCSP stapling status, and HSTS response headers.",
                codeSnippet: "Strict-Transport-Security: max-age=31536000",
              },
            ]}
            useCasesTitle="Common SSL/TLS Vulnerabilities & How to Fix Them"
            useCases={[
              {
                title: "Expired Certificates (NET::ERR_CERT_DATE_INVALID)",
                description:
                  "Automated ACME/Let's Encrypt renewal scripts can fail silently due to rate limits or DNS authorization errors. SteadyStack alerts you 30, 14, and 7 days prior to expiry.",
                badge: "Critical Outage",
              },
              {
                title: "Broken Intermediate Trust Chains",
                description:
                  "If your web server (Nginx/Caddy/Apache) only serves the leaf certificate without fullchain.pem, desktop browsers with cached CAs may work while mobile apps crash.",
                badge: "Chain Gap",
              },
              {
                title: "Deprecated TLS 1.0 & TLS 1.1 Support",
                description:
                  "Legacy protocols contain known cryptographic flaws (POODLE, BEAST). Modern compliance frameworks (PCI-DSS, SOC 2, HIPAA) require disabling TLS versions below 1.2.",
                badge: "Compliance",
              },
              {
                title: "Missing HSTS Preloading",
                description:
                  "Without HTTP Strict Transport Security, users visiting http:// can be intercepted via SSL stripping attacks before being redirected to https://.",
                badge: "Security Header",
              },
            ]}
            faqs={[
              {
                question: "How far in advance should I renew my SSL certificate?",
                answer:
                  "Best practices recommend renewing SSL/TLS certificates at least 30 days before expiration. Most automated ACME clients (like Certbot) automatically renew at 30 days remaining.",
              },
              {
                question: "What is the difference between TLS 1.2 and TLS 1.3?",
                answer:
                  "TLS 1.3 reduces the handshake round-trips from 2-RTT to 1-RTT (or 0-RTT with session resumption), significantly improving latency while removing vulnerable legacy cipher suites.",
              },
              {
                question: "Why does my SSL work on desktop Chrome but fail on mobile?",
                answer:
                  "Desktop browsers frequently cache intermediate certificates, masking incomplete server certificate bundles. If the server does not send the full chain, mobile devices with strict trust stores will reject the connection.",
              },
              {
                question: "Can SteadyStack automatically monitor my SSL certificate expiry?",
                answer:
                  "Yes. SteadyStack monitors SSL certificate validity, expiration dates, and revocation statuses across global edge nodes, delivering instant alerts via Slack, Discord, Email, and PagerDuty.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
