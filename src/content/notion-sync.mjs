import fs from 'node:fs/promises';
import path from 'node:path';
import { blocksToMarkdown, normalizeNotionPage } from './notion-adapter.mjs';
import { queryDataSource, fetchBlockTree } from './notion-client.mjs';

// Download Notion-hosted images (signed URLs expire) to public/img/
// Filename is deterministic so re-syncing doesn't duplicate.
function makeImageResolver(publicImgDir) {
  return async ({ url, blockId }) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`image fetch ${res.status}`);
    const pathname = new URL(url).pathname;
    const ext = (path.extname(pathname) || '.png').toLowerCase();
    const safeExt = /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '.png';
    const filename = `notion-${blockId.replace(/-/g, '')}${safeExt}`;
    await fs.mkdir(publicImgDir, { recursive: true });
    const filePath = path.join(publicImgDir, filename);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filePath, buf);
    return `/img/${filename}`;
  };
}

export async function fetchNotionEntries(config) {
  const pages = await queryDataSource(config.dataSourceId, config.token);
  const resolveImage = config.publicImgDir ? makeImageResolver(config.publicImgDir) : undefined;
  return Promise.all(
    pages.map(async (page) => {
      const blocks = await fetchBlockTree(page.id, config.token);
      const body = await blocksToMarkdown(blocks, { resolveImage });
      return normalizeNotionPage(page, {
        gitOwnedSlugs: config.gitOwnedSlugs,
        body,
      });
    }),
  );
}

// Notion users often type "##텍스트" (no space) in paragraph blocks.
// CommonMark requires a space after the hashes to treat it as a heading,
// so normalize each line before writing.
function normalizeBody(body) {
  return body
    .split('\n')
    .map((line) => line.replace(/^(\s*)(#{1,6})([^\s#])/, '$1$2 $3'))
    .join('\n');
}

export function entryToMarkdown(entry) {
  const lines = ['---'];
  lines.push(`title: "${entry.title.replaceAll('"', '\\"')}"`);
  lines.push(`date: ${entry.date.toISOString().slice(0, 10)}`);
  lines.push(`summary: "${entry.summary.replaceAll('"', '\\"')}"`);

  if (entry.section === 'flora') {
    lines.push(`highlight: ${entry.highlight ? 'true' : 'false'}`);
  }

  if (entry.demo) {
    lines.push(`demo: "${entry.demo}"`);
  }

  if (entry.stage) {
    lines.push(`stage: "${entry.stage}"`);
  }

  const tags = entry.tags?.length
    ? entry.tags.map((tag) => `"${tag}"`).join(', ')
    : `"${entry.section}"`;
  lines.push(`tags: [${tags}]`);

  if (entry.series) {
    lines.push(`series:`);
    lines.push(`  name: "${entry.series.name}"`);
    lines.push(`  title: "${entry.series.title}"`);
    lines.push(`  order: ${entry.series.order}`);
  }

  lines.push('---', '', normalizeBody(entry.body).trim(), '');
  return lines.join('\n');
}
