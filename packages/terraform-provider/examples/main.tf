terraform {
  required_providers {
    steadystack = {
      source  = "getsteadystack/SteadyStack"
      version = ">= 1.0.0"
    }
  }
}

provider "steadystack" {
  # api_key can also be set via STEADYSTACK_API_KEY env var
  api_key = "pg_live_your_api_key_here"
}

# Fetch all available sovereign edge regions
data "steadystack_regions" "edge" {}

# Create PagerDuty notification channel
resource "steadystack_alert_channel" "pagerduty_sre" {
  name = "PagerDuty SRE High Priority"
  type = "PAGERDUTY"
  config_json = jsonencode({
    routingKey = "R015PXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  })
}

# Create Opsgenie notification channel
resource "steadystack_alert_channel" "opsgenie_oncall" {
  name = "Opsgenie Platform On-Call"
  type = "OPSGENIE"
  config_json = jsonencode({
    apiKey = "eb32xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    region = "us"
  })
}

# Define edge-native synthetic monitor across sovereign regions
resource "steadystack_monitor" "api_production" {
  name     = "Production API Gateway"
  url      = "https://api.example.com/health"
  type     = "HTTP"
  interval = 30
  timeout  = 5
  method   = "GET"

  headers = {
    "X-Synthetic-Monitor" = "SteadyStack-Edge"
    "Authorization"       = "Bearer secret-token"
  }

  check_regions = [
    "wnam", # North America West
    "enam", # North America East
    "weur", # Western Europe (Frankfurt)
    "apac", # Asia Pacific (Singapore)
  ]

  alert_threshold      = 2
  dynamic_thresholding = true
  runbook_url          = "https://wiki.example.com/runbooks/api-gateway-outage"

  tags = ["production", "api", "critical"]
}

# Configure Alert Routing Rules
resource "steadystack_alert_rule" "api_down_alert" {
  monitor_id    = steadystack_monitor.api_production.id
  trigger       = "STATUS_CHANGE"
  target_status = "DOWN"
  enabled       = true
  channel_ids   = [
    steadystack_alert_channel.pagerduty_sre.id,
    steadystack_alert_channel.opsgenie_oncall.id,
  ]
}

resource "steadystack_alert_rule" "api_latency_alert" {
  monitor_id  = steadystack_monitor.api_production.id
  trigger     = "LATENCY"
  threshold   = 1500 # Alert if latency > 1500ms
  comparison  = "GT"
  enabled     = true
  channel_ids = [
    steadystack_alert_channel.pagerduty_sre.id,
  ]
}

# Manage Public or Private Status Page
resource "steadystack_status_page" "public_status" {
  slug               = "acme-status"
  title              = "ACME Production Status"
  description        = "Real-time uptime and incident reporting for ACME services"
  custom_domain      = "status.example.com"
  is_private         = false
  show_uptime        = true
  show_response_time = true
  history_days       = 90
}
