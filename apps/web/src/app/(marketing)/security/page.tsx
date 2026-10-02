import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security | SteadyStack",
  description:
    "SteadyStack Security — how we protect your monitoring infrastructure, credentials, and data.",
  alternates: {
    canonical: "/security",
  },
  openGraph: {
    title: "Security | SteadyStack",
    description: "How we protect your monitoring infrastructure, credentials, and data.",
  },
};

const sections = [
  {
    title: "Infrastructure Security",
    content:
      "SteadyStack runs on high-availability, enterprise-grade cloud infrastructure powered by Cloudflare's Edge network and secure cloud providers. Our database, monitoring workers, and distributed probes operate in isolated virtual environments. All physical data centers utilized by our providers comply with strict security standards, including SOC 2 Type II, ISO 27001, and PCI-DSS compliance.",
  },
  {
    title: "Data Protection & Encryption",
    content:
      "All data transmitted to or from SteadyStack is encrypted in transit using TLS 1.3/1.2 protocols with secure cipher suites. Data at rest is encrypted using industry-standard AES-256 encryption. We strictly enforce HTTPS across all endpoints, utilizing HTTP Strict Transport Security (HSTS) to prevent unauthorized interception. Sensitive database fields, such as credential tokens, are hashed or encrypted at the database level.",
  },
  {
    title: "Application Security & Hardening",
    content:
      "We design and build SteadyStack with security-first principles. We employ robust rate limiting, strict CORS policies, and automated input validation (via Zod validation schemas) to protect our APIs from SQL injection, Cross-Site Scripting (XSS), and other OWASP Top 10 vulnerabilities. Our dependency stack is continuously scanned for security advisories, and we perform daily automated package audits to eliminate vulnerabilities before deployment.",
  },
  {
    title: "Authentication & Access Control",
    content:
      "User authentication is built on secure, modern session management utilizing cryptographic tokens and secure HttpOnly cookies. We support secure authentication methods, single sign-on (SSO) integrations, and enforce secure session timeouts. Role-based access controls (RBAC) ensure that team members within a workspace only have access to resources authorized by their role.",
  },
  {
    title: "Edge Monitoring Reliability",
    content:
      "Our edge workers leverage Cloudflare's globally distributed architecture to provide highly resilient monitoring. We utilize localized DNS caches, fail-safe TCP connections, and robust error-handling protocols. Real-time anomalies and latency metrics are aggregated securely using Cloudflare Durable Objects, ensuring that monitoring data is highly available and isolated against DDoS or network outages.",
  },
  {
    title: "Security Audits & Vulnerability Scans",
    content:
      "We conduct regular internal security reviews and static code analysis using modern tools like oxlint and static analysis gates. External penetration tests are planned periodically to validate our defenses. Any identified security findings are prioritized immediately and remediated in accordance with strict incident response SLAs.",
  },
  {
    title: "Responsible Disclosure Policy",
    content:
      "We value the contribution of security researchers in keeping SteadyStack secure. If you believe you have discovered a security vulnerability in our application, API, edge workers, or infrastructure, please report it privately to security@steadystack.dev. We request that you do not disclose the vulnerability publicly or to any third party until we have had a reasonable opportunity to investigate and address the issue.",
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security Policy"
      badge="Enterprise-Grade Protection"
      description="We treat the security and integrity of your monitoring infrastructure as our highest priority. Learn about our defense-in-depth measures, data protection, and secure operations."
      lastUpdated="July 1, 2026"
      sections={sections}
      otherPage={{
        href: "/privacy",
        label: "Privacy Policy",
        description: "Read about how we collect, handle, and protect your privacy.",
      }}
    />
  );
}
