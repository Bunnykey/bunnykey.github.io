export const CONTRACT_VERSION = 1;
export const COLLECTIONS = ['flora', 'seeds', 'nursery'];
export const CATEGORIES = ['life', 'food', 'music', 'travel', 'tech', 'notes'];
export const STAGES = ['seed', 'growing', 'evergreen'];
export const DEMOS = {flora:['TokenFlowDemo','ApiFlowDemo'], seeds:['ApiFlowDemo'], nursery:[]};
export const PUBLICATION_STATES = ['idle','building','committed','pushed','failed'];
export function slugify(value) {
  return String(value || '').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,100);
}
export function validateRoute(collection, slug) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Unsupported section: ${collection}`);
  if (typeof slug !== 'string' || !slug || slug !== slugify(slug)) throw new Error('Slug must be a normalized single path segment');
  return {collection,slug};
}
export function validateId(id) {
  if (!/^post_[a-z0-9-]{16,64}$/.test(id || '')) throw new Error('Invalid document ID');
  return id;
}
export function normalizeMetadata(collection, fm) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Unsupported section: ${collection}`);
  if (typeof fm.title !== 'string' || !fm.title.trim()) throw new Error('title required');
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0,10) : fm.date;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new Error('date must be a valid YYYY-MM-DD');
  const category = fm.category ?? 'notes';
  if (!CATEGORIES.includes(category)) throw new Error('Invalid category');
  if (fm.tags !== undefined && (!Array.isArray(fm.tags) || fm.tags.some(t=>typeof t !== 'string'))) throw new Error('tags must be strings');
  if (fm.summary !== undefined && typeof fm.summary !== 'string') throw new Error('summary must be text');
  if (fm.draft !== undefined && typeof fm.draft !== 'boolean') throw new Error('draft must be boolean');
  if (fm.id !== undefined) validateId(fm.id);
  if (fm.contractVersion !== undefined && fm.contractVersion !== CONTRACT_VERSION) throw new Error('Unsupported content contract version');
  if (fm.stage && (collection !== 'nursery' || !STAGES.includes(fm.stage))) throw new Error('stage is only valid for nursery');
  if (fm.demo && !DEMOS[collection].includes(fm.demo)) throw new Error('Unsupported demo for collection');
  if (fm.highlight !== undefined && typeof fm.highlight !== 'boolean') throw new Error('highlight must be boolean');
  if (fm.highlight && collection !== 'flora') throw new Error('highlight is only valid for flora');
  if (fm.series) {
    const {name,title,order} = fm.series;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name || '') || typeof title !== 'string' || !title.trim() || !Number.isInteger(order) || order < 1) throw new Error('series requires name, title, and positive integer order');
  }
  const result={...fm,title:fm.title.trim(),date,category,tags:[...new Set((fm.tags || []).map(t=>t.trim().toLowerCase()).filter(Boolean))]};
  for(const key of ['demo','stage','series'])if(result[key] == null || result[key] === '')delete result[key];
  return result;
}
