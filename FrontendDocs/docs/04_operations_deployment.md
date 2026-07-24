# 04. Operations & Deployment Runbook

## Deployment Environment

The LaventeCare Frontend is structurally optimized for deployment on **Vercel** (`@astrojs/vercel`). This provides zero-configuration access to Edge networking, SSR compute, and automated Image Optimization routing.

### Vercel Integration Features
- **Adapter**: Configured in `astro.config.mjs` via `output: 'server'` combined with the Vercel adapter.
- **Web Analytics**: Enables built-in tracking of traffic metrics natively injected at runtime.
- **Speed Insights**: Automated Core Web Vitals profiling injected into production builds to monitor Real User Metrics (RUM).

## 1. Build and Bundling Optimization

Astro and Rolldown own chunk generation. The project deliberately avoids brittle manual vendor
chunk rules and hydrates only interactive islands. Bundle size is checked through the production
build and browser flows rather than package-name grouping.

## 2. CI/CD Pipeline (GitHub Actions)

Deployments are governed by strict pipeline requirements orchestrated via `.github/workflows/ci.yml`.

### The Pipeline Flow
1. **Trigger**: Push to `main` branch or a Pull Request creation.
2. **Quality Gate**:
   - `npm run format:check`
   - `npm run lint`
   - `npm run type-check`
3. **Testing Gate**:
   - Executes `npm run test` (Playwright) against a localized build.
4. **Deploy**:
   - If tests pass, code is deployed through the Vercel integration (Push-to-Deploy).

## 3. Operations & SEO

### Sitemap Automation
`/sitemap.xml` and `/robots.txt` are SSR endpoints generated from the central NL/EN route map and
incoming Host. This prevents `.nl` and `.com` URLs from being published under the wrong domain.
Admin, API, login and internal rewrite routes are excluded.

### Diagnostics & Web Vitals
When addressing performance regressions, operators should refer to the **Vercel Dashboard** (under "Speed Insights"). Focus strictly on:
- **LCP (Largest Contentful Paint)**: Should be < 2.5s. Optimize top-of-fold images with Astro's `<Image>` format conversion (`webp`/`avif`).
- **CLS (Cumulative Layout Shift)**: Should be < 0.1. Prevent async islands from displacing rendering layout upon hydration by defining min-height skeletons.
