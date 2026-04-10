# 03. Operations & Deployment Runbook

## The Unified Worker
To simplify orchestration, avoid multiple failing cron-jobs, and manage concurrency efficiently, LaventeCare Auth runs all background processes via a single compiled Go binary: `cmd/worker`.

### Sub-processes Managed (7 Total):
1.  **Email Gateway**: Polls `email_outbox` to batch-dispatch emails via tenant-specific SMTP configurations.
2.  **IMAP Janitor**: Reaches out to tenant IMAP servers, scraping incoming replies on predefined tickets and dropping them into `email_inbox`.
3.  **Janitor**: Deletes unverified `users` after 24h, flushes expired `refresh_tokens`, `verification_tokens` and temporary records.
4.  **Social Scheduler**: Fetches drafted `social_posts` aligned with active `social_campaigns`. Generates LLM copy based on set personas/archetypes, tracks budget against rate limits, and queues approved drafts for posting on X.
5.  **Analytics Maintenance**: Month-to-month auto-provisioner. Evaluates `analytics_events` timestamps and provisions new inherited partitions for PostgreSQL ahead of time. Detaches records older than 12 months.
6.  **Blog Scheduler** (`internal/workers/blog`): Polls every 5 minutes. Automatically promotes blog posts with `status = 'scheduled'` to `'published'` when their `scheduled_for` timestamp is reached. Operates via a low-level RLS-bypass transaction to act across all tenants simultaneously.
7.  **Observatory AI** (`internal/observatory`): Runs all health probes in parallel every 60s. Fires Telegram + Sentry alerts on unhealthy probes. Does NOT use `safeStart` — it must outlive worker panics to be able to detect them.

