import { readFile, writeFile, mkdir, readdir, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { CONTRACT_VERSION, COLLECTIONS, validateRoute, validateId, normalizeMetadata } from './contract.mjs';
import { parsePost, serializePost, revisionOf, stableId } from './serialization.mjs';
const fail=(message,status=409)=>{throw Object.assign(new Error(message),{status});};
async function optional(path) {try{return await readFile(path,'utf8');}catch(e){if(e.code==='ENOENT') return null;throw e;}}
async function atomic(path,data) {const temp=path+'.'+randomUUID()+'.tmp';try{await writeFile(temp,data);await rename(temp,path);}finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}}
export function createPostStore(root) {
  const drafts=join(root,'.publishing','drafts');
  const jobs=join(root,'.publishing','jobs');
  const content=join(root,'src','content');
  async function source(collection,slug) {
    validateRoute(collection,slug);
    const hits=[];
    for(const ext of ['.md','.mdx']) {const path=join(content,collection,slug+ext);const raw=await optional(path);if(raw!==null)hits.push({path,raw,ext});}
    if(hits.length>1)fail('동일 주소에 Markdown과 MDX가 함께 있습니다. 먼저 중복을 해결하세요.');
    if(!hits.length)return null;
    const hit=hits[0], parsed=parsePost(hit.raw);
    return {...hit,...parsed,id:parsed.frontmatter.id || stableId('legacy:'+collection+'/'+slug),revision:revisionOf(hit.raw),collection,slug};
  }
  async function allDrafts() {
    await mkdir(drafts,{recursive:true});
    return Promise.all((await readdir(drafts)).filter(p=>p.endsWith('.json')).map(async p=>JSON.parse(await readFile(join(drafts,p),'utf8'))));
  }
  async function read(collection,slug) {
    validateRoute(collection,slug);
    const src=await source(collection,slug);
    const draft=(await allDrafts()).find(d=>d.collection===collection && d.slug===slug);
    const post=draft || src;
    if(!post)return null;
    const job=JSON.parse(await optional(join(jobs,post.id+'.json')) || 'null');
    return {...post,source:undefined,raw:undefined,path:undefined,hasDraft:!!draft,sourceExists:!!src,publication:job || {state:'idle'},sourceChanged:!!draft && (src?.revision || null)!==draft.baseSourceRevision};
  }
  async function check(request, allowSourceChange=false) {
    const {collection,slug,document}=request;validateRoute(collection,slug);
    if(!document || !Object.hasOwn(document,'revision'))fail('문서 버전이 필요합니다. 글을 다시 열어주세요.',428);
    validateId(document.id);
    if(document.collection!==collection || document.slug!==slug)fail('저장된 글의 주소·컬렉션 변경은 별도 이동 작업이 필요합니다.');
    const draftsNow=await allDrafts();
    const sameId=draftsNow.find(d=>d.id===document.id);
    if(sameId && (sameId.collection!==collection || sameId.slug!==slug))fail('문서 ID가 다른 주소에서 사용 중입니다.');
    const current=await read(collection,slug);
    if(current ? current.id!==document.id || current.revision!==document.revision : document.revision!==null)fail('다른 기기 또는 작업에서 글이 변경됐습니다. 작성 내용을 보관한 뒤 최신 글을 다시 열어 병합하세요.');
    if(current?.sourceChanged && !allowSourceChange)fail('원본 파일이 변경됐습니다. 초안과 최신 원본을 비교해야 합니다.');
    // IDs must also be unique across source files, including manually imported files.
    for(const c of COLLECTIONS) for(const filename of await readdir(join(content,c))) {
      if(!/\.mdx?$/.test(filename))continue;
      const route=filename.replace(/\.mdx?$/,'');
      if(c===collection && route===slug)continue;
      const other=await source(c,route);if(other?.id===document.id)fail('문서 ID가 다른 글에서 사용 중입니다.');
    }
    return current;
  }
  async function save(request, reconcile=false) {
    const current=await check(request,reconcile);
    const {collection,slug,document}=request;
    if(typeof request.body!=='string')fail('본문은 문자열이어야 합니다.',400);
    const frontmatter=normalizeMetadata(collection,{...current?.frontmatter,...request.frontmatter,id:document.id,contractVersion:CONTRACT_VERSION,draft:true});
    const ext=request.ext==='.mdx' || /<(TokenFlowDemo|ApiFlowDemo)\b/.test(request.body) ? '.mdx' : '.md';
    const src=await source(collection,slug);
    if(src && src.id!==document.id)fail('다른 문서가 같은 주소를 사용 중입니다. 기존 문서를 덮어쓸 수 없습니다.');
    if(reconcile && (!Object.hasOwn(request,'acknowledgedSourceRevision') || request.acknowledgedSourceRevision !== (src?.revision || null)))fail('비교 후 원본이 다시 변경됐습니다. 최신본을 다시 확인하세요.');
    const envelope={id:document.id,collection,slug,ext,frontmatter,body:request.body,baseSourceRevision:!reconcile && current?.hasDraft?current.baseSourceRevision:src?.revision || null};
    envelope.revision=revisionOf(JSON.stringify(envelope));
    await atomic(join(drafts,document.id+'.json'),JSON.stringify(envelope,null,2));
    return {...envelope,hasDraft:true,path:`src/content/${collection}/${slug}${ext}`,state:'saved'};
  }
  async function promote(draft) {
    const src=await source(draft.collection,draft.slug);
    if((src?.revision || null)!==draft.baseSourceRevision)fail('발행 전 원본이 변경됐습니다.');
    const path=join(content,draft.collection,draft.slug+draft.ext);
    const raw=serializePost(draft.collection,{...draft.frontmatter,draft:false},draft.body);
    await atomic(path,raw);
    if(src && src.path!==path)await unlink(src.path);
    return {path,old:src,raw,revision:revisionOf(raw)};
  }
  async function rollback(promotion) {
    if(promotion.old)await atomic(promotion.old.path,promotion.old.raw);
    if(!promotion.old || promotion.old.path!==promotion.path)await unlink(promotion.path);
  }
  async function record(id,job) {validateId(id);await mkdir(jobs,{recursive:true});await atomic(join(jobs,id+'.json'),JSON.stringify({...job,updatedAt:new Date().toISOString()}));}
  async function finish(draft,promotion) {await unlink(join(drafts,draft.id+'.json'));return {id:draft.id,revision:promotion.revision,collection:draft.collection,slug:draft.slug};}
  async function rebase(draft,promotion) {draft.baseSourceRevision=promotion.revision;delete draft.revision;delete draft.hasDraft;delete draft.path;delete draft.state;draft.revision=revisionOf(JSON.stringify(draft));await atomic(join(drafts,draft.id+'.json'),JSON.stringify(draft));return draft;}
  async function list() {
    const routes=new Map();
    for(const c of COLLECTIONS)for(const filename of await readdir(join(content,c)))if(/\.mdx?$/.test(filename))routes.set(c+'/'+filename.replace(/\.mdx?$/,''),[c,filename.replace(/\.mdx?$/,'')]);
    for(const d of await allDrafts())routes.set(d.collection+'/'+d.slug,[d.collection,d.slug]);
    return Promise.all([...routes.values()].map(([c,s])=>read(c,s)));
  }
  return {read,source,save,promote,rollback,record,finish,rebase,list,check};
}
