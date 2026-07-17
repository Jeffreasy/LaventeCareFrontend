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
    copyright: `© ${new Date().getFullYear()} LaventeCare — Jeffrey Lavente | CoC 88162710 | Dronten, Netherlands`,
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
        'Systems that take work off your hands: custom platforms, AI automation and IoT monitoring — with security and maintainability designed in from the start.',
    },
    about: {
      title: 'About Jeffrey Lavente — Systems Engineer | LaventeCare',
      description:
        'Jeffrey Lavente: systems engineer with a background in intensive care. Builds complete digital systems from design to production.',
    },
    services: {
      title: 'Services — AI, IoT, Custom Platforms & Security | LaventeCare',
      description:
        'Five integrated services: AI automation, IoT monitoring, custom platforms, lead generation and security. One engineer, full ownership.',
    },
    pricing: {
      title: 'Pricing & Packages — Transparent Rates | LaventeCare',
      description:
        'Clear pricing with no hidden costs. Hourly rate €95, fixed packages available. Contact us for a custom quote.',
    },
    contact: {
      title: 'Contact — Schedule an Intake | LaventeCare',
      description:
        'Get in touch with Jeffrey Lavente. Schedule a free intake and discover where your business can immediately benefit.',
    },
    portfolio: {
      title: 'Portfolio — Proven Work in Production | LaventeCare',
      description:
        'View existing projects including De Koninklijke Loop, SmartCoolCare, C&F Bouw and Dustin Auto Garage, with their applied technologies and approach.',
    },
    terms: {
      title: 'Terms & Conditions | LaventeCare',
      description: 'Terms and conditions of LaventeCare — Jeffrey Lavente, CoC 88162710.',
    },
  },
} as const;

export type TranslationEN = typeof en;
