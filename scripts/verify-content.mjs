import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { COLLECTIONS, validateRoute, normalizeMetadata } from '../src/lib/publishing/contract.mjs';
import { parsePost } from '../src/lib/publishing/serialization.mjs';
const ids=new Set(), routes=new Set();
for(const collection of COLLECTIONS) for(const file of await readdir(join('src/content',collection))) {
  if(!/\.mdx?$/.test(file))continue;
  const slug=file.replace(/\.mdx?$/,'');validateRoute(collection,slug);
  const route=collection+'/'+slug;if(routes.has(route))throw new Error('Duplicate route: '+route);routes.add(route);
  const {frontmatter}=parsePost(await readFile(join('src/content',collection,file),'utf8'));
  normalizeMetadata(collection,frontmatter);
  if(frontmatter.id){if(ids.has(frontmatter.id))throw new Error('Duplicate document ID: '+frontmatter.id);ids.add(frontmatter.id);}
}
console.log(`CONTENT CONTRACT VERIFICATION PASSED (${routes.size} posts)`);
