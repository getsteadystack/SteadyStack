---
page_title: "steadystack_alert_channel Resource - SteadyStack"
subcategory: ""
description: |-
  Manages a SteadyStack notification dispatch channel (PagerDuty, Opsgenie, Slack, Discord, Webhook, Email, Telegram, SMS).
---

# steadystack_alert_channel (Resource)

Manages a notification integration channel used by alert rules to dispatch incident notifications.

## Example Usage

```terraform
resource "steadystack_alert_channel" "slack_sre" {
  name = "Slack SRE Channel"
  type = "SLACK"
  config_json = jsonencode({
    webhookUrl = "https://hooks.slack.com/services/T00/B00/XXXX"
  })
}
```

## Schema

### Required

- `config_json` (String, Sensitive) JSON-encoded string containing channel-specific credentials and routing keys.
- `name` (String) Channel display name.
- `type` (String) Notification provider type: `PAGERDUTY`, `OPSGENIE`, `SLACK`, `DISCORD`, `WEBHOOK`, `EMAIL`, `TELEGRAM`, `SMS`.

### Read-Only

- `id` (String) Unique identifier of the alert channel.
