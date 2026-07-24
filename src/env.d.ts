/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SITE: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_TENANT_ID: string;
  readonly GTM_ID?: string;
  readonly JWT_ISSUER?: string;
  readonly JWT_AUDIENCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Astro Middleware Locals
type VercelEdgeLocals = import('@astrojs/vercel').EdgeLocals;

declare namespace App {
  interface Locals extends VercelEdgeLocals {
    isLoggedIn: boolean;
    isAdmin: boolean;
    accessToken?: string;
    csrfToken?: string;
    locale: import('./lib/i18n').Locale;
  }
}
