import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {assertCatalog} from '../../public/music-tiers/state.mjs';
const source=new URL('../../src/data/kpop-months.json',import.meta.url);
const catalog=assertCatalog(JSON.parse(await readFile(source,'utf8'))).filter(month=>month.month==='2026-10');
const target=new URL('../../public/music-tiers/studio/data/',import.meta.url);
await mkdir(target,{recursive:true});
await writeFile(new URL('catalog.json',target),JSON.stringify(catalog,null,2)+'\n');
console.log('감상 작업실 곡 목록을 공개 발매곡 데이터에서 갱신했습니다.');
