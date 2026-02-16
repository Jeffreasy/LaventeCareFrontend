import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;

    // Attempt backend session invalidation (best-effort)
    try {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
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
    return redirect('/');
};
