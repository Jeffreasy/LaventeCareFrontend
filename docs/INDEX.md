# Documentation index

Last verified: 2026-07-17

This index is the canonical entry point. Documents without a Current status are historical evidence, not implementation truth.

| Document                                             | Status              | Scope                                                                                                     |
| ---------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| README.md                                            | Current             | Local setup and project entry point                                                                       |
| docs/READINESS_STATUS_2026-07-17.md                  | Current             | Implemented fixes, historical-audit reconciliation and external release gates                             |
| ARCHITECTURE.md                                      | Current             | Runtime, BFF, auth, locale and contact architecture                                                       |
| FrontendDocs/BFF_Cookie_Integration_Guide.md         | Superseded in parts | Historical multi-cookie design; current code uses one refresh cookie at Path=/api and /api/auth/rehydrate |
| backendtofrontendAudit.md                            | Historical          | Audit evidence, findings require revalidation                                                             |
| FrontendDocs/LAVENTECARE_FRONTEND_READINESS_AUDIT.md | Historical          | Point-in-time readiness audit                                                                             |
| FrontendDocs/docs/02_data_state_integration.md       | Superseded in parts | Refresh queue was replaced by a single-flight promise                                                     |

## Current system truth

- Astro SSR on Vercel.
- Same-origin BFF under /api to LaventeCareAuthSystems.
- JWT verification requires RS256, issuer, audience laventecare-frontend, access scope and the configured tenant claim.
- Refresh token is HttpOnly at Path=/api; protected pages rehydrate through /api/auth/rehydrate.
- Public contact submissions go to AuthSystems, which forwards idempotently to JeffriesBackend.
- Locale is host based: .nl is Dutch and .com is English.
