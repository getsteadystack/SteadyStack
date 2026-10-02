export type CompetitorFeature = {
  name: string;
  steadystack: string | boolean;
  competitor1: string | boolean;
  competitor2: string | boolean;
  competitor3: string | boolean;
  isBattle?: boolean;
};

export type CompetitorInfo = {
  id: string;
  name: string;
  url: string;
  pricingUrl: string;
  description: string;
  badge?: string;
  isPrimary?: boolean;
};

export type FeatureComparisonItem = {
  category: string;
  name: string;
  description?: string;
  steadystack: string | boolean;
  uptimerobot: string | boolean;
  checkly: string | boolean;
  betteruptime: string | boolean;
  isBattle?: boolean;
  competitor1?: string | boolean;
  competitor2?: string | boolean;
  competitor3?: string | boolean;
};

export const competitors: CompetitorInfo[] = [
  {
    id: "steadystack",
    name: "SteadyStack",
    url: "https://steadystack.dev",
    pricingUrl: "/pricing",
    description:
      "Cloudflare edge-native monitoring with multi-region quorum consensus (2-of-3 Free, 4-of-7 Paid).",
    badge: "Recommended",
    isPrimary: true,
  },
  {
    id: "uptimerobot",
    name: "UptimeRobot",
    url: "https://uptimerobot.com",
    pricingUrl: "https://uptimerobot.com/pricing",
    description: "Popular legacy provider with 50 free monitors at 5-min check intervals.",
  },
  {
    id: "betteruptime",
    name: "Better Uptime",
    url: "https://betteruptime.com",
    pricingUrl: "https://betterstack.com/uptime/pricing",
    description: "Modern incident management UI with 3-of-4 quorum model.",
  },
  {
    id: "checkly",
    name: "Checkly",
    url: "https://checklyhq.com",
    pricingUrl: "https://www.checklyhq.com/pricing",
    description: "API & Playwright synthetic monitoring (22 global locations).",
  },
];

