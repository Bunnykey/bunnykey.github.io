import fs from 'node:fs/promises';
import path from 'node:path';

import { fetchNotionEntries, entryToMarkdown } from '../src/content/notion-sync.mjs';

const PROJECT_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const ENV_LOCAL_PATH = path.join(PROJECT_ROOT, '.env.local');
const CONTENT_DIRS = {
  flora: path.join(PROJECT_ROOT, 'src/content/flora'),
  seeds: path.join(PROJECT_ROOT, 'src/content/seeds'),
  nursery: path.join(PROJECT_ROOT, 'src/content/nursery'),
};

async function loadEnvFileIfPresent(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (!process.env[key]) {
        process.env[key] = rest.join('=').trim();
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function loadGitOwnedSlugs(section) {
  const dir = CONTENT_DIRS[section];
  const files = await fs.readdir(dir);
  return new Set(files.filter((file) => file.endsWith('.md')).map((file) => file.replace(/\.md$/, '')));
}

async function main() {
  await loadEnvFileIfPresent(ENV_LOCAL_PATH);

  const config = {
    token: requiredEnv('NOTION_TOKEN'),
    dataSourceId: requiredEnv('NOTION_BLOG_DATA_SOURCE_ID'),
    gitOwnedSlugs: {
      flora: await loadGitOwnedSlugs('flora'),
      seeds: await loadGitOwnedSlugs('seeds'),
      nursery: await loadGitOwnedSlugs('nursery'),
    },
  };

  const results = await fetchNotionEntries(config);
  let written = 0;
  let skipped = 0;

  for (const result of results) {
    if (result.status !== 'ready') {
      skipped += 1;
      continue;
    }

    const filePath = path.join(CONTENT_DIRS[result.entry.section], `${result.entry.slug}.md`);
    await fs.writeFile(filePath, entryToMarkdown(result.entry), 'utf8');
    written += 1;
  }

  console.log(`Notion sync complete: written=${written} skipped=${skipped}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
