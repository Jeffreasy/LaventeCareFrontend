# Contributing to LaventeCare

Thank you for your interest in contributing! This document outlines the standards and workflows for developing on this project.

## Development Workflow

1.  **Dependencies**: Ensure you are using Node.js v20+ and have installed dependencies via `npm install`.
2.  **Dev Server**: Run `npm run dev` to start the local development server at `http://localhost:4321`.
3.  **Branching**: specific-feature-branch naming convention (e.g., `feat/login-page` or `fix/navbar-typo`).

## Code Standards

### Styling
-   **Tailwind First**: Use utility classes for everything.
-   **No Custom CSS**: Avoid writing raw CSS in `.astro` styles tags unless absolutely necessary (e.g., complex animations). Use `src/styles/global.css` for global tokens.
-   **Glassmorphism**: Follow the existing design language (backdrop-blur, borders, transparency).

### Components
-   **Structure**: Place components in the correct directory:
    -   `ui/` for small, reusable atoms.
    -   `blocks/` for static page sections.
    -   `islands/` for interactive React components.
-   **Props**: Always define a PHP/TS `interface Props` for Astro components.

### Commits
-   Use clear, descriptive commit messages.
-   Format: `type(scope): description`
    -   `feat(auth): add login modal`
    -   `fix(nav): correct mobile padding`
    -   `docs(readme): update setup steps`

## Pull Requests

1.  Describe the changes clearly.
2.  Attach screenshots if UI changes were made.
3.  Ensure all tests pass (`npm run test`).
4.  Ensure lining passes (`npm run lint`).
