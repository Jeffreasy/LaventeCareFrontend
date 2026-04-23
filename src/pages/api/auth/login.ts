import type { APIRoute } from 'astro';
import { applySanitizedCookies } from '../../../lib/cookie-utils';

export const prerender = false;

const isDev = import.meta.env.DEV;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

  if (isDev) {
    console.log('[Proxy] ===== LOGIN REQUEST START =====');
    console.log('[Proxy] API_URL:', API_URL);
  }

  try {
    const data = await request.json();
    if (isDev) {
      console.log('[Proxy] Request body received:', {
        email: data.email,
        passwordLength: data.password?.length || 0,
      });
    }

    const requestBody = JSON.stringify(data);

    // Get real client IP and User-Agent to prevent self-DoS on proxy
    const ip = clientAddress || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
        'X-Forwarded-For': ip,
        'User-Agent': userAgent,
      },
      body: requestBody,
    });

    if (isDev) console.log(`[Proxy] Status: ${response.status}`);

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: response.statusText };
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });

    // Use shared cookie sanitization
    applySanitizedCookies(response, headers, isDev);

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers,
    });
  } catch (error) {
    if (isDev)
      console.error(
        '[Proxy] Login proxy error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    return new Response(
      JSON.stringify({
        message: 'Authentication service unavailable. Please try again later.',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
