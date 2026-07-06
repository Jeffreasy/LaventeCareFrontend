/**
 * Site configuration — locale-aware
 *
 * Use getSettings(locale) to get the correct config per language.
 * The shape is identical for both locales so all components work seamlessly.
 */

import type { Locale } from './i18n';

interface MenuLink {
  cached_url: string;
}

interface MenuItem {
  label: string;
  link: MenuLink;
  items?: MenuItem[];
}

interface FooterColumn {
  title: string;
  links: { label: string; link: MenuLink }[];
}

interface SiteSettings {
  site_name: string;
  meta_title: string;
  meta_description: string;
  favicon: { filename: string }[];
  logo: { filename: string; alt: string }[];
  main_menu: MenuItem[];
  footer_columns: FooterColumn[];
  social_links: { platform: string; url: string }[];
  copyright_text: string;
  gtm_id: string | null;
  cookie_consent_code: string | null;
  og_image: { filename: string; alt: string }[];
}

const LOGO_URL =
  'https://res.cloudinary.com/dgfuv7wif/image/upload/v1769967340/Gemini_Generated_Image_g7euilg7euilg7eu-removebg-preview_1_dwzy2f_c_crop_w_1920_h_1920_ar_1_1_g_auto_e_improve_e_sharpen_u6yfpq.png';

const settingsNL: SiteSettings = {
  site_name: 'LaventeCare',
  meta_title: 'Software en systemen voor het mkb — van idee tot werkend systeem',
  meta_description:
    'LaventeCare bouwt systemen die bedrijven efficiënter maken, fouten voorkomen en groei versnellen: AI, IoT, maatwerkplatformen, lead generation en security-first systemen.',
  favicon: [{ filename: '/favicon.svg' }],
  logo: [{ filename: LOGO_URL, alt: 'LaventeCare' }],
  main_menu: [
    { label: 'Home', link: { cached_url: 'home' } },
    { label: 'Over', link: { cached_url: 'over' } },
    {
      label: 'Diensten',
      link: { cached_url: 'diensten' },
      items: [
        { label: 'IT Advies & Consultancy', link: { cached_url: 'diensten/consultancy' } },
        { label: 'AI & Automatisering', link: { cached_url: 'diensten/ai-prompt-engineering' } },
        { label: 'IoT & Hardware', link: { cached_url: 'diensten/iot-hardware' } },
        { label: 'Maatwerk Platformen', link: { cached_url: 'diensten/maatwerk-platformen' } },
        { label: 'Klanten werven', link: { cached_url: 'diensten/lead-generation' } },
        { label: 'Beveiliging & Toegang', link: { cached_url: 'diensten/security' } },
        { label: 'Alle Diensten', link: { cached_url: 'diensten' } },
      ],
    },
    { label: 'Portfolio', link: { cached_url: 'portfolio' } },
    { label: 'Werkwijze', link: { cached_url: 'werkwijze' } },
    { label: 'Prijzen', link: { cached_url: 'prijzen' } },
  ],
  footer_columns: [
    {
      title: 'Diensten',
      links: [
        { label: 'IT Advies & Consultancy', link: { cached_url: 'diensten/consultancy' } },
        { label: 'AI & Automatisering', link: { cached_url: 'diensten/ai-prompt-engineering' } },
        { label: 'IoT & Hardware', link: { cached_url: 'diensten/iot-hardware' } },
        { label: 'Maatwerk Platformen', link: { cached_url: 'diensten/maatwerk-platformen' } },
        { label: 'Klanten werven', link: { cached_url: 'diensten/lead-generation' } },
        { label: 'Beveiliging & Toegang', link: { cached_url: 'diensten/security' } },
        { label: 'Prijzen', link: { cached_url: 'prijzen' } },
      ],
    },
    {
      title: 'Bedrijf',
      links: [
        { label: 'Over Jeffrey', link: { cached_url: 'over' } },
        { label: 'Portfolio', link: { cached_url: 'portfolio' } },
        { label: 'Werkwijze', link: { cached_url: 'werkwijze' } },
        { label: 'Contact', link: { cached_url: 'contact' } },
      ],
    },
    {
      title: 'Meer',
      links: [
        { label: 'LinkedIn', link: { cached_url: 'https://linkedin.com/in/jeffrey-lavente' } },
        { label: 'GitHub', link: { cached_url: 'https://github.com/Jeffreasy' } },
        { label: 'Instagram', link: { cached_url: 'https://www.instagram.com/jjalavente/' } },
        { label: 'Algemene Voorwaarden', link: { cached_url: 'voorwaarden' } },
        { label: 'Admin Login', link: { cached_url: 'login' } },
      ],
    },
  ],
  social_links: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/jeffrey-lavente' },
    { platform: 'GitHub', url: 'https://github.com/Jeffreasy' },
    { platform: 'Instagram', url: 'https://www.instagram.com/jjalavente/' },
  ],
  copyright_text: '© 2026 LaventeCare — Jeffrey Lavente | KVK 88162710 | Dronten',
  gtm_id: null,
  cookie_consent_code: null,
  og_image: [
    { filename: LOGO_URL, alt: 'LaventeCare — B2B systeempartner voor mkb. Van idee tot werkend systeem.' },
  ],
};

