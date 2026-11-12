import {readdir, readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';
import {JSDOM} from 'jsdom';
import {COLLECTIONS} from '../src/lib/publishing/contract.mjs';
import {parsePost} from '../src/lib/publishing/serialization.mjs';

async function exists(path) {try {return (await stat(path)).isFile();} catch {return false;}}
async function children(path) {try {return await readdir(path,{withFileTypes:true});} catch(error) {if(error.code==='ENOENT')return [];throw error;}}
let publicCount=0;
for(const collection of COLLECTIONS){
  const published=new Set(), previews=new Set();
  for(const file of await readdir(join('src/content',collection))){
    if(!/\.mdx?$/.test(file))continue;
    const slug=file.replace(/\.mdx?$/,'');
    const {frontmatter}=parsePost(await readFile(join('src/content',collection,file),'utf8'));
    if(frontmatter.draft!==true)published.add(slug);
    else if(frontmatter.sharePreview===true)previews.add(slug);
  }
  publicCount+=published.size;
  for(const [directory,expected] of [[join('dist',collection),published],[join('dist/preview',collection),previews]]){
    for(const entry of await children(directory)){
      if(!entry.isDirectory()||entry.name==='series')continue;
      if(await exists(join(directory,entry.name,'index.html'))&&!expected.has(entry.name))throw Error(`Deleted or hidden post remains in build: ${directory}/${entry.name}`);
    }
    for(const slug of expected)if(!await exists(join(directory,slug,'index.html')))throw Error(`Post missing from build: ${directory}/${slug}`);
  }
  for(const entry of await children(join('dist/og',collection))){
    if(entry.name.endsWith('.png')&&!published.has(entry.name.slice(0,-4)))throw Error(`Deleted or hidden post social image remains: ${collection}/${entry.name}`);
  }
}
const rss=await readFile('dist/rss.xml','utf8');
if((rss.match(/<item>/g)||[]).length!==publicCount)throw Error('RSS does not match published source posts');
const home=new JSDOM(await readFile('dist/index.html','utf8'));
if(home.window.document.querySelectorAll('.post-row').length!==publicCount)throw Error('Home list does not match published source posts');
home.window.close();
console.log(`BUILT POST VERIFICATION PASSED (${publicCount} published posts; source, pages, previews, social images and RSS agree)`);
