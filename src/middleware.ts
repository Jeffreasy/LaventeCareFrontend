/**
 * Astro middleware: host-based locale resolution and fail-closed route guards.
 *
 * Refresh tokens stay scoped to /api. Protected pages rehydrate through the
 * dedicated BFF route without exposing the long-lived token to page requests.
 */

import { defineMiddleware } from 'astro:middleware';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { localeFromHost } from './lib/i18n';
import { getPublicRuntimeConfig, type PublicRuntimeConfig } from './lib/runtime-config';
import { isDutchAdminHost } from './lib/request-security';
import { classifyVerificationError } from './lib/session-verification';

const REHYDRATE_GUARD_COOKIE = 'auth_rehydrate_attempt';
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksSource = '';

function getJWKS(apiUrl: string): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks || jwksSource !== apiUrl) {
    jwks = createRemoteJWKSet(new URL('/.well-known/jwks.json', apiUrl));
    jwksSource = apiUrl;
  }
  return jwks;
}

interface SessionClaims {
  role: string;
  tenantId: string;
}

type SessionVerification =
  { status: 'valid'; session: SessionClaims } | { status: 'missing' | 'invalid' | 'unavailable' };

async function verifySession(
  accessToken: string,
  config: PublicRuntimeConfig
): Promise<SessionVerification> {
  if (!config.apiUrl || !config.tenantId || !config.jwtIssuer) {
    return { status: 'unavailable' };
  }

  try {
    const { payload } = await jwtVerify(accessToken, getJWKS(config.apiUrl), {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      algorithms: ['RS256'],
      clockTolerance: 5,
    });

    if (
      payload.scope !== 'access' ||
      payload.tid !== config.tenantId ||
      typeof payload.role !== 'string'
    ) {
      return { status: 'invalid' };
    }

    return {
      status: 'valid',
      session: { role: payload.role, tenantId: payload.tid as string },
    };
  } catch (error) {
    return { status: classifyVerificationError(error) };
  }
}

function rehydrateRedirect(pathname: string, search: string): string {
  return '/api/auth/rehydrate?returnTo=' + encodeURIComponent(pathname + search);
}

function loginRedirect(pathname: string, search: string): string {
  return '/login?returnTo=' + encodeURIComponent(pathname + search);
}

function verifierUnavailable(): Response {
  return new Response('Authentication service temporarily unavailable', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'Retry-After': '30',
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host') || '';
  const pathname = context.url.pathname;
  const locale = localeFromHost(host);
  context.locals.locale = locale;

  const accessToken = context.cookies.get('access_token')?.value;
  const csrfToken =
    context.cookies.get('csrf_token')?.value || context.cookies.get('XSRF-TOKEN')?.value;
  const config = getPublicRuntimeConfig();
  const configAvailable = Boolean(config.apiUrl && config.tenantId && config.jwtIssuer);
  const verification: SessionVerification = !configAvailable
    ? { status: 'unavailable' }
    : accessToken
      ? await verifySession(accessToken, config)
      : { status: 'missing' };
  const session = verification.status === 'valid' ? verification.session : null;

  context.locals.isLoggedIn = session !== null;
  context.locals.isAdmin = session?.role === 'admin';
  context.locals.accessToken = session ? accessToken : undefined;
  context.locals.csrfToken = csrfToken;

  if (session && context.cookies.has(REHYDRATE_GUARD_COOKIE)) {
    context.cookies.delete(REHYDRATE_GUARD_COOKIE, { path: '/' });
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  if ((isAdminRoute || isDashboardRoute) && verification.status === 'unavailable') {
    return verifierUnavailable();
  }

  if (isAdminRoute) {
    if (!isDutchAdminHost(host)) return new Response('Not Found', { status: 404 });
    if (!session) {
      if (context.cookies.has(REHYDRATE_GUARD_COOKIE)) {
        context.cookies.delete(REHYDRATE_GUARD_COOKIE, { path: '/' });
        return context.redirect(loginRedirect(pathname, context.url.search), 303);
      }
      return context.redirect(rehydrateRedirect(pathname, context.url.search), 303);
    }
    if (session.role !== 'admin') return new Response('Forbidden', { status: 403 });
  }

  if (isDashboardRoute && !session) {
    if (context.cookies.has(REHYDRATE_GUARD_COOKIE)) {
      context.cookies.delete(REHYDRATE_GUARD_COOKIE, { path: '/' });
      return context.redirect(loginRedirect(pathname, context.url.search), 303);
    }
    return context.redirect(rehydrateRedirect(pathname, context.url.search), 303);
  }

  const nlToEn: Record<string, string> = {
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
    '/voorwaarden': '/terms',
  };
  const enToNl = Object.fromEntries(Object.entries(nlToEn).map(([nl, en]) => [en, nl]));

  if (locale === 'en' && nlToEn[pathname]) return context.redirect(nlToEn[pathname], 301);
  if (locale === 'nl' && enToNl[pathname]) return context.redirect(enToNl[pathname], 301);

  const legacyAliases: Record<string, { nl: string; en: string }> = {
    '/services/landing-pages': {
      nl: '/diensten/lead-generation',
      en: '/services/lead-generation',
    },
    '/services/webshops': {
      nl: '/diensten/maatwerk-platformen',
      en: '/services/custom-platforms',
    },
    '/services/custom-apps': {
      nl: '/diensten/maatwerk-platformen',
      en: '/services/custom-platforms',
    },
    '/platform': { nl: '/over', en: '/about' },
    '/security': { nl: '/diensten/security', en: '/services/security' },
    '/docs': { nl: '/', en: '/' },
  };
  const legacyTarget = legacyAliases[pathname]?.[locale];
  if (legacyTarget) return context.redirect(legacyTarget, 301);

  return next();
});