const settingsEN: SiteSettings = {
  site_name: 'LaventeCare',
  meta_title: 'Software and systems for SMEs — from idea to working system',
  meta_description:
    'LaventeCare builds systems that make businesses more efficient, prevent errors and accelerate growth: AI, IoT, custom platforms, lead generation and security-first systems.',
  favicon: [{ filename: '/favicon.svg' }],
  logo: [{ filename: LOGO_URL, alt: 'LaventeCare' }],
  main_menu: [
    { label: 'Home', link: { cached_url: 'home' } },
    { label: 'About', link: { cached_url: 'about' } },
    {
      label: 'Services',
      link: { cached_url: 'services' },
      items: [
        { label: 'IT Advice & Consultancy', link: { cached_url: 'services/consultancy' } },
        { label: 'AI & Automation', link: { cached_url: 'services/ai-prompt-engineering' } },
        { label: 'IoT & Hardware', link: { cached_url: 'services/iot-hardware' } },
        { label: 'Custom Platforms', link: { cached_url: 'services/custom-platforms' } },
        { label: 'Win customers', link: { cached_url: 'services/lead-generation' } },
        { label: 'Security & Access', link: { cached_url: 'services/security' } },
        { label: 'All Services', link: { cached_url: 'services' } },
      ],
    },
    { label: 'Portfolio', link: { cached_url: 'portfolio' } },
    { label: 'How We Work', link: { cached_url: 'how-we-work' } },
    { label: 'Pricing', link: { cached_url: 'pricing' } },
  ],
  footer_columns: [
    {
      title: 'Services',
      links: [
        { label: 'IT Advice & Consultancy', link: { cached_url: 'services/consultancy' } },
        { label: 'AI & Automation', link: { cached_url: 'services/ai-prompt-engineering' } },
        { label: 'IoT & Hardware', link: { cached_url: 'services/iot-hardware' } },
        { label: 'Custom Platforms', link: { cached_url: 'services/custom-platforms' } },
        { label: 'Win customers', link: { cached_url: 'services/lead-generation' } },
        { label: 'Security & Access', link: { cached_url: 'services/security' } },
        { label: 'Pricing', link: { cached_url: 'pricing' } },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Jeffrey', link: { cached_url: 'about' } },
        { label: 'Portfolio', link: { cached_url: 'portfolio' } },
        { label: 'How We Work', link: { cached_url: 'how-we-work' } },
        { label: 'Contact', link: { cached_url: 'contact' } },
      ],
    },
    {
      title: 'More',
      links: [
        { label: 'LinkedIn', link: { cached_url: 'https://linkedin.com/in/jeffrey-lavente' } },
        { label: 'GitHub', link: { cached_url: 'https://github.com/Jeffreasy' } },
        { label: 'Instagram', link: { cached_url: 'https://www.instagram.com/jjalavente/' } },
        { label: 'Terms & Conditions', link: { cached_url: 'terms' } },
        { label: 'Admin Login', link: { cached_url: 'login' } },
      ],
    },
  ],
  social_links: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/jeffrey-lavente' },
    { platform: 'GitHub', url: 'https://github.com/Jeffreasy' },
    { platform: 'Instagram', url: 'https://www.instagram.com/jjalavente/' },
  ],
  copyright_text: '© 2026 LaventeCare — Jeffrey Lavente | CoC 88162710 | Dronten, Netherlands',
  gtm_id: null,
  cookie_consent_code: null,
  og_image: [
    { filename: LOGO_URL, alt: 'LaventeCare — B2B systems partner for SMEs. From idea to working system.' },
  ],
};

/**
 * Get site-wide settings for the given locale.
 * Drop-in replacement for the old `settings` import.
 */
export function getSettings(locale: Locale): SiteSettings {
  return locale === 'en' ? settingsEN : settingsNL;
}

/**
 * @deprecated Use getSettings(locale) instead.
 * Retained for backward compatibility during migration.
 */
export const settings = settingsNL;
