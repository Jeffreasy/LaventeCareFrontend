# Architecture

## Runtime

LaventeCare is an Astro 7 SSR application deployed through the Vercel adapter. Astro middleware
runs at the edge and resolves locale, validates sessions and guards private routes before rendering.
Most UI is server-rendered HTML; React 19 is used only for interactive islands.

## Request flow

```text
Browser
  -> Vercel security headers
  -> Astro edge middleware
       -> locale from Host (.nl / .com)
       -> JWT verification through backend JWKS
       -> route and role guards
  -> Astro page or same-origin /api route
       -> Go backend (BFF proxy)
  -> response
```

The browser never needs a direct backend credential. The BFF forwards authorised same-origin
requests, applies backend cookies through Astro's cookie manager, limits request bodies and disables
caching for private/API responses.

## Localisation

`src/lib/i18n/routes.ts` owns all public NL/EN route pairs. Middleware redirects a route that belongs
to the other locale, while SEO metadata, hreflang links and the dynamic sitemap use the same mapping.
Shared URLs such as `/contact` and `/portfolio` render language-specific content from the Host.

## Authentication

- The backend remains the authority for login, refresh, logout and RBAC.
- Access tokens are verified with a remote JWKS and configured issuer/audience.
- Admin routes require both a valid access token and the `admin` role.
- Auth cookies are HTTP-only except for the CSRF token required by the browser.
- Login and logout enforce same-origin requests in production.
- Private pages and API responses use `Cache-Control: no-store`.

## Consent and analytics

Necessary functionality is always available. Vercel Analytics and optional marketing scripts only
load after the corresponding consent category is enabled. Users can reject, accept, customise and
later reopen preferences from the footer. The preferences dialog traps focus and supports Escape.

## Quality gates

GitHub Actions uses Node 24 and runs Prettier, ESLint, Astro type checking, Chromium Playwright flows
and a production build. E2E coverage includes locale routing, real 404 responses, consent persistence,
host-aware SEO files, English case studies and the contact intake flow.
