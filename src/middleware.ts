/**
 * Astro Middleware
 *
 * Route protection and authentication guards.
 * Uses JWKS-based JWT validation for role extraction.
 *
 * Also resolves locale from the Host header for i18n support.
 * .laventecare.nl → 'nl' | .laventecare.com → 'en'
 */

import { defineMiddleware } from 'astro:middleware';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { localeFromHost } from './lib/i18n';

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
    const { payload } = await jwtVerify(accessToken, getJWKS(), {
      issuer: 'https://laventecareauthsystems.onrender.com',
    });
    const p = payload as { role?: string };
    return p.role || null;
  } catch {
    // Token invalid, expired, or JWKS unreachable → fail secure
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  // --- i18n: Locale resolution from Host header ---
  const host = context.request.headers.get('host') || '';
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

  // Set auth state in locals for pages to use
  context.locals.isLoggedIn = !!refreshToken;
  context.locals.accessToken = accessToken;
  context.locals.csrfToken = csrfToken;

  // Decode JWT and extract role for RBAC
  let role: string | null = null;
  if (accessToken) {
    role = await decodeRole(accessToken);
    if (import.meta.env.DEV) {
      console.log(`[Middleware] JWT role: ${role || 'decode failed (fail secure)'}`);
    }
  }

  // isAdmin: only true if JWT role is 'admin' (weight 4 in backend RBAC)
  context.locals.isAdmin = role === 'admin';

  // Protect admin routes
  if (context.url.pathname.startsWith('/admin')) {
    // Admin is only accessible on .nl domain (security policy: NL-only admin)
    const isNLAdmin =
      host.includes('laventecare.nl') ||
      host.includes('localhost') ||
      host.includes('127.0.0.1');
    if (!isNLAdmin) {
      return new Response('Not Found', { status: 404 });
    }
    if (!refreshToken || !accessToken || role !== 'admin') {
      return context.redirect('/login');
    }
  }

  // Protect dashboard routes
  if (context.url.pathname.startsWith('/dashboard') && !refreshToken) {
    return context.redirect('/login');
  }

  // --- i18n: Cross-domain slug guards ---
  const locale = context.locals.locale;

  // .com visitors on NL-only slugs → redirect to EN equivalent
  if (locale === 'en') {
    const nlToEn: Record<string, string> = {
      '/over': '/about',
      '/diensten': '/services',
      '/diensten/ai-prompt-engineering': '/services/ai-prompt-engineering',
      '/diensten/iot-hardware': '/services/iot-hardware',
      '/diensten/maatwerk-platformen': '/services/custom-platforms',
      '/diensten/lead-generation': '/services/lead-generation',
      '/diensten/security': '/services/security',
      '/werkwijze': '/how-we-work',
      '/prijzen': '/pricing',
      '/voorwaarden': '/terms',
    };
    const enPath = nlToEn[context.url.pathname];
    if (enPath) {
      return context.redirect(enPath, 301);
    }
  }

  // .nl visitors on EN-only slugs → redirect to NL equivalent
  if (locale === 'nl') {
    const enToNl: Record<string, string> = {
      '/about': '/over',
      '/services': '/diensten',
      '/services/ai-prompt-engineering': '/diensten/ai-prompt-engineering',
      '/services/iot-hardware': '/diensten/iot-hardware',
      '/services/custom-platforms': '/diensten/maatwerk-platformen',
      '/services/lead-generation': '/diensten/lead-generation',
      '/services/security': '/diensten/security',
      '/how-we-work': '/werkwijze',
      '/terms': '/voorwaarden',
    };
    const nlPath = enToNl[context.url.pathname];
    if (nlPath) {
      return context.redirect(nlPath, 301);
    }
  }

  return next();
});
