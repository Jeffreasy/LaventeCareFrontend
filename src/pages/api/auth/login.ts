import type { APIRoute } from 'astro';
import { applySanitizedCookies } from '../../../lib/cookie-utils';

export const prerender = false;

const isDev = import.meta.env.DEV;

// Simple in-memory rate limiter for Edge
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

  // 1. Get real client IP and User-Agent to prevent self-DoS on proxy
  const ip = clientAddress || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  if (isDev) {
    console.log('[Proxy] ===== LOGIN REQUEST START =====');
    console.log(`[Proxy] IP: ${ip} | User-Agent: ${userAgent}`);
  }

  // 2. Strict Origin/Referer Enforcement
  if (!isDev) {
    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';
    const allowedOrigin = url.origin; // e.g. https://www.laventecare.nl
    
    if (!origin.startsWith(allowedOrigin) && !referer.startsWith(allowedOrigin)) {
      if (isDev) console.warn('[Proxy Security] Blocked cross-origin request');
      return new Response(JSON.stringify({ message: 'Forbidden: Invalid Origin' }), { status: 403 });
    }
  }

  // 3. Edge Rate Limiting (per IP)
  if (!checkRateLimit(ip)) {
    if (isDev) console.warn(`[Proxy Security] Rate limit exceeded for IP: ${ip}`);
    return new Response(JSON.stringify({ message: 'Te veel inlogpogingen. Probeer het over 5 minuten opnieuw.' }), { 
      status: 429,
      headers: { 'Retry-After': '300', 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();

    // 4. Honeypot Validation
    if (data.confirm_email && data.confirm_email.length > 0) {
      if (isDev) console.warn(`[Proxy Security] Bot detected via honeypot from IP: ${ip}`);
      // Return generic 400 Bad Request to confuse the bot, but look like a normal failure
      return new Response(JSON.stringify({ message: 'Inloggen mislukt. Controleer uw e-mailadres en wachtwoord.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove honeypot field before sending to backend
    delete data.confirm_email;

    const requestBody = JSON.stringify(data);

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
