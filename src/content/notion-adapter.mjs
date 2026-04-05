export { slugify } from './cms-adapter.mjs';
import { normalizeCmsEntry, slugify } from './cms-adapter.mjs';

const TITLE_KEYS = ['Title', 'Name'];
const DATE_KEYS = ['Date', 'Published At', 'Publish Date'];
const SUMMARY_KEYS = ['Summary', 'Description', 'Excerpt'];
const SLUG_KEYS = ['Slug'];
const TAG_KEYS = ['Tags'];
const HIGHLIGHT_KEYS = ['Highlight'];
const PUBLISHED_KEYS = ['Published'];
const SECTION_KEYS = ['Section'];
const DEMO_KEYS = ['Demo'];
const STAGE_KEYS = ['Stage'];
const SERIES_NAME_KEYS = ['Series Name'];
const SERIES_TITLE_KEYS = ['Series Title'];
const SERIES_ORDER_KEYS = ['Series Order'];

function readPlainText(property) {
  if (!property) return '';
  if (property.type === 'title') {
    return property.title?.map((item) => item.plain_text || '').join('').trim() || '';
  }
  if (property.type === 'rich_text') {
    return property.rich_text?.map((item) => item.plain_text || '').join('').trim() || '';
  }
  return '';
}

function readDate(property) {
  if (property?.type === 'date') {
    return property.date?.start || '';
  }
  return '';
}

function readMultiSelect(property) {
  if (property?.type === 'multi_select') {
    return property.multi_select?.map((item) => item.name).filter(Boolean) || [];
  }
  return [];
}

function readCheckbox(property, fallback = false) {
  if (property?.type === 'checkbox') {
    return Boolean(property.checkbox);
  }
  return fallback;
}

function readSelect(property) {
  if (property?.type === 'select') {
    return property.select?.name || '';
  }
  return '';
}

function readNumber(property) {
  if (property?.type === 'number') {
    return property.number;
  }
  return undefined;
}

function getFirstProperty(properties, keys) {
  for (const key of keys) {
    if (properties[key]) return properties[key];
  }
  return undefined;
}

export function normalizeNotionPage(page, options = {}) {
  const properties = page.properties || {};
  const section = readSelect(getFirstProperty(properties, SECTION_KEYS)).toLowerCase();
  if (!section) {
    return { status: 'skipped', reason: 'no_section' };
  }
  const title = readPlainText(getFirstProperty(properties, TITLE_KEYS));
  const slugProperty = readPlainText(getFirstProperty(properties, SLUG_KEYS));
  const date = readDate(getFirstProperty(properties, DATE_KEYS));
  const summary = readPlainText(getFirstProperty(properties, SUMMARY_KEYS));
  const tags = readMultiSelect(getFirstProperty(properties, TAG_KEYS));
  const highlight = readCheckbox(getFirstProperty(properties, HIGHLIGHT_KEYS), false);
  const publishedProp = getFirstProperty(properties, PUBLISHED_KEYS);
  const published = publishedProp ? readCheckbox(publishedProp, true) : true;
  const demo = readSelect(getFirstProperty(properties, DEMO_KEYS));
  const stage = readSelect(getFirstProperty(properties, STAGE_KEYS));
  const seriesName = readPlainText(getFirstProperty(properties, SERIES_NAME_KEYS));
  const seriesTitle = readPlainText(getFirstProperty(properties, SERIES_TITLE_KEYS));
  const seriesOrder = readNumber(getFirstProperty(properties, SERIES_ORDER_KEYS));

  if (!published) {
    return { status: 'skipped', reason: 'unpublished' };
  }

  const series = seriesName
    ? { name: seriesName, title: seriesTitle || seriesName, order: seriesOrder || 1 }
    : undefined;

  return normalizeCmsEntry(
    {
      sourceId: page.id,
      section,
      slug: slugProperty || slugify(title),
      title,
      date,
      summary,
      body: options.body || '',
      tags,
      highlight,
      draft: false,
      ...(demo ? { demo } : {}),
      ...(stage ? { stage } : {}),
      ...(series ? { series } : {}),
    },
    options,
  );
}

function renderRichText(richText = []) {
  return richText
    .map((item) => {
      const text = item.plain_text || '';
      const href = item.href || item.text?.link?.url;
      return href ? `[${text}](${href})` : text;
    })
    .join('');
}

export function blocksToMarkdown(blocks = []) {
  const lines = [];

  for (const block of blocks) {
    if (block.type === 'paragraph') {
      lines.push(renderRichText(block.paragraph?.rich_text));
      lines.push('');
      continue;
    }

    if (block.type === 'heading_1') {
      lines.push(`# ${renderRichText(block.heading_1?.rich_text)}`);
      lines.push('');
      continue;
    }

    if (block.type === 'heading_2') {
      lines.push(`## ${renderRichText(block.heading_2?.rich_text)}`);
      lines.push('');
      continue;
    }

    if (block.type === 'heading_3') {
      lines.push(`### ${renderRichText(block.heading_3?.rich_text)}`);
      lines.push('');
      continue;
    }

    if (block.type === 'bulleted_list_item') {
      lines.push(`- ${renderRichText(block.bulleted_list_item?.rich_text)}`);
      continue;
    }

    if (block.type === 'numbered_list_item') {
      lines.push(`1. ${renderRichText(block.numbered_list_item?.rich_text)}`);
      continue;
    }

    if (block.type === 'quote') {
      lines.push(`> ${renderRichText(block.quote?.rich_text)}`);
      lines.push('');
      continue;
    }

    if (block.type === 'code') {
      const language = block.code?.language || '';
      lines.push(`\`\`\`${language}`);
      lines.push(renderRichText(block.code?.rich_text));
      lines.push('```');
      lines.push('');
      continue;
    }

    if (block.type === 'divider') {
      lines.push('---');
      lines.push('');
      continue;
    }
  }

  return lines.join('\n').trim();
}
