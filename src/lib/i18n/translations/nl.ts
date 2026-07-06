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
    metaTitle: 'Software en systemen voor het mkb — van idee tot werkend systeem',
    metaDescription:
      'LaventeCare bouwt software en systemen die bedrijven efficiënter maken, fouten voorkomen en groei versnellen: AI, IoT, maatwerkplatformen, klanten werven en beveiliging vanaf de basis.',
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
    consultancy: 'IT Advies & Consultancy',
    ai: 'AI & Automatisering',
    iot: 'IoT & Hardware',
    platforms: 'Maatwerk Platformen',
    leads: 'Klanten werven',
    security: 'Beveiliging & Toegang',
  },

  // --- Footer ---
  footer: {
    services: 'Diensten',
    company: 'Bedrijf',
    resources: 'Meer',
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
    consultancy: 'IT Advies & Consultancy',
    'ai-prompt-engineering': 'AI & Automatisering',
    'iot-hardware': 'IoT & Hardware',
    'maatwerk-platformen': 'Maatwerk Platformen',
    'lead-generation': 'Klanten werven',
    security: 'Beveiliging & Toegang',
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
