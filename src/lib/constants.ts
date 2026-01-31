/**
 * Application Constants
 * 
 * Centralized location for static configuration data
 */

export const SITE_CONFIG = {
    name: 'LaventeCare',
    title: 'LaventeCare - Enterprise Astro Application',
    description: 'Modern, type-safe web development with Astro',
    url: 'http://localhost:4321',
} as const;

// Navigation items can be defined here
export const NAV_ITEMS = [
    // { label: 'Home', href: '/' },
    // { label: 'About', href: '/about' },
    // { label: 'Contact', href: '/contact' },
] as const;

// Footer columns configuration
export const FOOTER_COLUMNS = [
    // {
    //   title: 'Product',
    //   links: [
    //     { label: 'Features', href: '/features' },
    //     { label: 'Pricing', href: '/pricing' },
    //   ]
    // },
] as const;

// Social links
export const SOCIAL_LINKS = [
    // { platform: 'GitHub', url: 'https://github.com/yourorg' },
    // { platform: 'Twitter', url: 'https://twitter.com/yourorg' },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
    MAIL_CONFIG: '/api/v1/admin/mail-config',
    EMAIL_STATS: '/api/v1/admin/email-stats',
    MAIL_TEST: '/api/v1/admin/mail-config/test',
} as const;
