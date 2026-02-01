/**
 * Centralized API Client with Automatic Token Refresh
 * 
 * Handles:
 * - Automatic token refresh on 401 errors
 * - Queue mechanism for concurrent requests during refresh
 * - Automatic redirect to login on refresh failure
 */

// Use relative path to hit local Astro proxy (BFF Pattern)
const API_BASE = '';
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

// Helper to extract CSRF token from cookies
const getCsrfToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(^|;)\s*csrf_token=([^;]+)/);
    return match ? match[2] : null;
};

class ApiClient {
    private isRefreshing = false;
    private refreshQueue: Array<() => void> = [];

    /**
     * Fetch wrapper with automatic token refresh
     */
    async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const url = `${API_BASE}${endpoint}`;

        // Ensure credentials are included (HttpOnly cookies)
        const fetchOptions: RequestInit = {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': TENANT_ID,
                'X-CSRF-Token': getCsrfToken() ?? '', // ✅ Injected for Cross-Origin POST
                ...options.headers,
            },
        };

        // Attempt request
        let response = await fetch(url, fetchOptions);

        // If 401 and not already refreshing, attempt token refresh
        if (response.status === 401 && !this.isRefreshing) {
            console.log('[ApiClient] 401 detected, attempting token refresh...');
            const refreshed = await this.refreshToken();

            if (refreshed) {
                console.log('[ApiClient] Token refreshed, retrying request...');
                // Retry original request with new access token
                response = await fetch(url, fetchOptions);
            }
        }

        return response;
    }

    /**
     * Refresh access token using refresh token
     */
    private async refreshToken(): Promise<boolean> {
        // If already refreshing, queue this request
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshQueue.push(() => resolve(true));
            });
        }

        this.isRefreshing = true;

        try {
            console.log('[ApiClient] Calling refresh endpoint:', `${API_BASE}/api/v1/auth/refresh`);
            const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Sends refresh_token cookie
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': TENANT_ID,
                },
            });

            if (response.ok) {
                console.log('[ApiClient] Token refresh successful');
                // Backend sets new access_token + refresh_token via Set-Cookie

                // Execute all queued requests
                this.refreshQueue.forEach((callback) => callback());
                this.refreshQueue = [];

                return true;
            }

            // Refresh failed - likely expired refresh token
            console.warn('[ApiClient] Token refresh failed, redirecting to login');
            window.location.href = '/login';
            return false;

        } catch (error) {
            console.error('[ApiClient] Token refresh error:', error);
            window.location.href = '/login';
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Helper: GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        const response = await this.fetch(endpoint, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`GET ${endpoint} failed: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Helper: POST request
     */
    async post<T>(endpoint: string, body: any): Promise<T> {
        const response = await this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`POST ${endpoint} failed: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Helper: DELETE request
     */
    async delete(endpoint: string): Promise<void> {
        const response = await this.fetch(endpoint, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
        }
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
