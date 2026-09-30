# Changelog

All notable changes to SteadyStack are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release notes are generated automatically from [Conventional Commits](https://www.conventionalcommits.org/) via GitHub Actions on every tag push.

---

## [1.4.0] - 2026-09-30

### Added

- **Automated Documentation Pipeline:** Integrated DocSync AI to automatically generate and update API references, architecture overviews, and security documentation from codebase changes.

## [1.3.0] - 2026-08-19

### Added

- **Design System & Theme Modes:** Introduced 5 modern, refined dark & light colorways (`Obsidian Dark`, `Midnight Slate`, `Carbon Ember`, `Nordic Emerald`, `Clean Light`) with balanced HSL contrast and crisp typography.
- **Navigation Architecture:** Reorganized landing navigation into high-density `Product` and `Tools` mega-menus with rich descriptors, dedicated mobile drawer, and quick actions.

### Changed

- **UI Tokenization:** Converted all hardcoded emerald and neon styling across the dashboard sidebar, onboarding setup wizard, workspace switcher, and hero consensus telemetry visualizations into dynamic CSS `--primary` and theme-aware design tokens.

### Fixed

- **Turborepo Dev Pipeline:** Updated CLI dev watch script and filter rules to prevent daemon server exits during root `bun dev`.

---

## [1.1.2] - 2026-08-19

### Fixed

- **Auth / Workspaces:** Fixed race condition causing duplicate personal workspace creation on initial user onboarding with atomic Better-Auth signup hook, in-memory mutex synchronization, and self-healing duplicate cleanup.
- **Monitoring Engine:** Upgraded Regional Probes, Durable Objects, and Edge Check services to send authentic Chrome 133 Client Hints (`Sec-CH-UA`, `Sec-Fetch-Dest`, `Sec-Fetch-Mode`) preventing false-positive WAF blocks on Cloudflare and Vercel.
- **Secret Management:** Hardened AES-256-GCM encrypted header resolution across worker queues and manual verification triggers.
- **Database Connectivity:** Fixed SSL negotiation logic in Supabase Supavisor pooler client adapters.

### Added

- **Security Portal:** Added platform security documentation, encryption specifications, and vulnerability disclosure policy at `/security`.

---

[Unreleased]: https://github.com/getsteadystack/SteadyStack/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/getsteadystack/SteadyStack/releases/tag/v1.1.2

### Changed
- fix(worker): accurately handle proxy infrastructure failures in multi-vector mesh ([#225](https://github.com/pulls/225)) by @alexgutscher26 - API fix: fix(worker): accurately handle proxy infrastructure failures in multi-vector mesh
