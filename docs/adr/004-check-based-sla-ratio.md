# ADR-004: SLA ratio is computed from successful checks, not incident durations

*Accepted — 2026-09*

## Context

An SLA report must answer: *what fraction of the reporting window was the
service up?* Two data sources in the product could answer it:

1. **Incident records** — start/end timestamps of detected outages. Human-auditable,
   but only as good as detection: probes that miss the window, alerting rules
   that weren't enabled, monitors whose threshold settings were changed
   mid-month.
2. **The raw check stream** — every probe result we recorded, up to one per
   monitor per 30 seconds. Complete, but enormous at scale.

The definition of "downtime" also matters. We do not want SLA numbers to move
when someone edits an alerting rule or an incident is closed late — the *service*
was up or down independently of how our alerting reacted.

## Decision

The SLA ratio is **defined as successful checks ÷ total checks** over the
window, computed from the persisted check stream. Concretely:

- The worker downsamples each monitor's checks into **`DailyMonitorSummary`**
  rows once per day (`apps/worker/src/downsampling-cron.ts`), storing
  `totalChecks`, `successfulChecks`, and aggregated latency — one row per
  monitor per UTC day, written idempotently via `upsert`.
- Report generation (`actions/sla-reports.ts`) sums these daily rows for the
  window. For the **current, not-yet-summarized day**, live counts are merged
  in from the check/event stream so today's SLA is accurate without waiting
  for tonight's downsampling run.
- A check is "successful" by the same criteria the monitor detail view uses —
  the quorum verdict from ADR-001, not any single provider's opinion.

## Consequences

- **SLA is decoupled from alerting configuration.** Disabling alerts, changing
  thresholds, or forgetting to close an incident cannot move an SLA number.
  What happened happened, and the check stream is the record.
- **Cost is bounded and predictable**: 1 row per monitor per day, regardless of
  30-second or 5-minute intervals. A month of reports reads ~30 rows per
  monitor instead of ~86k checks.
- **Interval changes don't distort history**: because the ratio is a fraction
  of *that day's* checks, switching a monitor from 5-minute to 30-second
  cadence changes the denominator of new days only — past days keep their own
  consistent fractions.
- **Missed checks are invisible by construction** (no check recorded, no count).
  This is the deliberate trade from ADR-002's crash window: we report on checks
  actually taken. If a user reports "SLA looks fine but we saw an outage," the
  first thing to compare is the check count before/after the reported window.
- **Maintenance windows do not automatically exclude anything** in the daily
  summary. The summary records what the monitor observed; any maintenance-aware
  presentation is a reporting-layer concern, applied at query time — not baked
  into the stored numbers, which stay a faithful record.
- **Latency aggregates live in the same rows**, so percentile and SLA views read
  the same compact table and never replay raw checks.
