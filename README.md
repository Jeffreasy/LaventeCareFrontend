# LaventeCare - Enterprise Astro Application

Een professioneel, enterprise-ready Astro project met moderne glassmorphism design, volledige type-safety en geautomatiseerde testing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

De applicatie draait op `http://localhost:4321`

## 📁 Enterprise Architecture

### Component-Driven Design

- **UI Components** (`src/components/ui/`): Herbruikbare primitive components (Button, Card, etc.)
- **Sections** (`src/components/sections/`): Samengestelde secties (Hero, Stats, Testimonial)
- **Structure** (`src/components/structure/`): Layout components (Navbar, Footer, SEO)

### Type Safety

- **Build-time**: TypeScript interfaces voor compile-time garanties
- **Component Props**: Strikt getypeerde props met TypeScript
- **Utilities**: Type-safe helpers en utilities

### Project Structure

```
src/
├── components/
│   ├── ui/             # Primitive UI componenten (Button, Card, Input)
│   ├── sections/       # Content secties (Hero, Stats, Testimonial)
│   └── structure/      # Layout components (Navbar, Footer, Page)
├── layouts/
│   └── Layout.astro    # Base layout met SEO en metadata
├── lib/
│   ├── utils.ts        # cn() utility (Tailwind class merging)
│   └── image.ts        # Image optimization helpers
├── pages/              # Astro routing
├── styles/
│   └── global.css      # Global styles met design tokens
└── types/              # TypeScript type definitions
```

## 🎨 Component Development

### Creating a New Component

1. **Create UI Component** (`src/components/ui/Button.astro`)

```astro
---
import { cn } from '../../lib/utils';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

const { variant = 'primary', size = 'md', class: className } = Astro.props;
---

<button class={cn(
  'inline-flex items-center justify-center rounded-lg transition-colors',
  variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
  variant === 'secondary' && 'bg-secondary text-white hover:bg-secondary/90',
  variant === 'outline' && 'border-2 border-primary text-primary bg-transparent',
  size === 'sm' && 'px-3 py-1.5 text-xs',
  size === 'md' && 'px-5 py-2.5 text-sm',
  size === 'lg' && 'px-8 py-4 text-lg',
  className
)}>
  <slot />
</button>
```

2. **Use in Pages** (`src/pages/index.astro`)

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/sections/Hero.astro';
---

<Layout title="Home">
  <Hero
    headline="LaventeCare"
    subtitle="Enterprise Astro Application"
    description="Modern, type-safe web development"
    ctaPrimary={{ label: 'Get Started', url: '/start' }}
  />
</Layout>
```

## 🧪 NPM Scripts

### Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

### Code Quality

```bash
npm run lint         # ESLint check
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run type-check   # TypeScript/Astro check
```

### Testing

```bash
npm run test         # Run Playwright E2E tests
npm run test:ui      # Interactive Playwright UI
```

## 🎨 Styling met Tailwind CSS

### Design System

Het project gebruikt een custom design system gedefinieerd in [`tailwind.config.mjs`](./tailwind.config.mjs):

- **Colors**: Semantic color tokens (primary, secondary, background, foreground)
- **Typography**: Custom font families en sizes
- **Glassmorphism**: Modern transparent card designs met backdrop blur
- **Responsive**: Mobile-first responsive utilities

### `cn()` Utility

Combineer en los Tailwind class conflicten op met de `cn()` utility:

```typescript
import { cn } from './lib/utils';

const className = cn(
  'bg-gray-50',
  isActive && 'bg-primary',
  props.class
);
```

### Global Styles

Zie [`src/styles/global.css`](./src/styles/global.css) voor:
- CSS custom properties
- Design tokens
- Global utility classes
- Glassmorphism effects

## 🖼️ Image Optimization

Gebruik de image optimization helpers:

```typescript
import { optimizeImage } from './lib/image';

const optimized = optimizeImage(imageUrl, {
  width: 800,
  format: 'webp',
  quality: 80,
});
```

## 🔄 CI/CD Pipeline

GitHub Actions workflow ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)):

1. **Code Quality**: Prettier, ESLint, TypeScript
2. **E2E Tests**: Playwright op alle browsers
3. **Build**: Productie build verificatie

## 🧩 Key Features

✅ **Modern Architecture** - Component-driven design  
✅ **Type Safety** - Full TypeScript support  
✅ **Testing** - Playwright E2E tests  
✅ **CI/CD** - GitHub Actions pipeline  
✅ **Code Quality** - ESLint + Prettier  
✅ **Design System** - Tailwind CSS met custom tokens  
✅ **Glassmorphism** - Modern transparent UI design  
✅ **Responsive** - Mobile-first approach

## 📚 Documentation

- [**Styling Rules**](./StylingRules.md) - Complete styling guide
- [Astro Docs](https://docs.astro.build)
- [Tailwind CSS Docs](https://tailwindcss.com)

## 🚢 Deployment

### Vercel (Recommended)

1. Push naar GitHub
2. Connect met Vercel
3. Deploy (automatisch detecteert Astro build)

### Netlify

1. Push naar GitHub  
2. Connect met Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🎯 Next Steps

1. Voeg custom components toe aan je pages
2. Implementeer routing voor additional pages
3. Voeg analytics toe (GA4, Plausible)
4. Setup webhooks voor automated deployments
5. Implementeer multilingual support (i18n)

## 💡 Best Practices

- Gebruik de `cn()` utility voor conditional styling
- Optimaliseer images voor betere performance
- Houd components klein en herbruikbaar
- Schrijf E2E tests voor kritieke user flows
- Run linting en formatting voor commits
- Gebruik semantic HTML voor accessibility

## 🏗️ Tech Stack

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Custom components met glassmorphism design
- **Icons**: Lucide React
- **Testing**: Playwright
- **Type Safety**: TypeScript
- **Code Quality**: ESLint + Prettier

---

**Built with Enterprise Standards** 🚀  
Type-safe • Tested • Scalable • Modern
