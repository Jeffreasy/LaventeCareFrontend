/**
 * i18n — Type-safe translation accessor
 *
 * Usage:
 *   import { t } from '../lib/i18n/t';
 *   const label = t(locale, 'nav.home');
 */

import type { Locale } from './locales';
import { nl } from './translations/nl';
import { en } from './translations/en';

const translations = { nl, en } as const;

type Translations = typeof nl;

/** Dot-notation path type for nested object */
type DotPath<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? Prefix extends ''
          ? DotPath<T[K], K>
          : DotPath<T[K], `${Prefix}.${K}`>
        : never;
    }[keyof T]
  : Prefix;

export type TranslationKey = DotPath<Translations>;

/** Resolve a dot-notation path on an object */
function resolvePath(obj: unknown, path: string): string {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string;
}

/**
 * Get a translated string by locale and dot-notation key.
 * Falls back to NL if key is missing in EN.
 */
export function t(locale: Locale, key: string): string {
  const dict = translations[locale];
  const result = resolvePath(dict, key);
  if (result !== undefined) return result;

  // Fallback to NL
  const fallback = resolvePath(translations.nl, key);
  return fallback ?? key;
}

/** Get the full translation object for a locale */
export function getTranslations(locale: Locale) {
  return translations[locale];
}
