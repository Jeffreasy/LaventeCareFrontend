# 01. Architecture & Design System

## System Overview

LaventeCare is engineered for maximum performance, excellent SEO, and a premium user experience. To achieve this trinity, the application relies on **Astro 5** as the core rendering engine. By defaulting to zero-JavaScript HTML, it provides immediate First Contentful Paint (FCP). Interactivity is injected strictly where necessary using **React 19**.

## Core Stack Philosophy

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Core Framework** | Astro 5 | Server-first rendering. Outputs highly optimized static or edge-rendered HTML. |
| **Interactive UI** | React 19 | Brings complex client-side state, form handling, and rich interactivity. |
| **Backend Integration** | Astro BFF Proxy | Intercepts route requests and proxies them securely to the LaventeCare AuthSystem API. |
| **Styling** | Tailwind CSS v4 | Provides a utility-first methodology with zero-runtime logic. |
| **Design Tokens** | CSS Variables | Dynamic theming and Glassmorphism backdrop definitions. |

---

## The Islands Architecture

Astro's defining feature is the **Islands Architecture**. In LaventeCare, an "Island" is an interactive React component floating in a sea of static Astro HTML.

### Server Components (`.astro`)
Located primarily in `src/components/blocks/`.
- **Role**: Layouts, typography, SEO metadata, and general content presentation.
- **Execution**: Runs exclusively on the server (or at build time).
- **Payload**: Sends 0 bytes of JavaScript to the browser.
- **Example**: `<Footer />` or `<Hero />` components.

### Client Components (`.tsx`)
Located primarily in `src/components/islands/`.
- **Role**: Contact forms, configuration tools, Authentication inputs, global loaders, and Toast notifications.
- **Execution**: Can be server-side rendered for initial paint, but hydrated on the client.
- **Hydration Directives**: 
  - `client:load`: Hydrates immediately (e.g., Main Navigation).
  - `client:idle`: Hydrates when the main thread is free.
  - `client:visible`: Hydrates only when scrolling into the viewport.
  - `client:only="react"`: Skips SSR entirely (useful for components reading browser objects heavily like `<AnalyticsProvider />`).

---

## The Glassmorphism Design System

We employ a strict **Glassmorphism** aesthetic. This visual language is characterized by:
- Translucency (frosted-glass) effects
- Vivid background gradients to expose the transparency
- Multi-layered depth and light borders
- Subtle, micro-interactions for a premium feel

### Implementation Guidelines

1. **Backgrounds & Blur**: Utilizes Tailwind's `backdrop-blur-md` or `backdrop-blur-lg` accompanied by a semi-transparent background color (e.g., `bg-white/10` or `bg-black/20`).
2. **Borders**: Elements feature a delicate 1px border (`border-white/20` or `border-zinc-800/50`) to emulate the physical edge of glass.
3. **Shadows**: Soft, generalized shadows (`shadow-xl`, `shadow-black/10`) create separation from the background canvas.
4. **Typography**: High contrast, crisp typography.

---

## Route Handling & Astro Middleware

LaventeCare uses File-Based Routing built into Astro.
- `src/pages/index.astro` -> `/`
- `src/pages/diensten/lead-generation.astro` -> `/diensten/lead-generation`

Dynamic routing uses bracket notation (e.g., `src/pages/blog/[slug].astro`).

### The Middleware Layer (`src/middleware.ts`)
Before any standard Page component renders, a deeply integrated **Astro Middleware** catches the request. This provides the primary line of defense for the entire web application:
1. **Cookie Scraper**: Extracts `access_token`, `refresh_token`, and `csrf_token` from the incoming HTTP stream.
2. **JWKS Decode**: Uses `jose` to cryptographically decode the JWT without contacting the database (saving incredible amounts of proxy time).
3. **Context Injection**: Modifies `Astro.locals` (a global context mechanism) rendering `locals.isLoggedIn`, `locals.isAdmin`, and `locals.csrfToken` accessible to every downstream layout or page template.
4. **Guards**: Enforces Role-Based Access Control (RBAC). For example, unauthorized calls to `/admin` are immediately intercepted and forwarded to `/login`.

## Directory Structure Strategy

```text
src/
├── components/
│   ├── ui/        # 🧩 Atoms: Pure .astro Primitives (Icons, Cards, Badges).
│   ├── blocks/    # 🧱 Layouts: Hero, Stats, Footer. No State. Pure rendering.
│   └── islands/   # 🏝️ Interactivity: Forms, toast notifications, React dependencies.
├── layouts/       # 🖼️ Master Pages: Contains <head>, global metadata, and `Layout.astro`.
├── pages/         # 🗺️ Routes: Astro file-based routing (+ /api proxy routes).
├── lib/           # 🧰 Utilities: `cn()`, `api-client.ts`, and core stores.
└── styles/        # 🎨 Global CSS: Tailwind configuration and root variables.
```
