import { blocksToMarkdown, normalizeNotionPage } from './notion-adapter.mjs';
import { queryDataSource, fetchBlockTree } from './notion-client.mjs';

function normalizeSectionConfig(config) {
  return Object.entries(config)
    .filter(([, value]) => value)
    .map(([section, dataSourceId]) => ({ section, dataSourceId }));
}

export async function fetchNotionEntries(config) {
  const sectionConfigs = normalizeSectionConfig(config.dataSources);
  const allEntries = [];

  for (const { section, dataSourceId } of sectionConfigs) {
    const pages = await queryDataSource(dataSourceId, config.token);
    for (const page of pages) {
      const blocks = await fetchBlockTree(page.id, config.token);
      const body = blocksToMarkdown(blocks);
      const normalized = normalizeNotionPage(page, section, {
        gitOwnedSlugs: config.gitOwnedSlugs,
        body,
      });
      allEntries.push(normalized);
    }
  }

  return allEntries;
}

export function entryToMarkdown(entry) {
  const lines = ['---'];
  lines.push(`title: "${entry.title.replaceAll('"', '\\"')}"`);
  lines.push(`date: ${entry.date.toISOString().slice(0, 10)}`);
  lines.push(`summary: "${entry.summary.replaceAll('"', '\\"')}"`);

  if (entry.section === 'flora') {
    lines.push(`highlight: ${entry.highlight ? 'true' : 'false'}`);
  }

  if (entry.section === 'seeds' || entry.section === 'flora') {
    const tags = entry.tags?.length
      ? entry.tags.map((tag) => `"${tag}"`).join(', ')
      : `"${entry.section}"`;
    lines.push(`tags: [${tags}]`);
  }

  lines.push('---', '', entry.body.trim(), '');
  return lines.join('\n');
}
