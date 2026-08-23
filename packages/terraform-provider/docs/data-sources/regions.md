---
page_title: "steadystack_regions Data Source - SteadyStack"
subcategory: ""
description: |-
  Fetches available SteadyStack sovereign edge probe regions.
---

# steadystack_regions (Data Source)

Retrieves the list of active SteadyStack edge check nodes and geographic regions across North America, Europe, and Asia-Pacific.

## Example Usage

```terraform
data "steadystack_regions" "all" {}

output "available_regions" {
  value = data.steadystack_regions.all.regions
}
```

## Schema

### Read-Only

- `id` (String) Data source identifier.
- `regions` (List of Object) List of active probe regions:
  - `code` (String) 4-letter region code (`wnam`, `enam`, `weur`, `apac`).
  - `name` (String) Geographic region name.
  - `location` (String) Physical datacenter city and country.
  - `flag` (String) Regional flag emoji.
