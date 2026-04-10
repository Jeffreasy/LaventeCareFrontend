# 04. Operations & Deployment Runbook

## Deployment Environment

The LaventeCare Frontend is structurally optimized for deployment on **Vercel** (`@astrojs/vercel`). This provides zero-configuration access to Edge networking, SSR compute, and automated Image Optimization routing.

### Vercel Integration Features
- **Adapter**: Configured in `astro.config.mjs` via `output: 'server'` combined with the Vercel adapter.
- **Web Analytics**: Enables built-in tracking of traffic metrics natively injected at runtime.
- **Speed Insights**: Automated Core Web Vitals profiling injected into production builds to monitor Real User Metrics (RUM).

## 1. Build and Bundling Optimization

### Rollup Manual Chunking
To prevent bloated bundle downloads and allow granular browser caching, Vite is configured (`astro.config.mjs`) to aggressively slice `node_modules` into categorized chunks:
- `react-vendor`: `react`, `react-dom`
- `form-vendor`: `@conform-to/react`, `zod`
- `analytics-vendor`: `@vercel/analytics`, `web-vitals`
- `store-vendor`: `nanostores`, `@nanostores/persistent`

This strategy ensures that if business logic (`islands`) updates, users do not redownload heavy React dependencies.

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
Generating sitemaps manually is error-prone. The `@astrojs/sitemap` integration intercepts the build process to generate a dynamic XML map, applying an `exclude` function to ensure protected paths remain unindexed.
- **Excluded**: `/admin/*`, `/api/*`, `/login`, etc.

### Diagnostics & Web Vitals
When addressing performance regressions, operators should refer to the **Vercel Dashboard** (under "Speed Insights"). Focus strictly on:
- **LCP (Largest Contentful Paint)**: Should be < 2.5s. Optimize top-of-fold images with Astro's `<Image>` format conversion (`webp`/`avif`).
- **CLS (Cumulative Layout Shift)**: Should be < 0.1. Prevent async islands from displacing rendering layout upon hydration by defining min-height skeletons.
