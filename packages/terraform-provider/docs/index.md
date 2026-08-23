---
page_title: "Provider: SteadyStack"
description: |-
  The SteadyStack provider is used to interact with the SteadyStack Uptime & Synthetic Surveillance API.
---

# SteadyStack Provider

The SteadyStack provider is used to configure and manage synthetic monitors, notification channels, alert routing rules, and status pages as Infrastructure as Code.

## Example Usage

```terraform
terraform {
  required_providers {
    steadystack = {
      source  = "getsteadystack/SteadyStack"
      version = "~> 1.0"
    }
  }
}

provider "steadystack" {
  api_key  = var.steadystack_api_key
  host_url = "https://app.steadystack.dev" # Optional
}
```

## Schema

### Optional

- `api_key` (String, Sensitive) SteadyStack API key for authentication. Can also be set via `STEADYSTACK_API_KEY` environment variable.
- `host_url` (String) SteadyStack API host URL. Defaults to `https://app.steadystack.dev` or `STEADYSTACK_HOST_URL` environment variable.
