import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { JSDOM } from 'jsdom';

const root = resolve('dist');
const errors = [];
let count = 0;
async function exists(path) {try {return (await stat(path)).isFile();} catch {return false;}}
async function visit(dir) {
  for (const item of await readdir(dir, {withFileTypes: true})) {
    const file = join(dir, item.name);
    if (item.isDirectory()) {await visit(file); continue;}
    if (!file.endsWith('.html')) continue;
    const document = new JSDOM(await readFile(file, 'utf8')).window.document;
    count++;
    for (const element of document.querySelectorAll('a[href], img[src], script[src], link[rel="stylesheet"][href]')) {
      const value = element.getAttribute(element.hasAttribute('src') ? 'src' : 'href');
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      const pathname = decodeURIComponent(new URL(value, 'https://bunnykey.github.io').pathname);
      const target = resolve(root, '.' + pathname);
      if (!target.startsWith(root + '/') && target !== root) {errors.push(`${relative(root, file)}: invalid path ${value}`); continue;}
      if (!(await exists(target)) && !(await exists(join(target, 'index.html')))) errors.push(`${relative(root, file)}: missing ${value}`);
    }
    document.defaultView.close();
  }
}
await visit(root);
if (errors.length) {console.error(errors.join('\n')); process.exit(1);}
console.log(`READER LINK VERIFICATION PASSED (${count} pages)`);
