# 03. Development & Testing Workflow

## Tooling Prerequisite
- **Node.js**: v20 or later.
- **Package Manager**: NPM.

## 1. Local Development 

### Quick Start
To bootstrap the local development environment:
```bash
npm install
npm run dev
```
The application will launch on `http://localhost:4321`.

### Understanding the Directory Tree
When adding a new component or page, follow the strictly defined taxonomy:
- **Pages** (`src/pages/*.astro`): Route entry points. Responsible for fetching data, verifying auth cookies, and rendering blocks.
- **Blocks** (`src/components/blocks/`): Sub-layouts. Cannot hold state. Used heavily within Pages.
- **Islands** (`src/components/islands/`): React components containing state (`useStore`, `useState`, `useQuery`). Hydrated only when necessary.
- **UI** (`src/components/ui/`): Dumb, reusable primitives (Buttons, Inputs, Dialog roots). 

## 2. Code Quality & Standards

Quality enforcement ensures a consistent codebase and protects against syntax errors prior to build.

### Linting & Formatting
We implement rigid enforcement via ESLint and Prettier. Run checks locally before committing:
```bash
npm run format         # Prettier: Applies exact code formatting rules
npm run lint           # ESLint: Highlights logic/rule violations
npm run format:check   # Verifies formatting (used in CI)
```

### Type Verification
Astro provides a dedicated checking utility for `.astro` file templates, ensuring prop interfaces and TS blocks are correct.
```bash
npm run type-check     # Validates TypeScript across all .ts, .tsx, and .astro files
```

## 3. End-to-End Testing (E2E)

Given the combination of Astro static rendering and React islands, E2E testing is our primary defense against regressions. We use **Playwright**.

### Configuration
`playwright.config.ts` dictates the testing strategy. It automatically boots the development server prior to running suites.

### Running Tests
Execute the testing suite against Chrome, Firefox, and WebKit (Safari).
```bash
npm run test           # Headless CI execution
npm run test:ui        # Interactive UI for debugging
```

### Testing Strategy
- **Core Flows**: User authentication, Lead Generation form validation, and Admin dashboard rendering.
- **Accessibility Checks**: Ensure ARIA landmarks, `aria-expanded` toggles (like mobile navigation), and high-contrast texts maintain compliance across viewports.
- **Visual Checks**: Ensure Glassmorphism backdrop blurs do not occlude vital action items on varying device widths.
