import {TIERS} from './model.mjs';
// Copy only October songs. The original quarterly browser data is never changed.
export function importLegacyOctober(workspace,value){
 if(!value||value.v!==2||value.period!=='2026-Q4'||!value.rows||TIERS.some(t=>!Array.isArray(value.rows[t])))throw Error('이전 감상 목록 형식 오류');
 const known=new Set(workspace.catalog.find(m=>m.month==='2026-10')?.tracks.map(t=>t.id)),seen=new Set(),incoming={};let count=0;
 for(const tier of TIERS)for(const id of value.rows[tier]){if(typeof id!=='string'||seen.has(id))throw Error('이전 감상 목록에 중복 ID가 있습니다.');seen.add(id);if(!known.has(id))continue;const note=value.notes?.[id]??'';if(typeof note!=='string'||note.length>500)throw Error('이전 한줄평 형식 오류');incoming[id]={selected:true,tier,note,review:'pending',issue:''};count++;}
 Object.assign(workspace.entries,incoming);return count;
}
