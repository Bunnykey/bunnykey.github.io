import matter from 'gray-matter';
import { createHash } from 'node:crypto';
import { normalizeMetadata } from './contract.mjs';
export const revisionOf = value => createHash('sha256').update(value).digest('hex');
export const stableId = value => 'post_' + revisionOf(value).slice(0,32);
export function serializePost(collection, fm, body) {
  const normalized = normalizeMetadata(collection,fm);
  // JSON scalars are valid YAML and preserve multiline text and unknown metadata.
  return '---\n'+Object.entries(normalized).filter(([,v])=>v !== undefined).map(([k,v])=>`${JSON.stringify(k)}: ${k === 'date' ? v : JSON.stringify(v)}`).join('\n')+'\n---\n\n'+body;
}
export function parsePost(raw) { const {data,content} = matter(raw); return {frontmatter:data,body:content.replace(/^\n/,'')}; }
