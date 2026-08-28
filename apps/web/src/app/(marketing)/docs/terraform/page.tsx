import type { Metadata } from "next";
import Link from "next/link";
import {
  Terminal,
  Shield,
  Layers,
  Bell,
  Cpu,
  Globe,
  CheckCircle2,
  ExternalLink,
  Code2,
  BookOpen,
  Copy,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terraform Provider Documentation | SteadyStack",
  description:
    "Official HashiCorp Terraform and OpenTofu provider documentation for SteadyStack — Manage synthetic surveillance, incident routing, and status pages as code.",
  alternates: {
    canonical: "/docs/terraform",
  },
  openGraph: {
    title: "SteadyStack Terraform Provider",
    description:
      "Manage global edge uptime, synthetic surveillance, and status pages with Terraform & OpenTofu.",
  },
};

export default function TerraformDocsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Docs</span>
          <span>/</span>
          <span className="text-primary font-semibold">Terraform Provider</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col gap-6 mb-16">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-mono font-bold tracking-wider uppercase">
              Official Provider
            </span>
            <span className="px-2.5 py-0.5 bg-muted/60 text-muted-foreground border border-border rounded text-xs font-mono">
              v1.0.0
            </span>
            <span className="px-2.5 py-0.5 bg-muted/60 text-muted-foreground border border-border rounded text-xs font-mono">
              OpenTofu Compatible
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Terraform Provider for SteadyStack
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Provision, manage, and version-control your edge-native synthetic monitoring, incident
            escalation channels, alert rules, and customer-facing status pages directly within your
            Terraform or OpenTofu infrastructure pipelines.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://github.com/getsteadystack/SteadyStack/tree/master/packages/terraform-provider"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              <Code2 className="size-4" />
              View on GitHub
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
            <a
              href="#quickstart"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted/40 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-all"
            >
              <BookOpen className="size-4" />
              Quick Start Guide
            </a>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm flex flex-col gap-3">
            <div className="p-2.5 bg-primary/10 text-primary w-fit rounded-lg">
              <Globe className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Sovereign Edge Quorum</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Target checks across 7 regional edge clusters (wnam, enam, weur, apac) to prevent
              regional ISP false alarms.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm flex flex-col gap-3">
            <div className="p-2.5 bg-primary/10 text-primary w-fit rounded-lg">
              <Bell className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Multi-Channel Routing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Route incidents to PagerDuty, Opsgenie, Slack, Discord, SMS, or custom webhooks with
              granular trigger rules.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm flex flex-col gap-3">
            <div className="p-2.5 bg-primary/10 text-primary w-fit rounded-lg">
              <Layers className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Status Pages as Code</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Provision branded public or password-protected status pages with custom domains and
              SLA timelines.
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-16">
          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Terminal className="size-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">1. Provider Configuration</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Declare the provider in your Terraform manifest and provide your API Key from the
              SteadyStack dashboard.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">main.tf</span>
                <span className="text-xs font-mono text-primary">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                {`terraform {
  required_providers {
    steadystack = {
      source  = "getsteadystack/SteadyStack"
      version = "~> 1.0"
    }
  }
}

provider "steadystack" {
  api_key = var.steadystack_api_key # or set export STEADYSTACK_API_KEY="..."
}`}
              </pre>
            </div>
          </section>

          {/* Section 2: Synthetic Monitor Resource */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Shield className="size-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                2. Synthetic Monitors (`steadystack_monitor`)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Configure HTTP, PING, PORT, SSL, DNS, or HEARTBEAT monitors with sovereign edge region
              targeting and AI anomaly thresholds.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">monitors.tf</span>
                <span className="text-xs font-mono text-primary">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                {`resource "steadystack_monitor" "api_gateway" {
  name     = "Production API Gateway"
  url      = "https://api.example.com/health"
  type     = "HTTP"
  interval = 30
  timeout  = 5
  method   = "GET"

  headers = {
    "X-Synthetic-Check" = "SteadyStack-Edge"
    "Authorization"     = "Bearer \${var.internal_auth_token}"
  }

  check_regions        = ["wnam", "enam", "weur", "apac"]
  alert_threshold      = 2
  dynamic_thresholding = true
  runbook_url          = "https://wiki.example.com/runbooks/api-outage"
  tags                 = ["production", "api", "core"]
}`}
              </pre>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 font-mono text-foreground">name</td>
                    <td className="p-3 font-mono text-primary">string (required)</td>
                    <td className="p-3">Display label of the monitor.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-foreground">url</td>
                    <td className="p-3 font-mono text-primary">string (required)</td>
                    <td className="p-3">Target endpoint or domain to surveil.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-foreground">type</td>
                    <td className="p-3 font-mono">string (optional)</td>
                    <td className="p-3">
                      <code className="font-mono">HTTP</code>,{" "}
                      <code className="font-mono">PING</code>,{" "}
                      <code className="font-mono">PORT</code>,{" "}
                      <code className="font-mono">SSL</code>, <code className="font-mono">DNS</code>
                      , <code className="font-mono">HEARTBEAT</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-foreground">check_regions</td>
                    <td className="p-3 font-mono">list(string)</td>
                    <td className="p-3">
                      Edge probe regions: <code className="font-mono">wnam</code>,{" "}
                      <code className="font-mono">enam</code>,{" "}
                      <code className="font-mono">weur</code>,{" "}
                      <code className="font-mono">apac</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-foreground">dynamic_thresholding</td>
                    <td className="p-3 font-mono">bool</td>
                    <td className="p-3">
                      Enables AI-driven latency spike & degradation anomaly alarms.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Notification Channels & Alert Rules */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Bell className="size-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                3. Notification Channels & Alert Rules
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect monitors to notification channels like PagerDuty or Slack with conditional
              alert triggers.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">alerts.tf</span>
                <span className="text-xs font-mono text-primary">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                {`# 1. Define Notification Channels
resource "steadystack_alert_channel" "pagerduty_sre" {
  name = "PagerDuty SRE On-Call"
  type = "PAGERDUTY"
  config_json = jsonencode({
    routingKey = var.pagerduty_routing_key
  })
}

# 2. Attach Alert Rules to Monitors
resource "steadystack_alert_rule" "api_downstream_alarm" {
  monitor_id    = steadystack_monitor.api_gateway.id
  trigger       = "STATUS_CHANGE"
  target_status = "DOWN"
  enabled       = true
  channel_ids   = [steadystack_alert_channel.pagerduty_sre.id]
}

resource "steadystack_alert_rule" "api_latency_sla" {
  monitor_id  = steadystack_monitor.api_gateway.id
  trigger     = "LATENCY"
  threshold   = 1500 # Trigger when latency exceeds 1500ms
  comparison  = "GT"
  enabled     = true
  channel_ids = [steadystack_alert_channel.pagerduty_sre.id]
}`}
              </pre>
            </div>
          </section>

          {/* Section 4: Status Pages */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Layers className="size-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                4. Status Pages (`steadystack_status_page`)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deploy branded status pages with custom domains, password protections, and SLA
              showcase charts.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">status_page.tf</span>
                <span className="text-xs font-mono text-primary">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                {`resource "steadystack_status_page" "company_status" {
  slug               = "acme-status"
  title              = "ACME Production Status"
  description        = "Live real-time operational status and historical SLA metrics."
  custom_domain      = "status.example.com"
  is_private         = false
  show_uptime        = true
  show_response_time = true
  history_days       = 90
}`}
              </pre>
            </div>
          </section>

          {/* Section 5: Data Sources */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Cpu className="size-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                5. Data Sources (`steadystack_regions`)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dynamically discover all active global edge check nodes and geographic regions.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">regions.tf</span>
                <span className="text-xs font-mono text-primary">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                {`data "steadystack_regions" "edge_nodes" {}

output "edge_regions" {
  value = data.steadystack_regions.edge_nodes.regions
}`}
              </pre>
            </div>
          </section>
        </div>

        {/* CTA Footer */}
        <div className="mt-20 p-8 md:p-12 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground">
              Ready to automate your monitoring?
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate an API Key in Workspace Settings and deploy your first synthetic check in
              minutes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
