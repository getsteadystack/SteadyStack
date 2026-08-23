---
page_title: "steadystack_alert_rule Resource - SteadyStack"
subcategory: ""
description: |-
  Manages a SteadyStack alert routing rule linking monitors to notification channels.
---

# steadystack_alert_rule (Resource)

Configures automated alert trigger conditions and routes incidents to notification channels.

## Example Usage

```terraform
resource "steadystack_alert_rule" "latency_warning" {
  monitor_id  = steadystack_monitor.api.id
  trigger     = "LATENCY"
  threshold   = 2000
  comparison  = "GT"
  enabled     = true
  channel_ids = [steadystack_alert_channel.pagerduty.id]
}
```

## Schema

### Required

- `monitor_id` (String) Target monitor ID to monitor for triggers.

### Optional

- `channel_ids` (List of String) List of notification channel IDs to alert when triggered.
- `comparison` (String) Comparison operator: `GT` (greater than), `LT` (less than).
- `enabled` (Boolean) Whether the rule is active. Defaults to `true`.
- `target_status` (String) State to alert on for status changes: `DOWN`, `DEGRADED`, `UP`. Defaults to `DOWN`.
- `threshold` (Number) Metric threshold value (latency in ms, certificate days remaining, etc.).
- `trigger` (String) Trigger event type: `STATUS_CHANGE`, `LATENCY`, `SSL_EXPIRY`, `DNS_WATCHDOG`, `DOMAIN_EXPIRY`. Defaults to `STATUS_CHANGE`.

### Read-Only

- `id` (String) Unique identifier of the alert rule.
