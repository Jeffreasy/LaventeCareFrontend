# 05. Components & Styling Reference

## 1. Styling Stack

The visual foundation relies purely on **Tailwind CSS v4** (`@tailwindcss/vite`). This allows zero-runtime styling, deeply integrated into Astro and React components without requiring CSS modules or styled-components overhead.

### Design Tokens & Variables
Root design variables are maintained in `src/styles/global.css`.
- Extracted colors define `primary`, `secondary`, `accent`, and `background` nuances.
- Layout metrics outline container padding and scalable max-width behavior.

## 2. The `cn()` Utility

Given that components dynamically adapt based on props (`variant`, `size`, `isActive`), we utilize the `cn()` utility function (constructed using `clsx` and `tailwind-merge`).

### Why `cn()`?
Handling Tailwind class collisions accurately is critical. If a button base class has `bg-blue-500` but a prop injects `bg-red-500`, standard concatenation causes unpredictable CSS cascaded behavior. `cn()` overrides dynamically ensuring developer intent is always preserved.

## 3. UI Primitives Reality (`src/components/ui/`)

Elements within the `ui/` directory are the simplest atoms of the system. 
- **Astro Exclusive**: Raw UI primitives such as `Card.astro`, `Logo.astro`, `Icon.astro` and
  `TechStackBadge.astro` are `.astro` files and add no client-side React overhead.
- **No State**: They contain no business logic and no ties to `Nanostores`.
- **Props Only**: They accept strongly-typed `Astro.props` and return structured HTML with Tailwind classes applied.
- **React Delegation**: Interactive behaviour lives in `src/components/islands/`; controls use
  native semantic HTML and explicit ARIA where needed.

## 4. Glassmorphism Design Guidelines

When engineering new blocks or islands, adhere to these styling tenets:
1. **Avoid Solid Opaque Backgrounds:** Unless contrasting a primary Call-To-Action (CTA), use `bg-zinc-900/40` paired with `backdrop-blur-md` instead of a flat `bg-zinc-800`.
2. **Text Hierarchy:** Base text is off-white (`text-zinc-200`). Pure white (`text-white`) is reserved strictly for Headings and Active states.
3. **Animations:** Keep micro-interactions fast and subtle. Example: `transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`.
4. **Borders:** Define element outlines using low opacity borders, essentially drawing the "lip" of the glass (`border border-white/10`).
