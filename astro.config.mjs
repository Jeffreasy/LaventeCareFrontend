// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    middlewareMode: 'edge',
    webAnalytics: {
      enabled: true,
    },
  }),
  site: process.env.SITE || 'https://www.laventecare.nl',

  vite: {
    plugins: [
      // @ts-ignore
      tailwindcss(),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      minify: 'esbuild',
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },

  integrations: [react()],
});
