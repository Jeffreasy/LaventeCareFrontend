import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // Clear cookies by setting them to expire immediately
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('status', { path: '/' }); // Sometimes used for client-side checks

    // Redirect to home page
    return redirect('/');
};
