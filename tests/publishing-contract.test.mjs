import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeMetadata, slugify } from '../src/lib/publishing/contract.mjs';
import { createPostStore } from '../src/lib/publishing/store.mjs';
import { serializePost, parsePost } from '../src/lib/publishing/serialization.mjs';
import { withPublishingLock } from '../src/lib/publishing/lock.mjs';
import { normalizeCmsEntry } from '../src/content/cms-adapter.mjs';
import { entryToMarkdown } from '../src/content/notion-sync.mjs';
const fm={title:'한글 글',date:'2026-09-16',category:'music',tags:['Kpop','kpop']};
const envelope=p=>({id:p.id,revision:p.revision,collection:p.collection,slug:p.slug});
async function fixture(work) {const root=await mkdtemp(join(tmpdir(),'post-contract-'));for(const c of ['flora','seeds','nursery'])await mkdir(join(root,'src/content',c),{recursive:true});try{await work(createPostStore(root),root);}finally{await rm(root,{recursive:true,force:true});}}
test('metadata validates real dates, collection rules, series and shared Korean slugs',()=>{
 assert.equal(slugify(' 음악 이야기 '),'음악-이야기');
 assert.throws(()=>normalizeMetadata('seeds',{...fm,date:'2026-02-30'}),/date/);
 assert.throws(()=>normalizeMetadata('seeds',{...fm,stage:'growing'}),/stage/);
 assert.throws(()=>normalizeMetadata('flora',{...fm,series:{name:'x',title:'X',order:0}}),/series/);
 assert.deepEqual(normalizeMetadata('seeds',fm).tags,['kpop']);
 assert.equal(normalizeMetadata('seeds',{...fm,category:undefined}).category,'notes');
});
test('Notion serialization preserves category, stable identity, series and multiline YAML safely',()=>{
 const result=normalizeCmsEntry({sourceId:'notion-one',section:'flora',slug:'음악-이야기',...fm,summary:'a\nb: "c"',body:'text',series:{name:'music',title:'Music',order:1}}).entry;
 const loaded=parsePost(entryToMarkdown(result));
 assert.equal(loaded.frontmatter.id,result.id);assert.equal(loaded.frontmatter.category,'music');assert.equal(loaded.frontmatter.summary,'a\nb: "c"');assert.equal(loaded.frontmatter.series.order,1);
});
test('two devices cannot overwrite each other; unchanged save is idempotent; published source is isolated',()=>fixture(async(store,root)=>{
 const path=join(root,'src/content/seeds/old.md');const raw=serializePost('seeds',fm,'published');await writeFile(path,raw);
 const a=await store.read('seeds','old'), b=await store.read('seeds','old');
 const req={collection:'seeds',slug:'old',document:envelope(a),frontmatter:{...fm,summary:''},body:'device A'};
 const saved=await store.save(req);
 assert.equal(await readFile(path,'utf8'),raw);
 await assert.rejects(store.save({...req,document:envelope(b),body:'device B'}),e=>e.status===409);
 const again=await store.save({...req,document:envelope(saved)});assert.equal(again.revision,saved.revision);
 assert.equal(again.id,a.id);assert.equal(again.frontmatter.summary,'');
 const promotion=await store.promote(again);assert.equal(parsePost(await readFile(path,'utf8')).body,'device A');
 await store.rollback(promotion);assert.equal(await readFile(path,'utf8'),raw);
}));
test('missing version, route moves and source edits cannot silently overwrite documents',()=>fixture(async(store,root)=>{
 const req={collection:'seeds',slug:'new',document:{id:'post_0123456789abcdef0123456789abcdef',revision:null,collection:'seeds',slug:'new'},frontmatter:fm,body:'draft'};
 await assert.rejects(store.save({...req,document:undefined}),e=>e.status===428);
 const saved=await store.save(req);
 await assert.rejects(store.save({...req,slug:'moved',document:envelope(saved)}),e=>e.status===409);
 await assert.rejects(store.save({...req,slug:'moved',document:{...envelope(saved),slug:'moved'}}),e=>e.status===409);
 const path=join(root,'src/content/seeds/new.md');await writeFile(path,serializePost('seeds',fm,'external source'));
 await assert.rejects(store.save({...req,document:envelope(saved)}),e=>e.status===409);
}));
test('cooperative writers fail closed while another process holds the lock',()=>fixture(async(_store,root)=>{
 await withPublishingLock(root,async()=>{
  await assert.rejects(withPublishingLock(root,async()=>{}),e=>e.status===423);
 });
 await withPublishingLock(root,async()=>{});
}));
test('manual reconciliation checks both latest draft and source revision before saving',()=>fixture(async(store,root)=>{
 const path=join(root,'src/content/seeds/existing.md');await writeFile(path,serializePost('seeds',fm,'initial'));
 const original=await store.read('seeds','existing');
 const req={collection:'seeds',slug:'existing',document:envelope(original),frontmatter:fm,body:'my draft'};
 const draft=await store.save(req);
 await writeFile(path,serializePost('seeds',fm,'external change'));
 const source=await store.source('seeds','existing');
 await assert.rejects(store.save({...req,document:envelope(draft),acknowledgedSourceRevision:original.revision},true),e=>e.status===409);
 const merged=await store.save({...req,document:envelope(draft),acknowledgedSourceRevision:source.revision,body:'combined'},true);
 assert.equal(merged.baseSourceRevision,source.revision);
 const promoted=await store.promote(merged);assert.equal(parsePost(promoted.raw).body,'combined');
}));
