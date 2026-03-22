import { blocksToMarkdown, normalizeNotionPage } from './notion-adapter.mjs';
import { queryDataSource, fetchBlockTree } from './notion-client.mjs';

function normalizeSectionConfig(config) {
  return Object.entries(config)
    .filter(([, value]) => value)
    .map(([section, dataSourceId]) => ({ section, dataSourceId }));
}

async function fetchSectionEntries({ section, dataSourceId }, config) {
  const pages = await queryDataSource(dataSourceId, config.token);
  const entries = await Promise.all(
    pages.map(async (page) => {
      const blocks = await fetchBlockTree(page.id, config.token);
      const body = blocksToMarkdown(blocks);
      return normalizeNotionPage(page, section, {
        gitOwnedSlugs: config.gitOwnedSlugs,
        body,
      });
    }),
  );
  return entries;
}

export async function fetchNotionEntries(config) {
  const sectionConfigs = normalizeSectionConfig(config.dataSources);
  const results = await Promise.all(
    sectionConfigs.map((sc) => fetchSectionEntries(sc, config)),
  );
  return results.flat();
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
