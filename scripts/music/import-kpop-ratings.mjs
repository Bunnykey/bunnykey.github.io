import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertCatalog,applyPublicRatings} from '../../public/music-tiers/state.mjs';
export function mergeRatings(catalog,value){
  assertCatalog(catalog);
  const index=catalog.findIndex(month=>month.month===value.month);
  if(index<0)throw new Error('해당 월이 없습니다.');
  const next=catalog.map((month,i)=>i===index?applyPublicRatings(month,value):month);
  return assertCatalog(next);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    if(!process.argv[2])throw new Error('사용법: node scripts/music/import-kpop-ratings.mjs <평가파일.json>');
    const source=new URL('../../src/data/kpop-months.json',import.meta.url);
    const value=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
    const next=mergeRatings(JSON.parse(await readFile(source,'utf8')),value);
    await writeFile(source,JSON.stringify(next,null,2)+'\n');
    console.log(`${value.month} 공개 평가 적용 완료. npm test && npm run build 후 GitHub에 반영하세요.`);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
