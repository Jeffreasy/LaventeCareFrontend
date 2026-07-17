# Architecture Guide

Status: current. Last verified: 2026-07-17.

## Runtime

LaventeCareFrontend is an Astro 7.1 server-rendered application deployed through `@astrojs/vercel` 11. React 19 is limited to interactive islands; Tailwind CSS 4 is compiled through Vite. Node.js 22.12+ is required locally and in CI.

## Request flow

```text
Browser
  -> LaventeCareFrontend (same origin)
     -> Astro pages / middleware
     -> /api/auth/* dedicated BFF routes
     -> /api/[...path] generic BFF
        -> LaventeCareAuthSystems
           -> PostgreSQL / Redis / mail outbox
           -> optional idempotent Homeapp intake bridge
```

The browser never selects the backend tenant. The BFF strips routing and hop-by-hop headers, overwrites `X-Tenant-ID` with the configured UUID and caps request bodies. `PUBLIC_API_URL` is a pure HTTP(S) origin; production requires HTTPS. Catch-all path segments reject traversal and URL-control characters.

## Authentication

- Access and pre-auth JWTs use RS256.
- Middleware validates signature, issuer, audience, token scope, tenant claim and admin role.
- Verification distinguishes invalid credentials from verifier/JWKS unavailability.
- Invalid or expired access sessions may rehydrate once through `/api/auth/rehydrate`.
- Network, 429 and 5xx refresh failures return 503 and preserve cookies and form state.
- Only 400, 401 and 403 refresh responses clear auth cookies and redirect to login.
- Refresh is single-flight in the browser API client.
- Public endpoints use the explicit `public` auth policy and never trigger refresh.

## Locale and routing

Locale is derived from the exact host: `.nl` serves Dutch and `.com` English. Route mappings provide canonical and alternate URLs, including portfolio subpages. Admin access is restricted to the Dutch production host and loopback development hosts.

## Contact intake

The contact island is a three-step accessible form. Step changes move focus to a localized announcement. Field limits mirror the server contract. A request key remains stable for an unchanged retry and rotates after business data changes.

AuthSystems binds the submitted tenant to the normalized Origin/Referer, ignores client-controlled `source` for bridge selection, canonicalizes the email address and persists idempotency before enqueuing mail. Only validated LaventeCare origins are forwarded to the private intake endpoint.

## Security boundaries

- Runtime configuration fails closed; no tenant, origin or backend fallback exists.
- Origin comparisons use parsed exact origins, not string prefixes.
- CSRF is forwarded from the same-origin cookie for session mutations.
- The generic BFF removes host, connection, transfer, proxy authorization and forwarding headers.
- Secret scans run against the current tree in CI with redacted output.
- Credentials found in historical source still require external rotation; repository cleanup does not revoke them.

## Verification

Required before merge or deploy:

```bash
npm run format:check
npm run lint
npm run type-check
npm run test
npm run build
```

See `docs/READINESS_STATUS_2026-07-17.md` for evidence and external deployment gates.
