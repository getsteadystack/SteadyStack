import type { Metadata } from "next";

import {
  ChangelogHero,
  ChangelogTimeline,
  type ChangelogEntry,
} from "@/components/landing/changelog-timeline";

export const metadata: Metadata = {
  title: "Changelog — SteadyStack Platform Releases & Updates",
  description:
    "Explore the latest features, agency multi-tenant capabilities, edge consensus engine improvements, and platform releases in SteadyStack.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "SteadyStack Changelog — Agency-First Monitoring Releases",
    description:
      "Continuous updates to the SteadyStack agency monitoring platform, white-label engines, and edge infrastructure.",
  },
};

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v2.0.0",
    date: "October 2026",
    title: "SteadyStack v2.0: The Multi-Client Monitoring Platform for Web Agencies",
    badge: "v2.0 Major Release",
    badgeColor: "bg-[#ffd439] text-[#23211a] border-[#ffd439]",
    description:
      "A monumental architectural evolution pivoting SteadyStack from a single-user monitoring tool into the premier white-label, multi-client uptime platform built specifically for web development agencies, dev shops, and managed service providers.",
    highlights: [
      {
        category: "Feature",
        title: "Multi-Client Workspace Isolation",
        description:
          "Manage unlimited isolated client projects from a unified agency dashboard with per-client monitor groupings, role-based access, and granular permission boundaries.",
      },
      {
        category: "Feature",
        title: "Complete White-Label Status Pages",
        description:
          "Deliver branded client status pages with custom CNAME subdomains, client logos, custom palettes, and zero SteadyStack branding.",
      },
      {
        category: "Feature",
        title: "Agency Margin & Profit Engine",
        description:
          "Turn monitoring into a recurring revenue stream with automated client billing models, margin expansion calculators, and retainer SLA packaging.",
      },
      {
        category: "Feature",
        title: "Automated Monthly SLA Reports",
        description:
          "Auto-generate white-labeled executive PDF and CSV uptime certificates delivered straight to your clients' inboxes on the 1st of every month.",
      },
      {
        category: "Performance",
        title: "Three.js 3D Edge Consensus Globe",
        description:
          "Embedded interactive WebGL consensus globe visualizing live multi-region probe telemetry and quorum latency across 300+ Cloudflare edge cities.",
      },
      {
        category: "Feature",
        title: "Empirical False-Positive Benchmark Suite",
        description:
          "Published 30-day 1.29M check dataset proving 0% false positives with raw JSON/CSV downloads and local reproduction harness at /benchmarks/false-positives.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "August 2026",
    title: "Precision Theme Engine, Colorways & Streamlined Navigation",
    badge: "Platform Release",
    badgeColor: "bg-[#f0ede6] text-[#23211a] border-[#e8e6df]",
    description:
      "Reimagined visual theme architecture with 5 modern precision colorways (Obsidian Dark, Midnight Slate, Carbon Ember, Nordic Emerald, Clean Light), converted all dashboard components to dynamic CSS tokens, and streamlined header navigation.",
    highlights: [
      {
        category: "Feature",
        title: "5 Precision Dark & Light Theme Modes",
        description:
          "Added Obsidian Dark, Midnight Slate, Carbon Ember, Nordic Emerald, and Clean Light with refined HSL contrast ratios.",
      },
      {
        category: "Feature",
        title: "Streamlined Navigation & Mobile Drawer",
        description:
          "Consolidated top-level links into intuitive Product and Free Tools dropdown menus with rich descriptions and a full-screen mobile drawer.",
      },
      {
        category: "Performance",
        title: "Dynamic Tokenized SaaS & Landing UI",
        description:
          "Refactored onboarding wizards, sidebar badges, workspace switchers, and hero consensus telemetry charts to adapt dynamically to the active theme.",
      },
      {
        category: "CLI",
        title: "Turborepo Watch Engine Optimization",
        description:
          "Updated CLI task watch configurations to ensure smooth background daemon execution during local monorepo development.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "August 2026",
    title: "Atomic Workspace Provisioning, Edge Client Hints & WAF Resilience",
    badge: "Platform Release",
    badgeColor: "bg-[#f0ede6] text-[#23211a] border-[#e8e6df]",
    description:
      "Eliminated parallel onboarding workspace race conditions, upgraded multi-region edge probes with authentic desktop Client Hints to prevent false-positive WAF blocks, and hardened encrypted header resolution.",
    highlights: [
      {
        category: "Security",
        title: "Atomic Personal Workspace Provisioning & Mutex Locking",
        description:
          "Added instant signup-hook workspace creation and in-flight mutex synchronization across React Server Components to guarantee exactly one personal workspace per account.",
      },
      {
        category: "Performance",
        title: "Authentic Chrome Client Hints & WAF Defense",
        description:
          "Upgraded Regional Probes and Edge Check Engines with Sec-CH-UA and Sec-Fetch-* browser headers to bypass CDN bot challenges and accurately monitor Cloudflare and Vercel protected endpoints.",
      },
      {
        category: "Security",
        title: "Encrypted Header Resolution Pipeline",
        description:
          "Hardened AES-256-GCM field-level secret decryption across all background worker queues, Durable Objects, and manual verification triggers.",
      },
      {
        category: "Feature",
        title: "Dedicated Security & Compliance Portal",
        description:
          "Published platform security overview, encryption at rest specifications, and vulnerability disclosure policies at /security.",
      },
    ],
  },
  {
    version: "v1.1.2",
    date: "August 2026",
    title: "Uptime Kuma Migration Suite, SLA Reports & Quorum Consensus v2",
    badge: "Platform Release",
    badgeColor: "bg-[#f0ede6] text-[#23211a] border-[#e8e6df]",
    description:
      "Shipped one-click backup migrations from Uptime Kuma JSON exports, automated PDF/CSV SLA reporting engines for client billing, and distributed quorum validation upgrades.",
    highlights: [
      {
        category: "Feature",
        title: "One-Click Uptime Kuma JSON Importer",
        description:
          "Migrate all monitor configurations, HTTP headers, retry limits, and maintenance windows from Uptime Kuma instances into SteadyStack in seconds.",
      },
      {
        category: "Feature",
        title: "Monthly PDF/CSV SLA Compliance Reporting",
        description:
          "Generate executive SLA verification reports with uptime percentages, MTTR metrics, and incident timestamps for enterprise clients.",
      },
      {
        category: "Self-Hosted",
        title: "Docker Compose Full-Stack Bundle",
        description:
          "Published single-command production deployment bundle with Postgres 16, Redis 7, and local worker simulation containers.",
      },
      {
        category: "Performance",
        title: "Quorum Consensus Engine v2",
        description:
          "Reduced edge probe agreement latency by 42% through pipelined Durable Object state broadcasts across US, EU, and APAC zones.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "July 2026",
    title: "General Availability: Edge-Native Synthetic Monitoring Engine",
    badge: "Initial Launch",
    badgeColor: "bg-[#f0ede6] text-[#23211a] border-[#e8e6df]",
    description:
      "Initial launch of SteadyStack: multi-region edge synthetic uptime monitoring platform with 1-minute free intervals, 50 free monitors, and Cloudflare edge quorum consensus.",
    highlights: [
      {
        category: "Feature",
        title: "Multi-Region Quorum Consensus Engine",
        description:
          "Simultaneous health check execution across 3 geographic edge zones to mathematically eliminate single-node false alarms.",
      },
      {
        category: "Feature",
        title: "Multi-Protocol Monitoring",
        description:
          "Native support for HTTP/HTTPS, SSL/TLS certificate expiry, DNS integrity, raw TCP port sockets, and webhook heartbeat dead-man switches.",
      },
      {
        category: "Feature",
        title: "Public Status Page Generator",
        description:
          "Branded status pages with custom domains, automatic SSL provisioning, and multi-channel subscriber alerting via Slack and Discord.",
      },
      {
        category: "CLI",
        title: "Official SteadyStack CLI",
        description:
          "Command-line tool to manage monitors, trigger synthetic checks in CI/CD pipelines, and view live incident streams from the terminal.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a]">
      <ChangelogHero />
      <ChangelogTimeline entries={CHANGELOG_DATA} />
    </div>
  );
}
