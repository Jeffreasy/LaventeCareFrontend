// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'http://localhost:4321', // Change to your production URL later
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        react(),
    ],
});
