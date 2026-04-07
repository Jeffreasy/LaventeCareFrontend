// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
    }),
    site: process.env.SITE || 'https://www.laventecare.nl',

    vite: {
        plugins: [
            // @ts-ignore
            tailwindcss()
        ],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        'form-vendor': ['@conform-to/react', '@conform-to/zod', 'zod'],
                        'analytics-vendor': ['@vercel/analytics', '@vercel/speed-insights', 'web-vitals'],
                        'store-vendor': ['nanostores', '@nanostores/persistent'],
                    },
                },
            },
            chunkSizeWarningLimit: 600,
            minify: 'esbuild',
        },
        optimizeDeps: {
            include: ['react', 'react-dom', '@conform-to/react', '@conform-to/zod'],
        },
    },

    integrations: [
        react(),
        sitemap({
            filter: (page) =>
                !page.includes('/admin') &&
                !page.includes('/docs') &&
                !page.includes('/api/') &&
                !page.includes('/login') &&
                !page.includes('/pricing'),
        }),
    ],
});