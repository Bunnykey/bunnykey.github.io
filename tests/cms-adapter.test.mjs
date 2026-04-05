import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCmsEntry } from '../src/content/cms-adapter.mjs';

test('normalizes a valid flora entry into a stable route shape', () => {
  const result = normalizeCmsEntry({
    sourceId: 'abc',
    section: 'flora',
    slug: 'GPT-5-Launch',
    title: 'GPT-5 Launch',
    date: '2026-03-16',
    summary: 'A summary',
    body: 'Body copy',
    tags: ['OpenAI', 'Launch'],
  });

  assert.equal(result.status, 'ready');
  assert.equal(result.entry.section, 'flora');
  assert.equal(result.entry.slug, 'gpt-5-launch');
  assert.equal(result.entry.canonicalPath, '/flora/gpt-5-launch/');
  assert.deepEqual(result.entry.tags, ['openai', 'launch']);
});

test('rejects unsupported sections', () => {
  assert.throws(
    () =>
      normalizeCmsEntry({
        sourceId: 'abc',
        section: 'garden',
        slug: 'future-item',
        title: 'Future Item',
        date: '2026-03-16',
        summary: 'A summary',
        body: 'Body copy',
      }),
    /unsupported section/i,
  );
});

test('rejects slugs with nested path separators', () => {
  assert.throws(
    () =>
      normalizeCmsEntry({
        sourceId: 'abc',
        section: 'flora',
        slug: 'nested/path',
        title: 'Nested Path',
        date: '2026-03-16',
        summary: 'A summary',
        body: 'Body copy',
      }),
    /single path segment/i,
  );
});

test('skips entries that collide with git-owned slugs', () => {
  const result = normalizeCmsEntry(
    {
      sourceId: 'abc',
      section: 'flora',
      slug: 'context-engineering-token-flow',
      title: 'Context Engineering',
      date: '2026-03-16',
      summary: 'A summary',
      body: 'Body copy',
    },
    {
      gitOwnedSlugs: {
        flora: new Set(['context-engineering-token-flow']),
      },
    },
  );

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'git_slug_conflict',
  });
});

test('skips draft entries before they become publishable', () => {
  const result = normalizeCmsEntry({
    sourceId: 'abc',
    section: 'seeds',
    slug: 'draft-note',
    title: 'Draft Note',
    date: '2026-03-16',
    summary: 'A summary',
    body: 'Body copy',
    draft: true,
  });

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'draft',
  });
});
