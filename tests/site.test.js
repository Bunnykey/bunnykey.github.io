import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline from src/consts/site.ts
const SITE = {
  name: 'The Greenhouse',
  siteUrl: 'https://bunnykey.github.io',
  defaultDescription: 'The Greenhouse — AI 분석, 디지털 가든, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.',
  defaultOgImage: '/og-default.svg',
  pinnedRoutes: ['/', '/gardener/', '/flora/', '/nursery/', '/seeds/'],
};

function toCanonicalUrl(pathname) {
  const normalized = pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`;
  return `${SITE.siteUrl}${normalized}`;
}

describe('SITE config', () => {
  it('has required fields', () => {
    assert.ok(SITE.name);
    assert.ok(SITE.siteUrl);
    assert.ok(SITE.defaultDescription);
    assert.ok(SITE.defaultOgImage);
  });

  it('siteUrl has no trailing slash', () => {
    assert.ok(!SITE.siteUrl.endsWith('/'));
  });
});

describe('toCanonicalUrl', () => {
  it('handles root path', () => {
    assert.equal(toCanonicalUrl('/'), 'https://bunnykey.github.io/');
  });

  it('ensures trailing slash', () => {
    assert.equal(toCanonicalUrl('/flora'), 'https://bunnykey.github.io/flora/');
  });

  it('normalizes double trailing slashes', () => {
    assert.equal(toCanonicalUrl('/flora//'), 'https://bunnykey.github.io/flora/');
  });

  it('preserves already-correct paths', () => {
    assert.equal(toCanonicalUrl('/flora/'), 'https://bunnykey.github.io/flora/');
  });
});
