// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
    output: 'server', // ✅ Server-side rendering for auth middleware
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
    }),
    // Change to your production URL later
    site: 'http://localhost:4321',

    vite: {
        plugins: [
            // @ts-ignore
            tailwindcss()
        ],
        build: {
            // Manual chunk splitting for better caching
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Separate React vendor chunk
                        'react-vendor': ['react', 'react-dom'],
                        // Separate form libraries (biggest bundle)
                        'form-vendor': ['@conform-to/react', '@conform-to/zod', 'zod'],
                        // Analytics vendor chunk
                        'analytics-vendor': ['@vercel/analytics', '@vercel/speed-insights', 'web-vitals'],
                        // Nanostores
                        'store-vendor': ['nanostores', '@nanostores/persistent'],
                    },
                },
            },
            // Increase chunk size warning limit (we have intentional large chunks)
            chunkSizeWarningLimit: 600,
            // Use esbuild minifier (faster, built-in)
            minify: 'esbuild',
        },
        // Optimize dependencies
        optimizeDeps: {
            include: ['react', 'react-dom', '@conform-to/react', '@conform-to/zod'],
        },
    },

    integrations: [
        react(),
    ],

    server: {
        headers: {
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
                "img-src 'self' data: https:",
                "font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com",
                "connect-src 'self' https://laventecareauthsystems.onrender.com https://tangible-hyena-200.convex.cloud https://tangible-hyena-200.convex.site https://vitals.vercel-insights.com",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ].join('; ')
        }
    },
});