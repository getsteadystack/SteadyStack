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
  ArrowRight,
  ShieldCheck,
  Activity,
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
    <div className="relative min-h-screen bg-[#fbfbf9] text-[#23211a] py-16 md:py-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#868279] mb-8">
          <Link href="/" className="hover:text-[#23211a] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span>Docs</span>
          <span>/</span>
          <span className="text-[#23211a] font-semibold">Terraform Provider</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col gap-6 mb-16">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-[#ffd439]/20 border border-[#ffd439]/50 text-[#23211a] rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
              Official Provider
            </span>
            <span className="px-2.5 py-0.5 bg-white text-[#5c5c5c] border border-[#e8e6df] rounded-md text-xs font-mono">
              v1.0.0
            </span>
            <span className="px-2.5 py-0.5 bg-white text-[#5c5c5c] border border-[#e8e6df] rounded-md text-xs font-mono">
              OpenTofu Compatible
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
            Terraform Provider for SteadyStack
          </h1>

          <p className="text-base sm:text-lg text-[#5c5c5c] max-w-3xl leading-relaxed font-sans text-balance">
            Provision, version-control, and automate edge-native synthetic monitoring, incident
            escalation channels, alert rules, and customer-facing status pages directly within your
            Terraform or OpenTofu infrastructure pipelines.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/getsteadystack/SteadyStack/tree/master/packages/terraform-provider"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-5 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              <Code2 className="size-4" />
              <span>View on GitHub</span>
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
            <a
              href="#quickstart"
              className="inline-flex items-center gap-2 h-11 px-5 bg-white hover:bg-[#f0ede6] border border-[#e8e6df] text-[#23211a] font-mono text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              <BookOpen className="size-4" />
              <span>Quick Start Guide</span>
            </a>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col gap-3">
            <div className="p-2.5 bg-[#ffd439]/20 text-[#23211a] w-fit rounded-xl border border-[#ffd439]/40">
              <Globe className="size-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#23211a]">Sovereign Edge Quorum</h3>
            <p className="text-xs text-[#5c5c5c] leading-relaxed">
              Target health checks across 7 regional edge clusters (wnam, enam, weur, apac) to
              eliminate single-probe false positives.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col gap-3">
            <div className="p-2.5 bg-[#ffd439]/20 text-[#23211a] w-fit rounded-xl border border-[#ffd439]/40">
              <Bell className="size-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#23211a]">Multi-Channel Routing</h3>
            <p className="text-xs text-[#5c5c5c] leading-relaxed">
              Route incidents to PagerDuty, Opsgenie, Slack, Discord, SMS, or custom webhooks with
              granular trigger policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col gap-3">
            <div className="p-2.5 bg-[#ffd439]/20 text-[#23211a] w-fit rounded-xl border border-[#ffd439]/40">
              <Layers className="size-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#23211a]">Status Pages as Code</h3>
            <p className="text-xs text-[#5c5c5c] leading-relaxed">
              Provision branded public or password-protected status pages with custom CNAME domains
              and SLA timelines.
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-16">
          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
              <Terminal className="size-6 text-[#23211a]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                1. Provider Configuration
              </h2>
            </div>
            <p className="text-sm text-[#5c5c5c] leading-relaxed">
              Declare the provider in your Terraform manifest and supply your API key from Workspace
              Settings.
            </p>

            <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#fbfbf9] border-b border-[#e8e6df] flex items-center justify-between">
                <span className="text-xs font-mono text-[#868279]">main.tf</span>
                <span className="text-xs font-mono font-bold text-[#23211a]">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-[#23211a] overflow-x-auto leading-relaxed bg-[#fbfbf9]/50">
                {`terraform {
  required_providers {
    steadystack = {
      source  = "getsteadystack/SteadyStack"
      version = "~> 1.0"
    }
  }
}

provider "steadystack" {
  api_key = var.steadystack_api_key # or export STEADYSTACK_API_KEY="..."
}`}
              </pre>
            </div>
          </section>

          {/* Section 2: Synthetic Monitor Resource */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
              <Shield className="size-6 text-[#23211a]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                2. Synthetic Monitors (
                <code className="font-mono text-sm bg-[#f0ede6] px-1.5 py-0.5 rounded">
                  steadystack_monitor
                </code>
                )
              </h2>
            </div>
            <p className="text-sm text-[#5c5c5c] leading-relaxed">
              Configure HTTP, PING, PORT, SSL, DNS, or HEARTBEAT monitors with sovereign edge region
              targeting and anomaly thresholds.
            </p>

            <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#fbfbf9] border-b border-[#e8e6df] flex items-center justify-between">
                <span className="text-xs font-mono text-[#868279]">monitors.tf</span>
                <span className="text-xs font-mono font-bold text-[#23211a]">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-[#23211a] overflow-x-auto leading-relaxed bg-[#fbfbf9]/50">
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

            <div className="overflow-x-auto border border-[#e8e6df] rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-[#fbfbf9] text-[#5c5c5c] font-semibold border-b border-[#e8e6df]">
                  <tr>
                    <th className="p-3.5">Attribute</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e6df] text-[#5c5c5c]">
                  <tr>
                    <td className="p-3.5 font-bold text-[#23211a]">name</td>
                    <td className="p-3.5 text-rose-700 font-semibold">string (required)</td>
                    <td className="p-3.5 font-sans">Display label of the monitor.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-[#23211a]">url</td>
                    <td className="p-3.5 text-rose-700 font-semibold">string (required)</td>
                    <td className="p-3.5 font-sans">Target endpoint or domain to surveil.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-[#23211a]">type</td>
                    <td className="p-3.5">string (optional)</td>
                    <td className="p-3.5 font-sans">
                      <code>HTTP</code>, <code>PING</code>, <code>PORT</code>, <code>SSL</code>,{" "}
                      <code>DNS</code>, <code>HEARTBEAT</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-[#23211a]">check_regions</td>
                    <td className="p-3.5">list(string)</td>
                    <td className="p-3.5 font-sans">
                      Edge probe regions: <code>wnam</code>, <code>enam</code>, <code>weur</code>,{" "}
                      <code>apac</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-[#23211a]">dynamic_thresholding</td>
                    <td className="p-3.5">bool</td>
                    <td className="p-3.5 font-sans">
                      Enables latency spike and degradation anomaly detection.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Notification Channels & Alert Rules */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
              <Bell className="size-6 text-[#23211a]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                3. Notification Channels & Alert Rules
              </h2>
            </div>
            <p className="text-sm text-[#5c5c5c] leading-relaxed">
              Connect monitors to notification channels like PagerDuty, Slack, or Webhooks with
              conditional alert rules.
            </p>

            <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#fbfbf9] border-b border-[#e8e6df] flex items-center justify-between">
                <span className="text-xs font-mono text-[#868279]">alerts.tf</span>
                <span className="text-xs font-mono font-bold text-[#23211a]">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-[#23211a] overflow-x-auto leading-relaxed bg-[#fbfbf9]/50">
                {`# 1. Define Notification Channel
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
            <div className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
              <Layers className="size-6 text-[#23211a]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                4. Status Pages (
                <code className="font-mono text-sm bg-[#f0ede6] px-1.5 py-0.5 rounded">
                  steadystack_status_page
                </code>
                )
              </h2>
            </div>
            <p className="text-sm text-[#5c5c5c] leading-relaxed">
              Deploy branded status pages with custom CNAME domains, access controls, and SLA
              showcase charts.
            </p>

            <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#fbfbf9] border-b border-[#e8e6df] flex items-center justify-between">
                <span className="text-xs font-mono text-[#868279]">status_page.tf</span>
                <span className="text-xs font-mono font-bold text-[#23211a]">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-[#23211a] overflow-x-auto leading-relaxed bg-[#fbfbf9]/50">
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
            <div className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
              <Cpu className="size-6 text-[#23211a]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                5. Data Sources (
                <code className="font-mono text-sm bg-[#f0ede6] px-1.5 py-0.5 rounded">
                  steadystack_regions
                </code>
                )
              </h2>
            </div>
            <p className="text-sm text-[#5c5c5c] leading-relaxed">
              Dynamically discover all active global edge check nodes and geographic regions.
            </p>

            <div className="rounded-2xl border border-[#e8e6df] bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#fbfbf9] border-b border-[#e8e6df] flex items-center justify-between">
                <span className="text-xs font-mono text-[#868279]">regions.tf</span>
                <span className="text-xs font-mono font-bold text-[#23211a]">HCL</span>
              </div>
              <pre className="p-5 text-xs font-mono text-[#23211a] overflow-x-auto leading-relaxed bg-[#fbfbf9]/50">
                {`data "steadystack_regions" "edge_nodes" {}

output "edge_regions" {
  value = data.steadystack_regions.edge_nodes.regions
}`}
              </pre>
            </div>
          </section>
        </div>

        {/* CTA Footer */}
        <div className="mt-20 rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_24px_60px_rgba(0,0,0,0.14)] relative overflow-hidden">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#ffd439]/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex flex-col gap-2 text-center md:text-left relative z-10">
            <h3 className="text-2xl font-serif font-medium text-white">
              Ready to automate your monitoring as code?
            </h3>
            <p className="text-sm text-white/80 max-w-md font-sans leading-relaxed">
              Generate an API key in Workspace Settings and deploy your first synthetic check
              pipeline in minutes.
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
