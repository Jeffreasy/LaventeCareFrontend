/**
 * Astro Middleware
 * 
 * Route protection and authentication guards
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    // Extract tokens from cookies (server can read HttpOnly cookies)
    const accessToken = context.cookies.get('access_token')?.value;
    const refreshToken = context.cookies.get('refresh_token')?.value;
    const csrfToken = context.cookies.get('csrf_token')?.value || context.cookies.get('XSRF-TOKEN')?.value;

    console.log(`[Middleware] ${context.request.method} ${context.url.pathname}`);
    console.log(`[Middleware] Cookies present: access=${!!accessToken}, refresh=${!!refreshToken}, csrf=${!!csrfToken}`);


    // Set auth state in locals for pages to use
    context.locals.isLoggedIn = !!refreshToken;
    context.locals.accessToken = accessToken;
    context.locals.csrfToken = csrfToken;

    // TODO: Decode JWT to get user role (requires JWT library)
    // For now, we'll assume logged in users are admins
    // In production, extract role from JWT claims
    context.locals.isAdmin = !!refreshToken;

    // Protect admin routes
    if (context.url.pathname.startsWith('/admin')) {
        if (!refreshToken) {
            return context.redirect('/login');
        }

        // TODO: Verify admin role from JWT
        // if (context.locals.userRole !== 'admin') {
        //   return new Response('Access Denied', { status: 403 });
        // }
    }

    // Protect dashboard routes
    if (context.url.pathname.startsWith('/dashboard') && !refreshToken) {
        return context.redirect('/login');
    }

    return next();
});
