import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import {
    consentStore,
    acceptAll,
    rejectAll,
    updateConsent,
    isConsentExpired
} from '@/lib/stores/consentStore';
import './CookieConsent.css';

/**
 * GDPR-Compliant Cookie Consent Banner
 * Clinical glassmorphism design consistent with LaventeCare design system
 */
export function CookieConsent() {
    const consent = useStore(consentStore);
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {
        // Show banner if no consent or expired
        const needsConsent = !consent.timestamp || isConsentExpired(consent);
        setShowBanner(needsConsent);
    }, [consent.timestamp]);

    const handleAcceptAll = () => {
        acceptAll();
        setShowBanner(false);
        setShowPreferences(false);
    };

    const handleRejectAll = () => {
        rejectAll();
        setShowBanner(false);
        setShowPreferences(false);
    };

    const handleSavePreferences = () => {
        // Consent already updated via checkboxes
        setShowPreferences(false);
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Main Banner */}
            {!showPreferences && (
                <div
                    className="cookie-banner"
                    role="dialog"
                    aria-live="polite"
                    aria-label="Cookie consent banner"
                    data-testid="cookie-banner"
                >
                    <div className="cookie-banner__content">
                        <div className="cookie-banner__text">
                            <h3 className="cookie-banner__title">🍪 Cookie Voorkeuren</h3>
                            <p className="cookie-banner__description">
                                We gebruiken cookies om jouw ervaring te verbeteren en onze website te optimaliseren.
                                Jouw privacy is belangrijk voor ons - data wordt opgeslagen in de EU volgens GDPR-richtlijnen.
                            </p>
                        </div>

                        <div className="cookie-banner__actions">
                            <button
                                onClick={handleRejectAll}
                                className="cookie-banner__button cookie-banner__button--secondary"
                                data-testid="reject-cookies"
                            >
                                Weigeren
                            </button>

                            <button
                                onClick={() => setShowPreferences(true)}
                                className="cookie-banner__button cookie-banner__button--tertiary"
                            >
                                Voorkeuren
                            </button>

                            <button
                                onClick={handleAcceptAll}
                                className="cookie-banner__button cookie-banner__button--primary"
                                data-testid="accept-cookies"
                            >
                                Accepteren
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preferences Modal */}
            {showPreferences && (
                <div className="cookie-modal" role="dialog" aria-labelledby="preferences-title">
                    <div className="cookie-modal__overlay" onClick={() => setShowPreferences(false)} />

                    <div className="cookie-modal__content">
                        <h2 id="preferences-title" className="cookie-modal__title">
                            Cookie Voorkeuren Beheren
                        </h2>

                        <div className="cookie-modal__preferences">
                            {/* Necessary Cookies - Always On */}
                            <div className="preference-item preference-item--disabled">
                                <div className="preference-item__header">
                                    <label className="preference-item__label">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            disabled
                                            className="preference-item__checkbox"
                                        />
                                        <span className="preference-item__name">Noodzakelijke Cookies</span>
                                    </label>
                                    <span className="preference-item__badge">Altijd Actief</span>
                                </div>
                                <p className="preference-item__description">
                                    Vereist voor authenticatie, beveiliging en basiswebsitefunctionaliteit.
                                </p>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="preference-item">
                                <div className="preference-item__header">
                                    <label className="preference-item__label">
                                        <input
                                            type="checkbox"
                                            checked={consent.analytics}
                                            onChange={(e) => updateConsent({ analytics: e.target.checked })}
                                            className="preference-item__checkbox"
                                        />
                                        <span className="preference-item__name">Analytics Cookies</span>
                                    </label>
                                </div>
                                <p className="preference-item__description">
                                    Helpt ons begrijpen hoe bezoekers onze website gebruiken via Vercel Analytics.
                                    Data wordt opgeslagen in de EU.
                                </p>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="preference-item">
                                <div className="preference-item__header">
                                    <label className="preference-item__label">
                                        <input
                                            type="checkbox"
                                            checked={consent.marketing}
                                            onChange={(e) => updateConsent({ marketing: e.target.checked })}
                                            className="preference-item__checkbox"
                                        />
                                        <span className="preference-item__name">Marketing Cookies</span>
                                    </label>
                                </div>
                                <p className="preference-item__description">
                                    Voor Google Tag Manager en andere marketing tools (indien geactiveerd).
                                </p>
                            </div>
                        </div>

                        <div className="cookie-modal__actions">
                            <button
                                onClick={handleRejectAll}
                                className="cookie-modal__button cookie-modal__button--secondary"
                            >
                                Alles Weigeren
                            </button>

                            <button
                                onClick={handleSavePreferences}
                                className="cookie-modal__button cookie-modal__button--primary"
                                data-testid="save-preferences"
                            >
                                Voorkeuren Opslaan
                            </button>
                        </div>

                        <p className="cookie-modal__footer">
                            Meer informatie in ons <a href="/privacy" className="cookie-modal__link">privacybeleid</a>.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
