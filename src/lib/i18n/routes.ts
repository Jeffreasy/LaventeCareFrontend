/**
 * i18n — Route mapping between NL and EN slugs
 *
 * Used by middleware, SEO component (hreflang) and navbar.
 */

import type { Locale } from './locales';

export const ROUTE_MAP = {
  nl: {
    home: '/',
    over: '/over',
    diensten: '/diensten',
    'diensten/consultancy': '/diensten/consultancy',
    'diensten/ai-prompt-engineering': '/diensten/ai-prompt-engineering',
    'diensten/iot-hardware': '/diensten/iot-hardware',
    'diensten/maatwerk-platformen': '/diensten/maatwerk-platformen',
    'diensten/lead-generation': '/diensten/lead-generation',
    'diensten/security': '/diensten/security',
    werkwijze: '/werkwijze',
    prijzen: '/prijzen',
    contact: '/contact',
    portfolio: '/portfolio',
    'portfolio/de-koninklijke-loop': '/portfolio/de-koninklijke-loop',
    'portfolio/smartcoolcare': '/portfolio/smartcoolcare',
    'portfolio/cf-bouw': '/portfolio/cf-bouw',
    'portfolio/dustin-auto-garage': '/portfolio/dustin-auto-garage',
    'portfolio/jeffdash': '/portfolio/jeffdash',
    'portfolio/tuinhub': '/portfolio/tuinhub',
    'portfolio/whisky-for-charity': '/portfolio/whisky-for-charity',
    voorwaarden: '/voorwaarden',
    login: '/login',
  },
  en: {
    home: '/',
    about: '/about',
    services: '/services',
    'services/consultancy': '/services/consultancy',
    'services/ai-prompt-engineering': '/services/ai-prompt-engineering',
    'services/iot-hardware': '/services/iot-hardware',
    'services/custom-platforms': '/services/custom-platforms',
    'services/lead-generation': '/services/lead-generation',
    'services/security': '/services/security',
    'how-we-work': '/how-we-work',
    pricing: '/pricing',
    contact: '/contact',
    portfolio: '/portfolio',
    'portfolio/de-koninklijke-loop': '/portfolio/de-koninklijke-loop',
    'portfolio/smartcoolcare': '/portfolio/smartcoolcare',
    'portfolio/cf-bouw': '/portfolio/cf-bouw',
    'portfolio/dustin-auto-garage': '/portfolio/dustin-auto-garage',
    'portfolio/jeffdash': '/portfolio/jeffdash',
    'portfolio/tuinhub': '/portfolio/tuinhub',
    'portfolio/whisky-for-charity': '/portfolio/whisky-for-charity',
    terms: '/terms',
    login: '/login',
  },
} as const;

export type NLRouteKey = keyof (typeof ROUTE_MAP)['nl'];
export type ENRouteKey = keyof (typeof ROUTE_MAP)['en'];

/** NL slug → EN slug (for hreflang alternate) */
const NL_TO_EN_PATH: Record<string, string> = {
  '/': '/',
  '/over': '/about',
  '/diensten': '/services',
  '/diensten/consultancy': '/services/consultancy',
  '/diensten/ai-prompt-engineering': '/services/ai-prompt-engineering',
  '/diensten/iot-hardware': '/services/iot-hardware',
  '/diensten/maatwerk-platformen': '/services/custom-platforms',
  '/diensten/lead-generation': '/services/lead-generation',
  '/diensten/security': '/services/security',
  '/werkwijze': '/how-we-work',
  '/prijzen': '/pricing',
  '/contact': '/contact',
  '/portfolio': '/portfolio',
  '/portfolio/de-koninklijke-loop': '/portfolio/de-koninklijke-loop',
  '/portfolio/smartcoolcare': '/portfolio/smartcoolcare',
  '/portfolio/cf-bouw': '/portfolio/cf-bouw',
  '/portfolio/dustin-auto-garage': '/portfolio/dustin-auto-garage',
  '/portfolio/jeffdash': '/portfolio/jeffdash',
  '/portfolio/tuinhub': '/portfolio/tuinhub',
  '/portfolio/whisky-for-charity': '/portfolio/whisky-for-charity',
  '/voorwaarden': '/terms',
};

/** EN slug → NL slug */
const EN_TO_NL_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(NL_TO_EN_PATH).map(([nl, en]) => [en, nl])
);

/**
 * Given the current pathname and locale, return the alternate-language path.
 * Returns null if no mapping exists (e.g. admin, api routes).
 */
export function getAlternatePath(pathname: string, currentLocale: Locale): string | null {
  if (currentLocale === 'nl') {
    return NL_TO_EN_PATH[pathname] ?? null;
  }
  return EN_TO_NL_PATH[pathname] ?? null;
}
