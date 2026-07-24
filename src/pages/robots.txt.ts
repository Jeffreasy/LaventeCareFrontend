import type { APIRoute } from 'astro';

const DOMAINS = {
  nl: 'https://www.laventecare.nl',
  en: 'https://www.laventecare.com',
} as const;

export const GET: APIRoute = ({ locals }) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login

Sitemap: ${new URL('/sitemap.xml', DOMAINS[locals.locale]).href}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
