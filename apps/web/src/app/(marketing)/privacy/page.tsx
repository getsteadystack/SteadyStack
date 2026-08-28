import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | SteadyStack",
  description: "SteadyStack Privacy Policy — how we collect, use, and protect your data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | SteadyStack",
    description: "How we collect, use, and protect your data.",
  },
};

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as when you create an account, configure monitors, or contact support. This includes your name, email address, payment information, and monitoring configuration data. We also automatically collect certain technical data when you use our service, including IP addresses, browser type, pages visited, and diagnostic logs from your monitored endpoints.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use the information we collect to operate, maintain, and improve SteadyStack, process transactions, send technical notices and support messages, respond to your comments and questions, and communicate with you about the service. Monitoring data (uptime checks, latency measurements) is used solely to provide the service you requested and is not sold or shared with third parties for advertising.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your account information and monitoring history for as long as your account is active. Uptime check results and incident reports are retained in accordance with your plan's data retention policy. Upon account deletion, we delete or anonymize your data within 90 days unless required by law to retain it.",
  },
  {
    title: "Data Sharing & Disclosure",
    content:
      "We do not sell your personal information. We may share your data with trusted third-party service providers who assist in operating our infrastructure (cloud hosting, payment processing, email delivery) under strict confidentiality agreements. We may disclose information if required by law or to protect the rights, property, or safety of SteadyStack, our users, or others.",
  },
  {
    title: "Security",
    content:
      "We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls. However, no method of electronic storage or transmission is 100% secure. We encourage you to use strong passwords and enable two-factor authentication where available.",
  },
  {
    title: "Your Rights",
    content:
      "Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also object to or restrict certain processing. To exercise these rights, contact us at privacy@steadystack.app. We will respond to your request within 30 days.",
  },
  {
    title: "Cookies",
    content:
      "We use essential cookies to maintain your session and authenticate you. We also use optional analytics cookies to understand how the service is used. You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect service functionality.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Material changes will be notified via email or through the service. Your continued use of SteadyStack after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact",
    content:
      "If you have questions about this Privacy Policy, please contact us at privacy@steadystack.dev",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      badge="Your Data, Your Control"
      description="We believe in transparency. This policy explains what data we collect, how we use it, and the controls you have over your information."
      lastUpdated="July 1, 2026"
      sections={sections}
      otherPage={{
        href: "/terms",
        label: "Terms of Service",
        description: "Read the terms governing your use of SteadyStack.",
      }}
    />
  );
}
