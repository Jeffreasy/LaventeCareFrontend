# Architecture Guide

## System Overview

LaventeCare is built as a high-performance, SEO-optimized web application using the **Astro 5** framework. It leverages the **Islands Architecture** to minimize client-side JavaScript, shipping purely static HTML for the majority of the UI and hydrating only the interactive components (React).

## Core Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend Framework** | Astro 5 | Best-in-class performance, SEO, and islands architecture. |
| **Interactive UI** | React 19 | Rich ecosystem for extensive interactive components. |
| **Backend / DB** | Convex | Typesafe, realtime backend-as-a-service. |
| **State** | Nanostores | Lightweight, framework-agnostic state management sharing state between Astro & React. |
| **Styling** | Tailwind CSS v4 | Utility-first, co-located styling with zero runtime overhead. |

## Application Layers

### 1. Presentation Layer (Astro & React)

-   **Static Blocks** (`src/components/blocks/`): These are Server Components (`.astro`). They render on the server and send no JS to the client. Used for Headers, Footers, Hero sections, and Content.
-   **Interactive Islands** (`src/components/islands/`): These are Client Components (`.tsx`). They are hydrated on the client. Used for Search, Forms, Auth, and Toggles.

**Hydration Strategy:**
We use partial hydration. Only interactive islands load JavaScript.
-   `<Navbar client:load />` -> Immediate hydration for critical UI.
-   `<Footer />` -> No hydration (static).

### 2. Data Layer (Convex)

The application connects to a managed Convex backend.
-   **Client**: Initialized in `src/lib/convex.ts`.
-   **Access**:
    -   *Realtime*: React components use `useQuery` hooks.
    -   *Actions*: RPC calls via `convex.mutation` or `convex.action`.

### 3. State Management (Nanostores)

Global state (like User Session, Theme, Shopping Cart) is managed via **Nanostores**.
-   **Why?** Nanostores can be read/written from standard JS modules, Astro components (during build/SSR), and React components (during runtime) without context wrappers.

## Design System

The application implements a "Glassmorphism" aesthetic.

-   **Core visual traits**: Translucency, vivid background gradients, light borders.
-   **Implementation**:
    -   Global CSS variables for primary/secondary colors.
    -   Tailwind v4 for utility composition.
    -   `cn()` utility for merging class names safely.

## Directory Structure Strategy

```
src/
├── components/
│   ├── blocks/    # ❌ No State. Pure rendering.
│   ├── islands/   # ✅ State. Event listeners. API calls.
│   └── ui/        # 🧩 Atoms. Buttons, Inputs, Badges.
```
