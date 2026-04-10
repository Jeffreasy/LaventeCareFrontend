# 01. Architecture & Security Model

## The "Anti-Gravity" Security Philosophy
LaventeCare Auth Systems is built on the premise that internal trust is a liability. The fundamental laws are:

1. **Input is Toxic**: No byte is trusted. Strict type-checking, bounds validation, and JSON decoding (disallowing unknown fields) intercept payloads at the perimeter.
2. **Silence is Golden**: The system never leaks internal errors, DB constraints, or stack traces. Generic HTTP status codes are returned to clients; details go to Sentry and internal logs.
3. **The Database is a Fortress**: SQL injection is physically impossible due to strictly typed compiler-generated queries (`sqlc`). Raw string building is banned.
4. **Race Conditions are Fatal**: Mutative state is exclusively managed via ACID-compliant transactional database wrappers.
5. **Dependency Paranoia**: The system favors the standard library. Core crypto (JWT/Bcrypt/AES) is managed via native Go libraries, avoiding supply-chain bloat.

---

## System Components

### 1. The HTTP Layer (Gateway)
- Built on `chi` router for zero-allocation routing.
- **Middlewares** (applied in order): Native `sentryhttp` (with repanic enabled for full context capturing), RequestID, RealIP, **AntiGravity Gate** (fail2ban — see below), custom Slog logger, Panic Recovery, dynamic CORS, global Ratelimit (`x/time/rate`), and Tenant Context extraction.
- CSRF protection is applied **only on mutating authenticated routes** (not public auth endpoints or persistent `GET` SSE streams).

### 2. Domain Logic (Services)
- **Token Generation**: Asymmetric RSA-SHA256 (`RS256`) JWTs for access limits.
- **Stateless Verification**: Revocation checks hit Redis cache for instant invalidation (e.g. forced logouts) bypassing DB round-trips.
- **Real-Time Push Transport**: Utilizes native **Server-Sent Events (SSE)** coupled with **Redis Pub/Sub** to stream bidirectional app states directly to clients.

### 3. The Unified Background Worker
Replaces legacy multi-worker architectures. A single `worker` binary runs **7** sub-routines:
1. **Email Dispatching**: Uses the outbox pattern from `email_outbox` to send via tenant SMTP gateways over batch-polled routines.
2. **IMAP Polling**: Checks for incoming emails and replies.
3. **Janitor**: Purges expired tokens, unverified accounts, and orphans. Cleans `email_logs` (180-day retention), `email_outbox` (30-day sent/failed), and `email_inbox` archived items (90-day). **Critical**: All Janitor cleanup queries MUST run inside `storage.WithoutRLS()` — `email_outbox`, `email_logs`, and `email_inbox` all have `FORCE ROW LEVEL SECURITY`. Without the bypass, every DELETE silently matches 0 rows.
4. **Social Queues**: Executes LLM text generation and schedules posts to X (formerly Twitter).
5. **Analytics Maintenance**: Auto-rotates analytics database partitions to prevent bloat.
6. **Blog Scheduler**: (`internal/workers/blog`) — Polls every 5 minutes. Promotes `status = 'scheduled'` blog posts to `'published'` when their `scheduled_for` timestamp has passed. Operates via an RLS-bypass transaction to act cross-tenant.
7. **Observatory AI** (`internal/observatory`) — Passive system health monitor. Runs all health probes in parallel every 60s. Dispatches alerts to Telegram (platform-owner bot) + Sentry for CRITICAL events. Never crashes other workers — runs outside the `safeStart` wrapper.

### 5. AntiGravity Gate — Fail2Ban Middleware (`internal/security`)
A Redis-backed IP blocking system that sits at the perimeter of the HTTP layer (after `RealIP`, before everything else). Implements Anti-Gravity Law 1 (Input is Toxic) at the network level.

**Dual-Strike Model**:
- **Hard Strike**: A single request to a known toxic path (`.env`, `wp-admin`, `phpMyAdmin`, `.git`, `xmlrpc.php`, etc.) triggers an **instant 15-minute ban**. These are 100% bot traffic — no legitimate user ever requests these.
- **Soft Strike**: Regular 404 responses are counted in a 1-minute sliding window (Redis ZSET). If an IP generates **15+ 404s in 1 minute**, it is banned for 15 minutes.
- **Recidivist Escalation**: On first ban, a `shadow_key` (1h TTL) is set. If the IP is banned again within that hour, the duration escalates to **1 hour**.
- **DDoS Detection**: In-memory per-IP rate tracking. If an IP exceeds **1000 requests in 10 seconds**, it is instantly banned and a `CRITICAL` real-time alert is fired via Telegram.

