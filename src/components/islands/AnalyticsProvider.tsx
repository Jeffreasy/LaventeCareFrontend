import { Analytics } from '@vercel/analytics/react';
import { useStore } from '@nanostores/react';
import { consentStore, isConsentExpired } from '@/lib/stores/consentStore';

/**
 * Consent-Aware Analytics Provider
 * Only loads Vercel Analytics when user has given consent
 * Speed Insights is handled by native Astro component in Layout.astro
 */
export function AnalyticsProvider() {
  const consent = useStore(consentStore);
  const canLoad = consent.analytics && !isConsentExpired(consent);

  // Don't load anything if no consent
  if (!canLoad) {
    return null;
  }

  return <Analytics />;
}
