import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Anchor",
  description:
    "Anchor Privacy Policy — how we handle your brain dumps, tasks, and reminders with one clear focus and zero data anxiety.",
  alternates: {
    canonical: "/anchor-privacy",
  },
  openGraph: {
    title: "Privacy Policy | Anchor",
    description: "How Anchor collects, uses, and protects your brain dumps, tasks, and reminders.",
  },
};

const sections = [
  {
    title: "What Anchor Is (and Isn't)",
    content:
      "Anchor is a focus app that replaces endless to-do lists and anxiety-inducing red warning badges with one clear focus at a time, gentle and persistent escalating reminders, AI-assisted brain-dump capture, and a guilt-free Fresh Start button. This policy explains how we handle the information you entrust to us when you use Anchor. In short: we collect as little as possible, we never sell your data, and we never use your brain dumps to advertise to you.",
  },
  {
    title: "Information We Collect",
    content:
      "When you create an Anchor account, we collect your email address and authentication details. When you use the app, we process the content you create: brain dumps you capture, the single task you're focusing on, reminder schedules you configure, and Fresh Start history if you choose to keep it. We also collect standard technical data (device type, app version, crash logs, and IP address) to keep Anchor running and to fix bugs.",
  },
  {
    title: "Brain Dumps & AI-Assisted Capture",
    content:
      "When you use AI-assisted brain-dump capture, your raw text is sent to our AI processing provider solely to sort your thoughts into tasks. Your brain dumps are never used to train AI models, never shared with advertisers, and never surfaced to other users. We only send the text needed to complete the capture you asked for, and we require our AI providers to process it under strict confidentiality and data-retention limits. If you prefer, you can also use Anchor without AI capture — the core one-focus-at-a-time experience works without it.",
  },
  {
    title: "Reminders & Notifications",
    content:
      "Anchor's gentle, escalating reminders are scheduled based on the timings you choose and are delivered through your device's notification system. We do not read your calendar, contacts, location, or any other part of your device to send reminders. Notification permission is entirely optional — Anchor remains usable without it.",
  },
  {
    title: "The Fresh Start Button",
    content:
      "The Fresh Start button wipes your slate clean: the tasks and brain-dump items you clear with it are deleted from our systems within 30 days, and from backups within 90 days. We don't keep a hidden archive of what you wiped. Fresh Start is guilt-free in our product design, and we believe your data should be guilt-free too — deletion means deletion.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use the information we collect to operate and improve Anchor, sync your focus and tasks across your devices, process payments if you subscribe to a paid plan, send service-related communications (such as account verification or security notices), and provide support. We use aggregated, de-identified analytics to understand which features help people focus better — never to build advertising profiles.",
  },
  {
    title: "Data Sharing & Disclosure",
    content:
      "We do not sell your personal information, and we do not share it with third parties for their own marketing. We share data only with the service providers that make Anchor possible — cloud hosting, authentication, payment processing, notification delivery, and AI processing — each under contractual confidentiality and security obligations. We may disclose information if required by law or to protect the rights, property, or safety of Anchor, our users, or others.",
  },
  {
    title: "Data Retention",
    content:
      "We keep your account information and active tasks for as long as your account exists. Content you delete with Fresh Start is removed from production systems within 30 days and from encrypted backups within 90 days. If you delete your account, we delete or anonymize your remaining data within 90 days unless the law requires us to keep it longer.",
  },
  {
    title: "Security",
    content:
      "We protect your data with encryption in transit and at rest, strict access controls, and regular security reviews. No system is perfectly secure, but our security posture is published and independently reviewed — see our Security Policy for the details. We encourage you to use a strong, unique password for your Anchor account.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "Anchor uses only the cookies and local storage it needs to keep you signed in and remember your preferences. We do not use advertising cookies, cross-site trackers, or fingerprinting. Where optional analytics are used, they are de-identified and never linked back to your brain dumps or tasks.",
  },
  {
    title: "Your Rights",
    content:
      "Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data, to object to or restrict certain processing, and to lodge a complaint with your local data protection authority. To exercise any of these rights, contact us at privacy@steadystack.dev and we will respond within 30 days.",
  },
  {
    title: "Children's Privacy",
    content:
      "Anchor is not directed at children under 13 (or the equivalent minimum age in your jurisdiction), and we do not knowingly collect their personal information. If you believe a child has created an account, contact us and we will delete it.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy as Anchor evolves. Material changes will be announced in the app or by email before they take effect. Your continued use of Anchor after an update constitutes acceptance of the revised policy.",
  },
  {
    title: "Contact",
    content:
      "Questions about this Privacy Policy or how Anchor handles your data? Email us at privacy@steadystack.dev — a human reads every message.",
  },
];

export default function AnchorPrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      badge="Anchor · One Focus, Zero Data Anxiety"
      description="Anchor handles your brain dumps, your single focus, and your guilt-free Fresh Starts. This policy explains exactly what we do — and don't do — with your data."
      lastUpdated="October 7, 2026"
      sections={sections}
      otherPage={{
        href: "/terms",
        label: "Terms of Service",
        description: "Read the terms governing your use of Anchor.",
      }}
    />
  );
}