**Graceful Degradation**: If Redis is `nil` or unavailable, the Guardian is a complete no-op passthrough (fail-open). The platform stays accessible; only the ban enforcement is temporarily disabled.

**Response to Banned IPs**: `403 Forbidden` with minimal JSON body `{"error":"forbidden"}`. No stack traces, no reason exposed (Anti-Gravity Law 2: Silence is Golden).

**Redis Key Schema**:
| Key | Type | TTL | Purpose |
|-----|------|-----|--------|
| `ag:ban:{ip}` | String | 15m/1h | Active ban marker |
| `ag:shadow:{ip}` | String | 1h | Recidivist detection |
| `ag:strikes:{ip}` | ZSET | Auto-prune | Soft 404 sliding window |
| `ag:gate:bans` | Counter | 6h | Total bans (Observatory stats) |
| `ag:gate:blocked` | Counter | 6h | Total blocked requests (Observatory stats) |

### 4. Observatory AI — Self-Healing Passive Sentry
The Observatory is the system's autonomous health monitor. It does not restart services, but it detects degradation and alerts the platform operator immediately.

**Architecture**: A `WorkerRegistry` forms a heartbeat bus. Each worker calls `registry.Beat(name)` on every loop iteration. The Observatory's `ProbeWorkers` reads these timestamps and fires CRITICAL if any worker has not beaten within `MaxWorkerAge` (default: 3× tick interval = 180s).

**Worker Keepalive Pattern**: Slow-tick workers (blog: 5min, janitor: 1h, maintenance: 12h) include a **45-second keepalive ticker** inside their main `select` loop. This ticker calls `Beat()` more frequently than their work cycles, preventing false stale alerts while still detecting actual worker death (if the goroutine dies, the keepalive also stops).

**8 Active Probes** (all run in parallel per tick):

| # | Probe | Trigger | Severity |
|---|---|---|---|
| 1 | DB Connectivity | `pool.Ping()` fails | 🔴 CRITICAL |
| 2 | DB Latency | Ping >1s / >3s | 🟡 WARN / 🔴 CRITICAL |
| 3 | Redis | nil client / ping fail | 🟡 WARN |
| 4 | Worker Heartbeats | Beat missed > MaxWorkerAge | 🔴 CRITICAL |
| 5 | Auth Anomalies (burst) | Redis ZCOUNT >threshold/4 in 30s | 🟡/🔴 |
| 6 | Auth Anomalies (sustained) | Postgres COUNT >threshold in 5min | 🟡/🔴 |
| 7 | Email Queue | Pending emails stuck >10min | 🟡 WARN |
| 8 | IMAP Silence | No email received in 24h (with accounts configured) | 🟡 WARN |
| 9 | AntiGravity Gate | DDoS suspect (>1000 req/10s) | 🔴 CRITICAL |

**Auth Anomaly Dual-Mode Detection**:
- **Burst mode** (Redis): `AuthService.recordAuthFailure()` writes `ZADD observatory:auth_failures <unixNano> <uuid>` on every failed login (both password and MFA TOTP paths). The probe reads via `ZCOUNT` over a 30s sliding window.
- **Sustained mode** (Postgres): Falls back to querying `audit_logs WHERE action = 'auth.failed_login' AND timestamp > NOW() - INTERVAL '5 minutes'` when Redis is unavailable.
- **Graceful degradation**: If Redis is not configured, `rdb` is `nil` — burst mode is silently skipped.

**Alert Routing**:
- `CRITICAL` probes → Telegram `OBSERVATORY_BOT_TOKEN` + `OBSERVATORY_CHAT_ID` AND Sentry `CaptureMessage` (tagged `component: observatory`).
- `WARN` probes → Telegram only (conserves Sentry quota).
- **SHA-256 deduplication**: Identical alerts are suppressed for 5 minutes via an in-memory `Deduplicator`.
- **6-hour heartbeat**: If no alerts fired for 6 hours, a 🟢 "All systems operational" Telegram ping is sent — now includes **AntiGravity Gate stats** (bans + blocked requests in the last 6 hours).

