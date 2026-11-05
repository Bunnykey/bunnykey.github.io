import {TIERS,assertCatalog,validateState,validateNotes} from './state.mjs';
export const blankRows=()=>Object.fromEntries(TIERS.map(tier=>[tier,[]]));
export const pickedIds=rows=>TIERS.flatMap(tier=>rows[tier]);
export function quarterFor(month){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('발매 월 형식이 올바르지 않습니다.');
  return `${month.slice(0,4)}-Q${Math.ceil(Number(month.slice(5))/3)}`;
}
export function buildPeriods(catalog,listening=[],publicOnly=false){
  assertCatalog(catalog);
  if(!Array.isArray(listening))throw new Error('공개 감상 목록은 배열이어야 합니다.');
  const all=new Map();
  for(const month of catalog)for(const track of month.tracks){if(all.has(track.id))throw new Error('곡 ID가 여러 월에 중복되었습니다.');all.set(track.id,{...track,period:quarterFor(month.month)});}
  const archive=new Map();
  for(const record of listening){
    if(!/^\d{4}-Q[1-4]$/.test(record.period)||archive.has(record.period)||!Array.isArray(record.picks))throw new Error('공개 감상 분기 형식을 확인해 주세요.');
    const seen=new Set();
    for(const pick of record.picks){const track=all.get(pick.id);if(!track||track.period!==record.period||seen.has(pick.id)||!TIERS.includes(pick.tier)||(pick.note!==undefined&&(typeof pick.note!=='string'||pick.note.length>500)))throw new Error('공개 감상곡의 ID·분기·평가·한줄평을 확인해 주세요.');seen.add(pick.id);}
    archive.set(record.period,record.picks);
  }
  const groups=new Map(), hasLive=catalog.some(m=>m.published&&!m.demo);
  for(const month of catalog){
    if(publicOnly&&(!month.published||(hasLive&&month.demo)))continue;
    const id=quarterFor(month.month);
    if(!groups.has(id))groups.set(id,{id,label:`${id.slice(0,4)}년 ${id.at(-1)}분기`,months:[],tracks:[],rows:blankRows(),demo:true});
    const period=groups.get(id);period.months.push(month.month);period.tracks.push(...month.tracks);period.demo&&=month.demo;
  }
  for(const period of groups.values()){
    period.months.sort();period.tracks.sort((a,b)=>a.released.localeCompare(b.released)||a.artist.localeCompare(b.artist,'ko'));
    const visible=new Set(period.tracks.map(t=>t.id));
    const picks=archive.has(period.id)?archive.get(period.id):period.tracks.filter(t=>t.tier!=='unranked').map(t=>({id:t.id,tier:t.tier,note:t.note||''}));
    const byId=new Map(picks.filter(p=>visible.has(p.id)).map(p=>[p.id,p]));
    for(const pick of picks)if(visible.has(pick.id))period.rows[pick.tier].push(pick.id);
    period.tracks=period.tracks.map(t=>({...t,tier:byId.get(t.id)?.tier??'unranked',note:byId.get(t.id)?.note??''}));
  }
  return [...groups.values()].sort((a,b)=>b.id.localeCompare(a.id));
}
export function validateCurated(value,period){
  if(!value||value.v!==2||value.period!==period.id||!value.rows||TIERS.some(t=>!Array.isArray(value.rows[t])))throw new Error('감상 목록의 분기나 파일 형식을 확인해 주세요.');
  const known=new Set(period.tracks.map(t=>t.id)),seen=new Set();
  const rows=Object.fromEntries(TIERS.map(tier=>[tier,value.rows[tier].map(id=>{if(typeof id!=='string'||!known.has(id)||seen.has(id))throw new Error('목록에 알 수 없거나 중복된 곡이 있습니다.');seen.add(id);return id;})]));
  return {rows,notes:validateNotes(value.notes,period)};
}
export function curatedSnapshot(period,rows,notes){return {v:2,period:period.id,rows,...(notes===undefined?{}:{notes})};}
export function selectTrack(rows,id){if(pickedIds(rows).includes(id))return rows;return {...rows,unranked:[...rows.unranked,id]};}
export function removeTrack(rows,id){return Object.fromEntries(TIERS.map(tier=>[tier,rows[tier].filter(other=>other!==id)]));}
export function legacySelection(value,month){
  const old=validateState(value,month),notes=validateNotes(value.notes,month),rows=blankRows();
  for(const tier of TIERS)if(tier!=='unranked')rows[tier]=old[tier];
  rows.unranked=old.unranked.filter(id=>notes[id]?.trim());
  return {rows,notes};
}
export function mergeListening(catalog,listening,value){
  const periods=buildPeriods(catalog,listening);
  let period,state;
  if(value.v===1){const month=catalog.find(m=>m.month===value.month);if(!month)throw new Error('이전 평가 파일의 발매 월이 없습니다.');period=periods.find(p=>p.id===quarterFor(month.month));state=legacySelection(value,month);
    const current=listening.find(p=>p.period===period.id)?.picks??[];
    const incoming=new Set(month.tracks.map(t=>t.id));
    const keep=current.filter(p=>!incoming.has(p.id));
    const picks=[...keep,...pickedIds(state.rows).map(id=>({id,tier:TIERS.find(t=>state.rows[t].includes(id)),note:state.notes[id]??period.tracks.find(t=>t.id===id).note??''}))];
    return replacePeriod(listening,{period:period.id,picks});
  }
  period=periods.find(p=>p.id===value.period);if(!period)throw new Error('해당 분기의 발매곡이 없습니다.');state=validateCurated(value,period);
  const picks=pickedIds(state.rows).map(id=>({id,tier:TIERS.find(t=>state.rows[t].includes(id)),note:state.notes[id]??period.tracks.find(t=>t.id===id).note??''}));
  const next=replacePeriod(listening,{period:period.id,picks});buildPeriods(catalog,next);return next;
}
function replacePeriod(listening,entry){return [...listening.filter(p=>p.period!==entry.period),entry].sort((a,b)=>b.period.localeCompare(a.period));}
