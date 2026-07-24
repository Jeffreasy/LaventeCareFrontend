import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import {
  consentStore,
  acceptAll,
  rejectAll,
  updateConsent,
  isConsentExpired,
} from '@/lib/stores/consentStore';
import './CookieConsent.css';

interface CookieConsentProps {
  locale?: 'nl' | 'en';
}

const COPY = {
  nl: {
    bannerLabel: 'Cookievoorkeuren',
    title: 'Cookievoorkeuren',
    description:
      'Ik gebruik optionele cookies om de website te verbeteren. Noodzakelijke cookies blijven altijd actief; analytics en marketing worden pas geladen na uw toestemming.',
    reject: 'Weigeren',
    preferences: 'Voorkeuren',
    accept: 'Accepteren',
    preferencesTitle: 'Cookievoorkeuren beheren',
    necessary: 'Noodzakelijke cookies',
    alwaysActive: 'Altijd actief',
    necessaryDescription: 'Vereist voor authenticatie, beveiliging en basisfunctionaliteit.',
    analytics: 'Analyticscookies',
    analyticsDescription:
      'Helpt mij begrijpen hoe bezoekers de website gebruiken via Vercel Analytics.',
    marketing: 'Marketingcookies',
    marketingDescription: 'Voor Google Tag Manager en andere marketingtools, indien geactiveerd.',
    rejectAll: 'Alles weigeren',
    save: 'Voorkeuren opslaan',
    close: 'Voorkeuren sluiten',
    footer: 'Vragen over privacy of cookies?',
    privacy: 'Privacyverklaring',
    contact: 'Neem contact op',
  },
  en: {
    bannerLabel: 'Cookie preferences',
    title: 'Cookie preferences',
    description:
      'I use optional cookies to improve the website. Necessary cookies always remain active; analytics and marketing only load after you consent.',
    reject: 'Reject',
    preferences: 'Preferences',
    accept: 'Accept',
    preferencesTitle: 'Manage cookie preferences',
    necessary: 'Necessary cookies',
    alwaysActive: 'Always active',
    necessaryDescription: 'Required for authentication, security and core website functionality.',
    analytics: 'Analytics cookies',
    analyticsDescription:
      'Helps me understand how visitors use the website through Vercel Analytics.',
    marketing: 'Marketing cookies',
    marketingDescription: 'For Google Tag Manager and other marketing tools, when enabled.',
    rejectAll: 'Reject all',
    save: 'Save preferences',
    close: 'Close preferences',
    footer: 'Questions about privacy or cookies?',
    privacy: 'Privacy statement',
    contact: 'Get in touch',
  },
} as const;

/**
 * GDPR-Compliant Cookie Consent Banner
 * Clinical glassmorphism design consistent with LaventeCare design system
 */
export function CookieConsent({ locale = 'nl' }: CookieConsentProps) {
  const consent = useStore(consentStore);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [draftMarketing, setDraftMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const copy = COPY[locale];

  useEffect(() => {
    // Show banner if no consent or expired
    const needsConsent = !consent.timestamp || isConsentExpired(consent);
    setShowBanner(needsConsent);
  }, [consent.timestamp, consent.version]);

  useEffect(() => {
    const openPreferences = () => {
      setDraftAnalytics(consent.analytics);
      setDraftMarketing(consent.marketing);
      setShowBanner(true);
      setShowPreferences(true);
    };

    window.addEventListener('laventecare:open-cookie-preferences', openPreferences);
    return () => {
      window.removeEventListener('laventecare:open-cookie-preferences', openPreferences);
    };
  }, [consent.analytics, consent.marketing]);

  useEffect(() => {
    if (!showPreferences) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPreferences(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href]'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [showPreferences]);

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
    updateConsent({
      analytics: draftAnalytics,
      marketing: draftMarketing,
    });
    setShowPreferences(false);
    setShowBanner(false);
  };

  const openPreferences = () => {
    setDraftAnalytics(consent.analytics);
    setDraftMarketing(consent.marketing);
    setShowPreferences(true);
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
          aria-label={copy.bannerLabel}
          data-testid="cookie-banner"
        >
          <div className="cookie-banner__content">
            <div className="cookie-banner__text">
              <h2 className="cookie-banner__title">{copy.title}</h2>
              <p className="cookie-banner__description">{copy.description}</p>
              <a href="/privacy" className="cookie-banner__privacy">
                {copy.privacy}
              </a>
            </div>

            <div className="cookie-banner__actions">
              <button
                onClick={handleRejectAll}
                className="cookie-banner__button cookie-banner__button--secondary"
                data-testid="reject-cookies"
              >
                {copy.reject}
              </button>

              <button
                onClick={openPreferences}
                className="cookie-banner__button cookie-banner__button--tertiary"
              >
                {copy.preferences}
              </button>

              <button
                onClick={handleAcceptAll}
                className="cookie-banner__button cookie-banner__button--primary"
                data-testid="accept-cookies"
              >
                {copy.accept}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          className="cookie-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preferences-title"
        >
          <button
            type="button"
            className="cookie-modal__overlay"
            onClick={() => setShowPreferences(false)}
            aria-label={copy.close}
            tabIndex={-1}
          />

          <div className="cookie-modal__content" ref={dialogRef} tabIndex={-1}>
            <h2 id="preferences-title" className="cookie-modal__title">
              {copy.preferencesTitle}
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
                    <span className="preference-item__name">{copy.necessary}</span>
                  </label>
                  <span className="preference-item__badge">{copy.alwaysActive}</span>
                </div>
                <p className="preference-item__description">{copy.necessaryDescription}</p>
              </div>

              {/* Analytics Cookies */}
              <div className="preference-item">
                <div className="preference-item__header">
                  <label className="preference-item__label">
                    <input
                      type="checkbox"
                      checked={draftAnalytics}
                      onChange={(e) => setDraftAnalytics(e.target.checked)}
                      className="preference-item__checkbox"
                    />
                    <span className="preference-item__name">{copy.analytics}</span>
                  </label>
                </div>
                <p className="preference-item__description">{copy.analyticsDescription}</p>
              </div>

              {/* Marketing Cookies */}
              <div className="preference-item">
                <div className="preference-item__header">
                  <label className="preference-item__label">
                    <input
                      type="checkbox"
                      checked={draftMarketing}
                      onChange={(e) => setDraftMarketing(e.target.checked)}
                      className="preference-item__checkbox"
                    />
                    <span className="preference-item__name">{copy.marketing}</span>
                  </label>
                </div>
                <p className="preference-item__description">{copy.marketingDescription}</p>
              </div>
            </div>

            <div className="cookie-modal__actions">
              <button
                onClick={handleRejectAll}
                className="cookie-modal__button cookie-modal__button--secondary"
              >
                {copy.rejectAll}
              </button>

              <button
                onClick={handleSavePreferences}
                className="cookie-modal__button cookie-modal__button--primary"
                data-testid="save-preferences"
              >
                {copy.save}
              </button>
            </div>

            <p className="cookie-modal__footer">
              {copy.footer}{' '}
              <a href="/privacy" className="cookie-modal__link">
                {copy.privacy}
              </a>
              {' · '}
              <a href="/contact" className="cookie-modal__link">
                {copy.contact}
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}
