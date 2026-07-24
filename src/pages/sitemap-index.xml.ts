import type { APIRoute } from 'astro';

const DOMAINS = {
  nl: 'https://www.laventecare.nl',
  en: 'https://www.laventecare.com',
} as const;

export const GET: APIRoute = ({ locals }) => {
  const sitemapUrl = new URL('/sitemap.xml', DOMAINS[locals.locale]).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${sitemapUrl}</loc></sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
