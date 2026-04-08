import { Analytics } from '@vercel/analytics/react';
import { useStore } from '@nanostores/react';
import { consentStore, hasAnalyticsConsent } from '@/lib/stores/consentStore';
import { useEffect, useState } from 'react';

/**
 * Consent-Aware Analytics Provider
 * Only loads Vercel Analytics when user has given consent
 * Speed Insights is handled by native Astro component in Layout.astro
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
                    return event;
                }}
            />
        </>
    );
}
