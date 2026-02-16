import { track } from '@vercel/analytics';
import { hasAnalyticsConsent } from '@/lib/stores/consentStore';

/**
 * Conversion Goals Mapping
 * Type-safe event names for custom tracking
 */
export const CONVERSION_GOALS = {
  // Contact & Forms
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_VIEW: 'contact_form_view',

  // Pricing CTAs
  PRICING_SETUP_CTA: 'pricing_setup_cta',
  PRICING_HOSTING_CTA: 'pricing_hosting_cta',
  PRICING_IOT_CTA: 'pricing_iot_cta',
  PRICING_PAGE_VIEW: 'pricing_page_view',

  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',

  // Admin Actions
  ADMIN_ACCESS: 'admin_access',
  ADMIN_DASHBOARD_VIEW: 'admin_dashboard_view',

  // Service Interactions
  SERVICE_CARD_CLICK: 'service_card_click',
  SERVICE_PAGE_VIEW: 'service_page_view',

  // Navigation
  DOCS_VIEW: 'docs_view',
  SECURITY_PAGE_VIEW: 'security_page_view',
  PLATFORM_PAGE_VIEW: 'platform_page_view',
} as const;

/**
 * Event Properties Type Definitions
 */
export interface ContactFormEvent {
  email?: string; // Hashed for privacy
  type?: string; // From URL query param
  source?: string;
}

export interface PricingCTAEvent {
  package: 'setup' | 'hosting' | 'iot';
  tier?: string;
  referrer?: string;
}

export interface ServiceInteractionEvent {
  service: 'custom-apps' | 'landing-pages' | 'webshops' | 'platform';
  action: 'view' | 'click';
}

export interface AdminEvent {
  section?: string;
  action?: string;
}

/**
 * Track custom conversion goal
 * Only sends event if user has given analytics consent
 */
export function trackConversionGoal(goal: string, properties?: Record<string, any>): void {
  // Validate consent
  if (!hasAnalyticsConsent()) {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event blocked (no consent): ${goal}`);
    }
    return;
  }

  try {
    // Track via Vercel Analytics
    track(goal, properties);

    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event tracked: ${goal}`, properties);
    }
  } catch (error) {
    // Fail silently in production
    if (import.meta.env.DEV) {
      console.error(`[Analytics] Tracking error:`, error);
    }
  }
}

/**
 * Hash email for privacy-preserving analytics
 * Simple hash for event correlation without storing PII
 */
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);
}

/**
 * Track contact form submission with privacy protection
 */
export async function trackContactFormSubmit(email: string, type?: string): Promise<void> {
  const emailHash = await hashEmail(email);

  trackConversionGoal(CONVERSION_GOALS.CONTACT_FORM_SUBMIT, {
    email: emailHash, // Hashed, not raw email
    type,
    source: document.referrer || 'direct',
  });
}

/**
 * Track pricing CTA click
 */
export function trackPricingCTA(package_type: 'setup' | 'hosting' | 'iot', tier?: string): void {
  const goalKey =
    package_type === 'setup'
      ? 'PRICING_SETUP_CTA'
      : package_type === 'hosting'
        ? 'PRICING_HOSTING_CTA'
        : 'PRICING_IOT_CTA';

  trackConversionGoal(CONVERSION_GOALS[goalKey as keyof typeof CONVERSION_GOALS], {
    package: package_type,
    tier,
    referrer: document.referrer,
  });
}

/**
 * Track service card interaction
 */
export function trackServiceInteraction(
  service: ServiceInteractionEvent['service'],
  action: ServiceInteractionEvent['action'] = 'view'
): void {
  const goalKey = action === 'click' ? 'SERVICE_CARD_CLICK' : 'SERVICE_PAGE_VIEW';

  trackConversionGoal(CONVERSION_GOALS[goalKey as keyof typeof CONVERSION_GOALS], {
    service,
    action,
  });
}

/**
 * Track page view (manual trigger if needed)
 * Auto-tracked by Vercel Analytics, but useful for SPA navigation
 */
export function trackPageView(path?: string): void {
  if (!hasAnalyticsConsent()) return;

  // Vercel Analytics auto-tracks page views
  // This is for manual triggers or custom page view logic
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Page view: ${path || window.location.pathname}`);
  }
}
