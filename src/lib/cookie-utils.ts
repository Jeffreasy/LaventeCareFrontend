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
 * Rebuild a raw Set-Cookie string for same-origin proxy usage.
 * @deprecated Use applyCookiesToAstro instead to prevent Vercel/Node cookie merging issues.
 */
export function rebuildCookie(rawCookie: string): string {
  const parts = rawCookie.split(';');
  const nameValue = parts[0];

  const maxAgeMatch = rawCookie.match(/Max-Age=([^;]+)/i);
  const maxAgeAttr = maxAgeMatch ? `; Max-Age=${maxAgeMatch[1]}` : '';

  const isCsrf = nameValue.trim().startsWith('csrf_token=');
  const httpOnlyAttr = isCsrf ? '' : '; HttpOnly';

  return `${nameValue}; Path=/${httpOnlyAttr}; SameSite=Lax${maxAgeAttr}`;
}

/**
 * Process all Set-Cookie headers from a backend response and
 * append sanitized versions to a response Headers object.
 * @deprecated Use applyCookiesToAstro instead to prevent Vercel/Node cookie merging issues.
 */
export function applySanitizedCookies(
  backendResponse: Response,
  targetHeaders: Headers,
  isDev: boolean
): void {
  const cookies = extractSetCookies(backendResponse);

  if (cookies.length === 0) return;

  targetHeaders.delete('set-cookie');

  cookies.forEach((cookie) => {
    const rebuilt = rebuildCookie(cookie);
    if (isDev) {
      const nameValue = cookie.split(';')[0];
      console.log(`[Cookie] Rebuilt: ${nameValue.substring(0, 20)}...`);
    }
    targetHeaders.append('set-cookie', rebuilt);
  });
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
      secure: !isDev,  // Disable secure on localhost HTTP
      maxAge,
    });

    if (isDev) {
      console.log(`[Cookie Proxy] Set cookie: ${name} = ${value.substring(0, 15)}... (path=${path}, maxAge=${maxAge})`);
    }
  });
}
