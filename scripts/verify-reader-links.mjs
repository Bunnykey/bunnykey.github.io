import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { JSDOM } from 'jsdom';
import { WORKSPACE_GROUPS } from '../src/consts/navigation.mjs';

const root = resolve('dist');
const origin = 'https://bunnykey.github.io';
const errors = [];
const pages = new Map();
async function exists(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
async function targetFile(pathname) {
  const path = resolve(root, '.' + decodeURIComponent(pathname));
  if (!path.startsWith(root + '/') && path !== root) return null;
  if (await exists(path)) return path;
  if (await exists(join(path, 'index.html'))) return join(path, 'index.html');
  return null;
}
async function visit(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) { await visit(file); continue; }
    if (!file.endsWith('.html')) continue;
    const pathname = '/' + relative(root, file).replace(/index\.html$/, '');
    const dom = new JSDOM(await readFile(file, 'utf8'));
    const document = dom.window.document;
    const ids = new Set([...document.querySelectorAll('[id]')].map(node => node.id));
    const links = [];
    for (const element of document.querySelectorAll('a[href], img[src], script[src], link[rel="stylesheet"][href]')) {
      const value = element.getAttribute(element.hasAttribute('src') ? 'src' : 'href');
      if (!value) continue;
      const url = new URL(value, origin + pathname);
      if (url.origin !== origin) continue;
      const target = await targetFile(url.pathname);
      if (!target) { errors.push(`${relative(root, file)}: missing ${value}`); continue; }
      if (element.tagName === 'A') links.push({ target, hash: url.hash, value });
    }
    pages.set(file, { pathname, ids, links });
    dom.window.close();
  }
}
await visit(root);
for (const [file, page] of pages) {
  for (const link of page.links) {
    if (link.hash && pages.has(link.target) && !pages.get(link.target).ids.has(decodeURIComponent(link.hash.slice(1)))) {
      errors.push(`${relative(root, file)}: missing anchor ${link.value}`);
    }
  }
}
// Existence alone is not enough: every feature must be findable from the blog.
const home = await targetFile('/');
const distance = new Map([[home, 0]]);
const queue = [home];
for (const file of queue) {
  for (const link of pages.get(file)?.links || []) {
    if (!distance.has(link.target)) {
      distance.set(link.target, distance.get(file) + 1);
      if (pages.has(link.target)) queue.push(link.target);
    }
  }
}
const destinations = ['/workbench/', '/demos/', ...WORKSPACE_GROUPS.flatMap(group => group.items.map(item => item.href))];
for (const href of new Set(destinations)) {
  const target = await targetFile(new URL(href, origin).pathname);
  if (!target || !distance.has(target)) errors.push(`unreachable feature from home: ${href}`);
  else if (distance.get(target) > 2) errors.push(`feature requires more than two clicks from home: ${href}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`READER LINK VERIFICATION PASSED (${pages.size} pages; feature routes reachable within two clicks; relative links and anchors checked)`);
