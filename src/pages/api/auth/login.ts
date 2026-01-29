import type { APIRoute } from 'astro';

// Force dynamic mode for this endpoint (fixes "POST not available in static endpoints" error)
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const APP_KEY = import.meta.env.PUBLIC_APP_KEY;
    const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

    console.log('[Proxy] Starting login request');
    console.log(`[Proxy] Target: ${API_URL}/api/v1/auth/login`);

    try {
        // Safe request body parsing
        let data;
        try {
            data = await request.json();
        } catch (e) {
            console.error('[Proxy] Failed to parse client request JSON:', e);
            return new Response(JSON.stringify({ message: 'Invalid JSON body in request' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Public-Key': APP_KEY,
                'X-Tenant-ID': TENANT_ID,
                'Origin': 'http://localhost:4321', // Emulate allowed origin
            },
            body: JSON.stringify(data),
        });

        console.log(`[Proxy] Upstream Status: ${response.status}`);

        const responseText = await response.text();
        let responseData;

        // Attempt parsing only if there is content
        if (responseText && responseText.trim().length > 0) {
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.warn('[Proxy] Response was not JSON:', responseText);
                responseData = { message: response.statusText, raw: responseText };
            }
        } else {
            // Empty body (common for 401/404/204)
            responseData = { message: response.statusText || 'No detailed error message from server' };
        }

        // Forward the Set-Cookie header if present
        const setCookie = response.headers.get('set-cookie');
        const headers = new Headers({
            'Content-Type': 'application/json',
        });

        if (setCookie) {
            headers.append('Set-Cookie', setCookie);
        }

        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers: headers,
        });

    } catch (error) {
        console.error('[Proxy] Internal Error:', error);
        return new Response(JSON.stringify({
            message: 'Internal Proxy Error',
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
