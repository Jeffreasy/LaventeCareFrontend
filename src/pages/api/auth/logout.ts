import type { APIRoute, AstroCookies } from 'astro';
import { applyCookiesToAstro } from '../../../lib/cookie-utils';
import { requirePublicAPIURL, requirePublicTenantID } from '../../../lib/runtime-config';

export const prerender = false;

const REFRESH_COOKIE_PATHS = [
  '/api/auth',
  '/api',
  '/api/v1/auth',
  '/api/auth/refresh',
  '/api/v1/auth/refresh',
  '/',
];

function clearAuthCookies(cookies: AstroCookies): void {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('csrf_token', { path: '/' });
  cookies.delete('status', { path: '/' });
  cookies.delete('auth_rehydrate_attempt', { path: '/' });
  for (const path of REFRESH_COOKIE_PATHS) cookies.delete('refresh_token', { path });
}

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  try {
    const apiUrl = requirePublicAPIURL();
    const tenantId = requirePublicTenantID();
    const response = await fetch(apiUrl + '/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: request.headers.get('cookie') || '',
        'X-Tenant-ID': tenantId,
      },
    });
    applyCookiesToAstro(response, cookies, import.meta.env.DEV);
  } catch {
    // Local cleanup is authoritative; no fallback tenant or backend is attempted.
  }

  clearAuthCookies(cookies);
  return redirect('/', 303);
};
