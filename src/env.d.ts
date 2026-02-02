/// <reference types="astro/client" />
/// <reference types="@types/alpinejs" />

interface ImportMetaEnv {
    readonly PROD: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    Alpine: import('alpinejs').Alpine;
}

declare module '@alpinejs/collapse' {
    import { PluginCallback } from 'alpinejs';
    const collapse: PluginCallback;
    export default collapse;
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

