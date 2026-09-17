import { COLLECTIONS, slugify, validateRoute, normalizeMetadata } from '../lib/publishing/contract.mjs';
import { stableId } from '../lib/publishing/serialization.mjs';
export { slugify };
const normalizeSection = section => String(section || '').trim().toLowerCase();

function buildCanonicalPath(section, slug) {
  return `/${section}/${slug}/`;
}

export function normalizeCmsEntry(input, options = {}) {
  if(typeof input.sourceId!=='string' || !input.sourceId.trim())throw new Error('sourceId required');
  const section = normalizeSection(input.section);
  if (!COLLECTIONS.includes(section)) {
    throw new Error(`Unsupported section: ${section}`);
  }

  if (String(input.slug || '').includes('/')) {
    throw new Error('Slug must be a single path segment');
  }

  const slug = slugify(input.slug);
  validateRoute(section,slug);

  if (input.draft) {
    return { status: 'skipped', reason: 'draft' };
  }

  const gitOwnedSlugs = options.gitOwnedSlugs?.[section] || new Set();
  if (gitOwnedSlugs.has(slug)) {
    return { status: 'skipped', reason: 'git_slug_conflict' };
  }

  const canonicalPath = buildCanonicalPath(section, slug);

  const metadata = normalizeMetadata(section, {
    title:input.title, date:input.date instanceof Date ? input.date : String(input.date || '').slice(0,10),
    summary:input.summary ?? '', tags:input.tags, category:input.category,
    highlight:Boolean(input.highlight), draft:false, demo:input.demo, stage:input.stage, series:input.series,
    id:stableId('cms:'+String(input.sourceId)), contractVersion:1,
  });
  return { status:'ready', entry:{...metadata,sourceId:String(input.sourceId),section,slug,body:String(input.body ?? ''),canonicalPath,date:new Date(metadata.date)} };
}
