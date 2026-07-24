/**
 * i18n — English (EN) translations
 *
 * All user-facing strings for the EN locale.
 */

export const en = {
  // --- Site-wide ---
  site: {
    name: 'LaventeCare',
    domain: 'https://www.laventecare.com',
    locale: 'en_US',
    htmlLang: 'en',
    metaTitle: 'Software and systems for SMEs — from idea to working system',
    metaDescription:
      'LaventeCare builds software and systems that make businesses more efficient, prevent errors and accelerate growth: AI, IoT, custom platforms, winning customers and security from the ground up.',
    copyright: '© 2026 LaventeCare — Jeffrey Lavente | CoC 88162710 | Dronten, Netherlands',
    skipLink: 'Skip to content',
  },

  // --- Navigation ---
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    portfolio: 'Portfolio',
    howWeWork: 'How We Work',
    pricing: 'Pricing',
    contact: 'Contact',
    allServices: 'All Services',
    adminLogin: 'Admin Login',
  },

  // --- Services submenu ---
  services: {
    websites: 'Website Development',
    consultancy: 'IT Advice & Consultancy',
    ai: 'AI & Automation',
    iot: 'IoT & Hardware',
    platforms: 'Custom Platforms',
    leads: 'Win customers',
    security: 'Security & Access',
  },

  // --- Footer ---
  footer: {
    services: 'Services',
    company: 'Company',
    resources: 'More',
    aboutJeffrey: 'About Jeffrey',
    termsLabel: 'Terms & Conditions',
  },

  // --- Breadcrumbs ---
  breadcrumbs: {
    about: 'About',
    services: 'Services',
    portfolio: 'Portfolio',
    'how-we-work': 'How We Work',
    pricing: 'Pricing',
    contact: 'Contact',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Statement',
    'website-care': 'Website Care',
    websites: 'Website Development',
    consultancy: 'IT Advice & Consultancy',
    'ai-prompt-engineering': 'AI & Automation',
    'iot-hardware': 'IoT & Hardware',
    'custom-platforms': 'Custom Platforms',
    'lead-generation': 'Win customers',
    security: 'Security & Access',
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
      title: 'LaventeCare — Custom Systems Built for Your Business | Netherlands',
      description:
        'Systems that take work off your hands: custom platforms, AI automation and IoT monitoring — with a lightweight technical foundation and security designed in.',
    },
    about: {
      title: 'About Jeffrey Lavente — Systems Engineer | LaventeCare',
      description:
        'Jeffrey Lavente: systems engineer with a background in intensive care. Builds complete digital systems from design to production.',
    },
    services: {
      title: 'Services — Websites, AI, IoT, Custom Platforms & Security | LaventeCare',
      description:
        'From professional website to working system: fixed website packages, consultancy, AI, IoT, custom platforms, customer acquisition and security.',
    },
    pricing: {
      title: 'Pricing & Packages — Transparent Rates | LaventeCare',
      description:
        'Website packages from €750, advice at €95 per hour and fixed milestone pricing for custom systems. Clear scope with no hidden costs.',
    },
    contact: {
      title: 'Contact — Schedule an Intake | LaventeCare',
      description:
        'Get in touch with Jeffrey Lavente. Schedule a free intake and discover where your business can immediately benefit.',
    },
    portfolio: {
      title: 'Portfolio — Proven Work in Production | LaventeCare',
      description:
        'View practical projects such as De Koninklijke Loop, SmartCoolCare, C&F Bouw and Dustin Auto Garage, with clear context on the work delivered.',
    },
    terms: {
      title: 'Terms & Conditions | LaventeCare',
      description: 'Terms and conditions of LaventeCare — Jeffrey Lavente, CoC 88162710.',
    },
  },
} as const;

export type TranslationEN = typeof en;
