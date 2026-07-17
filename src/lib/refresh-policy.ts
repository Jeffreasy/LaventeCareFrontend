export type RefreshOutcome = 'refreshed' | 'invalid' | 'unavailable';

/**
 * Only an explicit client/authentication rejection invalidates the session.
 * Rate limits, redirects and server failures are availability problems and must
 * preserve the user's cookies and in-progress work.
 */
export function classifyRefreshResponse(status: number): RefreshOutcome {
  if (status >= 200 && status < 300) return 'refreshed';
  if (status === 400 || status === 401 || status === 403) return 'invalid';
  return 'unavailable';
}
