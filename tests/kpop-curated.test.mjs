import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {blankRows,buildPeriods,quarterFor,pickedIds,validateCurated,selectTrack,removeTrack,curatedSnapshot,mergeListening} from '../public/music-tiers/curated.mjs';
const original=JSON.parse(readFileSync(new URL('./fixtures/kpop-demo-months.json',import.meta.url)));
function catalog(){const oct=structuredClone(original[0]);const nov={...structuredClone(oct),month:'2026-11',tracks:[{...oct.tracks[0],id:'nov-song',released:'2026-11-01',tier:'unranked',note:''}]};return [oct,nov];}
test('a quarter combines release months while original dates and catalog remain intact',()=>{
 const source=catalog(),before=structuredClone(source);const periods=buildPeriods(source,[{period:'2026-Q4',picks:[]}]);
 assert.equal(periods.length,1);assert.deepEqual(periods[0].months,['2026-10','2026-11']);
 assert.equal(periods[0].tracks.length,9);assert.equal(periods[0].tracks.find(t=>t.id==='nov-song').released,'2026-11-01');
 assert.equal(pickedIds(periods[0].rows).length,0);assert.deepEqual(source,before);
 assert.equal(quarterFor('2026-12'),'2026-Q4');assert.equal(quarterFor('2027-01'),'2027-Q1');
});
test('picked-but-unrated is distinct from not picked and survives catalog growth',()=>{
 const source=catalog(),period=buildPeriods(source)[0];let rows=selectTrack(blankRows(),'demo-oct-01');
 const value=curatedSnapshot(period,rows,{'demo-oct-01':'한줄평'});
 const bigger={...period,tracks:[...period.tracks,{id:'new-song'}]};
 assert.deepEqual(validateCurated(value,bigger).rows.unranked,['demo-oct-01']);
 assert.equal(pickedIds(removeTrack(rows,'demo-oct-01')).length,0);assert.equal(period.tracks.length,9);
});
test('public listening import changes only the chosen quarter and keeps source metadata',()=>{
 const source=[...catalog(),original[1]],before=structuredClone(source);
 const listening=[{period:'2026-Q3',picks:[{id:original[1].tracks[0].id,tier:'B',note:'지난 분기'}]}];
 const period=buildPeriods(source,listening).find(p=>p.id==='2026-Q4');
 const next=mergeListening(source,listening,curatedSnapshot(period,selectTrack(blankRows(),'nov-song'),{'nov-song':'들었지만 아직 점수는 보류'}));
 assert.deepEqual(next.find(p=>p.period==='2026-Q3'),listening[0]);
 assert.deepEqual(next.find(p=>p.period==='2026-Q4').picks,[{id:'nov-song',tier:'unranked',note:'들었지만 아직 점수는 보류'}]);
 assert.deepEqual(source,before);
});
test('duplicate, foreign, and wrong-quarter selections are rejected',()=>{
 const source=catalog(),period=buildPeriods(source)[0];const rows=selectTrack(blankRows(),'demo-oct-01');
 assert.throws(()=>validateCurated({...curatedSnapshot(period,rows),rows:{...rows,S:['demo-oct-01']}},period));
 assert.throws(()=>validateCurated(curatedSnapshot(period,selectTrack(blankRows(),'foreign')),period));
 assert.throws(()=>buildPeriods(source,[{period:'2026-Q3',picks:[{id:'nov-song',tier:'A',note:''}]}]));
});

test('unpublished-month metadata and picks do not leak into the public quarter',()=>{
 const source=catalog();source[1].published=false;
 const archive=[{period:'2026-Q4',picks:[{id:'nov-song',tier:'A',note:'비공개'}]}];
 const periods=buildPeriods(source,archive,true);
 assert.equal(periods[0].tracks.some(t=>t.id==='nov-song'),false);
 assert.deepEqual(periods[0].months,['2026-10']);assert.equal(pickedIds(periods[0].rows).length,0);
});