export const featureComparisons: FeatureComparisonItem[] = [
  // Consensus & Verification
  {
    category: "Consensus & Verification",
    name: "Failure confirmation rule",
    description: "How many locations must agree before you're paged",
    steadystack: "2-of-3 (Free) · 4-of-7 (Paid) · Published",
    uptimerobot: "Multi-node within one region",
    betteruptime: "3 of 4 locations",
    checkly: "Not published",
    isBattle: true,
  },
  {
    category: "Consensus & Verification",
    name: "Monitoring regions",
    description: "Number of independent geographic probe zones deployed",
    steadystack: "3 (Free) · 7 (Paid)",
    uptimerobot: "4",
    betteruptime: "4 by default",
    checkly: "22",
    isBattle: false,
  },
  {
    category: "Consensus & Verification",
    name: "Multi-region checks on free tier",
    description: "Whether synthetic checks run from all regions without paying",
    steadystack: "✓ Included (3 regions, 2-of-3)",
    uptimerobot: "Paid plans only (single region free)",
    betteruptime: "Limited",
    checkly: "✓ 6 locations",
    isBattle: true,
  },
  {
    category: "Consensus & Verification",
    name: "Regional vs. global outage classification",
    description: "Distinguishes regional route flaps from true global outages",
    steadystack: "✓",
    uptimerobot: "✓ Region-specific incidents",
    betteruptime: "—",
    checkly: "—",
    isBattle: false,
  },
  {
    category: "Consensus & Verification",
    name: "Multi-ASN provider partition protection",
    description:
      "Out-of-band sentinel nodes on independent ASNs prevent single-cloud false positive storms",
    steadystack: "✓ Multi-ASN Quorum",
    uptimerobot: "Single-vendor egress",
    betteruptime: "Single-vendor egress",
    checkly: "AWS only",
    isBattle: true,
  },

  // Transparency & Allowlisting
  {
    category: "Transparency & Allowlisting",
    name: "Probe locations & health published",
    description: "Every city, network ASN, and DO location hint with live health",
    steadystack: "✓ Full list + live status",
    uptimerobot: "Regions only",
    betteruptime: "Not published",
    checkly: "List only",
    isBattle: true,
  },
  {
    category: "Transparency & Allowlisting",
    name: "WAF & probe allowlisting",
    description:
      "CF-Worker cryptographic header + User-Agent matching (immune to shared Cloudflare edge egress IP spoofing)",
    steadystack: "✓ CF-Worker header",
    uptimerobot: "Static IPs (shared)",
    betteruptime: "Static IPs only",
    checkly: "Static IPs (AWS)",
    isBattle: true,
  },
  {
    category: "Transparency & Allowlisting",
    name: "Probe health & flapping telemetry",
    description: "Automated flapping probe removal from quorum consensus",
    steadystack: true,
    uptimerobot: false,
    betteruptime: false,
    checkly: false,
    isBattle: false,
  },

  // Pricing & Limits
  {
    category: "Pricing & Limits",
    name: "Free tier check interval",
    description: "Frequency of health checks on free plan",
    steadystack: "3m (1m for first 10)",
    uptimerobot: "5 minutes",
    betteruptime: "3 minutes",
    checkly: "1 minute",
    isBattle: true,
  },
  {
    category: "Pricing & Limits",
    name: "Free monitor limit",
    description: "Number of active targets on free plan",
    steadystack: "50 monitors",
    uptimerobot: "50 monitors",
    betteruptime: "10 monitors",
    checkly: "10 monitors",
    isBattle: true,
  },
  {
    category: "Pricing & Limits",
    name: "Commercial use on free tier",
    description: "Legally permitted for business and production workloads",
    steadystack: "✓ Guaranteed in writing (stable ToS)",
    uptimerobot: "Permitted (ToS modified June 2026)",
    betteruptime: "Unstated",
    checkly: "✓",
    isBattle: true,
  },

  // Monitor Types & Protocols
  {
    category: "Monitor Types & Protocols",
    name: "SSL Certificate & Expiry Monitoring",
    description: "Full certificate chain verification with 30-day expiry warning",
    steadystack: "✓ 30-day alerts",
    uptimerobot: "✓ Basic",
    betteruptime: "✓ Included",
    checkly: "✓ Included",
    isBattle: false,
  },
  {
    category: "Monitor Types & Protocols",
    name: "DNS Record Integrity Monitoring",
    description: "Track DNS changes for A, AAAA, MX, TXT, CAA records",
    steadystack: "✓ A, MX, TXT, CAA",
    uptimerobot: "Paid Only",
    betteruptime: "✓ Included",
    checkly: "Paid Only",
    isBattle: false,
  },
  {
    category: "Monitor Types & Protocols",
    name: "TCP Port & Service Reachability",
    description: "Raw TCP socket handshakes for databases, mail, and custom ports",
    steadystack: "✓ Pro & Agency",
    uptimerobot: "✓ Included",
    betteruptime: "✓ Included",
    checkly: "—",
    isBattle: false,
  },
  {
    category: "Monitor Types & Protocols",
    name: "Heartbeat & Cron Job Monitoring",
    description: "Dead-man switch monitoring for scheduled jobs and workers",
    steadystack: "✓ Free & Paid",
    uptimerobot: "✓ Included",
    betteruptime: "✓ Included",
    checkly: "✓ Included",
    isBattle: false,
  },

  // Advanced Platform Capabilities
  {
    category: "Advanced Platform Capabilities",
    name: "Private Probe Agents (Docker VPC)",
    description: "Deploy internal probes inside private VPCs or homelabs",
    steadystack: "✓ Agency Plan",
    uptimerobot: "—",
    betteruptime: "—",
    checkly: "Enterprise",
    isBattle: false,
  },
  {
    category: "Advanced Platform Capabilities",
    name: "Browser / Synthetic Journey Testing",
    description: "Multi-step headless browser user journeys with assertion checks",
    steadystack: "✓ Pro & Agency",
    uptimerobot: "—",
    betteruptime: "—",
    checkly: "✓ Included",
    isBattle: false,
  },

  // Status Pages & Alerts
  {
    category: "Status Pages & Alerts",
    name: "Status Page with Custom Domain",
    description: "Branded public status portal with automated SSL",
    steadystack: "Agency ($29–$39/mo) · Hosted on Free",
    uptimerobot: "Paid Only ($7/mo+)",
    betteruptime: "Paid Only",
    checkly: "Paid Only",
    isBattle: false,
  },
  {
    category: "Status Pages & Alerts",
    name: "Slack & Discord Alerts (Free Tier)",
    description: "Instant chat and webhook dispatches without upgrading",
    steadystack: "✓ Free & Paid",
    uptimerobot: "Paid Only",
    betteruptime: "✓ Free & Paid",
    checkly: "✓ Free & Paid",
    isBattle: false,
  },
  {
    category: "Status Pages & Alerts",
    name: "Native REST API & CLI Access",
    description: "Terminal CLI tool and REST API for automation & CI/CD",
    steadystack: "✓ Full API & CLI",
    uptimerobot: "Limited API",
    betteruptime: "✓ Full API",
    checkly: "Paid Only",
    isBattle: false,
  },
];

export const intervalComparison = {
  steadystack: { label: "SteadyStack Free", interval: 60, color: "bg-primary" },
  competitors: [
    { label: "UptimeRobot", interval: 300, color: "bg-red-500/60" },
    { label: "Better Uptime", interval: 300, color: "bg-yellow-500/60" },
    { label: "OpenStatus", interval: 60, color: "bg-blue-500/60" },
  ],
};

export type DowntimeScenario = {
  name: string;
  description: string;
  downtimeStart: number;
  recoveryStart: number;
  competitorLabel: string;
  competitorDetect: number;
  steadystackLabel: string;
  steadystackDetect: number;
};

export const downtimeScenarios: DowntimeScenario[] = [
  {
    name: "Partial Outage",
    description:
      "A single server crashes during a deployment. Takes 8 minutes to identify and roll back.",
    downtimeStart: 0,
    recoveryStart: 8,
    competitorLabel: "Competitor (5min check)",
    competitorDetect: 5,
    steadystackLabel: "SteadyStack (3min check)",
    steadystackDetect: 3,
  },
  {
    name: "DNS Propagation Delay",
    description:
      "DNS record changes take effect gradually. A 12-minute window where traffic hits stale records.",
    downtimeStart: 0,
    recoveryStart: 12,
    competitorLabel: "Competitor (5min check)",
    competitorDetect: 5,
    steadystackLabel: "SteadyStack (3min check)",
    steadystackDetect: 3,
  },
  {
    name: "Database Failover",
    description: "Primary database goes down. Replica promotion takes 15 minutes.",
    downtimeStart: 0,
    recoveryStart: 15,
    competitorLabel: "Competitor (5min check)",
    competitorDetect: 5,
    steadystackLabel: "SteadyStack (3min check)",
    steadystackDetect: 3,
  },
];