---

## Tenant Registry

Each tenant is a fully isolated entity with its own identity store, SMTP gateway, and branded email templates. The registry is the canonical source of truth for all tenant UUIDs used throughout the system.

### Active Tenants

#### 1. LaventeCare
| Key | Value |
|---|---|
| **UUID** | `e3253710-d965-42d2-bdf8-4cf3762381c2` |
| **Slug** | `laventecare` |
| **App URL** | `https://laventecare.nl` |
| **SMTP** | `smtp.office365.com:587` (STARTTLS) |
| **From** | `LaventeCare <info@laventecare.nl>` |
| **Template Provider** | `internal/mailer/templates/tenants/laventecare.go` |
| **Primary Color** | `#0D7C5F` (Emerald) |
| **Features** | Blog CMS, Social Automation (X), IMAP, Analytics, Direct Messaging, MFA |

#### 2. De Koninklijke Loop
| Key | Value |
|---|---|
| **UUID** | `b2727666-7230-4689-b58b-ceab8c2898d5` |
| **Slug** | `dkl` |
| **App URL** | `https://dekoninklijkeloop.nl` |
| **SMTP** | `smtp.office365.com:587` (STARTTLS) |
| **From** | `De Koninklijke Loop <info@dekoninklijkeloop.nl>` |
| **Template Provider** | `internal/mailer/templates/tenants/koninklijkeloop.go` |
| **Primary Color** | `#E07A2F` (Royal Orange) |
| **Features** | Analytics, Dual-Email (User + Admin) registration dispatch |

#### 3. C&F Bouw
| Key | Value |
|---|---|
| **UUID** | `3b542934-6ac6-42b2-9511-a09e6cff8c80` |
| **Slug** | `cfbouw` |
| **App URL** | `https://cfbouw.nl` |
| **SMTP** | `smtp.office365.com:587` (STARTTLS) |
| **From** | `C&F Bouw <info@cfbouw.nl>` |
| **Template Provider** | `internal/mailer/templates/tenants/cf_bouw.go` |
| **Primary Color** | `#155A84` (Steel Blue) |
| **CTA Color** | `#E07E34` (Construction Orange) |
| **Logo** | CDN-hosted via ImageKit (`ik.imagekit.io`) |
| **Features** | IoT (ESP32), Analytics, IMAP, Direct Messaging |

#### 4. TuinHub
| Key | Value |
|---|---|
| **UUID** | `05cbd9a2-2ef6-4314-9e02-7b718a630bf9` |
| **Slug** | `tuinhub` |
| **App URL** | `https://www.tuinhub.nl` |
| **SMTP** | `smtp.office365.com:587` (STARTTLS) |
| **From** | `TuinHub <info@tuinhub.nl>` |
| **Template Provider** | `internal/mailer/templates/tenants/tuinhub.go` |
| **Primary Color** | `#008d51` (Trustworthy Green) |
| **Logo** | Emoji-based text header (`🌿 TuinHub`) |
| **Features** | Analytics, Lead notifications with offerte/contact data |

### Email Template Architecture

The email system uses a **Strategy Pattern** where each tenant implements the `TemplateProvider` interface:

```go
type TemplateProvider interface {
    Render(template types.EmailTemplate, data map[string]any) (subject string, body string, err error)
}
```

**Dispatch flow**: `manager.go` maps tenant UUID → provider struct → `Render()` → inline-styled HTML.

**Standard template set** (all tenants implement these 7 templates):

| Template Constant | Purpose | Triggered By |
|---|---|---|
| `TemplateContactConfirmation` | Consumer confirmation after contact/offerte form | Public contact endpoint |
| `TemplatePasswordReset` | Password reset link | `/auth/password/forgot` |
| `TemplateEmailVerification` | Email address verification | `/auth/register`, `/auth/email/resend` |
| `TemplateRegistrationWelcome` | Welcome after account creation | `/auth/register-confirmation` |
| `TemplateNewRegistration` | Admin notification for new signups/leads | Registration + lead submission |
| `TemplatePlainReply` | Admin-initiated plain text replies | `/email/message/{id}/reply` |
| `TemplateMFAOTP` | Time-limited login code | `/auth/mfa/send-email` |

