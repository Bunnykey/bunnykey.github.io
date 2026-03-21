import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import { getSeriesPostsFromEntries } from '../../utils/series.ts';

const COLLECTIONS = ['flora', 'nursery', 'seeds'] as const;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const TITLE_LINE_LIMIT = 2;
const TITLE_LINE_LENGTH = 26;

type CollectionName = (typeof COLLECTIONS)[number];

type OgContentEntry = {
  collection: CollectionName;
  slug: string;
  data: {
    title: string;
    date: Date;
    tags?: string[];
    series?: {
      name: string;
      title: string;
      order: number;
    };
  };
};

export function getOgStaticPathsFromEntries(
  entries: Array<{ collection: CollectionName; slug: string }>,
) {
  return entries.map((entry) => ({
    params: { slug: `${entry.collection}/${entry.slug}` },
  }));
}

export function parseOgSlug(value: string | string[] | undefined) {
  const normalized = Array.isArray(value) ? value.join('/') : value ?? '';
  const [collection, ...slugParts] = normalized.split('/').filter(Boolean);

  if (!COLLECTIONS.includes(collection as CollectionName) || slugParts.length === 0) {
    throw new Error(`Invalid OG slug: ${normalized}`);
  }

  return {
    collection: collection as CollectionName,
    slug: slugParts.join('/'),
  };
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapTitle(title: string) {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= TITLE_LINE_LENGTH || currentLine.length === 0) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;

    if (lines.length === TITLE_LINE_LIMIT - 1) {
      break;
    }
  }

  const remainingWords = words.slice(lines.join(' ').split(/\s+/).filter(Boolean).length);
  const finalLine = [currentLine, ...remainingWords].filter(Boolean).join(' ').trim();

  if (finalLine) {
    lines.push(finalLine);
  }

  return lines.slice(0, TITLE_LINE_LIMIT).map((line, index, allLines) => {
    if (index === allLines.length - 1 && allLines.length === TITLE_LINE_LIMIT && line.length > TITLE_LINE_LENGTH) {
      return `${line.slice(0, TITLE_LINE_LENGTH - 1).trimEnd()}…`;
    }

    return line;
  });
}

let _fontCache: { regular: string; bold: string } | null = null;

async function loadFontData() {
  if (_fontCache) return _fontCache;

  const fontsDir = path.resolve(process.cwd(), 'src/assets/fonts');
  const regularPath = path.join(fontsDir, 'Pretendard-Regular.otf');
  const boldPath = path.join(fontsDir, 'Pretendard-Bold.otf');

  try {
    const [regularFont, boldFont] = await Promise.all([
      fs.readFile(regularPath),
      fs.readFile(boldPath),
    ]);
    _fontCache = {
      regular: regularFont.toString('base64'),
      bold: boldFont.toString('base64'),
    };
    return _fontCache;
  } catch {
    _fontCache = { regular: '', bold: '' };
    console.warn('[og] Pretendard fonts not found, falling back to sans-serif');
    return _fontCache;
  }
}

let _entriesCache: OgContentEntry[] | null = null;

async function loadOgEntries(): Promise<OgContentEntry[]> {
  if (_entriesCache) return _entriesCache;

  const { getCollection } = await import('astro:content');
  const collections = await Promise.all(
    COLLECTIONS.map(async (collection) => {
      const entries = await getCollection(collection);
      return entries.map((entry) => ({
        ...entry,
        collection,
      }));
    }),
  );

  _entriesCache = collections.flat();
  return _entriesCache;
}

function buildSvg(entry: OgContentEntry, totalSeriesPosts: number, fonts: Awaited<ReturnType<typeof loadFontData>>) {
  const titleLines = wrapTitle(entry.data.title);
  const series = entry.data.series;
  const metaLine = [
    entry.data.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    entry.data.tags?.length ? entry.data.tags.map((tag) => `#${tag}`).join(' ') : undefined,
  ]
    .filter(Boolean)
    .join('  •  ');

  const seriesBadge = series
    ? `
      <g transform="translate(816 56)">
        <rect width="328" height="74" rx="24" fill="#546353" opacity="0.95" />
        <text x="24" y="32" fill="#faf9f6" font-size="22" font-weight="700">${escapeXml(series.title)}</text>
        <text x="24" y="58" fill="#faf9f6" font-size="18" font-weight="600">${series.order}/${totalSeriesPosts}</text>
      </g>
    `
    : '';

  const titleText = titleLines
    .map(
      (line, index) =>
        `<tspan x="96" dy="${index === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'Pretendard';
          src: url(data:font/opentype;base64,${fonts.regular}) format('opentype');
          font-weight: 400;
        }

        @font-face {
          font-family: 'Pretendard';
          src: url(data:font/opentype;base64,${fonts.bold}) format('opentype');
          font-weight: 700;
        }

        text {
          font-family: 'Pretendard', sans-serif;
        }
      </style>

      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#2f3430" />
      <rect x="58" y="58" width="${OG_WIDTH - 116}" height="${OG_HEIGHT - 116}" rx="32" fill="#edeeea" stroke="#afb3ae" />
      ${seriesBadge}
      <text x="96" y="294" fill="#2f3430" font-size="48" font-weight="700">${titleText}</text>
      <text x="96" y="420" fill="#5c605c" font-size="20" font-weight="400">${escapeXml(metaLine)}</text>
      <text x="96" y="564" fill="#2f3430" font-size="14" font-weight="700">The Greenhouse</text>
    </svg>
  `;
}

export async function getStaticPaths() {
  const entries = await loadOgEntries();
  return getOgStaticPathsFromEntries(entries);
}

export async function GET({ params }: { params: { slug?: string | string[] } }) {
  const { collection, slug } = parseOgSlug(params.slug);
  const entries = await loadOgEntries();
  const entry = entries.find(
    (contentEntry) => contentEntry.collection === collection && contentEntry.slug === slug,
  );

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const seriesPosts = entry.data.series
    ? getSeriesPostsFromEntries(
        entries.filter((contentEntry) => contentEntry.collection === collection),
        entry.data.series.name,
      )
    : [];

  const svg = buildSvg(entry, seriesPosts.length || 1, await loadFontData());
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
