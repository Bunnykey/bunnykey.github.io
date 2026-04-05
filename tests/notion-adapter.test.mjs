import test from 'node:test';
import assert from 'node:assert/strict';

import {
  blocksToMarkdown,
  normalizeNotionPage,
  slugify,
} from '../src/content/notion-adapter.mjs';

test('slugify normalizes mixed-case titles into single-segment slugs', () => {
  assert.equal(slugify('GPT-5.4 Launch Notes'), 'gpt-54-launch-notes');
});

test('normalizeNotionPage maps common property names into cms entry shape', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'A Notion Entry' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
      Tags: {
        type: 'multi_select',
        multi_select: [{ name: 'AI' }, { name: 'Agents' }],
      },
      Highlight: {
        type: 'checkbox',
        checkbox: true,
      },
    },
  }, 'flora');

  assert.equal(result.status, 'ready');
  assert.equal(result.entry.title, 'A Notion Entry');
  assert.equal(result.entry.slug, 'a-notion-entry');
  assert.equal(result.entry.summary, 'A short summary');
  assert.deepEqual(result.entry.tags, ['ai', 'agents']);
  assert.equal(result.entry.highlight, true);
  assert.equal(result.entry.canonicalPath, '/flora/a-notion-entry/');
});

test('normalizeNotionPage prefers explicit Slug property when present', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'Ignored Title Slug' }],
      },
      Slug: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'custom-slug' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
    },
  }, 'seeds');

  assert.equal(result.entry.slug, 'custom-slug');
  assert.equal(result.entry.canonicalPath, '/seeds/custom-slug/');
});

test('normalizeNotionPage skips unpublished entries', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'Draft' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
      Published: {
        type: 'checkbox',
        checkbox: false,
      },
    },
  }, 'flora');

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'unpublished',
  });
});

test('blocksToMarkdown renders supported block types into markdown', () => {
  const markdown = blocksToMarkdown([
    {
      type: 'heading_2',
      heading_2: {
        rich_text: [{ plain_text: 'Heading' }],
      },
      has_children: false,
    },
    {
      type: 'paragraph',
      paragraph: {
        rich_text: [{ plain_text: 'Paragraph body' }],
      },
      has_children: false,
    },
    {
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ plain_text: 'Bullet item' }],
      },
      has_children: false,
    },
    {
      type: 'code',
      code: {
        language: 'javascript',
        rich_text: [{ plain_text: 'console.log("hi")' }],
      },
      has_children: false,
    },
  ]);

  assert.match(markdown, /^## Heading/m);
  assert.match(markdown, /Paragraph body/);
  assert.match(markdown, /^- Bullet item/m);
  assert.match(markdown, /```javascript/);
  assert.match(markdown, /console\.log\("hi"\)/);
});
