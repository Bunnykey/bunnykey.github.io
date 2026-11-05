import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {init} from '../public/music-tiers/app.mjs';
const catalog=JSON.parse(readFileSync(new URL('./fixtures/kpop-demo-months.json',import.meta.url)));
function setup(){
  const ids=['title','intro','count','demo','actions','hint','storage','status'];
  const buttons=['undo','reset','confirm-reset','export','share','image'];
  const dom=new JSDOM(`<section id="kpop-tiers"><select id="kt-month">${catalog.map(m=>`<option>${m.month}</option>`).join('')}</select><button data-mode="author"></button><button data-mode="mine"></button>${ids.map(id=>`<div id="kt-${id}"></div>`).join('')}${buttons.map(id=>`<button id="kt-${id}"></button>`).join('')}<input type="checkbox" id="kt-compare"><input type="file" id="kt-import"><textarea id="kt-share-url"></textarea><div id="kt-board"></div><dialog id="kt-dialog"><div id="kt-song"></div></dialog><dialog id="kt-reset-dialog"></dialog><dialog id="kt-share-dialog"></dialog></section><script id="kt-catalog" type="application/json"></script>`,{url:'https://example.test/music/tiers/'});
  const {window}=dom;
  const data=structuredClone(catalog);data[0].tracks[0].cover='/img/album.png';
  window.document.getElementById('kt-catalog').textContent=JSON.stringify(data);
  for(const d of window.document.querySelectorAll('dialog')){d.showModal=()=>{d.open=true;};d.close=()=>{d.open=false;};}
  const originals=new Map();
  for(const key of ['window','document','location','localStorage','navigator']){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,value:window[key]});}
  init();
  return {window,document:window.document,cleanup(){for(const [key,descriptor]of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}window.close();}};
}
test('blog cards open a reading layout and next/previous keep the modal open',()=>{
  const f=setup();try{
    const {document:d}=f;d.querySelector('[data-song="demo-oct-01"]').click();
    assert.equal(d.querySelector('#kt-dialog').open,true);
    assert.equal(d.querySelector('#kt-song-title').textContent,'Afterglow');
    assert.ok(d.querySelector('.kt-story-art img'));
    assert.match(d.querySelector('.kt-story-review blockquote').textContent,/뒤늦게/);
    const nav=d.querySelector('.kt-story-nav');assert.equal(nav.firstElementChild.disabled,true);nav.lastElementChild.click();
    assert.equal(d.querySelector('#kt-song-title').textContent,'초록빛');
    assert.equal(d.querySelector('#kt-dialog').open,true);
    d.querySelector('.kt-story-nav').firstElementChild.click();assert.equal(d.querySelector('#kt-song-title').textContent,'Afterglow');
  }finally{f.cleanup();}
});
test('dragging uses the full cover as its preview and moves exactly one song',()=>{
  const f=setup();try{
    const {document:d,window:w}=f;d.querySelector('[data-mode="mine"]').click();
    const card=d.querySelector('[data-song="demo-oct-01"]'),art=card.querySelector('.kt-art');
    assert.equal(art.querySelector('img').draggable,false);
    art.getBoundingClientRect=()=>({left:100,top:200,width:90,height:90});
    let capture;const transfer={setData(type,value){assert.equal(type,'text/plain');assert.equal(value,'demo-oct-01');},setDragImage(...args){capture=args;}};
    const drag=new w.MouseEvent('dragstart',{bubbles:true,clientX:130,clientY:220});Object.defineProperty(drag,'dataTransfer',{value:transfer});card.dispatchEvent(drag);
    assert.deepEqual(capture,[art,30,20]);assert.equal(transfer.effectAllowed,'move');
    d.querySelector('[data-tier="A"]').dispatchEvent(new w.Event('drop',{bubbles:true,cancelable:true}));
    assert.equal(d.querySelectorAll('[data-song="demo-oct-01"]').length,1);
    assert.ok(d.querySelector('[data-tier="A"] [data-song="demo-oct-01"]'));
  }finally{f.cleanup();}
});
test('tier choice remains editable in the new reading layout',()=>{
  const f=setup();try{
    const d=f.document;d.querySelector('[data-mode="mine"]').click();d.querySelector('[data-song="demo-oct-01"]').click();
    [...d.querySelectorAll('.kt-choice button')].find(b=>b.textContent==='S').click();
    assert.equal(d.querySelector('#kt-dialog').open,false);
    assert.ok(d.querySelector('[data-tier="S"] [data-song="demo-oct-01"]'));
    assert.match(d.querySelector('#kt-status').textContent,/자동 저장됨/);
  }finally{f.cleanup();}
});
