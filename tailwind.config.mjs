/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    // Tailwind v4 uses @theme in CSS - config is minimal now
    plugins: [require("tailwindcss-animate")],
}
