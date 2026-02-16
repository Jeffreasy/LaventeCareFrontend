/**
 * Shared Cookie Sanitization Utilities
 *
 * Used by auth proxy routes to rebuild backend Set-Cookie headers
 * for localhost/HTTP compatibility (strips Secure, Partitioned, Domain).
 */

/**
 * Extract Set-Cookie headers from a fetch response.
 * Handles both Node 18+ `getSetCookie()` and legacy fallback.
 */
export function extractSetCookies(response: Response): string[] {
  const rawRes = response as any;

  if (typeof rawRes.headers.getSetCookie === 'function') {
    return rawRes.headers.getSetCookie();
  }

  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
}

/**
 * Rebuild a raw Set-Cookie string for same-origin proxy usage.
 * - Strips `Secure`, `Partitioned`, and `Domain` attributes
 * - Preserves `Max-Age` if present
 * - Makes `csrf_token` accessible to JS (no HttpOnly)
 * - Sets `SameSite=Lax` for CSRF protection
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
