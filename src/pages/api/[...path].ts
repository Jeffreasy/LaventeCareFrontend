import type { APIRoute } from 'astro';
import { applyCookiesToAstro } from '../../lib/cookie-utils';
import { buildProxyRequestHeaders, normalizeProxyPath } from '../../lib/request-security';
import { requirePublicAPIURL, requirePublicTenantID } from '../../lib/runtime-config';

export const prerender = false;

const MAX_PROXY_BODY_BYTES = 1_048_576;

class ProxyBodyTooLargeError extends Error {}

async function readLimitedBody(request: Request): Promise<ArrayBuffer | undefined> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PROXY_BODY_BYTES) {
    throw new ProxyBodyTooLargeError();
  }
  if (!request.body) return undefined;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PROXY_BODY_BYTES) {
        await reader.cancel();
        throw new ProxyBodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (total === 0) return undefined;
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
}

// Universal same-origin BFF for backend endpoints not handled by a specific route.
export const ALL: APIRoute = async ({ request, params, url, cookies }) => {
  const path = params.path;
  let apiUrl: string;
  let tenantId: string;
  try {
    apiUrl = requirePublicAPIURL();
    tenantId = requirePublicTenantID();
  } catch {
    return new Response(JSON.stringify({ error: 'Proxy is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const normalizedPath = path ? normalizeProxyPath(path) : null;
  if (!normalizedPath) {
    return new Response(JSON.stringify({ error: 'Proxy path is invalid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetUrl = new URL(`/api/${normalizedPath}`, apiUrl);
  targetUrl.search = url.search;
  const requestHeaders = buildProxyRequestHeaders(request.headers, tenantId);

  if (import.meta.env.DEV) {
    console.log(`[Universal Proxy] ${request.method} ${url.pathname} -> ${targetUrl.origin}`);
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: requestHeaders,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await readLimitedBody(request);
      if (body) fetchOptions.body = body;
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);
    const responseHeaders = new Headers(backendResponse.headers);

    applyCookiesToAstro(backendResponse, cookies, import.meta.env.DEV);
    responseHeaders.delete('set-cookie');
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof ProxyBodyTooLargeError) {
      return new Response(JSON.stringify({ error: 'Request body is too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (import.meta.env.DEV) console.error('[Universal Proxy] Request failed');
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '30' },
      }
    );
  }
};
