import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {fresh} from '../public/music-tiers/studio/model.mjs';
import {importLegacyOctober} from '../public/music-tiers/studio/legacy.mjs';
const catalog=JSON.parse(await readFile(new URL('../src/data/kpop-months.json',import.meta.url),'utf8'));
const blank=()=>({v:2,period:'2026-Q4',rows:{S:[],A:[],B:[],C:[],D:[],unranked:[]},notes:{}});
test('studio copies existing October selections and notes without changing the old snapshot',()=>{const w=fresh(catalog),old=blank(),id=catalog[0].tracks[0].id;old.rows.A.push(id);old.notes[id]='기존 감상';const before=structuredClone(old);assert.equal(importLegacyOctober(w,old),1);assert.deepEqual(w.entries[id],{selected:true,tier:'A',note:'기존 감상',review:'pending',issue:''});assert.deepEqual(old,before);});
test('other months remain in the original quarterly snapshot and are not copied into October',()=>{const w=fresh(catalog),old=blank();old.rows.S.push('future-nov-song');assert.equal(importLegacyOctober(w,old),0);assert.deepEqual(old.rows.S,['future-nov-song']);});
test('duplicate or invalid quarterly data cannot silently replace the studio workspace',()=>{const w=fresh(catalog),old=blank(),id=catalog[0].tracks[0].id;old.rows.A.push(id,id);assert.throws(()=>importLegacyOctober(w,old));assert.deepEqual(w.entries,{});assert.throws(()=>importLegacyOctober(w,{...blank(),period:'2026-Q3'}));});
