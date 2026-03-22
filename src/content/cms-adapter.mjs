const SUPPORTED_SECTIONS = new Set(['flora', 'seeds']);
const SINGLE_SEGMENT_SLUG = /^[a-z0-9-]+$/;

function normalizeSection(section) {
  return String(section || '').trim().toLowerCase();
}

export function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeTags(tags = []) {
  return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
}

function buildCanonicalPath(section, slug) {
  return `/${section}/${slug}/`;
}

export function normalizeCmsEntry(input, options = {}) {
  const section = normalizeSection(input.section);
  if (!SUPPORTED_SECTIONS.has(section)) {
    throw new Error(`Unsupported section: ${section}`);
  }

  if (String(input.slug || '').includes('/')) {
    throw new Error('Slug must be a single path segment');
  }

  const slug = slugify(input.slug);
  if (!SINGLE_SEGMENT_SLUG.test(slug)) {
    throw new Error('Slug must be a single path segment');
  }

  if (input.draft) {
    return { status: 'skipped', reason: 'draft' };
  }

  const gitOwnedSlugs = options.gitOwnedSlugs?.[section] || new Set();
  if (gitOwnedSlugs.has(slug)) {
    return { status: 'skipped', reason: 'git_slug_conflict' };
  }

  const canonicalPath = buildCanonicalPath(section, slug);

  return {
    status: 'ready',
    entry: {
      sourceId: String(input.sourceId),
      section,
      slug,
      title: String(input.title).trim(),
      date: new Date(input.date),
      summary: String(input.summary).trim(),
      body: String(input.body),
      canonicalPath,
      tags: normalizeTags(input.tags),
      highlight: Boolean(input.highlight),
      draft: false,
    },
  };
}
