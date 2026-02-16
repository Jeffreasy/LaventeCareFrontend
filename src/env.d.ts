/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SITE: string;
    readonly PUBLIC_API_URL: string;
    readonly PUBLIC_TENANT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Astro Middleware Locals
declare namespace App {
    interface Locals {
        isLoggedIn: boolean;
        isAdmin: boolean;
        accessToken?: string;
        csrfToken?: string;
    }
}

