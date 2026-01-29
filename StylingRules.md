🚀 Astro 2026: The Master Stack & Architecture
I. De Technologische Stack
De focus ligt op zero-runtime styling en type-safe interactie.

1. Tailwind CSS v4.0 (The Engine)
Rust-Powered Performance: Nagenoeg directe build-tijden dankzij de nieuwe Rust-engine.

CSS-First: Geen tailwind.config.js meer. Configuratie gebeurt via CSS-variabelen in @theme.

Container Queries: Gebruik @container in plaats van media queries voor component-level responsiviteit.

2. Componenten: Shadcn/ui & React Aria
Copy-Paste Philosophy: Volledige eigenaarschap over de broncode van je UI.

Accessibility: Gebruik React Aria Components voor 100% WCAG 2.2 compliant interacties (modals, dropdowns) zonder hoofdpijn.

Glassmorphism 2.0: Combineer bg-white/10, backdrop-blur-md en ring-1 ring-white/20 voor de moderne 2026-look.

3. "The Special Sauce" Tools
Onderdeel	Tool	Strategie
Kleuren	OKLCH	Gebruik oklch() voor perceptueel accurate kleuren en perfecte contrasten.
Typography	Geist & Fontshare	Geist voor UI-precisie; Satoshi (Fontshare) voor koppen.
Forms	Conform + Zod	Type-safe formulieren die naadloos samenwerken met Astro Server Actions.
Data Vis	Tremor Raw	Tailwind-native grafieken voor real-time IoT dashboards.

Exporteren naar Spreadsheets

II. Centrale Structuur & Architectuur
Een professioneel project vereist een Single Source of Truth en een voorspelbare mappenstructuur.

1. Directory Layout
Plaintext

src/
├── components/
│   ├── ui/             # Primitives (Buttons, Inputs via CVA)
│   ├── blocks/         # Secties (Navbar, Hero)
│   └── islands/        # Interactieve componenten (React/Svelte)
├── layouts/
│   └── BaseLayout.astro # De centrale wrapper met ViewTransitions
├── lib/
│   ├── utils.ts        # cn() helper (clsx + tailwind-merge)
│   └── constants.ts    # Navigatie-items en API endpoints
└── styles/
    └── global.css      # @theme definities en globale resets
2. Design Tokens (@theme)
Centraliseer je styling variabelen in src/styles/global.css:

CSS

@theme {
  --color-brand-primary: oklch(65% 0.24 260);
  --radius-action: 0.75rem;
  --font-display: "Satoshi", sans-serif;
}
III. De Gouden Regels voor 2026
Rule 1: Zero-JS by Default
Lever geen JavaScript aan de browser tenzij het strikt noodzakelijk is. Gebruik Astro's statische rendering voor 90% van je styling. Gebruik <details> voor dropdowns en pure CSS voor hover-effecten.

Rule 2: Island Isolation Strategy
Gebruik Astro's directives om performance te optimaliseren:

client:load: Voor directe interactie (bijv. mobiel menu).

client:visible: Voor zware onderdelen zoals IoT grafieken.

client:only="react": Voor componenten die browser-specifieke API's (Web Bluetooth/USB) gebruiken.

Rule 3: Type-Safe Components
Behandel je frontend als je backend. Gebruik strikte interfaces voor je props:

TypeScript

interface Props {
  variant: 'success' | 'warning' | 'error'; 
  label: string;
  value: number;
}
Dit voorkomt runtime-fouten bij het visualiseren van kritieke sensordata of cliëntinformatie.

Rule 4: Semantic HTML & Shared Context
Semantiek: Gebruik de juiste tags (<article>, <nav>, <aside>).

Shared State: Gebruik Nano Stores in plaats van zware React Context voor state-management tussen verschillende Astro Islands.

IV. Animatie & Visuele Flow
Gebruik de Astro View Transitions API voor een "Native App" gevoel.

Morphing: Geef elementen een transition:name om ze vloeiend tussen pagina's te laten bewegen.

Scroll-Driven: Gebruik de native CSS animation-timeline voor scroll-animaties zonder JS-library overhead.