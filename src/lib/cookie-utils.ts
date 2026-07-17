import type { AstroCookies } from 'astro';

/**
 * Shared Cookie Sanitization Utilities
 *
 * Used by auth proxy routes to rebuild backend Set-Cookie headers
 * for Astro and localhost/HTTP compatibility.
 */

/**
 * Extract Set-Cookie headers from a fetch response.
 * Handles both Node 18+ `getSetCookie()` and legacy fallback.
 */
export function extractSetCookies(response: Response): string[] {
  const rawRes = response as Response & { headers: { getSetCookie?: () => string[] } };

  if (typeof rawRes.headers.getSetCookie === 'function') {
    return rawRes.headers.getSetCookie();
  }

  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
}

/**
 * Process all Set-Cookie headers from a backend response and apply them to Astro's cookie manager.
 * This guarantees proper serialization of multiple Set-Cookie headers on serverless platforms (Vercel).
 * Also preserves cookie paths from the backend to ensure correct cookie clearing and shadowing prevention.
 */
export function applyCookiesToAstro(
  backendResponse: Response,
  astroCookies: AstroCookies,
  isDev: boolean
): void {
  const cookies = extractSetCookies(backendResponse);

  cookies.forEach((cookieStr) => {
    const parts = cookieStr.split(';').map((p) => p.trim());
    if (parts.length === 0 || !parts[0]) return;

    const nameValue = parts[0];
    const equalIndex = nameValue.indexOf('=');
    if (equalIndex === -1) return;

    const name = nameValue.substring(0, equalIndex);
    const value = nameValue.substring(equalIndex + 1);

    // Extract attributes
    const pathMatch = cookieStr.match(/Path=([^;]+)/i);
    const path = pathMatch ? pathMatch[1].trim() : '/';

    const maxAgeMatch = cookieStr.match(/Max-Age=([^;]+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : undefined;

    // Check for deletion/clear actions
    const isDelete = maxAge !== undefined && maxAge <= 0;

    if (isDelete) {
      astroCookies.delete(name, { path });
      if (isDev) {
        console.log(`[Cookie Proxy] Deleted cookie: ${name} on path: ${path}`);
      }
      return;
    }

    const isCsrf = name === 'csrf_token';
    const httpOnly = !isCsrf; // CSRF token needs to be readable by JS

    astroCookies.set(name, value, {
      path,
      httpOnly,
      sameSite: 'lax', // Use 'lax' for same-origin proxy compatibility
      secure: !isDev, // Disable secure on localhost HTTP
      maxAge,
    });

    if (isDev) {
      console.log(`[Cookie Proxy] Set cookie: ${name} (path=${path}, maxAge=${maxAge})`);
    }
  });
}
