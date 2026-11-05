import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TIERS, emptyRows, authorRows, moveTrack, snapshot, validateState, encodeState, decodeState, safeListenUrl} from '../public/music-tiers/state.mjs';
const catalog=JSON.parse(readFileSync(new URL('./fixtures/kpop-demo-months.json',import.meta.url)));
const month=catalog[0];
test('moving and reordering preserve each song exactly once',()=>{
  const original=emptyRows(month), first=month.tracks[0].id, second=month.tracks[1].id;
  let rows=moveTrack(original,first,'S');rows=moveTrack(rows,second,'S',first);
  assert.deepEqual(rows.S,[second,first]);assert.equal(original.unranked.length,month.tracks.length);
  rows=moveTrack(rows,first,'A');assert.deepEqual(rows.S,[second]);assert.deepEqual(rows.A,[first]);
  assert.equal(new Set(TIERS.flatMap(t=>rows[t])).size,month.tracks.length);
});
test('shared links round trip ordered rows, independent of author ranking',()=>{
  const rows=moveTrack(emptyRows(month),month.tracks[0].id,'D');
  const value=decodeState(encodeState(snapshot(month,rows)));
  assert.deepEqual(validateState(value,month),rows);assert.deepEqual(authorRows(month).S,[month.tracks[0].id]);
});
test('corrupt, duplicate, unknown and incompatible data are rejected',()=>{
  const value=snapshot(month,emptyRows(month));
  assert.throws(()=>validateState({...value,revision:'old'},month));
  assert.throws(()=>validateState({...value,rows:{...value.rows,S:[month.tracks[0].id]}},month));
  assert.throws(()=>validateState({...value,rows:{...value.rows,S:['foreign']}},month));
  assert.throws(()=>decodeState('%%%'));assert.throws(()=>decodeState('x'.repeat(25000)));
});
test('missing songs remain unranked, months are isolated',()=>{
  const value=snapshot(month,emptyRows(month));value.rows.unranked=[];
  assert.deepEqual(validateState(value,month),emptyRows(month));assert.throws(()=>validateState(value,catalog[1]));
});
test('listen URLs are limited to expected HTTPS providers',()=>{
  assert.equal(safeListenUrl('javascript:alert(1)'),null);assert.equal(safeListenUrl('https://youtube.com.evil.test/a'),null);assert.equal(safeListenUrl('https://user:pass@youtube.com/a'),null);
  assert.equal(safeListenUrl('https://open.spotify.com/track/test'),'https://open.spotify.com/track/test');
});
test('catalog validates calendar dates and unique IDs before a build',async()=>{
  const {assertCatalog,safeCoverPath}=await import('../public/music-tiers/state.mjs');
  assert.equal(assertCatalog(catalog),catalog);
  const bad=structuredClone(catalog);bad[0].tracks[0].released='2026-10-32';assert.throws(()=>assertCatalog(bad));
  bad[0].tracks[0].released='2026-10-02';bad[0].tracks[1].id=bad[0].tracks[0].id;assert.throws(()=>assertCatalog(bad));
  assert.equal(safeCoverPath('/img/a.webp'),'/img/a.webp');assert.equal(safeCoverPath('/img/../secret.png'),null);assert.equal(safeCoverPath('https://elsewhere.test/a.jpg'),null);
});
