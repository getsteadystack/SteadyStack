<div align="center">

# SteadyStack

**Open-source uptime monitoring with distributed probes, status pages, and incident management.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-bun-f9f1e1?logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org)

</div>

SteadyStack runs **19 monitor types** — HTTP endpoints, TCP ports, ICMP pings, heartbeat URLs, browser flows, DNS/SSL/domain watches, and more — from a Cloudflare Worker **plus distributed community probes** with quorum-based verdicts. It renders hosted status pages, routes alerts through 8 channel types, and tracks incidents with postmortems.

## Features

- **Monitors** — 19 check types: HTTP(S) with headers/bodies/redirects and response assertions, Ping/ICMP, Port, Heartbeat (dead-man's switch), SSL/DNS/domain-expiry watch, browser flows, GraphQL, WebSocket, gRPC, database, SMTP/FTP/Mail, MCP, BGP, SEQUENCE
- **Distributed probes** — community-run probes vote on results; [quorum logic](docs/adr/001-single-provider-quorum.md) decides UP/DOWN, so one bad network can't page you
- **Status pages** — hosted, custom domains, subscriber notifications (email/RSS), per-page language toggles
- **Incidents** — timeline, maintenance windows, postmortems
- **Alerting** — 8 channel types (email, Slack, Discord, Telegram, SMS, PagerDuty, Opsgenie, webhooks) routed by rules: status change, latency threshold, SSL expiry, domain expiry, DNS watchdog
- **Infrastructure as code** — [Terraform provider](packages/terraform-provider) (monitors, alert channels/rules, status pages as HCL) and a [GitHub Action](packages/github-action) for multi-region quorum checks on PR preview deployments
- **CLI** — manage monitors from the terminal ([`steadystack`](apps/cli)); import from Uptime Kuma
- **Mobile** — Expo push notifications ([`apps/native`](apps/native))
- **i18n** — 10 locales (en, es, fr, de, pt-BR, ja, ko, zh-CN, ar + RTL), locale-aware formatting in dashboard, emails, and CLI
- **Self-hostable** — [self-hosted guide](docs/self-hosted.md)

## Architecture

| App / Package | What it is |
| --- | --- |
| [`apps/web`](apps/web) | Next.js dashboard, marketing site, docs, public status pages |
| [`apps/worker`](apps/worker) | Cloudflare Worker: scheduled checks, notifications, crons |
| [`apps/probe`](apps/probe) | Distributed probe agent that reports results to the registry |
| [`apps/cli`](apps/cli) | Terminal client (`steadystack` command) |
| [`apps/native`](apps/native) | Expo / React Native mobile app |
| [`apps/e2e`](apps/e2e) | Playwright end-to-end tests |
| [`packages/api`](packages/api) | tRPC backend (typed API layer) |
| [`packages/core`](packages/core) | Protocol checkers, redirect-chain logic (shared by web, worker, probes) |
| [`packages/db`](packages/db) | Prisma schema, migrations, generated client |
| [`packages/auth`](packages/auth) | better-auth configuration |
| [`packages/email`](packages/email) | React Email templates (i18n-ready) |
| [`packages/shared`](packages/shared) | Shared constants & payload validation |
| [`packages/wasm-parser`](packages/wasm-parser) | Rust→WASM high-performance response-assertion validator |
| [`packages/terraform-provider`](packages/terraform-provider) | Official Terraform provider (Go) |
| [`packages/github-action`](packages/github-action) | Multi-region quorum check for PR previews |
| [`packages/types`](packages/types) | Shared TypeScript types |
| [`packages/env`](packages/env) | Environment variable schema |
| [`packages/config`](packages/config) | Shared lint/format/TS config |
| [`packages/infra`](packages/infra) | Alchemy IaC for Cloudflare deployment |

```
┌────────────┐   checks    ┌─────────────────┐
│  Web (Next)│────────────▶│  PostgreSQL     │
└────────────┘             │  (Prisma)       │
      │  ▲                 └────────┬────────┘
      │  │ monitors, events         │ read/write
      ▼  │                          ▼
┌──────────────┐    claims   ┌──────────────────┐     ┌────────┐
│  Worker      │◀───────────▶│  Probes (quorum) │────▶│ Alerts │
│  (CF cron)   │             └──────────────────┘     └────────┘
└──────────────┘
```

Check engines (worker cron, web's in-process scheduler, `/api/cron/check`) coordinate via atomic `nextCheck` claims — no double-checks, no leader election. Response assertions run through a Rust/WASM validator for heavy regex and JSON-path matching.

## Quick start

```bash
bun install            # runs postinstall → prisma generate
bun run db:push        # create/sync the database
bun run dev            # web, worker, and CLI in watch mode (native/probe/infra excluded)
```

- Web app (dashboard + API routes): http://localhost:3000
- Worker (wrangler dev + local cron ticker): http://localhost:8787
- Health: `GET /api/health` → `{ status, db, redis, scheduler }` (503 when degraded)

### Env

`bun run predev` syncs env via [`scripts/sync-env.js`](scripts/sync-env.js) from the [`@steadystack/env`](packages/env) schema. Required: `DATABASE_URL` (Postgres), `BETTER_AUTH_SECRET`. Optional: `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `UPSTASH_REDIS_REST_*` (rate limiting + health).

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | All dev servers (web, worker, CLI — infra & probes excluded) |
| `bun run dev:web` / `dev:worker` / `dev:native` | One app at a time |
| `bun run cron:local` | Local cron ticker for the worker |
| `bun run db:push` / `db:migrate` / `db:generate` | Prisma schema → database |
| `bun run db:studio` | Prisma Studio |
| `bun run seed` | Seed demo monitors |
| `bun run import:kuma` | Import from Uptime Kuma |
| `bun run test` | Bun tests across all packages |
| `bun run check` | oxlint + format |
| `bun run check-types` | TypeScript across the monorepo |
| `bun run check-names` / `check-deps` / `check-publint` / `check-size` | Hygiene checks |
| `bun run deploy` / `destroy` | Cloudflare deploy via Alchemy |

## Documentation

Full docs live at **[steadystack.dev/docs](https://steadystack.dev/docs)** (source: [`apps/web/src/content/docs`](apps/web/src/content/docs)) and are also served as [`/llms.txt`](apps/web/public/llms.txt) + `/llms-full.txt` for AI/answer engines.

- [Self-hosting](docs/self-hosted.md) · [Architecture](ARCHITECTURE.md) · [Probe quorum ADR](docs/adr/001-single-provider-quorum.md) · [Roadmap](ROADMAP.md)

## Contributing

Contributions welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) — translations go through [Crowdin](crowdin.yml), code PRs follow conventional commits (enforced by commitlint + husky).

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) — please don't open public issues.

## License

[Apache-2.0](LICENSE)