*(Note: If a process panics, an isolated `safeStart` panic handler traps the crash, extracts execution context via Sentry's SDK `BeforeSend` hooks, reports the stack trace, and keeps the remaining sub-routines running flawlessly).*

---

## Render.com Deployment Workflow
We use Render as our primary cloud provider due to native PostgreSQL extensions and secure private networking.

1.  **Environment Setup**
    - Create a new PostgreSQL Database in Render.
    - Create a Redis instance.
    - Create a Web Service for the API (`docker-compose` build logic is mostly ignored; Render targets the Repo's root `Dockerfile` natively, or set up via standard Build Command `go build -o api ./cmd/api`).
    - Create a Background Worker service tracking `go build -o worker ./cmd/worker`.

2.  **Crucial Environment Variables**
    | Variable | Purpose |
    | :--- | :--- |
    | `DATABASE_URL` | PostgreSQL DSN |
    | `REDIS_URL` | Redis Cloud / Internal cluster — powers Instant Revocation, **Pub/Sub SSE Chat**, Online Presence Tracking, and **Observatory burst detection** |
    | `JWT_SECRET` | 32+ character RSA Generator Key string |
    | `SENTRY_DSN` | Enterprise Exception logging (Sentry.io). Also receives Observatory CRITICAL probe events tagged `component: observatory` |
    | `TENANT_SECRET_KEY` | 64 Hex chars (32-bytes). Master AES-GCM encryption key for Tenant SMTP/API credentials |
    | `TENANT_SECRET_KEY_V2` | (Optional) New key during rotation. `crypto.CurrentKeyVersion()` auto-detects V3 → V2 → default 1 |
    | `APP_ENV` | `production`, `staging`, `development` |
    | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | System fallback SMTP credentials for platform-level emails |
    | `IMAP_HOST` / `IMAP_PORT` / `IMAP_USER` / `IMAP_PASS` | System-level IMAP credentials for inbox polling |
    | `PORT` | HTTP listen port (auto-injected by Render; defaults to 8080) |
    | `GEMINI_API_KEY` | Google Gemini API key — used by Social Worker for LLM draft generation |
    | `CONVEX_URL` | Convex deployment URL — IoT telemetry proxy target |
    | `CONVEX_DEPLOY_KEY` | Convex deploy key — authenticates IoT telemetry forwarding |
    | `OBSERVATORY_BOT_TOKEN` | **Telegram bot token** for Observatory system alerts (separate from tenant bots) |
    | `OBSERVATORY_CHAT_ID` | **Telegram chat/channel ID** where Observatory alerts are delivered |
    | `GROK_API_KEY` | xAI Grok API key — primary AI engine for Social Worker |
    | `GROQ_API_KEY` | Groq API key — fallback AI engine for Social Worker |
    | `DB_MAX_CONNS` | Max database pool connections per process (default: 25). API=15, Worker=15 recommended |
    | `DB_MIN_CONNS` | Min idle database connections (default: 2). API=3, Worker=5 recommended |

3.  **Database Migrations (Pre-Deploy)**
    - Never let the API handle its own Schema.
    - Migrations run strictly via Render's `Pre-Deploy Command`:
      `curl -sL https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz && ./migrate -path ./migrations -database $DATABASE_URL up`

---

## The Email Gateway Engine
LaventeCare provides complete white-labeling capability. Instead of using a single global API (like Resend or Postmark), the engine holds AES-GCM encrypted SMTP strings *per tenant*.

- **AES-GCM Encryption**: An encryption key (`TENANT_SECRET_KEY`) is generated upon infra provisioning. It must be kept physically safe and NEVER committed.
- **Fail-open Logic**: If a tenant has not configured their SMTP settings, the worker defaults back to the System Default injected via `.env` arrays.
- **SSRF Protection**: Before SMTP handshake, the worker evaluates target infrastructure IPs and drops connections to local, loopback, or internal-origin ranges.
- **SMTP Config Caching**: Tenant SMTP config is cached in-memory with a **5-minute TTL** per tenant (via `sync.Map` in `workers/email`). Config changes take effect within 5 minutes. Eliminates 60+ redundant DB queries/min per active tenant.
- **`from` Validation**: The `POST /admin/mail-config` endpoint validates the `from` field against RFC 5322 via `mail.ParseAddress()`. Invalid addresses are rejected with HTTP 400.
- **`email_logs` audit trail**: Since migration `20260224000001`, `recipient_email` is stored alongside the SHA-256 `recipient_hash` for dashboard visibility. The NOT NULL constraint is relaxed (DEFAULT `''`) for backwards compatibility.
- **IMAP TLS Mode**: `imap_accounts.imap_tls_mode` column (added migration `20260224000001`) allows per-account configuration of `ssl` or `starttls`. Previously hardcoded to `"ssl"`.
- **IMAP Management**: Tenants configure IMAP credentials via `POST /admin/imap-config` (no direct SQL required).

### Per-Tenant SMTP Configuration

All tenants use Office 365 SMTP with AES-256-GCM encrypted credentials. The worker decrypts at runtime using the active `TENANT_SECRET_KEY`.

| Tenant | SMTP Host | Port | TLS | From Address | Admin Email |
|---|---|---|---|---|---|
| **LaventeCare** | `smtp.office365.com` | 587 | STARTTLS | `LaventeCare <info@laventecare.nl>` | `info@laventecare.nl` |
| **De Koninklijke Loop** | `smtp.office365.com` | 587 | STARTTLS | `De Koninklijke Loop <info@dekoninklijkeloop.nl>` | `info@dekoninklijkeloop.nl` |
| **C&F Bouw** | `smtp.office365.com` | 587 | STARTTLS | `C&F Bouw <info@cfbouw.nl>` | `info@cfbouw.nl` |
| **TuinHub** | `smtp.office365.com` | 587 | STARTTLS | `TuinHub <info@tuinhub.nl>` | `info@tuinhub.nl` |

> **Common SMTP Failure**: `535 Authentication Rejected` — ensure **SMTP AUTH** is enabled per-mailbox in the M365 Admin Center, and MFA is **disabled** for service mailboxes (or an App Password is configured). See the Troubleshooting Guide for detailed resolution steps.

### New Tenant Onboarding Checklist

When adding a new tenant to the platform, follow this exact sequence:

1. **Generate UUIDs**: Tenant ID, admin user ID, membership ID
   ```powershell
   [guid]::NewGuid().ToString()  # Run 3 times
   ```

2. **Create database migration** (`migrations/YYYYMMDDHHMMSS_<tenant>_tenant.up.sql`):
   - `INSERT INTO tenants` — with CORS origins, app_url, branding
   - `INSERT INTO users` — admin user with bcrypt password hash
   - `INSERT INTO memberships` — admin role membership

3. **Configure SMTP** (M365 Admin Center):
   - Enable **SMTP AUTH** per mailbox (Users → Active Users → Mail → Email Apps)
   - Disable **MFA** for the service mailbox (or generate App Password)
   - Verify **Security Defaults** are OFF in Azure AD / Entra ID

4. **Encrypt SMTP password**:
   ```bash
   go run ./cmd/tools/encrypt_smtp <password>
   ```

5. **Create SMTP migration** (`migrations/YYYYMMDDHHMMSS_<tenant>_smtp_credentials.up.sql`):
   - `UPDATE tenants SET mail_config = '{...}'::jsonb` with `enc:` ciphertext

6. **Create template provider** (`internal/mailer/templates/tenants/<tenant>.go`):
   - Implement `TemplateProvider` interface with all 7 template types
   - Extract brand tokens (colors, fonts, logo) from the tenant's website

7. **Register in manager** (`internal/mailer/templates/manager.go`):
   - Add `case "<uuid>": provider = &tenants.<Tenant>Templates{}`

8. **Update `email_logs_template_type_check`** constraint if adding new template types

9. **Build verification**: `go build ./...`

10. **Deploy**: Commit → Push → Render auto-deploy (migrations run in pre-deploy command)

### Disaster Recovery: Key Rotation (Zero Downtime)
If the `TENANT_SECRET_KEY` is compromised, deploy a zero-downtime rotation.

1. Generate a new key: `go run ./tools/generate_key/`.
2. Export the new key as `TENANT_SECRET_KEY_V2` in Render.
3. `crypto.CurrentKeyVersion()` (called by `UpdateMailConfig`) will automatically tag new configs as version 2.
4. Write a script: query all `tenants.mail_config` where `mail_config_key_version = 1`, re-encrypt using V2, commit.
5. Drop V1 (`TENANT_SECRET_KEY`) from Render Env once all rows are at version 2.

> **Tooling**: Use `tools/encrypt_mail_config` for manual re-encryption during key rotation. Use `tools/generate_key` to generate a cryptographically secure new key.

### Janitor Cleanup & FORCE_RLS
The Janitor worker runs hourly and handles data retention. **Important**: `email_outbox`, `email_logs`, and `email_inbox` all have `FORCE ROW LEVEL SECURITY`. The Janitor uses `storage.WithoutRLS()` to bypass RLS inside a single transaction. Without this, all DELETEs silently match 0 rows.

| Table | Retention Policy |
| :--- | :--- |
| `email_logs` | 180 days |
| `email_outbox` (sent/failed) | 30 days |
| `email_inbox` (archived) | 90 days |
| `refresh_tokens`, `verification_tokens`, `invitations` | Expired immediately |

---

## Telegram Alerting System
LaventeCare includes a native per-tenant Telegram notification system for real-time operational alerts.

- **Configuration**: Stored per tenant in the `telegram_config` table. Managed via `POST /admin/telegram-config`.
- **Triggers**: Automatically fires when new feedback tickets are submitted (`feedback` table). Can be extended to other events.
- **Testing**: Use `POST /admin/telegram-config/test` to send a test message and verify the webhook is working before relying on it in production.
- **Package**: `internal/telegram/notifier.go` — stateless notifier, instantiated per request.

---

## Audit Logs (Append-Only)
`audit_logs` are the core forensic tracking element.
- The service account or application layer holds **no** DELETE/UPDATE privileges over this table via PostgreSQL native permissions.
- Everything from MFA activations, to Login Attempts, Profile mutations, Role Escalations, Email Changes, and GDPR deletions triggers an append.
- **Auth Failure Instrumentation**: Failed password attempts and failed MFA TOTP attempts in `AuthService` call `recordAuthFailure()`, which writes to both:
  1. `audit_logs` (action: `auth.failed_login`) — feeds the Observatory's 5-minute sustained probe.
  2. Redis ZADD `observatory:auth_failures` (score: unixNano) — feeds the Observatory's 30-second burst probe.
- **Performance index**: `idx_audit_logs_observatory ON audit_logs(action, timestamp DESC)` — ensures the Observatory's sustained probe (runs every 60s) is O(log n) instead of a full table scan.
- Use `tools/query_audit` for manual forensic queries during incidents.

---

## Observatory AI — Operations Guide

### Startup
The Observatory starts automatically with the worker binary. On startup it sends `🔭 Observatory Online` to Telegram.

### Normal Operation
- Every 60s: all 8 probes run in parallel.
- On a clean tick: `🔭 all probes healthy` is logged (visible in Render logs).
- Every 6 hours without incidents: `🟢 All systems operational` Telegram ping, now including **AntiGravity Gate stats** (e.g., `🛡️ AntiGravity Gate: 142 bots geband, 2,847 requests geblokkeerd (6h)`).

### When You Receive an Alert
| Emoji | Severity | Action |
|---|---|---|
| 🔴 CRITICAL | System degraded or under attack | Immediate investigation required. Check Sentry for full context. |
| 🟡 WARN | Early degradation signal | Investigate within 15 minutes. Can be benign (quiet inbox, slow DB). |
| 🟢 Heartbeat | All healthy | No action needed. Confirms Observatory is alive. |

### Configuring Alert Suppression
Identical alerts are deduplicated for 5 minutes via `Deduplicator`. If a probe alternates between healthy/unhealthy faster than 5 minutes, only the first alert fires. This prevents alert storms.

### Observatory Probes Reference
| Probe | Key | Default Threshold |
|---|---|---|
| DB Latency WARN | `db.latency.warn` | >1s ping |
| DB Latency CRITICAL | `db.latency.critical` | >3s ping |
| Redis down | `redis.ping.failed` | Any ping fail |
| Worker stale | `worker.stale.<name>` | 180s without heartbeat |
| Auth burst WARN | `auth.burst.warn` | 5 failures/30s |
| Auth burst CRITICAL | `auth.burst.critical` | 20 failures/30s |
| Auth sustained WARN | `auth.failed_login.spike` | 20 failures/5min |
| Auth sustained CRITICAL | `auth.sustained.critical` | 40 failures/5min |
| Email queue stuck | `email.outbox.stuck` | 50 pending emails >10min |
| IMAP silence | `imap.inbox.silent` | 24h no received emails |
| IMAP empty | `imap.inbox.empty` | Account configured, inbox never received mail |
| Gate DDoS | `gate.ddos.detected` | >1000 requests/10s from single IP |

---

## AntiGravity Gate — Operations Guide

### What It Does
The Gate (`internal/security/guardian.go`) is a Redis-backed fail2ban middleware that blocks malicious scanners and aggressive bots at the HTTP perimeter. It runs in the **API process only** (the Worker reads stats from Redis for Observatory reporting).

### When You See Gate Logs
| Log Message | Meaning |
|---|---|
| `🛡️ instant ban: toxic path` | A bot probed `.env`, `wp-admin`, `.git`, etc. — instantly banned for 15m |
| `🛡️ soft strike ban` | An IP hit 15+ 404s in 1 minute — likely a fuzzer or broken crawler |
| `🛡️ blocked banned IP` | A previously banned IP tried again — request was rejected (403) |
| `🛡️ recidivist escalation` | A repeat offender was escalated from 15m to 1h ban |
| `🙨 DDoS suspect detected` | An IP exceeded 1000 req/10s — banned + CRITICAL Telegram alert |

### Redis Keys (Diagnostics)
To inspect active bans from the Render Redis console:
```
KEYS ag:ban:*        # List all currently banned IPs
KEYS ag:shadow:*     # List recidivist markers
GET ag:gate:bans     # Total bans in current 6h window
GET ag:gate:blocked  # Total blocked requests in current 6h window
```

### Fail-Open Behavior
If Redis goes down, the Gate becomes a transparent passthrough. No requests are blocked, but no requests are rejected either. The platform continues to function normally. When Redis recovers, the Gate automatically resumes enforcement.

### Tuning
| Constant | Default | Location |
|---|---|---|
| `softStrikeLimit` | 15 hits/min | `internal/security/guardian.go` |
| `banDuration` | 15 minutes | `internal/security/guardian.go` |
| `recidivistBan` | 1 hour | `internal/security/guardian.go` |
| `ddosThreshold` | 1000 req/10s | `internal/security/guardian.go` |
