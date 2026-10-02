# ADR-003: Response assertions run through a Rust → WASM validator

*Accepted — 2026-09*

## Context

Monitors support user-defined assertions against the HTTP response: status code
checks, header matching, JSON path extraction with comparisons, body contains /
regex, response-time thresholds, and TLS expiry checks. These run:

- on every check, in the worker (Cloudflare Workers, V8 isolates) and in web
  server contexts;
- against data returned by the probe fleet, at up to 30-second intervals per
  monitor;
- **on input the user typed** — a regex or JSON path written by an arbitrary
  org member.

Requirements pulled in opposite directions:

- **Safety**: a user-supplied regex (`(a+)+$`-style catastrophic backtracking)
  or deep JSON path must not be able to burn CPU on an isolate that shares a
  machine with everyone else's checks.
- **Speed**: assertion evaluation happens on every check; JSON-path evaluation
  in plain JS was a measurable chunk of check latency.
- **Portability**: the same assertion semantics must hold in the Cloudflare
  worker, the Next.js server, the CLI, and CI contexts.
- **Testability**: assertion logic is protocol-adjacent core logic; it should
  be one implementation, not a JS and a Rust one drifting apart.

## Decision

Assertions are defined, validated, and evaluated in a single **Rust crate
compiled to WebAssembly** (`packages/wasm-parser`). The JS surface is a thin
loader: serialize the assertion set and the response payload, call into WASM,
get back pass/fail plus extracted values. The crate has no I/O and no ambient
capabilities — it is a pure function of `(assertions, response)`.

WASM instantiation is capped, and evaluation is a single call per check, so
per-check overhead is one linear parse of the payload regardless of how many
assertions are attached.

## Consequences

- **Denial-of-service via user input is structurally contained.** Even a
  pathological regex executes inside the WASM sandbox with bounded stack; it
  cannot exhaust the host isolate.
- **One semantics everywhere.** A regex that passes in the dashboard's preview
  behaves identically in the worker and in `ss monitors test`.
- **Checks stay fast.** Rust + WASM parses and evaluates payloads well under
  the budget that plain-JS JSON-path evaluation consumed.
- **Toolchain cost**: contributors need a Rust toolchain to touch assertion
  internals, and the wasm artifact is a build input for the worker. CI builds
  it once and caches it; the cost is at build time, not at check time.
- **The boundary is strict**: anything needing I/O (e.g. TLS handshake details)
  is fetched by the host and passed in as data — the WASM module never performs
  network or filesystem access itself.
