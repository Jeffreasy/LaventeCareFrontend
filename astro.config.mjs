// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const EN_PATHS = [
  '/',
  '/about',
  '/services',
  '/services/consultancy',
  '/services/ai-prompt-engineering',
  '/services/iot-hardware',
  '/services/custom-platforms',
  '/services/lead-generation',
  '/services/security',
  '/how-we-work',
  '/pricing',
  '/contact',
  '/portfolio',
  '/portfolio/de-koninklijke-loop',
  '/portfolio/smartcoolcare',
  '/portfolio/cf-bouw',
  '/portfolio/dustin-auto-garage',
  '/portfolio/jeffdash',
  '/portfolio/tuinhub',
  '/portfolio/whisky-for-charity',
  '/terms',
];

const EN_ONLY_PATHS = new Set([
  '/about',
  '/services',
  '/services/consultancy',
  '/services/ai-prompt-engineering',
  '/services/iot-hardware',
  '/services/custom-platforms',
  '/services/lead-generation',
  '/services/security',
  '/how-we-work',
  '/pricing',
  '/terms',
]);

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  site: process.env.SITE || 'https://www.laventecare.nl',

  vite: {
    plugins: [tailwindcss()],
    build: {
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
      customPages: EN_PATHS.map((path) => 'https://www.laventecare.com' + path),
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
        return (
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/dashboard') &&
          !pathname.startsWith('/api/') &&
          pathname !== '/login' &&
          pathname !== '/en-index' &&
          !EN_ONLY_PATHS.has(pathname)
        );
      },
    }),
  ],
});
