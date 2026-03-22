import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline the function since node --test can't import .ts directly
function readingTime(text) {
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const englishWords = text.replace(/[\u3131-\uD79D]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}

describe('readingTime', () => {
  it('returns 1 for empty text', () => {
    assert.equal(readingTime(''), 1);
  });

  it('returns 1 for very short text', () => {
    assert.equal(readingTime('Hello world'), 1);
  });

  it('calculates English text at 200 words/min', () => {
    const words = Array(200).fill('word').join(' ');
    assert.equal(readingTime(words), 1);
  });

  it('calculates Korean text at 500 chars/min', () => {
    const chars = '가'.repeat(500);
    assert.equal(readingTime(chars), 1);
  });

  it('rounds to nearest minute', () => {
    const words = Array(500).fill('word').join(' ');
    assert.equal(readingTime(words), 3); // 500/200 = 2.5 → 3
  });

  it('handles mixed Korean and English', () => {
    const mixed = '가'.repeat(250) + ' ' + Array(100).fill('word').join(' ');
    // 250/500 + 100/200 = 0.5 + 0.5 = 1
    assert.equal(readingTime(mixed), 1);
  });
});
