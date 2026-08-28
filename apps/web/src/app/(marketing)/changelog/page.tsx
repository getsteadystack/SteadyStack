import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  Globe,
  Cpu,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — SteadyStack Platform Releases & Updates",
  description:
    "Explore the latest features, edge consensus engine improvements, CLI updates, and bug fixes shipped in SteadyStack.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "SteadyStack Changelog — Edge-Native Monitoring Releases",
    description:
      "Continuous updates to the SteadyStack edge monitoring platform, CLI tools, and self-hosted infrastructure.",
  },
};

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlights: Array<{
    category: "Feature" | "Performance" | "CLI" | "Self-Hosted" | "Security";
    title: string;
    description: string;
  }>;
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v1.3.0",
    date: "August 2026",
    title: "Modern Design System, Precision Theme Modes & Streamlined Navigation",
    badge: "Latest Release",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    description:
      "Reimagined the visual theme architecture with 5 modern precision colorways (Obsidian Dark, Midnight Slate, Carbon Ember, Nordic Emerald, Clean Light), converted all hardcoded dashboard components to dynamic CSS tokens, and streamlined header navigation with grouped mega-menus and responsive mobile drawers.",
    highlights: [
      {
        category: "Feature",
        title: "5 Precision Dark & Light Theme Modes",
        description:
          "Added Obsidian Dark (deep zinc/slate monochrome), Midnight Slate (electric blue), Carbon Ember (warm amber), Nordic Emerald, and Clean Light with refined HSL contrast ratios.",
      },
      {
        category: "Feature",
        title: "Streamlined Navigation & Mobile Drawer",
        description:
          "Consolidated top-level links into intuitive Product and Free Tools dropdown menus with rich descriptions, quick action shortcuts, and a full-screen mobile drawer.",
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
    badgeColor: "bg-muted text-muted-foreground border-border",
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
        title: "Authentic Chrome 133 Client Hints & WAF False-Positive Prevention",
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
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    description:
      "Seamless 1-command migration from Uptime Kuma, automated SLA compliance report exports (PDF & JSON), improved 4-of-7 edge quorum consensus engine, and public roadmap.",
    highlights: [
      {
        category: "CLI",
        title: "One-Command Uptime Kuma Importer (pulse import kuma)",
        description:
          "Instantly migrate entire monitor fleets, intervals, custom headers, and alert triggers from Uptime Kuma backup JSON files into SteadyStack via CLI or Web Dashboard.",
      },
      {
        category: "Feature",
        title: "SLA Compliance Report Exports (PDF, JSON & Web)",
        description:
          "Generate and download executive-grade SLA uptime reports with exact downtime accounting, SLA breach projections, and custom branding.",
      },
      {
        category: "Feature",
        title: "Multi-Region Quorum Consensus Engine v2",
        description:
          "Parallel consensus tallies across 7 sovereign Cloudflare edge regions (wnam, enam, weur, eeur, apac, apac-ne, apac-se) with double-check retry protocol to eliminate false positives.",
      },
      {
        category: "Self-Hosted",
        title: "Zero-Lock-In Export & Self-Hosting Stack",
        description:
          "Published comprehensive single-server Docker Compose with auto-HTTPS Caddy, PostgreSQL, and Blackbox Prometheus YAML exporter.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "July 2026",
    title: "Team Management & RBAC, PagerDuty Alerts & pulse CLI",
    badge: "Major Update",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    description:
      "Enterprise team collaboration with fine-grained RBAC, PagerDuty incident routing, Monitoring as Code (pulse CLI), and private on-premise Docker probes.",
    highlights: [
      {
        category: "Security",
        title: "Team Management & Granular RBAC",
        description:
          "Multi-tenant organizations, workspace invitations, and role-based permissions (Owner, Admin, Member, Viewer) for engineering teams.",
      },
      {
        category: "Feature",
        title: "PagerDuty & Multi-Channel Incident Routing",
        description:
          "Direct integration with PagerDuty routing keys, interactive Slack blocks, Discord rich embeds, SMS, Telegram, and Webhooks.",
      },
      {
        category: "CLI",
        title: "pulse monitors apply & CI/CD Gates",
        description:
          "Version your monitoring configurations in Git and block breaking deployments with `pulse wait <id> --timeout 120`.",
      },
      {
        category: "Feature",
        title: "Private On-Premise Docker Probes",
        description:
          "Lightweight outbound WebSocket agents to monitor private subnets, Kubernetes clusters, and databases behind corporate firewalls.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "June 2026",
    title: "SteadyStack Public Release",
    badge: "Initial Release",
    badgeColor: "bg-muted text-muted-foreground border-border",
    description:
      "The initial release of SteadyStack: 16 monitor types, real-time WebSocket dashboard via Cloudflare Durable Objects, multi-channel alerting, and public status pages.",
    highlights: [
      {
        category: "Feature",
        title: "16 Monitor Types & Edge Telemetry",
        description:
          "Native support for HTTP/HTTPS, PING, TCP Port, SSL/TLS, DNS, Domain expiration, Heartbeat, MCP, GraphQL, and WebSocket endpoints.",
      },
      {
        category: "Feature",
        title: "Public Status Pages with Custom Domains",
        description:
          "Fast, SEO-optimized status pages with subscriber email notifications, custom themes, and maintenance schedules.",
      },
      {
        category: "Self-Hosted",
        title: "OpenNext Next.js 16 Edge Architecture",
        description:
          "Serverless deployment on Cloudflare Pages and Workers with Prisma ORM and PostgreSQL.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-28 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-5 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest">
            <Sparkles className="size-3" />
            Product Releases & Updates
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            What&apos;s New in SteadyStack
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            Follow the latest engine improvements, CLI features, edge consensus upgrades, and
            platform releases shipped by the SteadyStack team.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="https://github.com/getsteadystack/SteadyStack/releases"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-all"
            >
              <GitBranch className="size-3.5 text-primary" />
              GitHub Releases
            </Link>
            <Link
              href="https://github.com/getsteadystack/SteadyStack/blob/master/docs/self-hosted.md"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <ShieldCheck className="size-3.5" />
              Self-Host Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 w-full flex-1">
        <div className="relative border-l border-border/60 ml-4 md:ml-6 pl-6 md:pl-10 space-y-16">
          {CHANGELOG_DATA.map((entry, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] md:-left-[47px] top-1 size-3.5 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />

              {/* Version & Date Header */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-lg font-mono font-extrabold text-foreground tracking-tight">
                  {entry.version}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${entry.badgeColor}`}
                >
                  {entry.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-bold text-foreground mb-2">{entry.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                {entry.description}
              </p>

              {/* Highlights Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {entry.highlights.map((h, hIdx) => {
                  const isCli = h.category === "CLI";
                  const isSelfHosted = h.category === "Self-Hosted";
                  return (
                    <div
                      key={hIdx}
                      className="p-4 rounded-lg border border-border/60 bg-muted/[0.15] hover:border-primary/30 hover:bg-muted/[0.3] transition-all space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
                          {h.category}
                        </span>
                        <h3 className="text-xs font-bold text-foreground truncate">{h.title}</h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 border-t border-border bg-muted/[0.1]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Ready to test SteadyStack?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Self-host the full stack on Docker or start free with 3-region 2-of-3 quorum consensus.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-lg hover:bg-primary/90 transition-all font-mono uppercase tracking-wider"
            >
              Get Started Free <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/vs/uptime-kuma"
              className="inline-flex items-center px-5 py-2.5 border border-border text-foreground font-semibold text-xs rounded-lg hover:border-primary/40 transition-all font-mono"
            >
              SteadyStack vs Uptime Kuma
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
