export function readingTime(text: string): number {
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const englishWords = text.replace(/[\u3131-\uD79D]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}
