export const CREDIT_ROLES={composers:'작곡',lyricists:'작사',arrangers:'편곡',vocals:'보컬'};
const strings=(v,max=100)=>{if(!Array.isArray(v)||v.length>max||v.some(x=>typeof x!=='string'||x.length>200))throw Error('제작진 목록 형식 오류');return [...new Set(v.map(x=>x.trim()).filter(Boolean))];};
export function cleanDetails(value){
 if(value===undefined)return undefined;if(!value||typeof value!=='object'||Array.isArray(value))throw Error('상세 정보 형식 오류');
 const out={};
 for(const f of ['fetchedAt','trackSource','albumSource','duration','coverSource','sourceTitle','albumType','genres','styles','label','distributor','sourceReleased','reviewedAt','coverProvenance'])if(value[f]!==undefined){if(typeof value[f]!=='string'||value[f].length>1500)throw Error('상세 정보 문자열 형식 오류');out[f]=value[f];}
 if(!['collected','partial','failed','pending','edited'].includes(value.status))throw Error('상세 수집 상태 오류');out.status=value.status;
 if(value.coverLocal!==undefined){if(typeof value.coverLocal!=='string'||!/^\.\/assets\/covers\/[a-zA-Z0-9_-]+\.webp$/.test(value.coverLocal))throw Error('자켓 파일 경로 오류');out.coverLocal=value.coverLocal;}
 out.credits={};for(const key of Object.keys(CREDIT_ROLES))out.credits[key]=strings(value.credits?.[key]??[]);
 out.missing=strings(value.missing??[],30);out.errors=strings(value.errors??[],30);
 if(value.coverSize!==undefined){if(!Array.isArray(value.coverSize)||value.coverSize.length!==2||value.coverSize.some(x=>!Number.isInteger(x)||x<1||x>4000))throw Error('자켓 크기 오류');out.coverSize=[...value.coverSize];}
 if(value.contributors!==undefined){if(!Array.isArray(value.contributors)||value.contributors.length>50)throw Error('참여진 형식 오류');out.contributors=value.contributors.map(c=>{if(!c||typeof c.role!=='string'||c.role.length>100)throw Error('참여 역할 오류');return {role:c.role,names:strings(c.names)};});}
 return out;
}
export function metadataMissing(t){const d=t.details;if(!d)return ['상세 정보 미수집'];const missing=[];for(const key of ['composers','lyricists','arrangers'])if(!d.credits?.[key]?.length)missing.push(CREDIT_ROLES[key]);if(!d.coverLocal)missing.push('자켓');if(!d.duration)missing.push('재생시간');return missing;}
export function searchableTrack(t){const d=t.details??{};return [t.title,t.artist,t.album,d.label,d.distributor,d.genres,d.styles,...Object.values(d.credits??{}).flat(),...(d.contributors??[]).flatMap(x=>[x.role,...x.names])].filter(Boolean).join(' ').toLocaleLowerCase();}
export function attachAvailableMetadata(workspace,defaults){
 const index=new Map(defaults.catalog.flatMap(m=>m.tracks).map(t=>[t.id,t]));
 const enrich=t=>{const source=index.get(t.id)?.details;if(!source)return false;if(!t.details){t.details=cleanDetails(source);return true;}if(t.details.status==='edited')return false;const before=JSON.stringify(t.details);
 if(['pending','failed'].includes(t.details.status)&&['collected','partial'].includes(source.status))t.details=cleanDetails(source);else for(const field of ['albumType','genres','styles','label','distributor','sourceReleased','coverLocal','coverSource','coverProvenance','coverSize'])if(!t.details[field]&&source[field])t.details[field]=JSON.parse(JSON.stringify(source[field]));return before!==JSON.stringify(t.details);};
 let count=0;for(const month of workspace.catalog)for(const t of month.tracks)if(enrich(t))count++;
 for(const month of workspace.baselineCatalog??[])for(const t of month.tracks)enrich(t);return count;
}
export function metadataSummary(tracks){return {total:tracks.length,covers:tracks.filter(t=>t.details?.coverLocal).length,composers:tracks.filter(t=>t.details?.credits?.composers?.length).length,lyricists:tracks.filter(t=>t.details?.credits?.lyricists?.length).length,arrangers:tracks.filter(t=>t.details?.credits?.arrangers?.length).length,incomplete:tracks.filter(t=>metadataMissing(t).length||t.details?.errors?.length).length};}
