// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://bunnykey.github.io',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), react()]
});
