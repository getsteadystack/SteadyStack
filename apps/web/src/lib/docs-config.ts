export interface DocMeta {
  title: string;
  description: string;
  section: string;
  order: number;
  badge?: string;
  lastUpdated?: string;
}

export interface NavLink {
  title: string;
  slug: string;
  href: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavLink[];
}

export const DOCS_NAVIGATION: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "introduction", href: "/docs/introduction" },
      { title: "Quickstart", slug: "quickstart", href: "/docs/quickstart", badge: "5 min" },
    ],
  },
  {
    title: "Synthetic Surveillance",
    items: [
      { title: "Monitors", slug: "monitors", href: "/docs/monitors" },
      {
        title: "Response Assertions",
        slug: "response-assertions",
        href: "/docs/response-assertions",
        badge: "Payload",
      },
      {
        title: "Quorum Consensus",
        slug: "quorum-consensus",
        href: "/docs/quorum-consensus",
        badge: "Core",
      },
      {
        title: "Dynamic Thresholding",
        slug: "dynamic-thresholding",
        href: "/docs/dynamic-thresholding",
        badge: "AI",
      },
      {
        title: "Network Architecture",
        slug: "network-architecture",
        href: "/docs/network-architecture",
        badge: "Network",
      },
    ],
  },
  {
    title: "Alerting & Incidents",
    items: [
      { title: "Alert Rules", slug: "alert-rules", href: "/docs/alert-rules" },
      {
        title: "Alert Channels Setup",
        slug: "alert-channels",
        href: "/docs/alert-channels",
        badge: "Setup",
      },
      { title: "Integrations", slug: "integrations", href: "/docs/integrations" },
      {
        title: "Incident Runbooks",
        slug: "incident-runbooks",
        href: "/docs/incident-runbooks",
        badge: "SRE",
      },
    ],
  },
  {
    title: "Status Pages & Reporting",
    items: [
      { title: "Hosted Status Pages", slug: "status-pages", href: "/docs/status-pages" },
      {
        title: "Customizing Status Pages",
        slug: "status-page-customization",
        href: "/docs/status-page-customization",
      },
      { title: "Status Badges & Widgets", slug: "status-badges", href: "/docs/status-badges" },
      {
        title: "SLA & Audit Reports",
        slug: "sla-reports",
        href: "/docs/sla-reports",
        badge: "SOC2",
      },
    ],
  },
  {
    title: "Workspace & Governance",
    items: [
      { title: "Teams & RBAC", slug: "teams-rbac", href: "/docs/teams-rbac" },
      {
        title: "SLA Calculation Methodology",
        slug: "sla-methodology",
        href: "/docs/sla-methodology",
        badge: "Spec",
      },
    ],
  },
  {
    title: "IaC & CI/CD Gates",
    items: [
      {
        title: "Monitoring as Code",
        slug: "monitoring-as-code",
        href: "/docs/monitoring-as-code",
        badge: "GitOps",
      },
      { title: "Terraform / OpenTofu", slug: "terraform", href: "/docs/terraform", badge: "IaC" },
      {
        title: "GitHub Actions Gates",
        slug: "github-actions",
        href: "/docs/github-actions",
        badge: "CI/CD",
      },
      { title: "CLI & Docker Probes", slug: "cli", href: "/docs/cli" },
      {
        title: "CLI Command Reference",
        slug: "cli-reference",
        href: "/docs/cli-reference",
        badge: "CLI",
      },
      { title: "Self-Hosting", slug: "self-hosting", href: "/docs/self-hosting" },
      {
        title: "Deploying Private Probes",
        slug: "probe-deployment",
        href: "/docs/probe-deployment",
        badge: "Self-host",
      },
    ],
  },
  {
    title: "APIs & Observability",
    items: [
      {
        title: "REST API Reference",
        slug: "api-reference",
        href: "/docs/api-reference",
        badge: "API",
      },
      { title: "Webhook Signatures", slug: "webhooks", href: "/docs/webhooks", badge: "HMAC" },
      {
        title: "Prometheus & Grafana",
        slug: "prometheus-grafana",
        href: "/docs/prometheus-grafana",
        badge: "Metrics",
      },
    ],
  },
];
