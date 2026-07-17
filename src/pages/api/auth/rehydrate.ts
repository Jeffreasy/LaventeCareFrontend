import type { APIRoute, AstroCookies } from 'astro';
import { applyCookiesToAstro } from '../../../lib/cookie-utils';
import { classifyRefreshResponse } from '../../../lib/refresh-policy';
import { requirePublicAPIURL, requirePublicTenantID } from '../../../lib/runtime-config';

export const prerender = false;

const REHYDRATE_GUARD_COOKIE = 'auth_rehydrate_attempt';

const REFRESH_COOKIE_PATHS = [
  '/api',
  '/api/auth',
  '/api/v1/auth',
  '/api/auth/refresh',
  '/api/v1/auth/refresh',
  '/',
];

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin';
  try {
    const parsed = new URL(value, 'https://local.invalid');
    if (parsed.origin !== 'https://local.invalid') return '/admin';
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return '/admin';
  }
}

function clearAuthCookies(cookies: AstroCookies): void {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('csrf_token', { path: '/' });
  cookies.delete('status', { path: '/' });
  cookies.delete(REHYDRATE_GUARD_COOKIE, { path: '/' });
  for (const path of REFRESH_COOKIE_PATHS) cookies.delete('refresh_token', { path });
}

function temporarilyUnavailable(): Response {
  return new Response('Authentication service temporarily unavailable', {
    status: 503,
    headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' },
  });
}

export const GET: APIRoute = async ({ cookies, request, url, redirect }) => {
  const refreshToken = cookies.get('refresh_token')?.value;
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
  let apiUrl: string;
  let tenantId: string;
  try {
    apiUrl = requirePublicAPIURL();
    tenantId = requirePublicTenantID();
  } catch {
    return temporarilyUnavailable();
  }

  if (!refreshToken) {
    clearAuthCookies(cookies);
    return redirect('/login?returnTo=' + encodeURIComponent(returnTo), 303);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl + '/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        Cookie: 'refresh_token=' + refreshToken,
        'X-Tenant-ID': tenantId,
        'User-Agent': request.headers.get('user-agent') || 'LaventeCare-BFF',
      },
    });
  } catch {
    return temporarilyUnavailable();
  }

  const outcome = classifyRefreshResponse(response.status);
  if (outcome === 'unavailable') return temporarilyUnavailable();

  applyCookiesToAstro(response, cookies, import.meta.env.DEV);
  if (outcome === 'invalid') {
    clearAuthCookies(cookies);
    return redirect('/login?returnTo=' + encodeURIComponent(returnTo), 303);
  }

  cookies.set(REHYDRATE_GUARD_COOKIE, '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.env.DEV,
    maxAge: 60,
  });
  return redirect(returnTo, 303);
};
