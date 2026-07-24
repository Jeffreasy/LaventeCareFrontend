import type { APIRoute } from 'astro';
import { applyCookiesToAstro } from '../../../lib/cookie-utils';

export const prerender = false;

const isDev = import.meta.env.DEV;

// Simple in-memory rate limiter for Edge
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_BODY_SIZE = 20_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  // Clean up old entries occasionally to prevent memory leaks in long-running instances
  if (rateLimitCache.size > 1000) {
    for (const [key, val] of rateLimitCache.entries()) {
      if (val.expiresAt < now) rateLimitCache.delete(key);
    }
  }

  if (!record || record.expiresAt < now) {
    rateLimitCache.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress, url, cookies }) => {
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (!API_URL || !TENANT_ID) {
    return new Response(JSON.stringify({ message: 'Authentication service unavailable.' }), {
      status: 503,
      headers: jsonHeaders,
    });
  }

  // 1. Get real client IP and User-Agent to prevent self-DoS on proxy
  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = clientAddress || forwardedIp || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  if (isDev) {
    console.log('[Proxy] ===== LOGIN REQUEST START =====');
    console.log(`[Proxy] IP: ${ip} | User-Agent: ${userAgent}`);
  }

  // 2. Strict Origin/Referer Enforcement
  if (!isDev) {
    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';
    const refererOrigin = (() => {
      try {
        return referer ? new URL(referer).origin : '';
      } catch {
        return '';
      }
    })();

    if (origin !== url.origin && refererOrigin !== url.origin) {
      if (isDev) console.warn('[Proxy Security] Blocked cross-origin request');
      return new Response(JSON.stringify({ message: 'Forbidden: Invalid Origin' }), {
        status: 403,
        headers: jsonHeaders,
      });
    }
  }

  // 3. Edge Rate Limiting (per IP)
  if (!checkRateLimit(ip)) {
    if (isDev) console.warn(`[Proxy Security] Rate limit exceeded for IP: ${ip}`);
    return new Response(
      JSON.stringify({ message: 'Te veel inlogpogingen. Probeer het over 5 minuten opnieuw.' }),
      {
        status: 429,
        headers: { ...jsonHeaders, 'Retry-After': '300' },
      }
    );
  }

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({ message: 'Request too large.' }), {
        status: 413,
        headers: jsonHeaders,
      });
    }

    const data: unknown = await request.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return new Response(JSON.stringify({ message: 'Invalid request.' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const fields = data as Record<string, unknown>;
    const email = typeof fields.email === 'string' ? fields.email.trim() : '';
    const password = typeof fields.password === 'string' ? fields.password : '';
    const honeypot = typeof fields.confirm_email === 'string' ? fields.confirm_email : '';

    if (!email || email.length > 320 || !password || password.length > 1024) {
      return new Response(JSON.stringify({ message: 'Invalid request.' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    // 4. Honeypot Validation
    if (honeypot.length > 0) {
      if (isDev) console.warn(`[Proxy Security] Bot detected via honeypot from IP: ${ip}`);
      // Return generic 400 Bad Request to confuse the bot, but look like a normal failure
      return new Response(
        JSON.stringify({ message: 'Inloggen mislukt. Controleer uw e-mailadres en wachtwoord.' }),
        {
          status: 400,
          headers: jsonHeaders,
        }
      );
    }

    const requestBody = JSON.stringify({ email, password });

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

    const headers = new Headers(jsonHeaders);

    // Use shared cookie sanitization
    applyCookiesToAstro(response, cookies, isDev);

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
        headers: jsonHeaders,
      }
    );
  }
};
