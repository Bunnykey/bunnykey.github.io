import {CREDIT_ROLES,searchableTrack} from './studio/metadata.mjs';
import {TIERS,moveTrack,encodeState,decodeState,safeListenUrl,safeCoverPath} from './state.mjs';
import {blankRows,pickedIds,quarterFor,buildPeriods,validateCurated,curatedSnapshot,selectTrack,removeTrack,legacySelection} from './curated.mjs';
const labels={S:'S',A:'A',B:'B',C:'C',D:'D',unranked:'미평가'};
const colors=['#b08585','#b79e72','#a7ad7c','#7fa696','#8a97b4','#b3b3b3'];
const clone=value=>JSON.parse(JSON.stringify(value));
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function init(){
  const root=document.getElementById('kpop-tiers');if(!root||root.dataset.ready)return;root.dataset.ready='true';
  const $=id=>root.querySelector('#kt-'+id);
  const tell=text=>{$('status').textContent=text;};
  let data,periods,months;
  try{data=JSON.parse(document.getElementById('kt-catalog').textContent);periods=Array.isArray(data)?buildPeriods(data):data.periods;months=Array.isArray(data)?data:data.months;}catch{tell('곡 목록을 불러오지 못했습니다.');return;}
  if(!periods?.length){tell('아직 공개한 발매곡 목록이 없습니다.');root.querySelectorAll('button,select,input').forEach(n=>n.disabled=true);return;}
  $('month').replaceChildren(...periods.map(p=>{const option=el('option',p.label+(p.demo?' · 샘플':''));option.value=p.id;return option;}));
  let period=periods[0],mode='author',mine=blankRows(),notes={},history=[],incoming=null,dragged=null;
  const board=$('board'),dialog=$('dialog'),picker=$('picker');
  const key=()=>`greenhouse:kpop:v2:${period.id}`;
  const activeRows=()=>mode==='author'?period.rows:mine;
  function save(){try{localStorage.setItem(key(),JSON.stringify(curatedSnapshot(period,mine,notes)));return true;}catch{tell('자동 저장이 불가능합니다. 파일 저장으로 목록을 보관해 주세요.');return false;}}
  function load(){
    mine=blankRows();notes={};history=[];
    try{
      const raw=localStorage.getItem(key());
      if(raw){const state=validateCurated(JSON.parse(raw),period);mine=state.rows;notes=state.notes;return;}
      let migrated=false;
      for(const month of months.filter(m=>quarterFor(m.month)===period.id)){
        const previous=localStorage.getItem(`greenhouse:kpop:v1:${month.month}:${month.revision}`);if(!previous)continue;
        const state=legacySelection(JSON.parse(previous),month);for(const tier of TIERS)mine[tier].push(...state.rows[tier]);Object.assign(notes,state.notes);migrated=true;
      }
      if(migrated){save();tell('기존에 평가하거나 한줄평을 쓴 곡을 복원했습니다. 미평가 곡은 곡 선택에서 다시 담을 수 있습니다.');}
    }catch{tell('저장한 감상 목록을 읽지 못했습니다. 보관한 파일을 불러와 주세요.');}
  }
  function clearHash(){if(location.hash.startsWith('#tier='))window.history.replaceState(null,'',location.pathname+location.search);}
  function parseFile(value){
    const id=value.v===1?quarterFor(value.month):value.period;
    const found=periods.find(p=>p.id===id);if(!found)throw new Error('이 파일의 발매 분기를 찾을 수 없습니다.');
    if(value.v===1){const month=months.find(m=>m.month===value.month);if(!month)throw new Error('이전 파일의 발매 월이 없습니다.');return {period:found,...legacySelection(value,month)};}
    return {period:found,...validateCurated(value,found)};
  }
  function readShared(){
    if(!location.hash.startsWith('#tier='))return false;
    try{const parsed=parseFile(decodeState(location.hash.slice(6)));period=parsed.period;load();incoming=clone(parsed.rows);mine=parsed.rows;notes={};mode='shared';history=[];tell('공유받은 감상 목록입니다. 내 목록으로 가져오기 전에는 저장본이 바뀌지 않습니다.');return true;}catch(error){tell(error.message||'공유 링크를 읽지 못했습니다.');return false;}
  }
  function focusCard(id){for(const card of board.querySelectorAll('[data-song]'))if(card.dataset.song===id)card.focus();}
  function commit(rows,message,id){history.push({rows:clone(mine),notes:clone(notes)});if(history.length>30)history.shift();mine=rows;const saved=save();render();tell(message+(saved?' · 자동 저장됨':' · 파일 저장이 필요합니다.'));if(id)focusCard(id);}
  function setMode(next){
    if(mode==='shared'&&next==='mine'){const rows=clone(incoming);load();mode='mine';clearHash();commit(rows,'공유받은 곡 선택과 배치를 가져왔습니다.');return;}
    if(mode==='shared'){clearHash();load();}mode=next;tell('');render();
  }
  function createArt(track, extraClass='') {
    const art=el('span',undefined,`kt-art ${extraClass}`.trim());
    art.style.setProperty('--art-color',/^#[0-9a-f]{6}$/i.test(track.color)?track.color:'#687b6c');
    art.setAttribute('aria-hidden','true');
    const cover=safeCoverPath(track.cover);
    if(cover){
      const image=el('img');image.src=cover;image.alt='';image.draggable=false;image.loading=extraClass?'eager':'lazy';
      image.addEventListener('error',()=>{image.remove();art.append(el('b',track.title.slice(0,2)));},{once:true});
      art.append(image);
    }else art.append(el('b',track.title.slice(0,2)));
    return art;
  }
  function render(){
    $('month').value=period.id;$('demo').hidden=!period.demo;
    $('title').textContent=`${period.label} · ${mode==='author'?'블로그 감상':mode==='shared'?'공유받은 감상':'내 감상 목록'}`;
    $('intro').textContent='들은 곡만 담아 티어와 한줄평을 남기는 기록입니다.';
    const rows=activeRows(),selected=pickedIds(rows),ranked=selected.length-rows.unranked.length;
    $('count').textContent=`담은 곡 ${selected.length} · 평가 ${ranked}`;
    if($('library-summary'))$('library-summary').textContent=`발매곡 목록 ${period.tracks.length}곡 · 수집 월 ${period.months.map(m=>Number(m.slice(5))+'월').join(', ')}`;
    root.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===mode));b.textContent=b.dataset.mode==='author'?'블로그 감상':mode==='shared'?'내 목록으로 가져오기':'내 감상 목록';});
    $('actions').hidden=mode!=='mine';$('undo').disabled=!history.length;if($('author-export'))$('author-export').hidden=mode!=='mine';
    for(const id of ['share','image'])if($(id))$(id).disabled=!selected.length;
    if($('board-search'))$('board-search').hidden=!selected.length;
    $('hint').textContent=mode==='mine'?'곡을 눌러 티어·한줄평을 바꾸세요. 곡을 빼도 발매곡 정보는 남습니다.':'블로그가 골라 담은 곡만 표시합니다.';
    const query=($('filter')?.value||'').trim().toLocaleLowerCase();
    const matches=t=>!query||searchableTrack(t).includes(query);
    board.replaceChildren();
    if(!selected.length){
      const empty=el('div',undefined,'kt-curated-empty');empty.append(el('p',mode==='author'?'아직 공개한 감상곡이 없습니다.':'아직 골라 담은 곡이 없습니다.','kt-empty-title'),el('p','발매곡 목록에서 실제로 들은 곡만 골라 담으세요.'));
      const add=el('button','들은 곡 고르기 ＋','kt-primary');add.type='button';add.addEventListener('click',openPicker);empty.append(add);board.append(empty);return;
    }
    const publicIds=new Set(pickedIds(period.rows));
    for(const [index,tier]of TIERS.entries()){
      if(mode!=='mine'&&!rows[tier].length)continue;
      const visible=rows[tier].filter(id=>matches(period.tracks.find(t=>t.id===id)));
      const row=el('section',undefined,'kt-row');row.dataset.tier=tier;row.setAttribute('aria-label',`${labels[tier]} 티어`);
      const rank=el('div',labels[tier],'kt-rank');rank.style.setProperty('--rank-color',colors[index]);if(tier!=='unranked')rank.append(el('small',`${rows[tier].length}곡`));row.append(rank);
      const cards=el('div',undefined,'kt-cards');
      for(const id of visible){
        const track=period.tracks.find(t=>t.id===id),card=el('button',undefined,'kt-card');card.type='button';card.dataset.song=id;card.draggable=mode==='mine';card.setAttribute('aria-label',`${track.artist}, ${track.title}, ${labels[tier]} 티어. 상세 보기${mode==='mine'?' 및 이동':''}`);
        const art=createArt(track);card.append(art,el('strong',track.title),el('span',track.artist,'kt-artist'));
        if(mode!=='author'&&$('compare').checked)card.append(el('span',publicIds.has(id)?`블로그 ${labels[track.tier]}`:'블로그 목록 밖','kt-badge'));
        card.addEventListener('click',()=>openSong(track));
        card.addEventListener('dragstart',e=>{if(mode!=='mine'||!e.dataTransfer)return;dragged=id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);const r=art.getBoundingClientRect();e.dataTransfer.setDragImage(art,Math.round(Math.max(0,Math.min(r.width,e.clientX-r.left))),Math.round(Math.max(0,Math.min(r.height,e.clientY-r.top))));});
        card.addEventListener('dragend',()=>{dragged=null;board.querySelectorAll('.kt-over').forEach(n=>n.classList.remove('kt-over'));});
        card.addEventListener('dragover',e=>{if(mode==='mine'&&dragged)e.preventDefault();});
        card.addEventListener('drop',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();e.stopPropagation();const moving=dragged;dragged=null;row.classList.remove('kt-over');commit(moveTrack(mine,moving,tier,id),'곡 순서를 바꿨습니다.',moving);});cards.append(card);
      }
      if(!visible.length)cards.append(el('p',query?'검색 결과가 없습니다.':mode==='mine'?'곡을 여기에 놓아 보세요.':'—','kt-empty'));
      row.append(cards);row.addEventListener('dragover',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();row.classList.add('kt-over');});row.addEventListener('dragleave',e=>{if(!row.contains(e.relatedTarget))row.classList.remove('kt-over');});row.addEventListener('drop',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();const moving=dragged;dragged=null;commit(moveTrack(mine,moving,tier),`${labels[tier]} 티어로 이동했습니다.`,moving);});board.append(row);
    }
  }
  function updatePickerCount(shown){if($('pool-count'))$('pool-count').textContent=`${shown}곡 표시 · 내 목록에 ${pickedIds(mine).length}곡 담음`;}
  function renderPicker(){
    const pool=$('pool');if(!pool)return;
    const query=($('pool-search')?.value||'').trim().toLocaleLowerCase(),month=$('pool-month')?.value||'';
    const selected=new Set(pickedIds(mine));
    const visible=period.tracks.filter(t=>(!month||t.released.startsWith(month))&&(!query||searchableTrack(t).includes(query)));
    pool.replaceChildren();updatePickerCount(visible.length);
    if(!visible.length){pool.append(el('p','검색 결과가 없습니다.','kt-empty'));return;}
    for(const track of visible){
      const item=el('label',undefined,'kt-pick-item');item.classList.toggle('kt-picked',selected.has(track.id));
      const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=selected.has(track.id);checkbox.dataset.pick=track.id;checkbox.setAttribute('aria-label',`${track.artist} — ${track.title} 담기`);
      const text=el('span',undefined,'kt-pick-copy');text.append(el('strong',track.title),el('span',track.artist),el('small',track.released));
      checkbox.addEventListener('change',()=>{commit(checkbox.checked?selectTrack(mine,track.id):removeTrack(mine,track.id),checkbox.checked?'감상 목록에 담았습니다.':'감상 목록에서 뺐습니다.');item.classList.toggle('kt-picked',checkbox.checked);updatePickerCount(visible.length);});
      item.append(createArt(track,'kt-pick-art'),text,checkbox);pool.append(item);
    }
  }
  function openPicker(){
    if(!picker)return;
    if(mode!=='mine'){if(mode==='shared')load();clearHash();mode='mine';render();}
    if($('pool-search'))$('pool-search').value='';
    if($('pool-month')){$('pool-month').replaceChildren(el('option','분기 전체'));$('pool-month').firstElementChild.value='';for(const m of period.months){const option=el('option',`${Number(m.slice(5))}월`);option.value=m;$('pool-month').append(option);}}
    renderPicker();picker.showModal();$('pool-search')?.focus();
  }
  function openSong(track){
    const box=$('song');box.replaceChildren();
    const sequence=pickedIds(activeRows());
    const index=sequence.indexOf(track.id);
    const layout=el('div',undefined,'kt-story-layout');
    const visual=el('div',undefined,'kt-story-visual');visual.append(createArt(track,'kt-story-art'));
    const caption=el('span',`${period.label} / ${period.demo?'SAMPLE TRACK':'K-POP LISTENING'}`,'kt-story-caption');visual.append(caption);
    const copy=el('div',undefined,'kt-story-copy');
    copy.append(el('p','LISTENING NOTES','kt-story-eyebrow'));
    const h=el('h3',track.title);h.id='kt-song-title';copy.append(h,el('p',track.artist,'kt-story-artist'));if(track.album)copy.append(el('p',track.album,'kt-story-album'));
    const meta=el('div',undefined,'kt-story-meta');
    const isPublic=pickedIds(period.rows).includes(track.id);
    const badge=el('span',isPublic?`블로그 ${labels[track.tier]||'미평가'}`:'블로그 목록에 없는 곡','kt-story-tier');
    badge.style.setProperty('--rank-color',colors[Math.max(0,TIERS.indexOf(track.tier))]);
    const date=el('time',track.released);date.dateTime=track.released;meta.append(badge,date);copy.append(meta);
    const review=el('div',undefined,'kt-story-review');review.append(el('p','이 곡을 듣고','kt-story-review-label'),el('blockquote',track.note||(isPublic?'아직 한줄평이 없습니다.':'아직 공개한 감상이 없는 곡입니다.')));copy.append(review);
    if(track.details){
      const details=track.details,credits=el('dl',undefined,'kt-story-credits');
      const line=(label,text)=>{if(!text)return;const group=el('div');group.append(el('dt',label),el('dd',text));credits.append(group);};
      for(const [key,label]of Object.entries(CREDIT_ROLES))line(label,(details.credits?.[key]??[]).join(' · '));
      line('재생시간',details.duration);line('장르',details.genres);line('기획사',details.label);line('유통사',details.distributor);
      copy.append(credits);
      if(details.status==='pending')copy.append(el('p','제작진 상세 정보는 제공처 요청 제한으로 확인 중입니다.','kt-small'));
      else if(details.missing?.length)copy.append(el('p','일부 제작진 정보가 원본에 없거나 확인되지 않았습니다.','kt-small'));
    }
    if(period.demo)copy.append(el('p','화면 확인용 가상 곡 · 가상 평가','kt-story-demo'));
    const url=safeListenUrl(track.listenUrl);
    if(url){const a=el('a','공식 음원·영상 듣기 ↗','kt-story-listen');a.href=url;a.target='_blank';a.rel='noopener noreferrer';copy.append(a);}
    layout.append(visual,copy);box.append(layout);
    if(mode==='mine'){
      const noteLabel=el('label','내 한줄평','kt-note-label'),textarea=el('textarea');
      textarea.id='kt-my-note';textarea.maxLength=500;textarea.rows=3;textarea.value=notes[track.id]??'';textarea.placeholder='듣고 남기고 싶은 이야기 (500자 이내)';noteLabel.htmlFor=textarea.id;
      textarea.addEventListener('input',()=>{notes[track.id]=textarea.value;save();});
      box.append(noteLabel,textarea);
      const heading=el('p','이 곡은 어느 티어인가요?','kt-edit-label');box.append(heading);
      const choices=el('div',undefined,'kt-choice'),current=TIERS.find(t=>mine[t].includes(track.id));
      for(const tier of TIERS){const b=el('button',labels[tier]);b.type='button';b.setAttribute('aria-pressed',String(current===tier));b.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,tier),`${track.title}: ${labels[tier]} 티어`,track.id);});choices.append(b);}box.append(choices);
      const remove=el('button','감상 목록에서 빼기','kt-remove');remove.type='button';remove.addEventListener('click',()=>{dialog.close();commit(removeTrack(mine,track.id),'감상 목록에서 뺐습니다. 곡 정보는 발매곡 목록에 남아 있습니다.');});box.append(remove);
      const order=el('div',undefined,'kt-reorder'),position=mine[current].indexOf(track.id);
      const prev=el('button','← 앞 순서'),next=el('button','뒤 순서 →');prev.type=next.type='button';prev.disabled=position===0;next.disabled=position===mine[current].length-1;
      prev.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,current,mine[current][position-1]),'앞으로 옮겼습니다.',track.id);});
      next.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,current,mine[current][position+2]),'뒤로 옮겼습니다.',track.id);});order.append(prev,next);box.append(order);
    }

    const navigation=el('nav',undefined,'kt-story-nav');navigation.setAttribute('aria-label','곡 상세 탐색');
    const previous=el('button','← 이전 곡'),next=el('button','다음 곡 →');previous.type=next.type='button';
    previous.disabled=index<=0;next.disabled=index>=sequence.length-1;
    previous.addEventListener('click',()=>openSong(period.tracks.find(t=>t.id===sequence[index-1])));
    next.addEventListener('click',()=>openSong(period.tracks.find(t=>t.id===sequence[index+1])));
    const count=el('span',`${String(index+1).padStart(2,'0')} / ${String(sequence.length).padStart(2,'0')}`);count.setAttribute('aria-live','polite');
    navigation.append(previous,count,next);box.append(navigation);
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
  }
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
  root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('month').addEventListener('change',()=>{period=periods.find(p=>p.id===$('month').value);clearHash();if(mode==='shared')mode='author';if($('filter'))$('filter').value='';tell('');load();render();});
  $('add')?.addEventListener('click',openPicker);$('pool-search')?.addEventListener('input',renderPicker);$('pool-month')?.addEventListener('change',renderPicker);
  $('compare').addEventListener('change',render);$('filter')?.addEventListener('input',render);
  $('undo').addEventListener('click',()=>{if(!history.length)return;const previous=history.pop();mine=previous.rows;notes=previous.notes;const saved=save();render();if(picker?.open)renderPicker();tell(saved?'이전 감상 목록으로 되돌렸습니다.':'복원했습니다. 파일로 저장해 주세요.');});
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
  $('confirm-reset').addEventListener('click',()=>{$('reset-dialog').close();const rows=blankRows();rows.unranked=pickedIds(mine);commit(rows,'담은 곡의 티어만 비웠습니다.');});
  function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  $('export').addEventListener('click',()=>{download(new Blob([JSON.stringify(curatedSnapshot(period,activeRows(),mode==='mine'?notes:undefined),null,2)],{type:'application/json'}),`kpop-${period.id}-${mode}.json`);tell('감상 목록 파일을 저장했습니다.');});
  $('author-export')?.addEventListener('click',()=>{const included=new Set(pickedIds(mine)),publicNotes=Object.fromEntries(Object.entries(notes).filter(([id])=>included.has(id)));download(new Blob([JSON.stringify({...curatedSnapshot(period,mine,publicNotes),kind:'greenhouse-kpop-ratings-v2'},null,2)],{type:'application/json'}),`kpop-${period.id}-public-ratings.json`);tell('선택한 곡의 티어와 한줄평을 저장했습니다. 블로그에는 아직 반영되지 않았습니다.');});
  $('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>2097152)throw new Error('2MB 이하의 파일을 선택해 주세요.');const value=JSON.parse(await file.text()),parsed=parseFile(value);if(period.id!==parsed.period.id||mode==='shared'){period=parsed.period;load();}mode='mine';clearHash();history.push({rows:clone(mine),notes:clone(notes)});if(value.v===1){const affected=new Set(months.find(m=>m.month===value.month).tracks.map(t=>t.id));mine=Object.fromEntries(TIERS.map(tier=>[tier,[...mine[tier].filter(id=>!affected.has(id)),...parsed.rows[tier]]]));notes={...notes,...parsed.notes};}else{mine=parsed.rows;notes=parsed.notes;}save();render();tell('선택한 곡과 티어·한줄평을 불러왔습니다.');}catch(error){tell(error.message||'파일을 읽지 못했습니다.');}finally{event.target.value='';}});
  $('share').addEventListener('click',async()=>{const token=encodeState(curatedSnapshot(period,activeRows()));if(token.length>24000){tell('공유할 곡이 많습니다. 파일 저장을 이용해 주세요.');return;}const url=new URL(location.href);url.hash='tier='+token;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url.href);tell('선택한 곡만 담은 공유 링크를 복사했습니다.');return;}}catch{}$('share-url').value=url.href;$('share-dialog').showModal();$('share-url').focus();$('share-url').select();});
  $('image').addEventListener('click',async()=>{
    const rows=activeRows(),width=1080,cell=140,cols=6;
    let y=190;
    const heading=`${period.label} K-POP · ${mode==='author'?'블로그 티어':mode==='shared'?'공유 티어':'내 티어'}`;
    let body=`<rect width="1080" height="100%" fill="#fafafa"/><text x="40" y="65" font-size="30" fill="#252525">${xml(heading)}</text><text x="40" y="105" font-size="17" fill="#666">${period.demo?'화면 확인용 가상 곡 · 가상 평가':'The Greenhouse · 개인의 취향을 담은 티어리스트'}</text>`;
    for(const [i,tier]of TIERS.entries()){
      const height=Math.max(110,Math.ceil(rows[tier].length/cols)*115+20);
      body+=`<rect x="40" y="${y}" width="1000" height="${height}" fill="none" stroke="#ddd"/><rect x="40" y="${y}" width="80" height="${height}" fill="${colors[i]}"/><text x="80" y="${y+height/2+7}" text-anchor="middle" font-size="${tier==='unranked'?18:28}" fill="#252525">${labels[tier]}</text>`;
      rows[tier].forEach((id,j)=>{const t=period.tracks.find(t=>t.id===id),x=140+(j%cols)*cell,top=y+20+Math.floor(j/cols)*115;body+=`<rect x="${x}" y="${top}" width="125" height="55" rx="2" fill="${/^#[0-9a-f]{6}$/i.test(t.color)?t.color:'#687b6c'}"/><text x="${x+10}" y="${top+36}" font-size="25" fill="white">${xml(t.title.slice(0,2))}</text><text x="${x}" y="${top+78}" font-size="15" fill="#252525">${xml(t.title.slice(0,14))}</text><text x="${x}" y="${top+98}" font-size="12" fill="#666">${xml(t.artist.slice(0,20))}</text>`;});y+=height+12;
    }
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y+55}" viewBox="0 0 ${width} ${y+55}"><style>text{font-family:system-ui,sans-serif}</style>${body}<text x="40" y="${y+28}" font-size="13" fill="#666">The Greenhouse / 분기별 케이팝 감상</text></svg>`;
    try{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=y+55;const context=canvas.getContext('2d');if(!context)throw new Error();context.drawImage(img,0,0);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error();download(png,`kpop-${period.id}-${mode}.png`);tell('티어 이미지를 PNG로 저장했습니다.');}catch{download(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),`kpop-${period.id}-${mode}.svg`);tell('티어 이미지를 SVG로 저장했습니다.');}
  });
  load();readShared();render();
  window.addEventListener('hashchange',()=>{if(!root.isConnected)return;if(readShared())render();else if(mode==='shared'&&!location.hash.startsWith('#tier=')){mode='author';tell('');load();render();}});
}