**Design principles**:
- All styles are **inlined** (no `<style>` blocks) for maximum email client compatibility
- MSO/Outlook-specific VML roundrect buttons for CTA rendering
- Hidden preview text for inbox display optimization
- Mobile-responsive 600px max-width table layout
- Each tenant's brand tokens (colors, fonts, logo) are extracted from their website design system

---

## Multi-Tenancy & Row Level Security (RLS)
Every piece of data is isolated to a specific Tenant. The application acts strictly context-aware.

- **Request Context**: Context is usually derived from `X-Tenant-ID` header or implicit from the token claims (`tid`).
- **Postgres RLS**: The ultimate defense-in-depth loop. Even if a developer forgets a `tenant_id` WHERE clause, the Database Engine physically blocks access via the `app.current_tenant` context variable.
  - Tables protected: `memberships`, `refresh_tokens`, `blog_posts`, `blog_comments`, `blog_categories`, `analytics_events`, `direct_messages`, `message_read_receipts`, `feedback`, `social_campaigns`, `social_posts`.
- **RBAC**: Handled in-memory via JWT claims array. Eliminates constant permission queries.

### RBAC Hierarchy (4 Levels)
| Role | Weight | Scope |
|:-----|:-------|:------|
| `viewer` | 1 | Read-only access to own profile, mail config, stats, audit logs |
| `user` | 2 | Write access to own self-service: profile, password, sessions, GDPR export/delete, email change |
| `editor` | 3 | Operational: user management, invites, email inbox, analytics dashboard, direct messaging, blog CMS, presence, feedback |
| `admin` | 4 | Governance: tenant settings, SMTP config, **IMAP config**, CORS, Telegram/X config, social campaigns |

---

## Core Database Schema

### Identity & Access
- `tenants`: Roots of isolation containing origin restrictions, keys, and SMTP config.
- `users`: Global identities. Includes `mfa_email_otp` and `mfa_email_otp_expiry` columns for Email OTP flows.
- `memberships`: Linking users to tenants with specific roles.
- `audit_logs`: Append-only, immutable record for all critical actions.
- `telegram_config`: Per-tenant Telegram bot credentials for alerting webhooks.

### Authentication
- **Tenant-Configurable MFA**: MFA enforcement is tenant-scoped via the `require_mfa` JSONB flag in `tenants.settings` (defaults to `false`). When enabled, `editor` and `admin` roles are forced to complete MFA authentication before receiving an active session.
- `refresh_tokens`: Hashes of active opaque tokens with `family_id` rotation tracking.
- `verification_tokens` / `invitations`: SHA256 deterministic hashes for single-use flows.
- `mfa_email_otp`: Time-limited 6 digit codes stored directly on the `users` table (`mfa_email_otp`, `mfa_email_otp_expiry`).

### CMS, Telemetry & Operations
- `blog_posts` & `blog_categories`: Fully featured headless content engine inside the tenant.
- `blog_comments`: Community comments with moderation queue (approve/reject/delete).
- `blog_revisions`: Full document history of every blog post edit.
- `social_campaigns` & `social_posts`: Configs, generated text, and X tokens. Posts support premium content tiers: `content_type` can be `tweet` (≤280), `verhaal` (≤1500), or `artikel` (≤4000).
- `analytics_events`: Partitioned tables holding GDPR-friendly `ip_hash` visits and page flows (12-month rolling window).
- `email_outbox` / `email_logs`: Reliable delivery tracking. `email_logs` stores both `recipient_email` (plain, for dashboard) and `recipient_hash` (SHA-256, GDPR). `imap_accounts` stores per-tenant IMAP credentials with `imap_tls_mode` (`ssl` or `starttls`).
- `direct_messages` + `message_read_receipts`: 1-on-1 push-based chat. Integrates strictly with the Redis SSE router for instant frontend delivery.
- `feedback`: Internal ticket system with Telegram alerting on new submissions.
- `audit_logs` (partitioned by `timestamp`): Append-only, immutable forensic record. Partitioned by month. Has a performance index `idx_audit_logs_observatory ON audit_logs(action, timestamp DESC)` — used by the Observatory's sustained auth-anomaly probe (runs every 60s, must be O(log n)).
