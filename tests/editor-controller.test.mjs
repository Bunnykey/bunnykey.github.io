import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// DOM/controller integration only; this is not browser or iPhone E2E.
test('editor sends versions, metadata, preserves conflicting input and backs up per document',async()=>{
 const {outputFiles}=await build({entryPoints:['scripts/editor/public/app.js'],bundle:true,write:false,format:'iife',plugins:[{name:'source-rich',setup(b){b.onResolve({filter:/rich\.bundle\.js$/},()=>({path:resolve('scripts/editor/client/rich.js')}));}}]});
 const html=(await readFile('scripts/editor/public/index.html','utf8')).replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');
 const dom=new JSDOM(html,{url:'http://localhost:4322',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){}});w.confirm=()=>false;w.alert=()=>{};w.setInterval=()=>0;w.HTMLElement.prototype.scrollIntoView=()=>{};
 let lastSave,failSave=false;
 w.fetch=async(path,opts={})=>{
  let data;
  if(path==='/api/list')data={seeds:[],flora:[],nursery:[]};
  else if(path==='/api/git-status')data={files:[],ahead:0,branch:'main'};
  else if(path==='/api/demos' || path==='/api/tags')data=[];
  else if(path.startsWith('/api/check-slug'))data={exists:false};
  else if(path==='/api/render')data={html:'<p>preview</p>'};
  else if(path==='/api/save'){
    lastSave=JSON.parse(opts.body);
    if(failSave)return {ok:false,status:409,json:async()=>({error:'stale revision'})};
    data={document:{...lastSave.document,revision:'server-revision-1'},path:'draft',ext:'.md'};
  }else throw new Error('Unexpected API '+path);
  return {ok:true,status:200,json:async()=>data};
 };
 const wait=async(fn)=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw new Error('controller state: '+w.document.querySelector('#status-msg').textContent);};
 try {
  w.eval(outputFiles[0].text);
  await wait(()=>w.document.querySelector('#git-branch').textContent.includes('main'));
  await new Promise(r=>setTimeout(r,10));
  const input=(id,value)=>{const el=w.document.querySelector(id);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
  input('#fm-title','음악 이야기');input('#fm-category','music');
  w.document.querySelector('#mode-toggle').click();input('#editor','First body');
  w.document.querySelector('#save').click();
  await wait(()=>w.document.querySelector('#status-msg').textContent.includes('초안 저장됨'));
  assert.equal(lastSave.body,'First body');assert.equal(lastSave.slug,'음악-이야기');assert.equal(lastSave.document.revision,null);assert.equal(lastSave.frontmatter.category,'music');
  assert.equal(w.document.querySelector('#fm-slug').readOnly,true);
  failSave=true;input('#editor','My unsaved changes');w.document.querySelector('#save').click();
  await wait(()=>w.document.querySelector('#status-msg').textContent.includes('stale revision'));
  assert.equal(lastSave.document.revision,'server-revision-1');assert.equal(w.document.querySelector('#editor').value,'My unsaved changes');assert.equal(w.document.querySelector('#compare-conflict').hidden,false);
  const firstId=lastSave.document.id;
  assert.ok(w.localStorage.getItem('bunnykey.editor.autosave.v2:'+firstId));
  w.document.querySelector('#new-post').click();input('#fm-title','Second draft');
  w.dispatchEvent(new w.Event('pagehide'));
  const keys=Object.keys(w.localStorage).filter(k=>k.startsWith('bunnykey.editor.autosave.v2:'));
  assert.equal(keys.length,2);
 } finally {dom.window.close();}
});
