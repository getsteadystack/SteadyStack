# SteadyStack — Comprehensive TODO & Roadmap

> Last updated: 2026-07-21
> Status legend: `[ ]` = not started · `[/]` = in progress · `[x]` = done · `[~]` = deprioritized

---

## 🏆 P0 — Critical / Blockers

- [x] Set up non-root `USER` directive enforcement in Docker probe image
- [x] Add DLQ (Dead Letter Queue) wrangler setup: `monitor-checks-dlq` and `notifications-dlq`
- [x] Fix Cloudflare Queues DLQ binding in `wrangler.jsonc` for the worker
- [x] Add database connection pooling (PgBouncer or Neon serverless driver) to prevent connection exhaustion under load
- [x] Implement proper rate limiting on all tRPC routes
- [x] Add `CSRF` protection to all state-mutating API routes in the web app
- [x] Validate that `better-auth` session tokens are properly invalidated on logout in the worker API
- [x] Ensure `CORS_ORIGIN` is validated strictly in the worker (no wildcard in production)
- [x] Add input size limits on all webhook/payload-accepting endpoints to prevent abuse
- [x] Implement alert de-duplication to prevent notification storms during extended outages
- [x] Add check to prevent monitors from running during active `MaintenanceWindow` periods

---

## 🚀 P1 — High Priority Features

### 👥 Team Management & RBAC (Official Roadmap Item)

- [x] Design `Team` / `Organization` model in Prisma schema
- [x] Add `Role` enum: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `BILLING`
- [x] Implement per-resource permission checks in tRPC routers (monitors, alerts, status pages)
- [x] Build team invitation flow (email invite → accept link → auto-join)
- [x] Create `/settings/team` UI page with member list, role editor, and invite form
- [x] Add team-scoped API keys with role-level permissions
- [x] Implement audit log for all team actions (member added/removed, role changed)
- [x] Support multiple workspaces per user (workspace switcher in nav)
- [x] Add team billing: aggregate usage across all members

### 📱 Mobile Push Notifications (Official Roadmap Item)

- [ ] Integrate Expo Push Notification service (`expo-notifications`)
- [ ] Store device push tokens in a new `PushToken` Prisma model
- [ ] Link push tokens to `User` with device metadata (platform, version)
- [ ] Create push notification send logic in the worker notification handler
- [ ] Add notification preference toggles in the mobile app settings screen
- [ ] Handle push token refresh and expiration gracefully
- [ ] Implement deep-link routing from push notification to specific monitor screen
- [ ] Add badge count for unresolved incidents on the app icon
- [ ] Test on both iOS (APNS) and Android (FCM) via Expo infrastructure

### 📄 SLA Report Exports (Official Roadmap Item)

- [x] Design SLA report data model (uptime%, incident count, MTTR, MTTD per monitor)
- [x] Build PDF export using `@react-pdf/renderer` or `jspdf`
- [x] Build JSON export endpoint (`/api/reports/sla?from=&to=&monitorId=`)
- [x] Add CSV export for raw `MonitorEvent` data
- [x] Create in-app SLA report viewer page under `/dashboard/reports`
- [x] Schedule automated monthly SLA report emails to workspace owner
- [x] Support custom date ranges, monitor filters, and grouping by status page

### 🔗 PagerDuty & Opsgenie Integrations (Official Roadmap Item)

- [ ] Add `PAGERDUTY` and `OPSGENIE` to `NotificationChannel` type enum
- [ ] Implement PagerDuty Events API v2 notification sender in `notification-handler.ts`
- [ ] Implement Opsgenie Alert API notification sender
- [ ] Build UI forms for PagerDuty/Opsgenie channel config (routing key, team, escalation policy)
- [ ] Add incident auto-resolve callback to close PagerDuty incidents when monitor recovers
- [ ] Test alert deduplication with PagerDuty's dedup key
- [ ] Add PagerDuty Webhooks → SteadyStack inbound integration (sync PD incident state back)

### 🌐 Terraform / OpenTofu Provider (Official Roadmap Item)

- [x] Design Terraform resource schema for `steadystack_monitor`, `steadystack_status_page`, `steadystack_alert_rule`
- [x] Scaffold Terraform provider using `hashicorp/terraform-plugin-framework` (Go)
- [x] Implement CRUD operations for each resource via the SteadyStack REST API
- [ ] Write acceptance tests for all resources
- [ ] Publish to Terraform Registry
- [x] Add `examples/` directory with common Terraform configurations
- [ ] Create documentation page at `steadystack.dev/docs/terraform`

---

## ⚙️ P2 — Core Platform Improvements

### 🔍 Monitoring Engine (Worker)

