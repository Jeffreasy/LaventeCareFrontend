import type { APIRoute } from 'astro';

export const prerender = false;

// Universal Proxy for Backend Integration (BFF Pattern)
// Handles all /api/* requests not caught by specific routes.
// Forwards cookies and requests to the remote backend.
// Sanitizes response cookies (Set-Cookie) for localhost/HTTP compatibility.

export const ALL: APIRoute = async ({ request, params, url }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const path = params.path; // e.g., "v1/admin/mail-config"

    if (!path || !API_URL) {
        return new Response(JSON.stringify({ error: 'Proxy Configuration Error' }), { status: 500 });
    }

    // Construct Target URL
    // Backend expects /api/v1/..., and path usually starts with v1/
    // We assume the file is at src/pages/api/[...path].ts
    const targetUrl = `${API_URL}/api/${path}${url.search}`;

    // Debug Log (Development only)
    if (import.meta.env.DEV) {
        console.log(`[Universal Proxy] ${request.method} ${url.pathname} -> ${targetUrl}`);
        const c = request.headers.get('cookie');
        const csrf = request.headers.get('x-csrf-token');
        console.log(`[Universal Proxy] In Cookies: ${c ? 'Present' : 'Missing'} (${c?.length} chars)`);
        console.log(`[Universal Proxy] In CSRF Header: ${csrf ? 'Present' : 'Missing'} (${csrf})`);
    }

    // Clone Headers (Filter Host to avoid SNI issues)
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    reqHeaders.delete('connection');
    reqHeaders.delete('content-length'); // Let fetch calculate it

    try {
        const fetchOptions: RequestInit = {
            method: request.method,
            headers: reqHeaders,
            redirect: 'manual', // Don't follow redirects, pass them to browser
        };

        // Forward Body (except for GET/HEAD)
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const body = await request.arrayBuffer();
            if (body.byteLength > 0) {
                fetchOptions.body = body;
            }
        }

        // Execute Proxy Request
        const backendResponse = await fetch(targetUrl, fetchOptions);

        // Process Response Attributes
        const resHeaders = new Headers(backendResponse.headers);

        // ATOMIC COOKIE RECONSTRUCTION (Copy from login.ts Fix)
        // Ensures backend cookies are stripped of 'Secure', 'Partitioned' and 'Domain' for Localhost
        const rawRes = backendResponse as any;
        let cookies: string[] = [];

        // Node 18+ support
        if (typeof rawRes.headers.getSetCookie === 'function') {
            cookies = rawRes.headers.getSetCookie();
        } else {
            const c = backendResponse.headers.get('set-cookie');
            if (c) cookies = [c];
        }

        if (cookies.length > 0) {
            resHeaders.delete('set-cookie'); // Clear originals

            cookies.forEach(cookie => {
                // Parse Name=Value
                const parts = cookie.split(';');
                const nameValue = parts[0];

                // Preserve Max-Age if present
                let maxAgeMatch = cookie.match(/Max-Age=([^;]+)/i);
                let maxAgeAttr = maxAgeMatch ? `; Max-Age=${maxAgeMatch[1]}` : '';

                // Rebuild Safe Cookie
                // csrf_token MUST be accessible to JS (not HttpOnly)
                const isCsrf = nameValue.trim().startsWith('csrf_token=');
                const httpOnlyAttr = isCsrf ? '' : '; HttpOnly';

                const newCookie = `${nameValue}; Path=/${httpOnlyAttr}; SameSite=Lax${maxAgeAttr}`;

                if (import.meta.env.DEV) {
                    console.log(`[Universal Proxy] Rebuilt Cookie: ${nameValue.substring(0, 20)}...`);
                }

                resHeaders.append('set-cookie', newCookie);
            });
        }

        // Fix: content-encoding mismatch (ERR_CONTENT_DECODING_FAILED)
        // Fetch decodes automatically, but headers might claim it is still gzipped
        resHeaders.delete('content-encoding');
        resHeaders.delete('content-length');
        resHeaders.delete('transfer-encoding');

        // Return Proxied Response
        return new Response(backendResponse.body, {
            status: backendResponse.status,
            headers: resHeaders
        });

    } catch (error) {
        console.error('[Universal Proxy] Error:', error);
        return new Response(JSON.stringify({
            error: 'Universal Proxy Gateway Error',
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
