import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {assertCatalog,emptyRows,moveTrack,snapshot,validateNotes} from '../public/music-tiers/state.mjs';
import {mergeRatings} from '../scripts/music/import-kpop-ratings.mjs';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/kpop-demo-months.json',import.meta.url)));
test('publishing a rating file preserves every other month and song metadata',()=>{
 const month=fixtures[0],id=month.tracks[0].id;
 const rows=moveTrack(emptyRows(month),id,'A');
 const value={...snapshot(month,rows),notes:{[id]:'후렴이 오래 남았다.'}};
 const next=mergeRatings(fixtures,value);
 assert.deepEqual(next[1],fixtures[1]);
 assert.equal(next[0].tracks[0].tier,'A');assert.equal(next[0].tracks[0].note,'후렴이 오래 남았다.');
 assert.equal(fixtures[0].tracks[0].tier,'S');
 assert.deepEqual(next[0].tracks.map(({tier,note,...rest})=>rest),month.tracks.map(({tier,note,...rest})=>rest));
});
test('public import refuses missing songs, an old revision, and unknown or oversized notes',()=>{
 const month=fixtures[0],value=snapshot(month,emptyRows(month));
 assert.throws(()=>mergeRatings(fixtures,{...value,revision:'old'}));
 assert.throws(()=>mergeRatings(fixtures,{...value,rows:{...value.rows,unranked:[]}}));
 assert.throws(()=>validateNotes({foreign:'unknown'},month));
 assert.throws(()=>validateNotes({[month.tracks[0].id]:'x'.repeat(501)},month));
});
test('published real catalog uses unique source IDs and local cover assets',()=>{
 const catalog=JSON.parse(readFileSync(new URL('../src/data/kpop-months.json',import.meta.url)));
 assertCatalog(catalog);
 for(const month of catalog.filter(m=>!m.demo)){
  assert.equal(new Set(month.tracks.map(t=>t.id)).size,month.tracks.length);
  for(const t of month.tracks){
   assert.match(t.id,/^bugs-\d+$/);assert.match(t.listenUrl,/^https:\/\/music\.bugs\.co\.kr\/track\/\d+$/);
   assert.match(t.sourceUrl,/^https:\/\/music\.bugs\.co\.kr\/album\/\d+$/);
   assert.ok(t.album);assert.ok(!t.title.includes('가상'));
   const cover=new URL('../public'+t.cover,import.meta.url);assert.ok(existsSync(cover));assert.ok(statSync(cover).size>100);
  }
 }
});
