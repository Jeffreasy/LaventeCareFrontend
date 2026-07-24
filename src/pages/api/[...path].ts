import type { APIRoute } from 'astro';
import { applyCookiesToAstro } from '../../lib/cookie-utils';

export const prerender = false;

// Universal Proxy for Backend Integration (BFF Pattern)
// Handles all /api/* requests not caught by specific routes.
// Forwards cookies and requests to the remote backend.
// Sanitizes response cookies (Set-Cookie) for localhost/HTTP compatibility.

export const ALL: APIRoute = async ({ request, params, url, cookies }) => {
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const path = params.path; // e.g., "v1/admin/mail-config"

  if (!path || !API_URL) {
    return new Response(JSON.stringify({ error: 'Proxy Configuration Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  if (!/^v1\/[a-zA-Z0-9/_-]+$/.test(path)) {
    return new Response(JSON.stringify({ error: 'Invalid API path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // Construct Target URL
  const targetUrl = `${API_URL}/api/${path}${url.search}`;

  // Debug Log (Development only)
  if (import.meta.env.DEV) {
    console.log(`[Universal Proxy] ${request.method} ${url.pathname} -> ${targetUrl}`);
    const c = request.headers.get('cookie');
    const csrf = request.headers.get('x-csrf-token');
    console.log(`[Universal Proxy] In Cookies: ${c ? 'Present' : 'Missing'} (${c?.length} chars)`);
    console.log(`[Universal Proxy] In CSRF Header: ${csrf ? 'Present' : 'Missing'}`);
    console.log(`[Universal Proxy] In Tenant Header: ${request.headers.get('x-tenant-id')}`);
  }

  // Clone Headers (Filter Host to avoid SNI issues)
  const reqHeaders = new Headers(request.headers);
  reqHeaders.delete('host');
  reqHeaders.delete('connection');
  reqHeaders.delete('content-length'); // Let fetch calculate it
  reqHeaders.delete('x-forwarded-host');
  reqHeaders.delete('x-forwarded-proto');
  if (!reqHeaders.has('x-tenant-id') && import.meta.env.PUBLIC_TENANT_ID) {
    reqHeaders.set('x-tenant-id', import.meta.env.PUBLIC_TENANT_ID);
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: reqHeaders,
      redirect: 'manual', // Don't follow redirects, pass them to browser
    };

    // Forward Body (except for GET/HEAD)
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.arrayBuffer();
      if (body.byteLength > 1_000_000) {
        return new Response(JSON.stringify({ error: 'Request too large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
      if (body.byteLength > 0) {
        fetchOptions.body = body;
      }
    }

    // Execute Proxy Request
    const backendResponse = await fetch(targetUrl, fetchOptions);

    // Process Response Attributes
    const resHeaders = new Headers(backendResponse.headers);

    // Use shared cookie sanitization
    applyCookiesToAstro(backendResponse, cookies, import.meta.env.DEV);
    resHeaders.delete('set-cookie');

    // Fix: content-encoding mismatch (ERR_CONTENT_DECODING_FAILED)
    resHeaders.delete('content-encoding');
    resHeaders.delete('content-length');
    resHeaders.delete('transfer-encoding');
    resHeaders.set('Cache-Control', 'no-store');

    // Return Proxied Response
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: resHeaders,
    });
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Universal Proxy] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable. Please try again later.',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      }
    );
  }
};
