import type { APIRoute } from 'astro';
import { ROUTE_MAP, getAlternatePath } from '../lib/i18n';

const DOMAINS = {
  nl: 'https://www.laventecare.nl',
  en: 'https://www.laventecare.com',
} as const;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = ({ locals }) => {
  const locale = locals.locale;
  const alternateLocale = locale === 'nl' ? 'en' : 'nl';
  const paths = [...new Set(Object.values(ROUTE_MAP[locale]))].filter((path) => path !== '/login');

  const entries = paths
    .map((path) => {
      const alternatePath = getAlternatePath(path, locale);
      const alternateLink = alternatePath
        ? `
    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${escapeXml(
      new URL(alternatePath, DOMAINS[alternateLocale]).href
    )}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
      new URL(locale === 'nl' ? path : alternatePath, DOMAINS.nl).href
    )}" />`
        : '';

      return `  <url>
    <loc>${escapeXml(new URL(path, DOMAINS[locale]).href)}</loc>
    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(
      new URL(path, DOMAINS[locale]).href
    )}" />${alternateLink}
  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
