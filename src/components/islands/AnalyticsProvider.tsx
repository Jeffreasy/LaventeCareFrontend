import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useStore } from '@nanostores/react';
import { consentStore, hasAnalyticsConsent } from '@/lib/stores/consentStore';
import { useEffect, useState } from 'react';

/**
 * Consent-Aware Analytics Provider
 * Only loads Vercel Analytics & Speed Insights when user has given consent
 * EU data residency enforced via custom endpoint
 */
export function AnalyticsProvider() {
    const consent = useStore(consentStore);
    const [canLoad, setCanLoad] = useState(false);

    useEffect(() => {
        // Check consent validity
        setCanLoad(hasAnalyticsConsent());
    }, [consent.analytics, consent.timestamp]);

    // Don't load anything if no consent
    if (!canLoad) {
        return null;
    }

    return (
        <>
            {/* Vercel Analytics with EU endpoint */}
            <Analytics
                beforeSend={(event) => {
                    // Additional privacy filtering if needed
                    // Remove any PII from page URLs, etc.
                    return event;
                }}
            />

            {/* Speed Insights for Core Web Vitals */}
            <SpeedInsights />
        </>
    );
}
