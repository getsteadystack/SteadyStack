# ADR-002: Atomic check claims over scheduler infrastructure

*Accepted — 2026-09*

## Context

Uptime checks must run on a fixed cadence per monitor (down to 30 seconds) across
three independent execution contexts:

1. **`apps/worker`** — a Cloudflare Worker driven by a cron trigger (the production engine).
2. **`/api/cron/check`** — a Next.js API route that can be poked by any external
   scheduler (Vercel Cron, GitHub Actions cron, a system crontab).
3. **Ad-hoc triggers** — on-demand instant probes and monitor mutations that
   schedule an immediate re-check.

Any of these can run concurrently — and in multi-region deployments, several
workers run concurrently *by design* (see ADR-001). Monitors must be claimed
before execution so that a due monitor is checked **exactly once** per interval,
no matter how many engines wake up at the same minute.

The naive solutions all have problems:

- **Single scheduler instance** (leader election via a lock row): a new SPOF,
  requires heartbeat/lease machinery, and fails open or closed in ugly ways.
- **Distributed lock service** (Redis/Upstash): extra infrastructure, extra cost,
  and another failure mode on the critical path of the core product.
- **"Optimistic" duplicate runs**: a 30s-interval monitor checked twice per
  interval silently halves alert latency and doubles probe spend; billing-adjacent
  check counts become wrong.

## Decision

Scheduling state lives **on the monitor row itself**: `nextCheckAt`. An engine
claims due monitors with a single atomic conditional `updateMany`:

```ts
const claimed = await prisma.monitor.updateMany({
  where: {
    id: { in: dueMonitorIds },
    nextCheckAt: { lte: now },          // still due — nobody claimed it yet
  },
  data: { nextCheckAt: new Date(now + intervalMs) }, // push the claim forward
});
```

Only the engine whose `updateMany` flips the row past `now` executes the check;
every other engine sees `nextCheckAt` already moved and skips it. The check
interval arithmetic lives in one place so cadence changes (including
backoff on failure) apply to all engines uniformly.

## Consequences

- **No leader election, no locks, no extra services.** Coordination is a
  conditional write on a row that already exists. Multi-region workers
  coordinate for free.
- **Engines are interchangeable and stateless.** Any subset can run: worker
  only, cron route only, both at once, or dev-mode in-process scheduling.
- **At-least-once with a practical exactly-once window.** If a worker crashes
  *after* claiming but *before* running the check, that interval is skipped —
  a lost check is less harmful than a duplicated one (it self-heals at the next
  tick, and the missed interval is honestly reflected in SLA data rather than
  double-counted).
- **Claim skew is bounded by clock agreement** between engine and database. We
  use the database clock (`nextCheckAt <= now` evaluated server-side) to avoid
  comparing app-server clocks to app-server clocks.
- **`nextCheckAt` is user-visible.** It doubles as the "next run" field shown in
  the dashboard — no separate scheduler metadata to keep in sync.
