import { serializePost, stableId, revisionOf } from '../lib/publishing/serialization.mjs';
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
    const buf = Buffer.from(await res.arrayBuffer());
    const filename = `notion-${blockId.replace(/-/g, '')}-${revisionOf(buf).slice(0,12)}${safeExt}`;
    await fs.mkdir(publicImgDir, { recursive: true });
    const filePath = path.join(publicImgDir, filename);
    await fs.writeFile(filePath, buf);
    return `/img/${filename}`;
  };
}

export async function fetchNotionEntries(config) {
  const pages = await queryDataSource(config.dataSourceId, config.token);
  const resolveImage = config.publicImgDir ? makeImageResolver(config.publicImgDir) : undefined;
  return Promise.all(
    pages.map(async (page) => {
      const initial=normalizeNotionPage(page,{gitOwnedSlugs:config.gitOwnedSlugs,body:''});
      if(initial.status!=='ready')return initial;
      if(config.ownedIds?.has(initial.entry.id))return {status:'skipped',reason:'git_source_conflict'};
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
  const {section,slug,canonicalPath,body,sourceId,...metadata}=entry;
  return serializePost(section, {...metadata,id:metadata.id || stableId('cms:'+sourceId),contractVersion:1,sourceId,draft:false}, normalizeBody(body).trim()+'\n');
}
