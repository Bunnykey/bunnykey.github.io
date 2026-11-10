import {cleanDetails,metadataMissing} from './metadata.mjs';
export const TIERS=['S','A','B','C','D','unranked'];
export const MONTH='2026-10', PERIOD='2026-Q4';
export const clone=v=>JSON.parse(JSON.stringify(v));
export function fresh(catalog){return {schema:'bunnyside-listening/v1',month:MONTH,catalog:clone(catalog),baselineCatalog:clone(catalog),entries:{},changes:[],baseline:{},revision:0};}
export const songList=w=>w.catalog.find(m=>m.month===MONTH).tracks;
export const entry=(w,id)=>w.entries[id]??{selected:false,tier:'unranked',note:'',review:'pending',issue:''};
export function safeUrl(x){try{let u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&['music.bugs.co.kr','open.spotify.com','youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)?u.href:null;}catch{return null;}}
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}]/gu,'');
export function audit(w,original){
 const tracks=songList(w), issues=[],ids=new Set(),keys=new Map();
 const add=(id,type,message)=>issues.push({id,type,message});
 for(const t of tracks){
  if(ids.has(t.id))add(t.id,'error','곡 ID 중복');ids.add(t.id);
  for(const f of ['title','artist','album','released','sourceUrl','listenUrl'])if(typeof t[f]!=='string'||!t[f].trim())add(t.id,'error',`${{title:'제목',artist:'아티스트',album:'앨범',released:'발매일',sourceUrl:'출처',listenUrl:'감상 링크'}[f]} 누락`);
  if(!/^2026-10-\d{2}$/.test(t.released)||!Number.isFinite(Date.parse(t.released))||new Date(t.released).toISOString().slice(0,10)!==t.released)add(t.id,'error','발매일 오류 · 2026년 10월의 유효한 날짜가 필요합니다.');
  for(const f of ['title','artist'])if(typeof t[f]==='string'&&t[f].length>100)add(t.id,'error',`${f==='title'?'제목':'아티스트'}는 100자 이내여야 합니다.`);
  if(t.cover&&(!/^\/img\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|avif|gif)$/i.test(t.cover)||t.cover.includes('..')))add(t.id,'error','이미지 경로 오류 · /img/ 내부 파일을 사용하세요.');
  if(t.listenUrl&&!safeUrl(t.listenUrl))add(t.id,'error','허용되지 않은 감상 링크');
  if(t.sourceUrl&&!safeUrl(t.sourceUrl))add(t.id,'error','출처 URL 오류');
  const key=norm(t.artist)+'|'+norm(t.title);if(keys.has(key))add(t.id,'warning',`제목·아티스트 중복 의심 (${keys.get(key)})`);else keys.set(key,t.id);
  if(t.details?.sourceReleased&&t.details.sourceReleased.replaceAll('.','-')!==t.released)add(t.id,'warning',`발매일 출처와 다름: ${t.details.sourceReleased}`);
  if(t.details){if(t.details.status==='pending')add(t.id,'warning','제공처 요청 제한(429)으로 상세 정보 수집 대기');else{for(const problem of t.details.errors??[])add(t.id,problem.includes('불일치')?'error':'warning',problem);const missing=metadataMissing(t);if(missing.length)add(t.id,'warning','원본 상세 정보 미확인: '+missing.join(' · '));}}
  const e=entry(w,t.id);if(e.issue.trim())add(t.id,'error',e.issue);
 }
 const originals=songList(original);for(const t of originals)if(!ids.has(t.id))add(t.id,'error',`수집본 대비 누락: ${t.artist} — ${t.title}`);
 for(const [id,e]of Object.entries(w.entries))if(e.selected&&!ids.has(id))add(id,'error','선택한 곡이 곡 목록에서 누락되었습니다.');
 return issues;
}
export function review(w,original){const problems=audit(w,original);for(const t of songList(w)){const e=entry(w,t.id);if(!e.selected)continue;if(e.tier==='unranked')problems.push({id:t.id,type:'block',message:'티어 미입력'});if(e.review!=='checked')problems.push({id:t.id,type:'block',message:e.review==='hold'?'검수 보류':'검수 미완료'});if(!e.note.trim())problems.push({id:t.id,type:'block',message:'한줄평 미입력'});}return problems;}
export function curated(w){const rows=Object.fromEntries(TIERS.map(t=>[t,[]])),notes={};for(const t of songList(w)){const e=entry(w,t.id);if(e.selected){rows[e.tier].push(t.id);notes[t.id]=e.note;}}return {v:2,period:PERIOD,rows,notes};}
export function diff(w){
 const result=[],defaults={selected:false,tier:'unranked',note:'',review:'pending',issue:''},tracks=songList(w),base=(w.baselineCatalog??w.catalog).find(m=>m.month===MONTH).tracks;
 for(const t of tracks){const a=w.baseline[t.id]??{},b=entry(w,t.id);for(const f of Object.keys(defaults))if((a[f]??defaults[f])!==b[f])result.push({id:t.id,title:t.title,field:f,before:a[f]??defaults[f],after:b[f]});
 const prev=base.find(x=>x.id===t.id);if(!prev)result.push({id:t.id,title:t.title,field:'catalog',before:'수집본에 없음',after:'곡 추가'});else for(const f of ['title','artist','album','released','sourceUrl','listenUrl'])if(prev[f]!==t[f])result.push({id:t.id,title:t.title,field:f,before:prev[f]??'',after:t[f]??''});
 if(prev){for(const f of ['duration','genres','label','distributor'])if((prev.details?.[f]??'')!==(t.details?.[f]??''))result.push({id:t.id,title:t.title,field:f,before:prev.details?.[f]??'',after:t.details?.[f]??''});for(const f of ['composers','lyricists','arrangers'])if(JSON.stringify(prev.details?.credits?.[f]??[])!==JSON.stringify(t.details?.credits?.[f]??[]))result.push({id:t.id,title:t.title,field:f,before:(prev.details?.credits?.[f]??[]).join(' · '),after:(t.details?.credits?.[f]??[]).join(' · ')});}}
 for(const t of base)if(!tracks.some(x=>x.id===t.id))result.push({id:t.id,title:t.title,field:'catalog',before:'수집본에 있음',after:'누락'});return result;
}
export function parseWorkspace(value){
 if(!value||value.schema!=='bunnyside-listening/v1'||value.month!==MONTH||!Array.isArray(value.catalog)||value.catalog.length!==1)throw Error('2026년 10월 Bunny Side 백업 파일이 필요합니다.');
 const month=value.catalog[0];if(month.month!==MONTH||!Array.isArray(month.tracks)||month.tracks.length>300)throw Error('곡 목록 형식을 확인해 주세요.');
 const w=fresh([{month:MONTH,revision:String(month.revision??'import').slice(0,80),published:true,demo:false,tracks:month.tracks.map(t=>{
 if(!t||typeof t.id!=='string'||!/^[\w-]{1,80}$/.test(t.id))throw Error('곡 ID 형식 오류');
 let out={id:t.id,tier:'unranked',note:''};for(const f of ['title','artist','album','released','sourceUrl','listenUrl','cover']){if(t[f]!==undefined&&typeof t[f]!=='string')throw Error('메타데이터 형식 오류');out[f]=(t[f]??'').slice(0,1000);}if(t.details!==undefined)out.details=cleanDetails(t.details);return out;})}]);
 function cleanEntries(input){if(!input||typeof input!=='object'||Array.isArray(input))throw Error('감상 기록 형식 오류');const out={};for(const [id,e]of Object.entries(input)){if(!/^[\w-]{1,80}$/.test(id)||!e||typeof e.selected!=='boolean'||!TIERS.includes(e.tier)||typeof e.note!=='string'||e.note.length>500||!['pending','checked','hold'].includes(e.review)||typeof e.issue!=='string'||e.issue.length>500)throw Error('감상 기록의 티어·한줄평·검수 상태를 확인해 주세요.');out[id]={selected:e.selected,tier:e.tier,note:e.note,review:e.review,issue:e.issue};}return out;}
 if(value.baselineCatalog)w.baselineCatalog=parseWorkspace({...value,catalog:value.baselineCatalog,baselineCatalog:undefined}).catalog;w.entries=cleanEntries(value.entries);w.baseline=cleanEntries(value.baseline??{});w.changes=Array.isArray(value.changes)?value.changes.slice(-100).map(c=>({at:String(c.at).slice(0,40),message:String(c.message).slice(0,200)})):[];w.revision=Number.isSafeInteger(value.revision)?value.revision:0;return w;
}
export function markdown(w,original){const rows=curated(w),problems=review(w,original);const esc=s=>String(s).replace(/[\r\n]+/g,' ').replace(/[|]/g,'\\|').replace(/[<>]/g,'');return `# 2026년 10월 감상 목록\n\n검토용 초안 · ${Object.values(rows.rows).flat().length}곡 · 미해결 검수 ${problems.length}건\n\n| 티어 | 곡 | 아티스트 | 한줄평 | 검수 |\n| --- | --- | --- | --- | --- |\n`+TIERS.flatMap(tier=>rows.rows[tier].map(id=>{let t=songList(w).find(t=>t.id===id),e=entry(w,id);return `| ${tier==='unranked'?'미평가':tier} | ${esc(t.title)} | ${esc(t.artist)} | ${esc(e.note)} | ${e.review==='checked'?'완료':e.review==='hold'?'보류':'미검수'} |`;})).join('\n')+'\n\n## 곡별 상세 정보\n\n'+TIERS.flatMap(tier=>rows.rows[tier].map(id=>{const t=songList(w).find(x=>x.id===id),d=t.details??{},c=d.credits??{};return `### ${esc(t.title)} — ${esc(t.artist)}\n\n- 앨범: ${esc(t.album)}\n- 재생시간: ${esc(d.duration||'미확인')}\n- 작곡: ${esc((c.composers??[]).join(' · ')||'원본 미등록 / 미확인')}\n- 작사: ${esc((c.lyricists??[]).join(' · ')||'원본 미등록 / 미확인')}\n- 편곡: ${esc((c.arrangers??[]).join(' · ')||'원본 미등록 / 미확인')}\n- 기획사 / 유통사: ${esc(d.label||'미확인')} / ${esc(d.distributor||'미확인')}\n- 정보 출처: ${esc(d.trackSource||t.listenUrl)}\n- 수집 시각: ${esc(d.fetchedAt||'미수집')}\n`; })).join('\n')+'\n\n## 검수 결과\n\n'+(problems.map(p=>`- ${esc(p.id)}: ${esc(p.message)}`).join('\n')||'- 미해결 항목 없음')+'\n\n## 변경 내역\n\n'+(diff(w).map(d=>`- ${esc(d.title)} · ${d.field}: ${esc(d.before)} → ${esc(d.after)}`).join('\n')||'- 기준점 이후 변경 없음')+'\n';}
