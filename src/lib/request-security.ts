const FIXED_PROXY_HEADERS = [
  'connection',
  'content-length',
  'forwarded',
  'host',
  'keep-alive',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
] as const;

export function hasExactOrigin(
  headerValue: string | null | undefined,
  allowedOrigin: string
): boolean {
  if (!headerValue) return false;
  try {
    return new URL(headerValue).origin === new URL(allowedOrigin).origin;
  } catch {
    return false;
  }
}

export function requestSourceMatchesOrigin(
  origin: string | null,
  referer: string | null,
  allowedOrigin: string
): boolean {
  return hasExactOrigin(origin || referer, allowedOrigin);
}

export function isDutchAdminHost(hostHeader: string): boolean {
  try {
    const hostname = new URL(`http://${hostHeader}`).hostname.toLowerCase();
    return (
      hostname === 'laventecare.nl' ||
      hostname === 'www.laventecare.nl' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

/**
 * Catch-all path parameters are routing data, not a free-form URL. Reject any
 * segment that can be decoded into path traversal or URL control characters.
 */
export function normalizeProxyPath(path: string): string | null {
  if (!path || path.startsWith('/') || path.endsWith('/') || path.includes('\\')) return null;
  const segments = path.split('/');
  if (segments.some((segment) => segment === '')) return null;

  const normalized: string[] = [];
  for (const segment of segments) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return null;
    }
    if (
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      decoded.includes('?') ||
      decoded.includes('#') ||
      !/^[A-Za-z0-9._~-]+$/.test(decoded)
    ) {
      return null;
    }
    normalized.push(decoded);
  }
  return normalized.join('/');
}

/**
 * Builds the backend request headers from a browser request. Client-controlled
 * routing/proxy headers are removed and the configured tenant always wins.
 */
export function buildProxyRequestHeaders(input: Headers, tenantId: string): Headers {
  const headers = new Headers(input);
  const connectionTokens = (headers.get('connection') ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  for (const header of [...FIXED_PROXY_HEADERS, ...connectionTokens]) headers.delete(header);
  headers.set('X-Tenant-ID', tenantId);
  return headers;
}
