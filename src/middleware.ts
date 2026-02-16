/**
 * Astro Middleware
 * 
 * Route protection and authentication guards.
 * Uses JWKS-based JWT validation for role extraction.
 */

import { defineMiddleware } from 'astro:middleware';
import { jwtVerify, createRemoteJWKSet } from 'jose';

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
        return (payload as any).role || null;
    } catch {
        // Token invalid, expired, or JWKS unreachable → fail secure
        return null;
    }
}

export const onRequest = defineMiddleware(async (context, next) => {
    const accessToken = context.cookies.get('access_token')?.value;
    const refreshToken = context.cookies.get('refresh_token')?.value;
    const csrfToken = context.cookies.get('csrf_token')?.value || context.cookies.get('XSRF-TOKEN')?.value;

    if (import.meta.env.DEV) {
        console.log(`[Middleware] ${context.request.method} ${context.url.pathname}`);
        console.log(`[Middleware] Cookies present: access=${!!accessToken}, refresh=${!!refreshToken}, csrf=${!!csrfToken}`);
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
        if (!refreshToken || !accessToken || role !== 'admin') {
            return context.redirect('/login');
        }
    }

    // Protect dashboard routes
    if (context.url.pathname.startsWith('/dashboard') && !refreshToken) {
        return context.redirect('/login');
    }

    return next();
});
