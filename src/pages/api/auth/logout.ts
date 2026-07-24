import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, redirect, url }) => {
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const refererOrigin = (() => {
    try {
      return referer ? new URL(referer).origin : '';
    } catch {
      return '';
    }
  })();

  if (import.meta.env.PROD && origin !== url.origin && refererOrigin !== url.origin) {
    return new Response('Forbidden', {
      status: 403,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Attempt backend session invalidation (best-effort)
  try {
    if (!API_URL) throw new Error('Missing API URL');
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });
  } catch {
    // Backend might be unreachable — proceed with client-side cleanup
  }

  // Clear all auth cookies by setting them to expire immediately
  cookies.delete('access_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });
  cookies.delete('csrf_token', { path: '/' });
  cookies.delete('status', { path: '/' });

  // Redirect to home page
  const response = redirect('/');
  response.headers.set('Cache-Control', 'no-store');
  return response;
};
