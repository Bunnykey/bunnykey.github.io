// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMedia from './src/lib/remark-media.mjs';
import keystatic from '@keystatic/astro';
import writingTrial from './scripts/keystatic-trial-integration.mjs';
import { requireRemoteWriting } from './scripts/writing-deployment.mjs';

const trialMode = process.env.KEYSTATIC_TRIAL;
const remoteWriting = trialMode === 'remote';
if (remoteWriting) requireRemoteWriting(process.env);
const adapter = remoteWriting ? (await import('@astrojs/vercel')).default() : undefined;

export default defineConfig({
  site: 'https://bunnykey.github.io',
  adapter,
  vite: {
    plugins: [tailwindcss()],
    // The Keystatic API imports Astro's server-only virtual environment module.
    optimizeDeps: { exclude: ['@keystatic/astro/api'] },
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
  integrations: [mdx(), sitemap(), react(),
    ...(trialMode ? [writingTrial()] : []),
    ...(trialMode === 'editor' || remoteWriting ? [keystatic()] : []),
  ]
});
