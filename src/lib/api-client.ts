/**
 * Centralized same-origin API client with single-flight token refresh.
 */

import { classifyRefreshResponse, type RefreshOutcome } from './refresh-policy';
import { requirePublicTenantID } from './runtime-config';

const API_BASE = '';
export type AuthPolicy = 'session' | 'public';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;)\s*csrf_token=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[2]);
  } catch {
    return null;
  }
}

export function shouldAttemptRefresh(
  status: number,
  endpoint: string,
  authPolicy: AuthPolicy
): boolean {
  return status === 401 && authPolicy === 'session' && !endpoint.endsWith('/auth/refresh');
}

function refreshUnavailableResponse(): Response {
  return new Response(JSON.stringify({ error: 'Authentication service temporarily unavailable' }), {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '30',
      'X-Auth-Refresh': 'unavailable',
    },
  });
}

class ApiClient {
  private refreshPromise: Promise<RefreshOutcome> | null = null;

  private requestOptions(options: RequestInit): RequestInit {
    const tenantId = requirePublicTenantID();
    return {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-CSRF-Token': getCsrfToken() ?? '',
        ...options.headers,
      },
    };
  }

  async fetch(
    endpoint: string,
    options: RequestInit = {},
    authPolicy: AuthPolicy = 'session'
  ): Promise<Response> {
    const url = API_BASE + endpoint;
    let response = await fetch(url, this.requestOptions(options));

    if (!shouldAttemptRefresh(response.status, endpoint, authPolicy)) return response;

    const refreshOutcome = await this.refreshToken();
    if (refreshOutcome === 'refreshed') {
      response = await fetch(url, this.requestOptions(options));
    } else if (refreshOutcome === 'unavailable') {
      return refreshUnavailableResponse();
    }
    return response;
  }

  private refreshToken(): Promise<RefreshOutcome> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<RefreshOutcome> {
    let outcome: RefreshOutcome;
    try {
      const response = await fetch(API_BASE + '/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': requirePublicTenantID(),
        },
      });
      outcome = classifyRefreshResponse(response.status);
    } catch {
      return 'unavailable';
    }

    if (outcome === 'invalid' && typeof window !== 'undefined') {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign('/login?returnTo=' + encodeURIComponent(returnTo));
    }
    return outcome;
  }

  async get<T>(endpoint: string, authPolicy: AuthPolicy = 'session'): Promise<T> {
    const response = await this.fetch(endpoint, { method: 'GET' }, authPolicy);
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`GET ${endpoint} failed: ${response.status} — ${body}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, body: unknown, authPolicy: AuthPolicy = 'session'): Promise<T> {
    const response = await this.fetch(
      endpoint,
      { method: 'POST', body: JSON.stringify(body) },
      authPolicy
    );
    if (!response.ok) {
      const resBody = await response.text().catch(() => '');
      throw new Error(`POST ${endpoint} failed: ${response.status} — ${resBody}`);
    }
    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await this.fetch(endpoint, { method: 'DELETE' });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`DELETE ${endpoint} failed: ${response.status} — ${body}`);
    }
  }
}

export const apiClient = new ApiClient();
