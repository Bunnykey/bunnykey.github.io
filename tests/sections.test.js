import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline from src/consts/sections.ts
const SECTION_KEYS = ['flora', 'nursery', 'seeds'];

const NURSERY_STAGE_DOTS = {
  seed: { filled: 1, total: 3, label: 'seed' },
  growing: { filled: 2, total: 3, label: 'growing' },
  evergreen: { filled: 3, total: 3, label: 'evergreen' },
};

const SECTION_INDEX_CONFIG = {
  flora: {
    pageTitle: 'Flora - The Greenhouse',
    heading: 'Flora',
    description: 'AI 런칭, 모델 변화, 에이전트 제품에 대한 큐레이션 노트.',
    emptyMessage: 'No flora posts yet.',
    accentClass: 'text-secondary',
  },
  nursery: {
    pageTitle: 'Nursery - The Greenhouse',
    heading: 'Nursery',
    description: '자라는 아이디어, 미완의 생각, 에버그린 노트.',
    emptyMessage: 'No nursery notes yet.',
    accentClass: 'text-secondary',
  },
  seeds: {
    pageTitle: 'Seeds - The Greenhouse',
    heading: 'Seeds',
    description: '짧은 메모, 순간 포착, 씨앗 단계의 글.',
    emptyMessage: 'No seeds yet.',
    accentClass: 'text-tertiary',
  },
};

function formatArchiveDate(date) {
  return date.toISOString().split('T')[0];
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

describe('SECTION_KEYS', () => {
  it('has exactly 3 sections', () => {
    assert.equal(SECTION_KEYS.length, 3);
  });

  it('contains flora, nursery, seeds', () => {
    assert.deepEqual(SECTION_KEYS, ['flora', 'nursery', 'seeds']);
  });
});

describe('SECTION_INDEX_CONFIG', () => {
  it('has config for all section keys', () => {
    for (const key of SECTION_KEYS) {
      assert.ok(SECTION_INDEX_CONFIG[key], `Missing config for ${key}`);
      assert.ok(SECTION_INDEX_CONFIG[key].heading);
      assert.ok(SECTION_INDEX_CONFIG[key].description);
    }
  });
});

describe('formatArchiveDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    assert.equal(formatArchiveDate(new Date('2026-03-22T12:00:00Z')), '2026-03-22');
  });
});

describe('NURSERY_STAGE_DOTS', () => {
  it('has entries for seed, growing, evergreen', () => {
    assert.deepEqual(Object.keys(NURSERY_STAGE_DOTS), ['seed', 'growing', 'evergreen']);
  });

  it('seed has filled=1, total=3', () => {
    assert.equal(NURSERY_STAGE_DOTS.seed.filled, 1);
    assert.equal(NURSERY_STAGE_DOTS.seed.total, 3);
  });

  it('growing has filled=2, total=3', () => {
    assert.equal(NURSERY_STAGE_DOTS.growing.filled, 2);
    assert.equal(NURSERY_STAGE_DOTS.growing.total, 3);
  });

  it('evergreen has filled=3, total=3', () => {
    assert.equal(NURSERY_STAGE_DOTS.evergreen.filled, 3);
    assert.equal(NURSERY_STAGE_DOTS.evergreen.total, 3);
  });
});

describe('sortByDateDesc', () => {
  it('sorts items by date descending', () => {
    const items = [
      { data: { date: new Date('2026-01-01') } },
      { data: { date: new Date('2026-03-01') } },
      { data: { date: new Date('2026-02-01') } },
    ];
    const sorted = sortByDateDesc(items);
    assert.equal(sorted[0].data.date.getMonth(), 2); // March
    assert.equal(sorted[1].data.date.getMonth(), 1); // Feb
    assert.equal(sorted[2].data.date.getMonth(), 0); // Jan
  });
});
