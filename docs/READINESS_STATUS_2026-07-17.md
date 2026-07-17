# LaventeCare frontend readiness — current reconciliation

Last verified against the working tree: 2026-07-17.

This is the current status companion to `backendtofrontendAudit.md` (2026-01-31) and `FrontendDocs/LAVENTECARE_FRONTEND_READINESS_AUDIT.md` (2026-07-06). Those reports remain historical evidence; their findings are not automatically current.

## Resolved in code

| Area                      | Current evidence                                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positioning               | NL and EN lead with “B2B systeempartner/systems partner” and “Van idee tot werkend systeem”; both expose the same six services.                                                                             |
| Unsupported public claims | Exact Lighthouse/PageSpeed/load-time claims and the AntiGravity/telemetry/Lighthouse widgets were removed. Portfolio numbers without primary evidence were removed or converted to functional descriptions. |
| Portfolio truth           | C&F Bouw, TuinHub, Whisky for Charity, JeffDash and Dustin stacks are aligned with the repo audit; the unsupported SmartCoolCare SMS claim is absent.                                                       |
| Encoding and routing      | No known mojibake remains; a true 404 route replaces the former catch-all page; portfolio hreflang mappings exist.                                                                                          |
| Contact UX                | NL/EN page copy, visible phone number, localized legal link, accessible step focus, bounded fields and stable idempotency retries.                                                                          |
| BFF/auth                  | Central fail-closed runtime config, exact origin checks, server-owned tenant header, hop-by-hop stripping, body limit, safe path normalization, RS256 claim validation and refresh outage preservation.     |
| Email/admin               | Frontend routes match the AuthSystems mail-config API; connection testing performs SMTP auth/TLS without sending a message.                                                                                 |
| Public contact server     | Origin-bound tenant resolution, source-spoof protection, canonical email, durable idempotency and transactional mail outbox.                                                                                |
| Brand/legal templates     | AuthSystems templates now use “LaventeCare”, KVK 88162710 and “Van idee tot werkend systeem”.                                                                                                               |
| Tooling                   | Astro 7.1, React 19, Tailwind 4, Node 22.12+ and CI jobs for quality, E2E, build, dependency audit, Go race tests, govulncheck and current-tree secret scanning.                                            |

## Historical audit findings that remain decisions, not code defects

- The authoritative founding date is not stored in the current canon; the site avoids publishing a conflicting year.
- The `.com` domain is implemented for English but ownership, DNS and production routing must be confirmed externally.
- The public brand colour is `#0D7C5F`; persisted tenant branding outside this repo must be checked before launch.
- “6+ live projects” remains because the audit verified seven real repositories. Exact customer outcomes, performance scores, uptime and conversion metrics stay unpublished until primary evidence is supplied.
- SLA copy uses target categories and an effort obligation; contractual response guarantees require an executed SLA.

## External release gates

1. Rotate every production credential that ever appeared in Git history, including affected database and tenant/mail secrets. Current-tree cleanup does not revoke a leaked secret.
2. Apply the new AuthSystems migrations in a controlled database environment and verify rollback/backups.
3. Configure production `PUBLIC_*`, JWT, database, Redis, SMTP and intake secrets in the deployment secret stores.
4. Confirm `.nl`/`.com` DNS, TLS, host routing, allowed origins and canonical URLs.
5. Run a real SMTP connection test and one end-to-end contact submission through Frontend → AuthSystems → Homeapp → outbox.
6. Run database-backed Go integration/race tests and the complete CI workflows in an environment with PostgreSQL/Redis.
7. Run live accessibility, browser and performance measurements on the deployed domains; do not turn results into marketing claims without retaining the reports.
8. Have the owner confirm public legal data, privacy/terms content and any contractual SLA language.

## Readiness verdict

The repository can be considered code-ready only when the documented local checks are green. Production remains gated by credential rotation, migrations, secret configuration, DNS/TLS and real infrastructure tests above.
