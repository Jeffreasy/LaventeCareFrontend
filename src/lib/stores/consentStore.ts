import { persistentAtom } from '@nanostores/persistent';

/**
 * Cookie Consent State Management
 * GDPR-compliant consent tracking with 6-month expiry
 */

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean; // Always true
  timestamp: number;
  version: string; // Policy version for re-consent
}

const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_MONTHS = 6;

// Default state: Nothing consented except necessary
const defaultConsent: ConsentState = {
  analytics: false,
  marketing: false,
  necessary: true,
  timestamp: Date.now(),
  version: CONSENT_VERSION,
};

// Persistent consent store in localStorage
export const consentStore = persistentAtom<ConsentState>('consent_state', defaultConsent, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * Check if consent has expired (6 months old)
 * Returns true if expired or version changed
 */
export function isConsentExpired(state: ConsentState): boolean {
  const expiryDate = new Date(state.timestamp);
  expiryDate.setMonth(expiryDate.getMonth() + CONSENT_EXPIRY_MONTHS);

  const isOld = Date.now() > expiryDate.getTime();
  const isOutdated = state.version !== CONSENT_VERSION;

  return isOld || isOutdated;
}

/**
 * Accept all cookies
 */
export function acceptAll() {
  consentStore.set({
    analytics: true,
    marketing: true,
    necessary: true,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  });
}

/**
 * Reject all non-necessary cookies
 */
export function rejectAll() {
  consentStore.set({
    analytics: false,
    marketing: false,
    necessary: true,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  });
}

/**
 * Update specific consent preferences
 */
export function updateConsent(preferences: Partial<Omit<ConsentState, 'timestamp' | 'version'>>) {
  const current = consentStore.get();
  consentStore.set({
    ...current,
    ...preferences,
    necessary: true, // Always true
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  });
}

/**
 * Check if analytics is enabled and valid
 */
export function hasAnalyticsConsent(): boolean {
  const state = consentStore.get();

  if (isConsentExpired(state)) {
    return false;
  }

  return state.analytics;
}

/**
 * Reset consent (for testing/debugging)
 */
export function resetConsent() {
  consentStore.set(defaultConsent);
}
