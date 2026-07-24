/**
 * Astro Middleware
 *
 * Route protection and authentication guards.
 * Uses JWKS-based JWT validation for role extraction.
 *
 * Also resolves locale from the Host header for i18n support.
 * .laventecare.nl → 'nl' | .laventecare.com → 'en'
 */

import type { APIContext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getAlternatePath, localeFromHost } from './lib/i18n';
import { applyCookiesToAstro } from './lib/cookie-utils';

// Lazy-init JWKS client (cached by jose internally)
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    const apiUrl = import.meta.env.PUBLIC_API_URL;
    jwks = createRemoteJWKSet(new URL('/.well-known/jwks.json', apiUrl));
  }
  return jwks;
}

/** Decode access_token and extract role claim. Returns null on any failure (fail secure). */
async function decodeRole(accessToken: string): Promise<string | null> {
  try {
    const issuer = import.meta.env.JWT_ISSUER || new URL(import.meta.env.PUBLIC_API_URL).origin;
    const audience = import.meta.env.JWT_AUDIENCE;
    const { payload } = await jwtVerify(accessToken, getJWKS(), {
      issuer,
      ...(audience ? { audience } : {}),
    });
    const p = payload as { role?: string };
    return p.role || null;
  } catch {
    // Token invalid, expired, or JWKS unreachable → fail secure
    return null;
  }
}

interface RefreshResult {
  accessToken: string;
  role: string | null;
}

/** Silent Session Rehydration (Server-Side Refresh) using Astro's cookie manager */
async function serverSideRefresh(
  context: APIContext,
  refreshToken: string
): Promise<RefreshResult | null> {
  const apiUrl = import.meta.env.PUBLIC_API_URL;
  const tenantId = import.meta.env.PUBLIC_TENANT_ID;

  if (!apiUrl || !tenantId) {
    console.error('[Middleware] Silent Refresh: Missing PUBLIC_API_URL or PUBLIC_TENANT_ID');
    return null;
  }

  try {
    const targetUrl = `${apiUrl}/api/v1/auth/refresh`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.warn(`[Middleware] Silent Refresh failed with status: ${response.status}`);
      }
      return null;
    }

    // Apply the Set-Cookie headers from the backend to Astro's cookie manager
    applyCookiesToAstro(response, context.cookies, import.meta.env.DEV);

    // Get the new access token set in the cookie manager
    const newAccessToken = context.cookies.get('access_token')?.value;
    if (!newAccessToken) {
      if (import.meta.env.DEV) {
        console.warn(
          '[Middleware] Silent Refresh succeeded but no access_token found in response cookies'
        );
      }
      return null;
    }

    const role = await decodeRole(newAccessToken);
    return { accessToken: newAccessToken, role };
  } catch (error) {
    console.error('[Middleware] Silent Refresh exception:', error);
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  // --- i18n: Locale resolution from Host header ---
  const forwardedHost = context.request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || context.request.headers.get('host') || '';
  context.locals.locale = localeFromHost(host);

  const accessToken = context.cookies.get('access_token')?.value;
  const refreshToken = context.cookies.get('refresh_token')?.value;
  const csrfToken =
    context.cookies.get('csrf_token')?.value || context.cookies.get('XSRF-TOKEN')?.value;

  if (import.meta.env.DEV) {
    console.log(`[Middleware] ${context.request.method} ${context.url.pathname}`);
    console.log(
      `[Middleware] Cookies present: access=${!!accessToken}, refresh=${!!refreshToken}, csrf=${!!csrfToken}`
    );
  }

  // Set initial auth state in locals for pages to use
  context.locals.isLoggedIn = false;
  context.locals.accessToken = accessToken;
  context.locals.csrfToken = csrfToken;

  let activeAccessToken = accessToken;
  let role: string | null = null;

  if (activeAccessToken) {
    role = await decodeRole(activeAccessToken);
    if (import.meta.env.DEV) {
      console.log(`[Middleware] JWT role: ${role || 'decode failed (fail secure)'}`);
    }
  }

  // --- Silent Session Rehydration (Server-Side Refresh) ---
  // If the access token is missing or invalid, but we have a refresh token,
  // attempt to refresh the session on the server side.
  if ((!activeAccessToken || !role) && refreshToken) {
    if (import.meta.env.DEV) {
      console.log(
        `[Middleware] Access token missing or invalid, but refresh token present. Attempting silent refresh...`
      );
    }
    const refreshed = await serverSideRefresh(context, refreshToken);
    if (refreshed) {
      activeAccessToken = refreshed.accessToken;
      role = refreshed.role;
      context.locals.isLoggedIn = true;
      context.locals.accessToken = activeAccessToken;
      context.locals.csrfToken =
        context.cookies.get('csrf_token')?.value || context.cookies.get('XSRF-TOKEN')?.value;
      if (import.meta.env.DEV) {
        console.log(`[Middleware] Silent refresh successful. New role: ${role}`);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log(`[Middleware] Silent refresh failed. Clearing cookies.`);
      }
      context.cookies.delete('access_token', { path: '/' });
      context.cookies.delete('refresh_token', { path: '/api/v1/auth' });
      context.cookies.delete('refresh_token', { path: '/api/auth' });
      context.locals.isLoggedIn = false;
      context.locals.accessToken = undefined;
      role = null;
    }
  }

  context.locals.isLoggedIn = Boolean(activeAccessToken && role);

  // isAdmin: only true if JWT role is 'admin' (weight 4 in backend RBAC)
  context.locals.isAdmin = role === 'admin';

  // Protect admin routes
  if (context.url.pathname.startsWith('/admin')) {
    // Admin is only accessible on .nl domain (security policy: NL-only admin)
    const isNLAdmin =
      host.includes('laventecare.nl') || host.includes('localhost') || host.includes('127.0.0.1');
    if (!isNLAdmin) {
      return new Response('Not Found', { status: 404 });
    }
    if (!refreshToken || !activeAccessToken || role !== 'admin') {
      return context.redirect('/login');
    }
  }

  // Protect dashboard routes
  if (context.url.pathname.startsWith('/dashboard') && !refreshToken) {
    return context.redirect('/login');
  }

  // --- i18n: Cross-domain slug guards ---
  const locale = context.locals.locale;

  const sourceLocale = locale === 'en' ? 'nl' : 'en';
  const localizedPath = getAlternatePath(context.url.pathname, sourceLocale);
  if (localizedPath && localizedPath !== context.url.pathname) {
    return context.redirect(localizedPath, 301);
  }

  const response = await next();
  if (
    context.url.pathname.startsWith('/admin') ||
    context.url.pathname.startsWith('/login') ||
    context.url.pathname.startsWith('/api/')
  ) {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
});
