# LaventeCare website

Production website and BFF for LaventeCare, built with Astro 7, React 19 and Tailwind CSS 4.
The same application serves Dutch content on `laventecare.nl` and English content on
`laventecare.com`.

## Requirements

- Node.js 24 (the same major version used in CI and production)
- npm
- The environment variables listed in `.env.example`

## Local development

```bash
npm ci
npm run dev
```

The local server is available at `http://localhost:4321`. Localhost defaults to Dutch.

## Commands

```bash
npm run format        # format source and test files
npm run lint          # ESLint
npm run type-check    # Astro and TypeScript diagnostics
npm run test          # Playwright end-to-end tests
npm run build         # Vercel production build
npm run verify        # complete local quality gate
```

Install the browser once before the first local E2E run:

```bash
npx playwright install chromium
```

## Architecture

- `src/pages/` contains SSR routes and API endpoints.
- `src/components/blocks/` contains server-rendered page sections.
- `src/components/islands/` contains interactive React islands.
- `src/lib/i18n/` is the single source of truth for locale routes.
- `/api/*` is a same-origin BFF proxy to the configured Go backend.
- Authentication tokens remain in secure cookies; middleware verifies JWT roles using JWKS.
- Consent is stored locally and gates optional analytics and marketing scripts.
- `sitemap.xml` and `robots.txt` are generated per incoming domain.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the request flow and security boundaries.

## Deployment

The Vercel adapter runs Astro middleware at the edge. Configure both production domains on the
same Vercel project and set the required environment variables before deploying.

CI checks formatting, linting, types, Playwright flows and the production build on Node 24.

## Repository hygiene

Commercial plans, résumés, exports, audit output and generated reports are internal working files
and must not be published with the website or added to a public repository. The public source of
truth for website pricing is `WebsitePackages.astro`; the public legal scope is maintained in
`TermsContent.astro` and `website-care.astro`.
