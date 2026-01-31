import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

    console.log('[Proxy] ===== LOGIN REQUEST START =====');
    console.log('[Proxy] API_URL:', API_URL);
    console.log('[Proxy] TENANT_ID:', TENANT_ID);

    try {
        const data = await request.json();
        console.log('[Proxy] Request body received:', {
            email: data.email,
            passwordLength: data.password?.length || 0
        });

        const requestBody = JSON.stringify(data);
        console.log('[Proxy] Sending to backend...');

        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': TENANT_ID,  // Only required header
            },
            body: requestBody,
        });

        console.log(`[Proxy] Status: ${response.status}`);

        const responseText = await response.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { message: response.statusText };
        }

        // CRITICAL: Extract cookies using Node.js Fetch API method
        const headers = new Headers({ 'Content-Type': 'application/json' });

        // Node.js 18+ has getSetCookie() method
        let cookies: string[] = [];
        const rawResponseHeaders = response.headers as any;

        if (typeof rawResponseHeaders.getSetCookie === 'function') {
            cookies = rawResponseHeaders.getSetCookie();
            console.log(`[Proxy] Using getSetCookie(), found ${cookies.length}`);
        } else {
            console.warn('[Proxy] getSetCookie() not found! Node version might be too old.');
            const rawHeader = response.headers.get('set-cookie');
            if (rawHeader) {
                console.log(`[Proxy] Fallback: Found raw 'set-cookie' header (length: ${rawHeader.length})`);
                // Warning: This might be a merged string. Without a parser we can't split safely.
                // We wrap it in array to allow attempts, but this is suboptimal.
                cookies = [rawHeader];
            } else {
                console.warn('[Proxy] No set-cookie header found in fallback mode.');
            }
        }

        console.log(`[Proxy] Processing ${cookies.length} cookies...`);

        cookies.forEach((cookie: string) => {
            // ATOMIC RECONSTRUCTION STRATEGY
            // Instead of regex patching, we parse and rebuild the cookie to guarantee validity.

            // 1. Extract Name=Value (First part)
            const parts = cookie.split(';');
            const nameValue = parts[0];

            // 2. Extract Max-Age (Persistence)
            let maxAgeMatch = cookie.match(/Max-Age=([^;]+)/i);
            let maxAgeAttr = maxAgeMatch ? `; Max-Age=${maxAgeMatch[1]}` : '';

            // 3. Construct Clean Cookie for Localhost
            // - No Secure (HTTP)
            // - No Partitioned (CHIPS conflict)
            // - SameSite=Lax (Best for top-level navigation + AJAX)
            // - Path=/ (Universal)
            // - HttpOnly (CONDITIONAL: False for csrf_token)

            const isCsrf = nameValue.trim().startsWith('csrf_token=');
            const httpOnlyAttr = isCsrf ? '' : '; HttpOnly';

            const newCookie = `${nameValue}; Path=/${httpOnlyAttr}; SameSite=Lax${maxAgeAttr}`;

            console.log(`[Proxy] Rebuilt Cookie: ${nameValue.substring(0, 20)}... | Attributes: P=/${httpOnlyAttr}; SS=Lax${maxAgeAttr}`);
            headers.append('Set-Cookie', newCookie);
        });

        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers,
        });

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return new Response(JSON.stringify({
            message: 'Proxy Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
