---
page_title: "steadystack_status_page Resource - SteadyStack"
subcategory: ""
description: |-
  Manages a SteadyStack hosted public or private status page.
---

# steadystack_status_page (Resource)

Manages a public or private status page with custom domain support.

## Example Usage

```terraform
resource "steadystack_status_page" "main" {
  slug               = "acme-status"
  title              = "ACME Production Status"
  description        = "Live availability and latency metrics for ACME systems"
  custom_domain      = "status.example.com"
  is_private         = false
  show_uptime        = true
  show_response_time = true
  history_days       = 90
}
```

## Schema

### Required

- `slug` (String) Unique URL path identifier.
- `title` (String) Display title of the status page.

### Optional

- `custom_domain` (String) Custom CNAME domain (e.g., `status.example.com`).
- `description` (String) Brief subtitle displayed beneath the title.
- `history_days` (Number) Lookback duration in days (30, 60, or 90). Defaults to `90`.
- `is_private` (Boolean) Restricts access to authorized/password-authenticated viewers. Defaults to `false`.
- `password` (String, Sensitive) Password for access protection when private.
- `show_response_time` (Boolean) Shows response time sparklines and charts. Defaults to `true`.
- `show_uptime` (Boolean) Displays 90-day SLA availability bars. Defaults to `true`.

### Read-Only

- `id` (String) Unique identifier of the status page.
