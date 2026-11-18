// @ts-check
import { includesLocalTools, OPERATOR_PATHS } from './src/consts/site-output.mjs';
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMedia from './src/lib/remark-media.mjs';

export default defineConfig({
  site: 'https://bunnykey.github.io',
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkMedia],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  integrations: [mdx(), sitemap({
    filter: url => !/^\/(preview|write|workbench|og|flora|seeds|nursery)(\/|$)/.test(new URL(url).pathname) && !url.endsWith('/og-default.png'),
  }), react(), {
    name: 'reader-only-output',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (includesLocalTools()) return;
        await Promise.all(OPERATOR_PATHS.map(route =>
          rm(new URL(route, dir), { recursive: true, force: true }),
        ));
      },
    },
  }]
});
