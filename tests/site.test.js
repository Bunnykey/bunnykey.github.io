import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SITE, toCanonicalUrl } from '../src/consts/site.ts';

describe('SITE config', () => {
  it('has required fields', () => {
    assert.equal(SITE.name, '버니사이드');
    assert.ok(SITE.siteUrl);
    assert.ok(SITE.defaultDescription);
    assert.equal(SITE.defaultOgImage, '/og-default.png');
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
