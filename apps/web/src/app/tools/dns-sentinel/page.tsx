import type { Metadata } from "next";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { DNSAnalyzer } from "./analyzer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MX & DNS Record Lookup Analyzer | SPF, DKIM, DMARC Health | SteadyStack",
  description:
    "Free MX and DNS record lookup tool to audit SPF, DKIM, and DMARC health scores. Verify email deliverability, nameserver propagation, and DNS security with SteadyStack's DNS sentinel.",
  keywords: [
    "dns lookup",
    "mx record checker",
    "spf record validator",
    "dmarc checker",
    "email deliverability test",
    "nameserver propagation",
  ],
  alternates: {
    canonical: "/tools/dns-sentinel",
  },
  openGraph: {
    title: "MX & DNS Record Lookup Analyzer",
    description:
      "Audit your domain's email security and deliverability with SteadyStack's DNS pulse sentinel.",
    type: "website",
  },
};

export default function DNSSentinelPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="MX & DNS Record Lookup Analyzer"
        description="Free MX and DNS record lookup tool to audit SPF/DKIM/DMARC health scores. Verify email deliverability and security with SteadyStack's DNS sentinel."
        url="https://steadystack.dev/tools/dns-sentinel"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-green-500 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              DNS Pulse Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-mono">
              [RESOLVING ENDPOINT RECORDSETS... ] Evaluate your domain's email deliverability and
              security integrity.
            </p>
          </div>

          <DNSAnalyzer />

          <ToolContentSection
            toolName="DNS Record Analyzer"
            overviewTitle="The Triad of Email Authentication: MX, SPF, and DMARC"
            overviewDescription="Domain Name System (DNS) records translate human-friendly domain names into IP addresses and declare authoritative email routing policies. Implementing strict Sender Policy Framework (SPF), DKIM public keys, and DMARC enforcement policies protects your domain reputation against phishing and prevents transactional emails from landing in spam folders."
            howItWorks={[
              {
                title: "1. Recursive DNS Record Querying",
                content:
                  "Our resolver queries authoritative root nameservers for A, AAAA, CNAME, MX, TXT, NS, and SOA record types.",
                codeSnippet: "Query: TXT @domain.com -> v=spf1 include:_spf.google.com ~all",
              },
              {
                title: "2. SPF & DKIM Policy Validation",
                content:
                  "We analyze SPF syntax, record count (preventing multiple SPF records), and the 10-lookup DNS evaluation limit that causes hard permerrors.",
                codeSnippet: "SPF Evaluation: Max 10 DNS Lookups Allowed",
              },
              {
                title: "3. DMARC Alignment & Enforcement",
                content:
                  "We verify that your DMARC record exists at _dmarc.domain.com with valid policy flags (p=reject / p=quarantine) and aggregate reporting (rua).",
                codeSnippet: "v=DMARC1; p=reject; rua=mailto:dmarc@domain.com",
              },
            ]}
            useCasesTitle="Common DNS & Email Deliverability Misconfigurations"
            useCases={[
              {
                title: "Multiple SPF TXT Records",
                description:
                  "Publishing more than one SPF TXT record violates RFC 7208 and causes receiving mail servers (Google, Microsoft) to reject the SPF check with a PermError.",
                badge: "RFC Violation",
              },
              {
                title: "SPF Exceeding 10 DNS Lookup Limit",
                description:
                  "Including multiple third-party email providers (Google, SendGrid, Zendesk, Mailchimp) can push nested DNS lookups over the 10-lookup threshold.",
                badge: "Lookup Limit",
              },
              {
                title: "DMARC Policy Set to p=none",
                description:
                  "A policy of p=none monitors spoofing attempts but does not protect your domain. Major mail providers require p=quarantine or p=reject for bulk senders.",
                badge: "Weak Security",
              },
              {
                title: "Dangling CNAME / Subdomain Takeover",
                description:
                  "Pointing a subdomain CNAME to a deleted third-party service (S3 bucket, GitHub Pages, Heroku) allows attackers to claim the host and hijack traffic.",
                badge: "DNS Hijack",
              },
            ]}
            faqs={[
              {
                question: "Why are my emails going to Gmail or Yahoo spam folders?",
                answer:
                  "Google and Yahoo enforce strict email sender requirements: all transactional and marketing emails must have valid SPF, DKIM, and DMARC alignment, low spam rates (<0.3%), and one-click unsubscribe headers.",
              },
              {
                question: "What is the difference between SPF softfail (~all) and hardfail (-all)?",
                answer:
                  "Softfail (~all) signals that unauthorized IPs should be accepted with scrutiny, while hardfail (-all) strictly instructs receiving mail servers to reject unauthorized senders.",
              },
              {
                question: "How long does DNS record propagation take?",
                answer:
                  "DNS propagation depends on the TTL (Time to Live) set on the existing record, typically ranging from 300 seconds (5 minutes) to 86,400 seconds (24 hours).",
              },
              {
                question: "Can SteadyStack monitor my DNS records for unauthorized changes?",
                answer:
                  "Yes. SteadyStack monitors DNS resolution, nameserver responses, and record values, immediately alerting you to DNS hijacking, TTL expiration, or unexpected record deletions.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
