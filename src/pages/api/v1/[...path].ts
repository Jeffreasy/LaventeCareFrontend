import type { APIRoute } from 'astro';
import { Buffer } from 'buffer';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;
const ENV_TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

/**
 * Helper: Extract Tenant ID from JWT
 * Robust fallback for when .env doesn't match the user's actual token tenant
 */
function getTenantFromToken(token: string): string | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.tid || null;
    } catch (e) {
        return null;
    }
}

/**
 * Universal Proxy Handler for /api/v1 routes
 * Forwards requests to the backend while maintaining auth cookies
 */
const proxyHandler: APIRoute = async ({ request, params, cookies }) => {
    const path = params.path;
    const targetUrl = `${API_URL}/api/v1/${path}`;

    console.log(`[Proxy] Forwarding ${request.method} ${path} to ${targetUrl}`);

    try {
        // 1. Prepare Headers
        const headers = new Headers();

        // Forward auth cookies (access_token, refresh_token)
        // We reconstruct the Cookie header from Astro cookies
        const cookieHeaderParts: string[] = [];
        const accessToken = cookies.get('access_token')?.value;
        const refreshToken = cookies.get('refresh_token')?.value;

        if (accessToken) cookieHeaderParts.push(`access_token=${accessToken}`);
        if (refreshToken) cookieHeaderParts.push(`refresh_token=${refreshToken}`);

        if (cookieHeaderParts.length > 0) {
            headers.set('Cookie', cookieHeaderParts.join('; '));
        }

        // Determine correct Tenant ID (Token wins over Env)
        let tenantId = ENV_TENANT_ID;
        if (accessToken) {
            const tokenTenant = getTenantFromToken(accessToken);
            if (tokenTenant && tokenTenant !== tenantId) {
                console.log(`[Proxy] Tenant Context Switch: .env(${tenantId}) -> Token(${tokenTenant})`);
                tenantId = tokenTenant;
            }
        }

        // Forward strict headers
        headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
        headers.set('X-Tenant-ID', tenantId);

        // Forward CSRF token if present
        const csrfToken = request.headers.get('X-CSRF-Token');
        if (csrfToken) {
            headers.set('X-CSRF-Token', csrfToken);
        }

        // 2. Prepare Body (if applicable)
        let body: any = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const safeBody = await request.clone().text(); // Clone to prevent stream lock
            if (safeBody) {
                body = safeBody;
            }
        }

        // Debug: Log detailed outgoing headers
        console.log('[Proxy] Outgoing Cookies:', headers.get('Cookie') || 'NONE');
        console.log('[Proxy] Outgoing Tenant:', headers.get('X-Tenant-ID'));

        // 3. Execute Request
        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body
        });

        console.log(`[Proxy] Backend responded with ${response.status} ${response.statusText}`);

        // 4. Handle Response Headers
        const responseHeaders = new Headers(response.headers);

        // CRITICAL FIX: Strip Content-Encoding and Content-Length
        // fetch() typically decodes the body, so forwarding 'gzip' header causes decoding errors in browser
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');

        // Debug: Log error body for 403/500
        if (!response.ok) {
            try {
                const errorClone = response.clone();
                const errorText = await errorClone.text();
                console.log(`[Proxy] Error Body (${response.status}):`, errorText.substring(0, 500));
            } catch (e) {
                console.log('[Proxy] Could not read error body');
            }
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return new Response(JSON.stringify({ error: 'Proxy Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const ALL: APIRoute = proxyHandler;
