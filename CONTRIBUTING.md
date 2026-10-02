# Contributing to SteadyStack

First off — thank you for taking the time to contribute! 🎉

This document covers everything you need to know to contribute code, documentation, translations, or bug reports to SteadyStack.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Guidelines](#code-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Translation Guidelines](#translation-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Issue Triage](#issue-triage)
- [Community](#community)

---

## Code of Conduct

By participating in this project you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Ways to Contribute

| Contribution        | Where                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| 🐛 Bug reports      | [Bug Report template](https://github.com/getsteadystack/SteadyStack/issues/new?template=bug_report.yml)  |
| ✨ Feature requests | [GitHub Discussions → Ideas](https://github.com/getsteadystack/SteadyStack/discussions/categories/ideas) |
| 📖 Documentation    | Open a PR against `master` — see [Documentation Guidelines](#documentation-guidelines)                   |
| 🌐 Translations     | See [Translation Guidelines](#translation-guidelines)                                                    |
| 💬 Community help   | [GitHub Discussions → Q&A](https://github.com/getsteadystack/SteadyStack/discussions/categories/q-a)     |
| 🔒 Security issues  | See [SECURITY.md](./SECURITY.md) — **do not** open a public issue                                        |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+
- [Node.js](https://nodejs.org/) 20+
- [Git](https://git-scm.com/)
- PostgreSQL instance (local Docker, [Neon](https://neon.tech/), or [Supabase](https://supabase.com/))
- [Rust + wasm-pack](https://rustwasm.github.io/wasm-pack/) — only if touching `packages/wasm-parser`

### Fork & Clone

```bash
# 1. Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/steadystack.git
cd steadystack

# 2. Add upstream remote
git remote add upstream https://github.com/getsteadystack/SteadyStack.git
```

### Environment Setup

```bash
bun install
cp .env.example .env
# Fill in the required variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
bun run db:push
bun run dev
```

- Dashboard: `http://localhost:3000`
- Worker (Miniflare): `bun run dev:worker`
- Prisma Studio: `bun run db:studio`

---

## Development Workflow

### Branch Naming

| Type          | Pattern                     | Example                      |
| ------------- | --------------------------- | ---------------------------- |
| Feature       | `feat/<short-description>`  | `feat/slack-alert-threading` |
| Bug fix       | `fix/<short-description>`   | `fix/ssl-expiry-overflow`    |
| Documentation | `docs/<short-description>`  | `docs/probe-setup-guide`     |
| Translation   | `i18n/<locale>`             | `i18n/pt-br`                 |
| Chore         | `chore/<short-description>` | `chore/upgrade-prisma-6`     |

Always branch from `master`:

```bash
git checkout master
git pull upstream master
git checkout -b feat/your-feature
```

### Keeping Your Fork in Sync

```bash
git fetch upstream
git rebase upstream/master
```

### Running Checks

All of the following must pass before opening a PR. These are exactly the gates CI runs on every push and pull request (see `.github/workflows/ci.yml`):

```bash
bun run check          # oxlint + oxfmt (formatting is auto-applied with --write)
bun run check-types    # TypeScript across all workspaces
bun run build          # production build for all apps
bun run check-names    # kebab-case source file naming (scripts/check-filenames.js)
bun run check-size     # bundle size limits (apps/web)
bun run check-deps     # depcheck: catches unused/missing dependencies
bun run build-storybook  # verifies Storybook compiles
```

Lint and type-check individually while iterating:

```bash
bunx oxlint <path>     # lint a single file/folder
bun --cwd apps/web run check-types   # type-check only the web app
```

---

## Code Guidelines

SteadyStack is a TypeScript-first monorepo. Follow these rules regardless of the package you're working in.

### General

- Write **self-documenting code** — prefer meaningful names over comments.
- Keep functions small and focused on a single responsibility.
- Prefer `const` over `let`; avoid `var`.
- No `any`. Use `unknown` and narrow types explicitly.
- Exports should be named, not default (except React components).

### TypeScript

- All public function signatures must have explicit return types.
- Use Zod for any runtime validation at API boundaries.
- Type-share between packages through `packages/types` — do not duplicate.

### React / Next.js

- Server Components by default; add `"use client"` only when necessary.
- Use TanStack Query for all data fetching in client components.
- UI primitives come from `shadcn/ui` — do not add competing component libraries.
- Tailwind v4 only — no inline `style` attributes unless absolutely required.
- All interactive elements need accessible labels (`aria-label`, `aria-describedby`).

### Cloudflare Worker

- Respect the Workers runtime constraints — no Node.js APIs.
- Keep the cold-start bundle lean. Prefer native `fetch` / `Web Crypto`.
- Durable Object mutations must be wrapped in transactional `storage.transaction()`.

### Database / Prisma

- All schema changes require a migration: `bun run db:migrate`.
- Do not ship a migration that drops columns without a deprecation period.
- Queries touching large tables should include an index hint or comment explaining the access pattern.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: BREAKING CHANGE or closes #<issue>]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Scopes** (workspace packages): `web`, `worker`, `cli`, `native`, `probe`, `e2e`, `api`, `auth`, `db`, `email`, `env`, `types`, `shared`, `config`, `infra`, `wasm-parser`

Examples:

```
feat(worker): add BGP monitor type
fix(web): resolve hydration mismatch on status page
docs(cli): update pulse wait examples
```

---

## Testing Requirements

Tests are required for new behavior. Bug fixes should include a regression test when a reasonable one exists. The test stack:

| Layer              | Tool                             | Location                                                          | Run with                        |
| ------------------ | -------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| Unit / integration | Vitest (Storybook browser tests) | `apps/web` (vitest configured; `*.stories.tsx` + component tests) | `bun --cwd apps/web vitest run` |
| E2E                | Playwright                       | `apps/e2e/tests/`                                                 | `bun --cwd apps/e2e test`       |

### Rules

- Test **behavior, not implementation** — assert on observable output and side effects.
- E2E tests must be **hermetic**: no network calls to real services, seed the database instead.
- Never assert on exact timestamps, latency, or other timing-dependent values in tests.
- New worker services and tRPC routers should ship with unit tests; see the P9 backlog in `todo.md` for the target coverage map.
- If you add a new monitor type or notification channel, cover the success and failure paths.

### E2E

```bash
bun --cwd apps/e2e test          # headless run
bun --cwd apps/e2e test --ui     # interactive UI
bun --cwd apps/e2e test --debug  # step-through debugging
```

E2E tests need the web app and database running locally — see [Getting Started](#getting-started).

### Storybook Component Tests

`apps/web` uses Vitest with `@storybook/addon-vitest` for component-level browser tests. To run:

```bash
bun --cwd apps/web vitest run
```

Interactive mode: `bunx vitest` from `apps/web`. Component tests live alongside stories as `.stories.tsx` files with `play` functions.

---

## Documentation Guidelines

Good docs are as valuable as good code. SteadyStack documentation lives in:

| Location               | Purpose                          |
| ---------------------- | -------------------------------- |
| `README.md`            | High-level overview, quick-start |
| `ARCHITECTURE.md`      | System design decisions          |
| `apps/*/README.md`     | App-specific setup               |
| `packages/*/README.md` | Package API reference            |
| Code comments          | Non-obvious logic only           |

### Writing Standards

- Use plain, direct language. Assume the reader is a competent developer, not a newcomer.
- Every code example must be tested and runnable.
- Use second person ("you") not first person plural ("we").
- Spell out acronyms on first use: "Durable Objects (DO)".
- Keep sentences short. Break long paragraphs after 3–4 sentences.

### Adding a New Package README

Copy the structure from an existing one (e.g., `packages/db/README.md`) and fill in:

1. **What it does** — one sentence
2. **Installation / usage** — with a working code example
3. **Configuration** — environment variables or options
4. **API reference** — exported types and functions

---

## Translation Guidelines

SteadyStack supports **9 locales** (`en`, `es`, `fr`, `de`, `pt-BR`, `ja`, `ko`, `zh-CN`, `ar`) across three surfaces:

| Surface                   | Source file                              | Notes                                    |
| ------------------------- | ---------------------------------------- | ---------------------------------------- |
| Status-page UI            | `apps/web/messages/en.json`              | Nested JSON, 41 keys                     |
| Email templates           | `packages/email/src/i18n.ts`             | Flat key catalog, `{placeholder}` style  |
| CLI output                | `apps/cli/src/i18n.ts`                   | Flat key catalog, `{placeholder}` style  |

### Preferred: Crowdin

Community translations are managed on **Crowdin** — the recommended path for translators, no git knowledge required:

1. Join the SteadyStack project on Crowdin (linked from the README).
2. Pick your language and translate strings in context; Crowdin protects `{placeholders}` automatically.
3. Approved translations are synced into the repo by maintainers via `bunx crowdin download` (config: `crowdin.yml`).

Machine-translation suggestions (TM + MT) are enabled as helpers, but human review is required before strings are approved.

### Manual: via Pull Request

If you prefer working in git directly:

#### Adding a New Locale

1. Add the locale to `apps/web/src/i18n/locales.ts` (code, labels, direction — `rtl` for Arabic/Hebrew/etc.).
2. Copy `apps/web/messages/en.json` → `apps/web/messages/<locale>.json` and translate all values — **do not translate keys**.
3. Add matching catalogs to `packages/email/src/i18n.ts` and `apps/cli/src/i18n.ts` (fall back to English for keys you haven't translated yet — partial catalogs are fine).
4. Do not use machine translation without human review.
5. Open a PR with title: `i18n: add <Language> (<locale>) translations`

#### Updating an Existing Locale

1. Compare `apps/web/messages/<locale>.json` against `apps/web/messages/en.json` and fill in any keys that are missing.
2. Mirror the same additions in the email and CLI catalogs.
3. Open a PR with the updated files.

#### RTL Locales (ar, he, fa, ur)

Arabic renders right-to-left via `<html dir="rtl">`. When adding RTL strings, avoid physical CSS in templates (`margin-left`) — use logical properties (`margin-inline-start`) so layout mirrors correctly.

### Translation Principles

- Prefer natural phrasing over literal word-for-word translation.
- Preserve placeholders exactly: `{monitorName}`, `{count}`, etc.
- Respect plural rules for your locale.
- Status words like `UP`/`DOWN`/`DEGRADED` are technical tokens in some contexts — translate the label, not status enum values.
- If a concept doesn't exist in the target language, leave an explanatory note in the PR.

---

## Submitting a Pull Request

### Checklist

Before opening a PR, confirm:

- [ ] Branch is based on the latest `main`
- [ ] `bun run check` passes (no lint/format errors)
- [ ] `bun run check-types` passes
- [ ] `bun run build` passes
- [ ] `bun run check-names`, `bun run check-deps`, and `bun run check-size` pass
- [ ] All commit messages follow Conventional Commits (validated by CI)
- [ ] New features have unit or integration tests where applicable (see [Testing Requirements](#testing-requirements))
- [ ] Documentation is updated (README, JSDoc, etc.)
- [ ] No secrets, credentials, or `.env` values are committed

### Release Notes

SteadyStack uses [changesets](https://github.com/changesets/changesets). If your PR changes published packages (`packages/*`), add a changeset:

```bash
bun run changeset
```

Describe the change as a `patch` (bug fix) or `minor` (new feature). Breaking changes require `major`. Changesets are consumed by the automated release workflow — PRs without them will not trigger a release.

### PR Description

Use the PR template. At minimum include:

- **What** — describe the change
- **Why** — motivation or linked issue
- **How** — any notable implementation choices
- **Screenshots** — for UI changes

### Review Process

1. A maintainer will review within **5 business days**.
2. Address all requested changes in follow-up commits (no force-push until approved).
3. Once approved, a maintainer will squash-merge into `main`.
4. Your name will be added to the release notes automatically.

### Stale PRs

PRs with no activity for **30 days** will be marked stale and closed after 7 additional days. Leave a comment to keep it open.

---

## Issue Triage

If you want to help with issue triage:

- Add `needs-repro` to issues without reproduction steps.
- Add `good first issue` to well-scoped bugs with clear acceptance criteria.
- Close duplicates with a link to the original.
- Move feature discussions to [GitHub Discussions](https://github.com/getsteadystack/SteadyStack/discussions).

---

## Community

- **GitHub Discussions** — for questions, ideas, and show-and-tell: [github.com/getsteadystack/SteadyStack/discussions](https://github.com/getsteadystack/SteadyStack/discussions)
- **Security issues** — see [SECURITY.md](./SECURITY.md)

We're happy to have you here. Thank you for making SteadyStack better. 🚀