- [ ] Add `GRPC` monitor type for gRPC health check protocol
- [ ] Add `SMTP` monitor type (EHLO handshake + optional AUTH test)
- [ ] Add `FTP` / `SFTP` monitor type for file server availability
- [ ] Add `ICMP` (true ping) monitor type using Cloudflare's socket bindings
- [ ] Add `IMAP` / `POP3` monitor type for mail server checks
- [ ] Add `LDAP` monitor type for directory server availability
- [ ] Add `MQTT` monitor type for IoT broker connectivity
- [ ] Add `Redis` monitor type (PING command check)
- [ ] Add `Kafka` monitor type (consumer group lag + broker health)
- [ ] Add `RabbitMQ` monitor type (management API health endpoint)
- [ ] Add `Elasticsearch` monitor type (`_cluster/health` endpoint check)
- [ ] Add `MongoDB` monitor type (connection + `ping` command)
- [ ] Add `gRPC reflection` check to introspect available services
- [ ] Implement monitor dependency graph (Monitor A only alerts if Monitor B is also down)
- [ ] Add monitor grouping/tagging for bulk operations
- [ ] Add `composite` monitor type: alert if X of N monitors fail simultaneously
- [ ] Add `synthetic` keyword monitoring (check if specific text appears in response body)
- [ ] Implement response body size threshold alerting
- [ ] Add HTTP redirect chain inspector (follow all redirects, report each hop)
- [ ] Add support for client certificate (mTLS) in HTTP monitors
- [ ] Add HTTP/2 and HTTP/3 protocol enforcement option in HTTP monitor
- [ ] Implement custom request body/headers templates with variable substitution
- [ ] Add monitor clone/duplicate feature (one-click copy with new name)
- [ ] Add bulk enable/disable/delete for monitors via checkbox selection
- [ ] Implement monitor import from URL (parse existing monitoring configs)
- [ ] Add `checksum` assertion: verify response body hash hasn't changed
- [ ] Add timing breakdown metric: DNS, TLS handshake, TTFB, content transfer
- [ ] Implement multi-step authentication flow in SEQUENCE monitors (login → navigate → assert)
- [ ] Add screenshot capture on BROWSER/SEQUENCE monitor failure
- [ ] Store screenshots in Cloudflare R2, display in incident timeline
- [ ] Implement visual regression detection for BROWSER monitors (pixel diff baseline)
- [ ] Add lighthouse performance score check as a monitor assertion
- [ ] Implement check from specific source IP/region only (targeting)
- [ ] Add monitor "warm up" period: don't alert for first N minutes after creation
- [ ] Implement exponential backoff for retry intervals after confirmed downtime
- [ ] Add customizable status evaluation window (e.g., "alert after 2 of 3 consecutive failures")
- [ ] Implement BGP hijack detection alerting (separate from basic BGP check)
- [ ] Add `DKIM` / `SPF` / `DMARC` DNS record validation monitor type
- [ ] Add domain blacklist monitoring (check domain against known spam/malware lists)

### 📊 Latency & Analytics

- [ ] Add p99.9 percentile to `LatencyAggregate` model and aggregation logic
- [ ] Implement anomaly detection via ARIMA or STL decomposition (complement OpenAI)
- [ ] Add "Apdex score" calculation per monitor (satisfied/tolerating/frustrated)
- [ ] Add weekly/monthly latency trend comparison charts
- [ ] Implement latency budget alerts (alert when p95 exceeds user-defined threshold)
- [ ] Add time-series data export as CSV/JSON from the monitor detail page
- [ ] Implement `DailyMonitorSummary` computation in a scheduled downsampling job
- [ ] Add "worst performing monitors" widget to dashboard overview
- [ ] Add "fastest improving monitors" insight widget
- [ ] Implement geographic heat map for global latency visualization
- [ ] Add funnel analysis: checks → failures → incidents → resolved
- [ ] Build a "check history" calendar view (GitHub-style contribution graph for uptime)
- [ ] Implement SLO tracking: define target uptime%, track burn rate, alert when breaching error budget
- [ ] Add error budget widget to dashboard
- [ ] Create latency percentile flame graph for multi-region checks
- [ ] Add custom dashboard widgets (drag-and-drop layout)
- [ ] Implement widget types: uptime gauge, latency sparkline, incident count, SLO burn rate

### 🔔 Alerting & Incidents

