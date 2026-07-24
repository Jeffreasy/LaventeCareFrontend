# LaventeCare Frontend - The Handbook

> **Anti-Template Protocol**: "Static when possible, Dynamic when necessary, Beautiful always."

LaventeCare Frontend is a high-performance SSR application built on **Astro 7**. Using the **Islands Architecture**, it sends server-rendered HTML and selectively hydrates interactive React components. The application uses Tailwind CSS v4 and integrates with the LaventeCare Auth System through a secured **Backend-For-Frontend (BFF)** proxy.

## The Core 5 Master Documents

Welcome to the consolidated frontend handbook. Everything you need to architect, design, and operate the frontend platform is divided into these chapters:

### [01. Architecture & Design System](./01_architecture_design.md)
The foundation of the frontend platform. Details the Astro 7 Islands Architecture, the separation of concerns between Server Components (`.astro`) and Client Components (`.tsx`), Page Routing, and the core Glassmorphism design philosophy.

### [02. Data, State & Integration](./02_data_state_integration.md)
The integration manual. Explains how the frontend communicates with the **LaventeCare Auth System** via the universal BFF proxy. Details the custom `ApiClient`, automatic token-refresh queues, CSRF header injection, and Nanostores for cross-framework global state management.

### [03. Development & Testing Workflow](./03_development_testing.md)
The Frontend Engineer's onboarding guide. Details local development environment setup, the strict `src/components` directory structure (`ui/`, `blocks/`, `islands/`), and mandatory testing procedures (Playwright E2E, ESLint, TypeScript verification).

### [04. Operations & Deployment Runbook](./04_operations_deployment.md)
The DevOps guide for the edge. Instructions for Vercel deployment, edge caching strategies, CI/CD with GitHub Actions, Web Vitals monitoring via Vercel Analytics, and production performance optimizations.

### [05. Components & Styling Reference](./05_components_styling_reference.md)
The UI Toolbox. Comprehensive reference for Tailwind CSS v4 usage, the `cn()` class merging utility, semantic color tokens, and best practices for creating accessible, modern UI primitives (Lucide React, React Aria).

---

## Key Capabilities at a Glance:

- **Islands Architecture**: Zero-JS by default. Interactive React components are only hydrated when needed (e.g., `<Navbar client:load />`), ensuring perfect Lighthouse scores.
- **Glassmorphism Design System**: Modern, translucent UI components with backdrop blurs, vivid background gradients, and precise Z-index management.
- **Universal BFF Proxy**: All external backend communication routes through a secure local Astro proxy (`/api`), shielding tokens and managing cookie sanitization.
- **Advanced API Client**: Custom `ApiClient` implementing an automated fetch queue to seamlessly resolve `401 Unauthorized` responses and refresh credentials without dropping parallel requests.
- **Seamless State Sharing**: **Nanostores** enables type-safe, frictionless state sharing between Astro pages, React Islands, and vanilla JS modules.
- **Type-Safe Routing & Props**: Astro's strict compile-time TypeScript checks guarantee prop validation and robust component boundaries.
- **Automated Web Vitals**: Built-in integration with `@vercel/speed-insights` and `@vercel/analytics` for continuous real-user monitoring (RUM).
- **SEO & Sitemap Isolation**: Host-aware `sitemap.xml` and `robots.txt` generation filters private routes and keeps the NL/EN domains separate.
- **End-to-End Testing**: Playwright Chromium covers the critical public flows and both hostnames.
