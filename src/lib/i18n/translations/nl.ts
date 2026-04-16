/**
 * i18n — Dutch (NL) translations
 *
 * All user-facing strings for the NL locale.
 */

export const nl = {
  // --- Site-wide ---
  site: {
    name: 'LaventeCare',
    domain: 'https://www.laventecare.nl',
    locale: 'nl_NL',
    htmlLang: 'nl',
    metaTitle: 'LaventeCare — AI Prompt Engineering, Web & IoT Solutions',
    metaDescription:
      'LaventeCare combineert AI prompt engineering met full-stack development en IoT-expertise. Custom AI-oplossingen, snelle webapplicaties en embedded systems. Dronten, Nederland.',
    copyright: '© 2026 LaventeCare — Jeffrey Lavente | KVK 88162710 | Dronten',
    skipLink: 'Naar inhoud',
  },

  // --- Navigation ---
  nav: {
    home: 'Home',
    about: 'Over',
    services: 'Diensten',
    portfolio: 'Portfolio',
    howWeWork: 'Werkwijze',
    pricing: 'Prijzen',
    contact: 'Contact',
    allServices: 'Alle Diensten',
    adminLogin: 'Admin Login',
  },

  // --- Services submenu ---
  services: {
    ai: 'AI & Prompt Engineering',
    iot: 'IoT & Hardware',
    platforms: 'Maatwerk Platformen',
    leads: 'Lead Generation',
    security: 'Security & Auth',
  },

  // --- Footer ---
  footer: {
    services: 'Diensten',
    company: 'Bedrijf',
    resources: 'Resources',
    aboutJeffrey: 'Over Jeffrey',
    termsLabel: 'Algemene Voorwaarden',
  },

  // --- Breadcrumbs ---
  breadcrumbs: {
    over: 'Over',
    diensten: 'Diensten',
    portfolio: 'Portfolio',
    werkwijze: 'Werkwijze',
    pricing: 'Prijzen',
    prijzen: 'Prijzen',
    contact: 'Contact',
    voorwaarden: 'Algemene Voorwaarden',
    'ai-prompt-engineering': 'AI & Prompt Engineering',
    'iot-hardware': 'IoT & Hardware',
    'maatwerk-platformen': 'Maatwerk Platformen',
    'lead-generation': 'Lead Generation',
    security: 'Security & Auth',
    'cf-bouw': 'C&F Bouw',
    'de-koninklijke-loop': 'De Koninklijke Loop',
    'dustin-auto-garage': 'Dustin Auto Garage',
    jeffdash: 'JeffDash',
    smartcoolcare: 'SmartCoolCare',
    tuinhub: 'TuinHub',
    'whisky-for-charity': 'Whisky for Charity',
  },

  // --- SEO defaults per page ---
  seo: {
    home: {
      title: 'LaventeCare — Maatwerkplatformen met Ingebouwde Beveiliging | Dronten',
      description:
        'Systemen die werk uit handen nemen: maatwerkplatformen, AI-automatisering en IoT-monitoring — met eigen beveiligingslaag en 99/100 PageSpeed.',
    },
    about: {
      title: 'Over Jeffrey Lavente — Systems Engineer | LaventeCare',
      description:
        'Jeffrey Lavente: systems engineer met achtergrond in NAH-zorg. Bouwt complete digitale systemen van ontwerp tot productie.',
    },
    services: {
      title: 'Diensten — AI, IoT, Maatwerk & Security | LaventeCare',
      description:
        'Vijf geïntegreerde diensten: AI-automatisering, IoT-monitoring, maatwerk platformen, lead generation en security. Eén engineer, volledig eigenaarschap.',
    },
    pricing: {
      title: 'Prijzen & Pakketten — Transparante Tarieven | LaventeCare',
      description:
        'Heldere tarieven zonder verborgen kosten. Uurtarief €95, vaste pakketten beschikbaar. Neem contact op voor een offerte op maat.',
    },
    contact: {
      title: 'Contact — Plan een Intake | LaventeCare',
      description:
        'Neem contact op met Jeffrey Lavente. Plan een vrijblijvende intake en ontdek waar uw bedrijf direct van kan profiteren.',
    },
    portfolio: {
      title: "Portfolio — Bewezen Werk in Productie | LaventeCare",
      description:
        "Bekijk realworld projecten: De Koninklijke Loop, SmartCoolCare, C&F Bouw, Dustin Auto Garage en meer. Verifieerbare Lighthouse scores.",
    },
    terms: {
      title: 'Algemene Voorwaarden | LaventeCare',
      description: 'Algemene voorwaarden van LaventeCare — Jeffrey Lavente, KVK 88162710.',
    },
  },
} as const;

export type TranslationNL = typeof nl;
