// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
    output: 'server', // ✅ Server-side rendering for auth middleware
    adapter: vercel(),
    // Change to your production URL later
    site: 'http://localhost:4321',

    vite: {
        plugins: [
            // @ts-ignore
            tailwindcss()
        ],
    },

    integrations: [
        react(),
    ],

    server: {
        headers: {
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
                "img-src 'self' data: https:",
                "font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com",
                "connect-src 'self' https://laventecareauthsystems.onrender.com https://tangible-hyena-200.convex.cloud https://tangible-hyena-200.convex.site",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ].join('; ')
        }
    },
});