import { blocksToMarkdown, normalizeNotionPage } from './notion-adapter.mjs';
import { queryDataSource, fetchBlockTree } from './notion-client.mjs';

export async function fetchNotionEntries(config) {
  const pages = await queryDataSource(config.dataSourceId, config.token);
  return Promise.all(
    pages.map(async (page) => {
      const blocks = await fetchBlockTree(page.id, config.token);
      const body = blocksToMarkdown(blocks);
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
