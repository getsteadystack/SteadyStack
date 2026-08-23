---
page_title: "steadystack_monitor Resource - SteadyStack"
subcategory: ""
description: |-
  Manages a SteadyStack edge uptime and synthetic surveillance monitor.
---

# steadystack_monitor (Resource)

Manages a SteadyStack edge uptime monitor with multi-region quorum validation.

## Example Usage

```terraform
resource "steadystack_monitor" "api" {
  name     = "Production API Gateway"
  url      = "https://api.example.com/health"
  type     = "HTTP"
  interval = 30
  timeout  = 5
  method   = "GET"

  headers = {
    "X-Synthetic-Check" = "SteadyStack-Edge"
  }

  check_regions        = ["wnam", "enam", "weur", "apac"]
  alert_threshold      = 2
  dynamic_thresholding = true
  runbook_url          = "https://wiki.example.com/runbooks/api"
  tags                 = ["prod", "api"]
}
```

## Schema

### Required

- `name` (String) The display name of the monitor.
- `url` (String) The endpoint URL or hostname to monitor.

### Optional

- `alert_threshold` (Number) Number of consecutive failed cycles required before triggering an incident. Defaults to `1`.
- `body` (String) HTTP request payload body.
- `check_regions` (List of String) Specific sovereign edge regions to run checks from (e.g. `wnam`, `enam`, `weur`, `apac`).
- `dynamic_thresholding` (Boolean) Enable AI-driven dynamic latency anomaly detection. Defaults to `false`.
- `headers` (Map of String) HTTP request headers.
- `interval` (Number) Check interval in seconds (e.g., 10, 30, 60, 300). Defaults to `60`.
- `method` (String) HTTP request method (GET, POST, PUT, DELETE, HEAD, PATCH). Defaults to `GET`.
- `runbook_url` (String) URL to operational runbook documentation.
- `tags` (List of String) Custom categorization tags.
- `timeout` (Number) Request timeout limit in seconds. Defaults to `10`.
- `type` (String) Monitor protocol: `HTTP`, `PING`, `PORT`, `SSL`, `DNS`, `HEARTBEAT`. Defaults to `HTTP`.

### Read-Only

- `id` (String) Unique identifier of the monitor.
- `status` (String) Current operational state (`UP`, `DOWN`, `DEGRADED`, `PAUSED`).
