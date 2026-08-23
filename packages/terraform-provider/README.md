# Terraform Provider for SteadyStack 🛡️

The official HashiCorp Terraform provider for [SteadyStack](https://steadystack.dev) — Edge-native, zero-false-positive uptime and synthetic monitoring platform.

## Features

- **Monitoring as Code**: Manage HTTP, PING, PORT, SSL, DNS, and HEARTBEAT synthetic monitors in HCL.
- **Headers & Payloads**: Full support for custom HTTP request headers, methods, and request bodies.
- **Sovereign Edge Region Targeting**: Pin checks across North America (`wnam`, `enam`), Europe (`weur`), and Asia-Pacific (`apac`).
- **Incident Escalation Channels**: Configure PagerDuty, Opsgenie, Slack, Discord, Telegram, SMS, Email, and Webhook dispatch channels directly from IaC.
- **Alert Routing Rules**: Define granular alert rules matching status changes, latency thresholds, SSL certificate expiration, and domain expiries with targeted escalation channels.
- **Public & Private Status Pages**: Define hosted status pages with custom domains, privacy protection, and SLA showcase settings.
- **Dynamic Thresholding & Runbooks**: Enable AI-driven latency anomaly detection and incident remediation runbook links.

## Quick Start

```hcl
terraform {
  required_providers {
    steadystack = {
      source  = "getsteadystack/SteadyStack"
      version = "~> 1.0"
    }
  }
}

provider "steadystack" {
  api_key = var.steadystack_api_key # or export STEADYSTACK_API_KEY
}

# Fetch available edge probe regions
data "steadystack_regions" "edge" {}

# Create an Edge Uptime Monitor
resource "steadystack_monitor" "app_gateway" {
  name     = "App Gateway"
  url      = "https://app.example.com/health"
  type     = "HTTP"
  interval = 30
  timeout  = 5
  method   = "GET"

  headers = {
    "X-Synthetic-Check" = "SteadyStack-Edge"
  }

  check_regions        = ["wnam", "weur", "apac"]
  alert_threshold      = 2
  dynamic_thresholding = true
  runbook_url          = "https://wiki.example.com/runbooks/api"
  tags                 = ["prod", "frontend"]
}

# Configure an Alert Notification Channel
resource "steadystack_alert_channel" "pagerduty_sre" {
  name = "PagerDuty SRE High Priority"
  type = "PAGERDUTY"
  config_json = jsonencode({
    routingKey = "R015PXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  })
}

# Route Alerts with Custom Rules
resource "steadystack_alert_rule" "app_down" {
  monitor_id    = steadystack_monitor.app_gateway.id
  trigger       = "STATUS_CHANGE"
  target_status = "DOWN"
  enabled       = true
  channel_ids   = [steadystack_alert_channel.pagerduty_sre.id]
}

# Create a Status Page
resource "steadystack_status_page" "company_status" {
  slug               = "acme-status"
  title              = "ACME Status"
  description        = "Live platform operational status and incident history."
  custom_domain      = "status.example.com"
  is_private         = false
  show_uptime        = true
  show_response_time = true
  history_days       = 90
}
```

## Authentication

Generate a scoped API key in your SteadyStack dashboard under **Workspace Settings → API Keys**.

Set via provider config or environment variable:

```bash
export STEADYSTACK_API_KEY="pg_live_xxxxxxxxxxxxxxxx"
export STEADYSTACK_HOST_URL="https://app.steadystack.dev" # Optional, defaults to production
```

## Development & Building

To build the provider binary locally for Terraform CLI development:

```bash
cd packages/terraform-provider
go build -o terraform-provider-steadystack
```

To configure local overrides in `~/.terraformrc` or `%APPDATA%/terraform.rc`:

```hcl
provider_installation {
  dev_overrides {
    "getsteadystack/SteadyStack" = "<path-to-steadystack>/packages/terraform-provider"
  }
  direct {}
}
```
