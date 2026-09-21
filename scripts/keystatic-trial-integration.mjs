import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';

export default function writingTrial() {
  const assets = new URL('../writing-trial/assets/', import.meta.url);
  return {
    name: 'bunnykey-writing-trial',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        injectRoute({ pattern: '/writing-preview/[slug]', entrypoint: './writing-trial/pages/preview.astro' });
        injectRoute({ pattern: '/writing-preview', entrypoint: './writing-trial/pages/index.astro' });
        updateConfig({ vite: { plugins: [{
          name: 'writing-trial-assets',
          configureServer(server) {
            server.middlewares.use('/writing-assets', sirv(fileURLToPath(assets), { dev: true }));
          },
        }] } });
      },
      'astro:build:done': async ({ dir }) => {
        // Vercel serves static assets from its Build Output API directory.
        const output = process.env.KEYSTATIC_TRIAL === 'remote'
          ? new URL('../.vercel/output/static/', import.meta.url) : dir;
        const destination = new URL('writing-assets/', output);
        await mkdir(destination, { recursive: true });
        await cp(assets, destination, { recursive: true });
      },
    },
  };
}