- [ ] Add alert escalation policies (if not acknowledged in N minutes, escalate to next contact)
- [ ] Implement on-call scheduling (rotation groups, business hours, overrides)
- [ ] Add alert grouping: consolidate multiple monitor alerts into one notification
- [ ] Add "repeat alert" option: re-notify every N minutes while monitor remains down
- [ ] Add Microsoft Teams notification channel
- [ ] Add Google Chat notification channel
- [ ] Add VictorOps / Splunk On-Call notification channel
- [ ] Add Pushover notification channel for personal alerts
- [ ] Add WhatsApp Business API notification channel
- [ ] Add phone call alert via Twilio (voice call with incident summary)
- [ ] Add alert severity levels per rule (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
- [ ] Implement alert silencing/muting (temporary suppression with expiry)
- [ ] Add "acknowledge" action directly from Slack/Discord notification message
- [ ] Add "trigger test notification" button in channel configuration UI
- [ ] Add notification preview with rendered email/Slack/Discord templates before saving
- [ ] Implement incident auto-assignment to on-call team member
- [ ] Add incident SLA timer: track time-to-acknowledge and time-to-resolve
- [ ] Add incident severity auto-calculation based on affected monitor criticality
- [ ] Build post-mortem templates with structured fields (timeline, root cause, action items)
- [ ] Add post-mortem "publish" action to share externally via status page
- [ ] Implement incident follow-up reminders (auto-open follow-up tasks in Linear/Jira)
- [ ] Add `IncidentTemplate` model for pre-defined incident types (DB down, CDN issue, etc.)
- [ ] Implement flap detection with hysteresis (configurable stable-period before recovery alert)

### 📄 Status Pages

- [ ] Add custom domain SSL auto-provisioning via Cloudflare's ACME
- [ ] Add metric display widgets: response time graph, uptime percentage bar
- [ ] Add historical uptime table (last 90 days per monitor row)
- [ ] Implement status page embed widget (iframe + JavaScript embed code)
- [ ] Add RSS/Atom feed for status page incidents (`/status-page/[slug]/feed.xml`)
- [ ] Add JSON feed endpoint for status page state (`/status-page/[slug]/status.json`)
- [ ] Implement status page "Upcoming Maintenance" banner with countdown timer
- [ ] Add subscriber segmentation: notify only subscribers of affected monitors
- [ ] Add SMS subscriber support (via Twilio)
- [ ] Add Telegram subscriber support
- [ ] Build subscriber analytics: open rates, unsubscribe rates, active count
- [ ] Add double opt-in flow for email subscribers
- [ ] Implement status page A/B testing for layout variants
- [ ] Add status page theme presets (corporate, minimal, dark, branded)
- [ ] Allow custom font upload for status pages
- [ ] Add full-page screenshot export for status page (Puppeteer snapshot → R2)
- [ ] Implement status page "clone" from template
- [ ] Add per-monitor SLA display on status page (99.9% uptime badge)
- [ ] Add "component status" manual override UI with reason and ETA fields
- [ ] Support status page groups nested up to 2 levels deep
- [ ] Add status page view analytics dashboard (views, geolocation, referrer)
- [ ] Implement status page search engine indexing controls (noindex toggle per page)
- [ ] Add Open Graph image auto-generation based on current status (dynamic OG)

---

## 🧩 P3 — Developer Experience & Integrations

### 🖥️ CLI (`pulse`)

- [x] Add `pulse monitors create` — interactive wizard to create a monitor from CLI
- [x] Add `pulse monitors delete <id>` — delete a monitor from CLI
- [ ] Add `pulse monitors pause <id>` / `resume <id>` — toggle monitor active state
- [ ] Add `pulse incidents list` — list active incidents with severity and status
- [ ] Add `pulse incidents update <id>` — update incident status from terminal
- [ ] Add `pulse status-pages list` — list all status pages
- [ ] Add `pulse pages override <slug>` — apply manual status override from CLI
- [ ] Add `pulse reports sla --from --to` — generate SLA report from CLI
- [ ] Add `pulse alerts list` — list active alert rules
- [ ] Add `pulse alerts test <id>` — send test notification for an alert rule
- [ ] Add `pulse probe status` — view connected probes and their health
- [ ] Add `pulse config validate` — validate a YAML monitors config file without applying
- [ ] Add `pulse diff` — show diff between local YAML config and live state
- [ ] Add `pulse export` — export all monitors to YAML (inverse of `apply`)
- [ ] Implement `pulse watch` — live terminal dashboard (ncurses-style) with monitor status grid
- [ ] Add shell completion scripts (`pulse completion bash/zsh/fish/powershell`)
- [ ] Add `--output json` flag to all commands for programmatic use
- [ ] Add `--format table|yaml|json` flag to list commands
- [ ] Publish `pulse` CLI to npm, brew, and winget
- [ ] Add Docker image for the CLI (`ghcr.io/steadystack/cli`)
- [ ] Add GitHub Action: `steadystack/action-wait` wrapping `pulse wait`

### 🔌 Integrations & Webhooks

- [ ] Add Datadog webhook integration (forward events to Datadog Events API)
- [ ] Add New Relic integration (forward alerts to NR Alerts)
- [ ] Add Grafana integration (push metrics via Prometheus remote write)
- [ ] Add `Jira` integration: auto-create Jira ticket on incident creation
- [ ] Add `Linear` integration: auto-create Linear issue on incident creation
- [ ] Add `GitHub Issues` integration: auto-create GitHub issue on incident
- [ ] Add `Statuspage.io` import tool (migrate existing status pages)
- [ ] Add `Freshservice` / `Freshdesk` notification channel
- [ ] Add `Zapier` webhook trigger (verified Zap trigger event schema)
- [ ] Add `Make (Integromat)` module for SteadyStack
- [ ] Add OAuth 2.0 flow for third-party app integrations
- [ ] Build a public integration marketplace page listing all available channels
- [ ] Add `ServiceNow` incident integration
- [ ] Add `Splunk` log forwarding for all monitoring events
- [ ] Implement outbound webhook signing with HMAC-SHA256 (`X-SteadyStack-Signature` header)
- [ ] Add webhook retry logic with exponential backoff on delivery failure
- [ ] Add webhook delivery log UI (view past delivery attempts, status, response)
- [ ] Implement `EventBridge` / `SNS` forwarding for AWS-native customers

### 🛠️ Developer Tools (Free Tools Section)

- [ ] Add `JWT Decoder` tool: paste a JWT, decode header/payload, validate signature
- [ ] Add `Base64 Encoder/Decoder` tool
- [ ] Add `YAML ↔ JSON Converter` tool
- [ ] Add `URL Encoder/Decoder` tool
- [ ] Add `UUID Generator` tool (v4, v5, v7)
- [ ] Add `Color Contrast Checker` accessibility tool
- [ ] Add `Regex Tester` tool with real-time match highlighting
- [ ] Add `JSON Path Tester` tool (live JSONPath evaluation)
- [ ] Add `CORS Tester` tool (send preflight and actual request, show results)
- [ ] Add `Mock Server` tool: define endpoints and responses, get a temporary URL
- [ ] Add `Certificate Decoder` tool (paste PEM, decode certificate details)
- [ ] Add `Whois Lookup` tool
- [ ] Add `ASN Lookup` tool (show BGP info for an IP/ASN)
- [ ] Add `HTTP Archive (HAR) Analyzer` tool (upload HAR, visualize waterfall)
- [ ] Add `Traceroute` visualization tool (using WASM or Cloudflare traces)
- [ ] Add `DNS Propagation Checker` tool (check DNS from multiple locations simultaneously)
- [ ] Add `SMTP Tester` tool (send a test email to verify SMTP config)
- [ ] Add `CSP Builder` tool: interactive Content Security Policy generator
- [ ] Add `Security Headers Grader` tool (public URL, get A-F grade with explanations)
- [ ] Add `Carbon Footprint Estimator` for websites (page weight → CO2 estimate)

---

## 🗄️ P4 — Data Model & Backend

### Prisma Schema

- [x] Add `Team` model with `members: TeamMember[]`, `plan`, `billingEmail`
- [x] Add `TeamMember` model with `userId`, `teamId`, `role`, `invitedAt`, `acceptedAt`
- [x] Add `Invitation` model for pending team invites (token, expiresAt, role)
- [ ] Add `PushToken` model for mobile push notification tokens
- [ ] Add `OnCallSchedule` model (rotation config, member list, timezone)
- [ ] Add `EscalationPolicy` model linked to `AlertRule`
- [ ] Add `SlaReport` model (generated reports with date ranges, snapshot data)
- [ ] Add `IntegrationWebhookLog` model (delivery attempts, status, response)
- [ ] Add `MonitorDependency` model (monitor A depends on monitor B)
- [ ] Add `MonitorGroup` model (logical grouping with name, color, description)
- [ ] Add `MonitorTag` model with many-to-many relation to `Monitor`
- [ ] Add `Screenshot` model (URL in R2, monitorId, checkTimestamp)
- [ ] Add `VisualBaseline` model for BROWSER monitor visual regression
- [x] Add `AuditLog` model for all user/team actions (actor, action, resource, metadata)
- [ ] Add `BillingSubscription` model (Stripe subscription ID, plan, seat count)
- [ ] Add `UsageRecord` model for per-workspace check consumption
- [ ] Add `CustomField` model for user-defined metadata on monitors
- [ ] Add `MonitorNote` model (internal notes/comments per monitor)
- [ ] Add `Runbook` model (markdown documentation linked to monitors)
- [ ] Add `CheckResult` model for detailed per-check results (currently only events on status change)
- [ ] Add `ProbeGroup` model for organizing multiple probes by network/location
- [ ] Add cascade delete rules on all orphaned relations in Prisma schema
- [ ] Add composite unique indexes on frequently queried multi-column combos
- [ ] Add full-text search index on `Monitor.name`, `Monitor.url`, `Incident.title`
- [ ] Add `archivedAt` soft-delete column to `Monitor` and `Incident`
- [ ] Add `checkCount` materialized counter on `Monitor` to avoid expensive COUNT queries

### tRPC API (`packages/api`)

- [ ] Add `monitor.duplicate` procedure (clone a monitor)
- [ ] Add `monitor.bulkPause` / `monitor.bulkResume` procedures
- [ ] Add `monitor.bulkDelete` procedure
- [ ] Add `monitor.search` procedure with full-text search support
- [ ] Add `monitor.export` procedure returning YAML-serializable config
- [ ] Add `incident.assign` procedure (assign to team member)
- [ ] Add `incident.acknowledge` procedure with timestamp
- [ ] Add `incident.addNote` procedure (internal incident comments)
- [ ] Add `alertRule.test` procedure (trigger test notification)
- [x] Add `team.create` / `team.invite` / `team.removeMember` procedures
- [ ] Add `billing.getSubscription` / `billing.createCheckoutSession` procedures
- [x] Add `auditLog.list` procedure with filtering by actor, resource, action
- [ ] Add `runbook.create` / `runbook.update` / `runbook.list` procedures
- [ ] Add `sla.generateReport` procedure with date range params
- [ ] Add pagination to all `.list` procedures (cursor-based pagination)
- [ ] Add `workspace.getUsage` procedure for current billing period metrics
- [ ] Add input validation schemas using Zod for all new procedures
- [ ] Add rate limiting middleware per user/workspace for tRPC procedures
- [ ] Add `probe.list` / `probe.deregister` / `probe.reassign` procedures
- [ ] Add `monitor.getCheckHistory` for full raw check result history

---

## 🎨 P5 — UI / UX Improvements

### Dashboard

- [ ] Add "Overview" widgets: total monitors, up/down counts, active incidents, avg uptime %
- [ ] Implement drag-and-drop widget layout (React DnD or dnd-kit)
- [ ] Add "Quick Add Monitor" modal accessible from the dashboard header
- [ ] Add global search across monitors, incidents, alerts, and status pages (enhance command palette)
- [ ] Add keyboard shortcut reference sheet (modal via `?` key)
- [ ] Add tour/onboarding flow for new users (step-by-step with coach marks)
- [ ] Implement "Recent Activity" feed on dashboard (latest events across all monitors)
- [ ] Add "Favorites" / pinned monitors list
- [ ] Add bulk action toolbar when monitors are selected (checkbox mode)
- [ ] Add monitor list view toggle: card view ↔ table view ↔ compact list
- [ ] Add column visibility toggle for monitor table view
- [ ] Add monitor sort options: by status, name, uptime%, response time, last checked
- [ ] Add monitor filter sidebar: by type, region, status, tags
- [ ] Implement infinite scroll or virtualized list for workspaces with 100+ monitors
- [ ] Add "empty state" illustrations for monitors, incidents, and alerts pages
- [ ] Add celebratory animation when first monitor is created
- [ ] Implement dark/light/system theme persistence per user (save to DB, not just localStorage)
- [ ] Add high-contrast accessibility theme option
- [ ] Add keyboard navigation for all interactive elements (focus rings, skip links)
- [ ] Implement skeleton loading states for all data-fetching components
- [ ] Add error boundary components with "try again" actions on every major section
- [ ] Add "Copied!" toast feedback on all copy-to-clipboard actions
- [ ] Add preview panel for monitors (click → side panel, no full page navigation)
- [ ] Implement breadcrumbs on all nested pages

### Monitor Detail Page

- [ ] Add tabbed layout: Overview, Events, Incidents, Alerts, Settings
- [ ] Show timing breakdown chart (DNS / TLS / TTFB / Transfer per check)
- [ ] Add response body preview (last check response, truncated with expand)
- [ ] Add response headers inspector (collapsible key-value table)
- [ ] Add "Check Now" button with real-time progress indicator
- [ ] Add multi-region latency comparison chart (one line per region)
- [ ] Add "Uptime by region" breakdown table
- [ ] Add "Share monitor" public URL feature (read-only public view)
- [ ] Add monitor health score indicator (calculated from recent events + latency trends)
- [ ] Add "Runbook" tab to display linked runbook documentation
- [ ] Add event filter controls on the events timeline (by status, region, date range)
- [ ] Add "Export Events" CSV button on the events tab

### Incidents

- [ ] Add Kanban view for incidents (Investigating / Identified / Monitoring / Resolved columns)
- [ ] Add incident priority/severity badge with color coding
- [ ] Add `@mention` support in incident comments (notify team members)
- [ ] Add rich text editor for post-mortems (markdown + image paste support)
- [ ] Add incident timeline with automatic event stitching from monitor events
- [ ] Add "related incidents" section (incidents affecting same monitors)
- [ ] Add incident duration counter (real-time since incident opened)
- [ ] Add one-click "Resolved" button from incident list
- [ ] Add incident export to PDF

### Settings

- [ ] Add `/settings/billing` page with current plan, usage meters, upgrade CTA
- [x] Add `/settings/team` page (P1 item — UI side)
- [x] Add `/settings/audit-log` page with searchable/filterable audit trail
- [ ] Add `/settings/api-keys` page with create, revoke, and last-used display
- [ ] Add `/settings/integrations` hub page listing all configured integrations
- [ ] Add `/settings/notifications` personal notification preferences
- [ ] Add two-factor authentication (TOTP) setup flow in security settings
- [ ] Add "Delete Account" danger zone with confirmation flow and data export
- [ ] Add "Export My Data" GDPR-compliant download (all monitors, events, incidents as ZIP)
- [ ] Add profile avatar upload (via UploadThing)
- [ ] Add timezone setting (convert all dashboard times to user's timezone)
- [ ] Add date format preference (ISO, US, EU)

### Onboarding & Marketing

- [x] Build interactive onboarding checklist (create monitor → set alert → share status page)
- [x] Add product demo mode with pre-seeded data (no signup required to explore)
- [x] Improve landing page hero with animated monitor status visualization
- [x] Add feature comparison table: SteadyStack vs UptimeRobot vs Checkly vs Better Uptime
- [ ] Add "Testimonials" section with customer quotes and logos
- [ ] Add pricing page with feature matrix and FAQ
- [x] Add use-case pages: DevOps, E-commerce, SaaS, API Monitoring
- [ ] Add integration directory page listing all supported notification channels
- [ ] Build changelog page (public release notes with dates and categories)
- [ ] Add cookie consent banner (GDPR compliance)
- [x] Add blog infrastructure (MDX-based, with SEO-optimized posts)
- [x] Write 10 SEO-targeted blog posts (uptime monitoring, SLA calculations, etc.)

---

## 📱 P6 — Mobile App (Native)

- [ ] Implement full monitor list screen with status indicators
- [ ] Add monitor detail screen with uptime chart and event feed
- [ ] Add incident list screen with status tabs
- [ ] Add incident detail screen with comment thread
- [ ] Add create/edit monitor form screen
- [ ] Add alert rules list and configuration screen
- [ ] Add status page management screen
- [ ] Implement biometric authentication (Face ID / Fingerprint unlock)
- [ ] Add widget support (iOS Lock Screen widget, Android App Widget) for top monitor statuses
- [ ] Add Apple Watch complication showing up/down count
- [ ] Implement pull-to-refresh on all list screens
- [ ] Add haptic feedback on status change events
- [ ] Add offline mode: cache last known status for all monitors
- [ ] Add dark mode support (system-aware)
- [ ] Add share sheet integration (share monitor status / incident details)
- [ ] Implement Siri Shortcuts for "Check monitor status" voice command
- [ ] Add Android Tasker integration for automation
- [ ] Publish to Apple App Store and Google Play Store
- [ ] Set up EAS Build and OTA updates via Expo Updates
- [ ] Add crash reporting (Sentry React Native)

---

## 🔒 P7 — Security & Compliance

- [ ] Implement MFA / TOTP for user accounts in `better-auth`
- [ ] Add passkey (WebAuthn) support as a passwordless option
- [ ] Add SSO integration: SAML 2.0 (for enterprise customers)
- [ ] Add OIDC provider support (Google Workspace, Okta, Azure AD)
- [ ] Implement session device management (view/revoke active sessions by device)
- [ ] Add account lockout after N failed login attempts with unlock via email
- [ ] Add IP allowlist for workspace access (enterprise feature)
- [ ] Implement field-level encryption for sensitive monitor config (credentials, auth tokens)
- [ ] Add automated GDPR data deletion workflow (user delete → cascade wipe + audit)
- [ ] Implement data residency options (EU-only Postgres for EU customers)
- [ ] Add SOC 2 Type II compliance controls tracking
- [ ] Add audit log export (SIEM integration via webhook or S3)
- [ ] Implement Content Security Policy headers on all web pages
- [ ] Add Subresource Integrity (SRI) hashes for all CDN-loaded scripts
- [ ] Run OWASP ZAP automated scan in CI pipeline
- [ ] Implement secrets rotation reminders (alert when API keys approach expiry)
- [ ] Add PGP key management UI for encrypted notification delivery
- [ ] Conduct third-party penetration test and publish summary report

---

## ⚡ P8 — Performance & Infrastructure

### Cloudflare / Worker

- [ ] Implement worker sharding (`SHARD_ID` / `TOTAL_SHARDS`) configuration automation
- [ ] Add Cloudflare R2 bucket for storing screenshots, reports, and log archives
- [ ] Set up Cloudflare D1 as an edge-local SQLite fallback for probe assignments
- [ ] Add Cloudflare Analytics Engine bindings for custom metrics
- [ ] Implement Cloudflare KV caching for status page data (reduce DB reads)
- [ ] Add Cloudflare Workers AI for on-device anomaly scoring (complement OpenAI)
- [ ] Set up Cloudflare Zaraz for privacy-first analytics
- [ ] Add Cloudflare Waiting Room integration for status page traffic surges
- [ ] Optimize `index.ts` worker (currently 87KB) — split into multiple route handler files
- [ ] Profile and optimize cron handler cold start time

### Database

- [ ] Add read replicas (Neon read replicas or Supabase) for analytics queries
- [ ] Implement DB query result caching with Upstash Redis for dashboard endpoints
- [ ] Add database index audit: review all slow queries in `pg_stat_statements`
- [ ] Partition `MonitorEvent` table by month for improved query performance at scale
- [ ] Archive events older than 12 months to cold storage (R2 Parquet files)
- [ ] Add a `cleanup` cron job to delete expired sessions, old events, and orphaned records
- [ ] Implement DB connection health check endpoint for liveness probes
- [ ] Add Prisma query logging in development with slow query detection

### Web Performance

- [x] Run Lighthouse CI in GitHub Actions and enforce performance budget (LCP < 2.5s)
- [x] Optimize largest contentful paint on the landing page
- [x] Add `next/image` optimization for all images (lazy loading, WebP/AVIF)
- [ ] Implement route-based code splitting for all dashboard routes
- [x] Add `<Suspense>` boundaries around all data-fetching components
- [x] Audit and remove unused dependencies from `apps/web/package.json`
- [x] Enable Turbopack for faster local dev builds
- [x] Add `prefetch` links for likely next navigations (monitors list → detail)
- [ ] Profile React render cycles with React DevTools and fix unnecessary re-renders
- [ ] Add service worker for offline fallback on the dashboard

### CI/CD

- [ ] Add Playwright E2E tests in `.github/workflows` on every PR
- [ ] Add visual regression testing with Percy or Chromatic
- [x] Set up preview deployments for every PR via Cloudflare Pages preview (implemented as Cloudflare Workers preview per PR, see `.github/workflows/preview.yml`)
- [x] Add automated `bun audit` check in CI for dependency vulnerabilities
- [x] Add Trivy container scan for the Docker probe image in CI
- [x] Implement semantic release and auto-changelog generation
- [ ] Add deploy lock mechanism to prevent concurrent production deployments
- [ ] Set up staging environment with production-mirror config
- [ ] Add smoke tests post-deployment (verify critical endpoints respond)
- [ ] Add rollback automation trigger on smoke test failure

---

## 🧪 P9 — Testing

### Unit / Integration Tests

- [ ] Write unit tests for all worker service files (`services/*.ts`)
- [ ] Write unit tests for `notification-handler.ts` for all channel types
- [ ] Write unit tests for all tRPC router procedures (mock Prisma client)
- [ ] Write unit tests for `mesh.ts` proxy fallback logic
- [ ] Write unit tests for `downsampling-cron.ts` aggregation logic
- [ ] Write unit tests for WASM payload parser (`wasm-parser` package)
- [ ] Write unit tests for all `packages/core` check primitives
- [ ] Add test coverage reporting (c8 or Istanbul) with minimum 70% threshold
- [ ] Write integration tests for probe registration → poll → result flow
- [ ] Write integration tests for incident creation → notification dispatch flow

### E2E Tests (Playwright — `apps/e2e`)

- [ ] Add E2E test: user signup → email verify → login
- [ ] Add E2E test: create HTTP monitor → verify it appears in list
- [ ] Add E2E test: trigger check → verify event recorded
- [ ] Add E2E test: create alert rule → send test notification
- [ ] Add E2E test: create status page → verify public URL renders
- [ ] Add E2E test: subscribe to status page → verify email confirmation
- [ ] Add E2E test: maintenance window → verify monitor paused during window
- [ ] Add E2E test: create incident → update status → resolve
- [ ] Add E2E test: CLI login → monitor apply → monitor list
- [ ] Add E2E test: probe registration → heartbeat → assignment polling
- [ ] Set up E2E test database seeding with realistic data fixtures
- [ ] Configure parallel E2E test execution in CI for faster feedback

---

## 📚 P10 — Documentation

- [ ] Write full API reference documentation (OpenAPI spec + Redoc/Scalar UI)
- [ ] Generate OpenAPI spec from tRPC router definitions automatically
- [ ] Write "Getting Started" guide with copy-paste commands
- [ ] Write monitor type reference (one page per type with all config options)
- [ ] Write alert channels setup guide (step-by-step for each channel)
- [ ] Write status page customization guide
- [ ] Write CLI reference documentation (`pulse --help` output as docs)
- [ ] Write probe deployment guide (Docker Compose + Kubernetes Helm chart)
- [ ] Write Monitoring as Code guide (YAML schema reference)
- [ ] Write RBAC and team management guide
- [ ] Write SLA calculation methodology explanation
- [ ] Write architecture decision records (ADRs) for key design choices
- [ ] Add inline code examples to all API documentation
- [x] Build interactive API explorer (Scalar or Swagger UI at `/docs/api`)
- [x] Write self-hosting guide (Docker Compose full stack)
- [x] Add Helm chart for Kubernetes self-hosted deployment
- [ ] Create video tutorials: "Set up your first monitor", "Configure alerts", "Status page setup"
- [x] Write contributing guide with code style, testing requirements, and PR process

---

## 🌍 P11 — Internationalization (i18n)

- [ ] Complete missing translation keys in all 4 locales (en, es, fr, de)
- [ ] Add Portuguese (pt-BR) locale
- [ ] Add Japanese (ja) locale
- [ ] Add Korean (ko) locale
- [ ] Add Chinese Simplified (zh-CN) locale
- [ ] Add Arabic (ar) locale with RTL layout support
- [ ] Translate all email notification templates to all supported locales
- [ ] Translate CLI output messages (auto-detect locale or `--locale` flag)
- [ ] Add locale-aware date/time formatting throughout the dashboard
- [ ] Add locale-aware number formatting (uptime%, latency ms)
- [ ] Implement per-user locale preference (override browser detection)
- [ ] Add locale switcher to the landing page footer
- [ ] Set up Crowdin or Weblate for community translation contributions

---

## 🔧 P12 — Technical Debt & Code Quality

- [x] Refactor `apps/worker/src/index.ts` (currently 87KB monolith) into separate route handlers
- [x] Extract notification channel implementations into separate files under `services/notifications/`
- [x] Standardize error handling across all worker services (use a common `AppError` class)
- [x] Add JSDoc comments to all exported functions in `packages/core`
- [x] Replace magic strings with typed enums/constants across the codebase
- [x] Consolidate all environment variable access through `packages/env` (no raw `process.env` access)
- [x] Add stricter oxlint rules (unicorn, sonarjs equivalents)
- [x] Enable stricter TypeScript: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] Remove all `any` type assertions and replace with proper types
- [x] Audit and update all outdated dependencies (especially Expo SDK bump)
- [x] Remove unused packages from all `package.json` files
- [x] Add `publint` checks to all shared packages
- [x] Set up `changesets` for package versioning in the monorepo
- [x] Add Turborepo remote caching (Vercel Remote Cache or self-hosted)
- [x] Standardize file naming conventions (kebab-case for files, PascalCase for components)
- [ ] Add `vitest` for unit tests
- [x] Add Storybook for component library documentation
- [x] Implement conventional commits enforcement via `commitlint`
- [x] Add `size-limit` check to prevent bundle size regressions
- [x] Add `depcheck` to CI to catch unused dependencies automatically
- [x] Clean up `node_modules` hoisting issues in the Turborepo workspace

---

## 💰 P13 — Monetization & Billing

- [x] Integrate Stripe Billing (subscription, usage-based metering, invoices)
- [x] Build `/settings/billing` page with plan display and Stripe Customer Portal link
- [x] Define pricing tiers: Initiate (Free), Netrunner ($19/mo), Construct ($79/mo)
- [x] Establish Team & Business Necessity Paywall: Core monitoring & false-positive consensus free; custom domain, multi-seat, on-call, private probes paid
- [x] Implement Early Cohort Grandfathering Guarantee (`tierVersion` & `grandfatheredAt` schema locking)
- [x] Implement feature flags based on workspace plan (enforced server-side)
- [x] Add usage metering: track checks per month, monitors created, notifications sent
- [x] Add usage alert: warn workspace owner when approaching plan limits
- [x] Implement hard limits: block new monitors when over plan limit
- [x] Add Stripe webhook handler for subscription lifecycle events (created, updated, cancelled)
- [x] Implement trial period (14-day Pro trial on signup)
- [x] Add coupon/promo code support in checkout flow
- [x] Build affiliate/referral program with unique referral links
- [x] Add annual billing option with discount (e.g., 20% off)
- [x] Add tax handling (Stripe Tax) for VAT/GST compliance
- [x] Add dunning emails for failed payments (Stripe built-in + custom reminder)

---

## 🤖 P14 — AI & Intelligence

- [ ] Expand `MonitorInsight` model to store richer AI analysis results
- [ ] Implement AI-powered root cause suggestions for recurring downtime patterns
- [ ] Add AI-generated incident summaries (auto-fill incident description from event history)
- [ ] Add AI-assisted post-mortem generation (draft root cause from events + AI)
- [ ] Implement predictive uptime: forecast likelihood of downtime based on trends
- [ ] Add "Ask AI about this monitor" chat interface in the monitor detail panel
- [ ] Implement natural language monitor creation ("Monitor my API at api.example.com every 5 minutes and alert on Slack")
- [ ] Add AI-powered anomaly scoring (complement rule-based detection)
- [ ] Implement smart alert grouping: AI clusters related alerts during incidents
- [ ] Add LLM-generated changelog summaries for status page incidents
- [ ] Build improved "Roast My Stack" tool: more specific AI advice per technology
- [ ] Add AI-powered cron expression helper (natural language → cron string)
- [ ] Implement AI response analysis: "Is this API response semantically correct?"
- [ ] Add vector embeddings for semantic search across incidents and post-mortems

---

## 🌐 P15 — Open Source & Community

- [x] Set up GitHub Discussions for feature requests and community help
- [x] Create `CONTRIBUTING.md` with clear guidelines (code, docs, translations)
- [x] Add `CODE_OF_CONDUCT.md`
- [x] Set up issue templates: Bug Report, Feature Request, Documentation, Question
- [x] Add PR template with checklist (tests, docs, types, lint)
- [x] Create `examples/` directory with common Monitoring as Code YAML examples
- [x] Add `docker-compose.yml` for full local development stack
- [x] Build self-hosted installation guide (single-server Docker Compose)
- [x] Create Helm chart for Kubernetes self-hosted deployment
- [x] Add `CHANGELOG.md` and set up automated release notes via GitHub Actions
- [ ] Create public roadmap (GitHub Project or Linear public board)
- [x] Set up Hall of Fame / Showcase automatic submission from the UI
- [x] Add "Powered by SteadyStack" badge for open-source status page users
- [ ] Build official Discord community server
- [ ] Holiday mode Suspend all alerts & notifications until a specific date.

---

> **Total items**: ~350+
> **Sections**: 15 priority groups (P0–P15)
> **Source**: Derived from ARCHITECTURE.md, README.md, SECURITY.md, codebase analysis, and official roadmap items.
