interface PublicEnvInput {
  PUBLIC_API_URL?: string;
  PUBLIC_TENANT_ID?: string;
  PUBLIC_JWT_ISSUER?: string;
  PUBLIC_JWT_AUDIENCE?: string;
  DEV?: boolean;
  MODE?: string;
}

export interface PublicRuntimeConfig {
  apiUrl: string | null;
  tenantId: string | null;
  jwtIssuer: string | null;
  jwtAudience: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '[::1]';
}

function normalizeHTTPURL(value: string | undefined, development: boolean): string | null {
  const candidate = value?.trim() ?? '';
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    if (parsed.pathname !== '/') return null;
    if (parsed.protocol === 'http:' && (!development || !isLoopbackHostname(parsed.hostname))) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function parsePublicRuntimeConfig(env: PublicEnvInput): PublicRuntimeConfig {
  const development = env.DEV === true || env.MODE === 'development';
  const apiUrl = normalizeHTTPURL(env.PUBLIC_API_URL, development);
  const tenantCandidate = env.PUBLIC_TENANT_ID?.trim() ?? '';
  const tenantId = UUID_PATTERN.test(tenantCandidate) ? tenantCandidate : null;
  const configuredIssuer = normalizeHTTPURL(env.PUBLIC_JWT_ISSUER, development);

  return {
    apiUrl,
    tenantId,
    jwtIssuer: configuredIssuer ?? apiUrl,
    jwtAudience: env.PUBLIC_JWT_AUDIENCE?.trim() || 'laventecare-frontend',
  };
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  return parsePublicRuntimeConfig(import.meta.env);
}

export function requirePublicTenantID(): string {
  const tenantId = getPublicRuntimeConfig().tenantId;
  if (!tenantId) throw new Error('PUBLIC_TENANT_ID is missing or invalid');
  return tenantId;
}

export function requirePublicAPIURL(): string {
  const apiUrl = getPublicRuntimeConfig().apiUrl;
  if (!apiUrl) throw new Error('PUBLIC_API_URL is missing or invalid');
  return apiUrl;
}
