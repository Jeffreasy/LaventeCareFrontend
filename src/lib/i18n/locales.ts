/**
 * i18n — Locale definitions & domain-to-locale mapping
 */

export const LOCALES = ['nl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'nl';

/** Map incoming Host header → locale */
export const DOMAIN_LOCALE_MAP: Record<string, Locale> = {
  'www.laventecare.nl': 'nl',
  'laventecare.nl': 'nl',
  'www.laventecare.com': 'en',
  'laventecare.com': 'en',
  // Dev / preview — default NL
  localhost: 'nl',
};

/** Resolve locale from a Host header value */
export function localeFromHost(host: string): Locale {
  // Strip port for localhost:4321 etc.
  const cleanHost = host.split(':')[0];
  return DOMAIN_LOCALE_MAP[host] ?? DOMAIN_LOCALE_MAP[cleanHost] ?? DEFAULT_LOCALE;
}
