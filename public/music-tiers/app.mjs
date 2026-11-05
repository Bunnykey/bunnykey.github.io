import {TIERS, emptyRows, authorRows, validateState, moveTrack, snapshot, encodeState, decodeState, safeListenUrl, safeCoverPath} from './state.mjs';
const labels = {S:'S',A:'A',B:'B',C:'C',D:'D',unranked:'미평가'};
const colors = ['#b08585','#b79e72','#a7ad7c','#7fa696','#8a97b4','#b3b3b3'];
const clone = value => JSON.parse(JSON.stringify(value));
const el = (tag, text, cls) => {const n=document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const xml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function init() {
  const root=document.getElementById('kpop-tiers');
  if(!root || root.dataset.ready)return;root.dataset.ready='true';
  const $=id=>root.querySelector('#kt-'+id);
  let catalog;
  try {catalog=JSON.parse(document.getElementById('kt-catalog').textContent);} catch { $('status').textContent='곡 목록을 불러오지 못했습니다.';return; }
  if(!catalog.length){$('status').textContent='아직 공개한 월별 목록이 없습니다.';root.querySelectorAll('button,select,input').forEach(n=>n.disabled=true);return;}
  let month=catalog[0], mode='author', mine=emptyRows(month), history=[], importedRows=null, dragged=null;
  const board=$('board'), dialog=$('dialog');
  const tell=message=>{$('status').textContent=message;};
  const key=()=>`greenhouse:kpop:v1:${month.month}:${month.revision}`;
  function save(){try{localStorage.setItem(key(),JSON.stringify(snapshot(month,mine)));return true;}catch{tell('자동 저장을 사용할 수 없습니다. 파일 저장으로 결과를 보관해 주세요.');return false;}}
  function load(){mine=emptyRows(month);history=[];try{const raw=localStorage.getItem(key());if(raw)mine=validateState(JSON.parse(raw),month);}catch{tell('저장한 티어를 읽지 못했습니다. 파일을 불러오거나 새로 만들어 주세요.');}}
  function readHash(){
    if(!location.hash.startsWith('#tier='))return false;
    try{const value=decodeState(location.hash.slice(6));const matched=catalog.find(m=>m.month===value.month);if(!matched)throw new Error('이 링크의 월별 목록을 찾을 수 없습니다.');const rows=validateState(value,matched);month=matched;load();importedRows=clone(rows);mine=rows;mode='shared';history=[];tell('공유받은 티어를 보고 있습니다. 내 티어로 가져오면 기존 내 티어가 교체됩니다.');return true;}catch(error){tell(error.message||'공유 링크를 읽지 못했습니다.');return false;}
  }
  function clearHash(){if(location.hash.startsWith('#tier='))window.history.replaceState(null,'',location.pathname+location.search);}
  function activeRows(){return mode==='author'?authorRows(month):mine;}
  function focusCard(id){board.querySelectorAll('[data-song]').forEach(n=>{if(n.dataset.song===id)n.focus();});}
  function commit(next,message,id){history.push(clone(mine));if(history.length>30)history.shift();mine=next;const saved=save();render();tell(message+(saved?' · 자동 저장됨':' · 자동 저장 불가: 파일로 저장해 주세요.'));if(id)focusCard(id);}
  function setMode(next){
    if(mode==='shared' && next==='mine') {const incoming=clone(importedRows);load();mode='mine';clearHash();commit(incoming,'공유받은 배치를 내 티어로 저장했습니다.');return;}
    else {if(mode==='shared'){clearHash();load();}mode=next;tell('');}
    render();
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
    $('month').value=month.month;$('demo').hidden=!month.demo;
    $('title').textContent=`${Number(month.month.slice(5))}월의 ${mode==='author'?'블로그 티어':mode==='shared'?'공유받은 티어':'내 티어'}${month.demo?' · 예시':''}`;
    $('intro').textContent=month.intro;
    const rows=activeRows(), ranked=month.tracks.length-rows.unranked.length;
    $('count').textContent=`${ranked} / ${month.tracks.length}곡 평가`;
    root.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===mode));b.textContent=b.dataset.mode==='mine' && mode==='shared'?'내 티어로 가져오기':b.dataset.mode==='mine'?'내 티어 만들기':'블로그 티어';});
    $('actions').hidden=mode!=='mine';$('undo').disabled=!history.length;
    $('hint').textContent=mode==='mine'?'곡을 눌러 티어를 선택하세요. PC에서는 끌어 놓기로 순서도 바꿀 수 있어요.':'곡을 누르면 블로그의 한줄평을 볼 수 있어요.';
    board.replaceChildren();
    for(const [index,tier] of TIERS.entries()){
      const row=el('section',undefined,'kt-row');row.dataset.tier=tier;row.setAttribute('aria-label',`${labels[tier]} 티어`);
      const rank=el('div',labels[tier],'kt-rank');rank.style.setProperty('--rank-color',colors[index]);if(tier!=='unranked')rank.append(el('small',`${rows[tier].length}곡`));row.append(rank);
      const cards=el('div',undefined,'kt-cards');
      for(const id of rows[tier]){
        const track=month.tracks.find(t=>t.id===id),card=el('button',undefined,'kt-card');card.type='button';card.dataset.song=id;card.draggable=mode==='mine';card.setAttribute('aria-label',`${track.artist}, ${track.title}, ${labels[tier]} 티어. 상세 보기${mode==='mine'?' 및 이동':''}`);
        const art=createArt(track);card.append(art,el('strong',track.title),el('span',track.artist,'kt-artist'));
        if(mode!=='author' && $('compare').checked)card.append(el('span',`블로그 ${labels[track.tier]||'미평가'}`,'kt-badge'));
        card.addEventListener('click',()=>openSong(track));
        card.addEventListener('dragstart',e=>{
          if(mode!=='mine'||!e.dataTransfer)return;
          dragged=id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);
          // Capture the complete visible cover rather than a nested image or text selection.
          const rect=art.getBoundingClientRect();
          e.dataTransfer.setDragImage(art,Math.round(Math.max(0,Math.min(rect.width,e.clientX-rect.left))),Math.round(Math.max(0,Math.min(rect.height,e.clientY-rect.top))));
        });
        card.addEventListener('dragend',()=>{dragged=null;board.querySelectorAll('.kt-over').forEach(n=>n.classList.remove('kt-over'));});
        card.addEventListener('dragover',e=>{if(mode==='mine' && dragged)e.preventDefault();});
        card.addEventListener('drop',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();e.stopPropagation();const moving=dragged;dragged=null;row.classList.remove('kt-over');commit(moveTrack(mine,moving,tier,id),'곡 순서를 변경했습니다.',moving);});
        cards.append(card);
      }
      if(!rows[tier].length)cards.append(el('p',mode==='mine'?'곡을 여기에 놓아 보세요.':'—','kt-empty'));
      row.append(cards);row.addEventListener('dragover',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();row.classList.add('kt-over');});row.addEventListener('dragleave',e=>{if(!row.contains(e.relatedTarget))row.classList.remove('kt-over');});row.addEventListener('drop',e=>{if(mode!=='mine'||!dragged)return;e.preventDefault();const moving=dragged;dragged=null;commit(moveTrack(mine,moving,tier),`${labels[tier]} 티어로 이동했습니다.`,moving);});board.append(row);
    }
  }
  function openSong(track){
    const box=$('song');box.replaceChildren();
    const sequence=TIERS.flatMap(tier=>activeRows()[tier]);
    const index=sequence.indexOf(track.id);
    const layout=el('div',undefined,'kt-story-layout');
    const visual=el('div',undefined,'kt-story-visual');visual.append(createArt(track,'kt-story-art'));
    const caption=el('span',`${month.month.replace('-','.')} / ${month.demo?'SAMPLE TRACK':'MONTHLY K-POP'}`,'kt-story-caption');visual.append(caption);
    const copy=el('div',undefined,'kt-story-copy');
    copy.append(el('p','THE MONTHLY LIST','kt-story-eyebrow'));
    const h=el('h3',track.title);h.id='kt-song-title';copy.append(h,el('p',track.artist,'kt-story-artist'));
    const meta=el('div',undefined,'kt-story-meta');
    const badge=el('span',`블로그 ${labels[track.tier]||'미평가'}`,'kt-story-tier');
    badge.style.setProperty('--rank-color',colors[Math.max(0,TIERS.indexOf(track.tier))]);
    const date=el('time',track.released);date.dateTime=track.released;meta.append(badge,date);copy.append(meta);
    const review=el('div',undefined,'kt-story-review');review.append(el('p','이 곡을 듣고','kt-story-review-label'),el('blockquote',track.note||'아직 한줄평이 없습니다.'));copy.append(review);
    if(month.demo)copy.append(el('p','화면 확인용 가상 곡 · 가상 평가','kt-story-demo'));
    const url=safeListenUrl(track.listenUrl);
    if(url){const a=el('a','공식 음원·영상 듣기 ↗','kt-story-listen');a.href=url;a.target='_blank';a.rel='noopener noreferrer';copy.append(a);}
    layout.append(visual,copy);box.append(layout);
    if(mode==='mine'){
      const heading=el('p','이 곡은 어느 티어인가요?','kt-edit-label');box.append(heading);
      const choices=el('div',undefined,'kt-choice'),current=TIERS.find(t=>mine[t].includes(track.id));
      for(const tier of TIERS){const b=el('button',labels[tier]);b.type='button';b.setAttribute('aria-pressed',String(current===tier));b.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,tier),`${track.title}: ${labels[tier]} 티어`,track.id);});choices.append(b);}box.append(choices);
      const order=el('div',undefined,'kt-reorder'),position=mine[current].indexOf(track.id);
      const prev=el('button','← 앞 순서'),next=el('button','뒤 순서 →');prev.type=next.type='button';prev.disabled=position===0;next.disabled=position===mine[current].length-1;
      prev.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,current,mine[current][position-1]),'앞으로 옮겼습니다.',track.id);});
      next.addEventListener('click',()=>{dialog.close();commit(moveTrack(mine,track.id,current,mine[current][position+2]),'뒤로 옮겼습니다.',track.id);});order.append(prev,next);box.append(order);
    }

    const navigation=el('nav',undefined,'kt-story-nav');navigation.setAttribute('aria-label','곡 상세 탐색');
    const previous=el('button','← 이전 곡'),next=el('button','다음 곡 →');previous.type=next.type='button';
    previous.disabled=index<=0;next.disabled=index>=sequence.length-1;
    previous.addEventListener('click',()=>openSong(month.tracks.find(t=>t.id===sequence[index-1])));
    next.addEventListener('click',()=>openSong(month.tracks.find(t=>t.id===sequence[index+1])));
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
  $('month').addEventListener('change',()=>{month=catalog.find(m=>m.month===$('month').value);clearHash();if(mode==='shared')mode='author';tell('');load();render();});
  $('compare').addEventListener('change',render);
  $('undo').addEventListener('click',()=>{if(!history.length)return;mine=history.pop();const saved=save();render();tell(saved?'이전 배치로 되돌렸습니다.':'배치를 되돌렸습니다. 자동 저장 불가: 파일로 저장해 주세요.');});
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
  $('confirm-reset').addEventListener('click',()=>{$('reset-dialog').close();commit(emptyRows(month),'모든 곡을 미평가로 옮겼습니다.');});
  function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  $('export').addEventListener('click',()=>{download(new Blob([JSON.stringify(snapshot(month,activeRows()),null,2)],{type:'application/json'}),`kpop-${month.month}-${mode}.json`);tell('티어 파일을 저장했습니다.');});
  $('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>100000)throw new Error('100KB 이하의 티어 파일을 선택해 주세요.');const value=JSON.parse(await file.text()),matched=catalog.find(m=>m.month===value.month);if(!matched)throw new Error('해당 월의 곡 목록이 없습니다.');const rows=validateState(value,matched);if(mode==='mine' && month.month===matched.month){commit(rows,'티어 파일을 불러왔습니다.');}else{month=matched;mode='mine';load();commit(rows,'티어 파일을 불러왔습니다.');}clearHash();}catch(error){tell(error.message||'파일을 읽지 못했습니다.');}finally{event.target.value='';}});
  $('share').addEventListener('click',async()=>{
    const url=new URL(location.href);url.hash='tier='+encodeState(snapshot(month,activeRows()));
    try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(url.href);tell('현재 티어의 공유 링크를 복사했습니다.');return;}}catch{}
    $('share-url').value=url.href;$('share-dialog').showModal();$('share-url').focus();$('share-url').select();
  });
  $('image').addEventListener('click',async()=>{
    const rows=activeRows(),width=1080,cell=140,cols=6;
    let y=190;
    const heading=`${month.month} K-POP · ${mode==='author'?'블로그 티어':mode==='shared'?'공유 티어':'내 티어'}`;
    let body=`<rect width="1080" height="100%" fill="#fafafa"/><text x="40" y="65" font-size="30" fill="#252525">${xml(heading)}</text><text x="40" y="105" font-size="17" fill="#666">${month.demo?'화면 확인용 가상 곡 · 가상 평가':'The Greenhouse · 개인의 취향을 담은 티어리스트'}</text>`;
    for(const [i,tier]of TIERS.entries()){
      const height=Math.max(110,Math.ceil(rows[tier].length/cols)*115+20);
      body+=`<rect x="40" y="${y}" width="1000" height="${height}" fill="none" stroke="#ddd"/><rect x="40" y="${y}" width="80" height="${height}" fill="${colors[i]}"/><text x="80" y="${y+height/2+7}" text-anchor="middle" font-size="${tier==='unranked'?18:28}" fill="#252525">${labels[tier]}</text>`;
      rows[tier].forEach((id,j)=>{const t=month.tracks.find(t=>t.id===id),x=140+(j%cols)*cell,top=y+20+Math.floor(j/cols)*115;body+=`<rect x="${x}" y="${top}" width="125" height="55" rx="2" fill="${/^#[0-9a-f]{6}$/i.test(t.color)?t.color:'#687b6c'}"/><text x="${x+10}" y="${top+36}" font-size="25" fill="white">${xml(t.title.slice(0,2))}</text><text x="${x}" y="${top+78}" font-size="15" fill="#252525">${xml(t.title.slice(0,14))}</text><text x="${x}" y="${top+98}" font-size="12" fill="#666">${xml(t.artist.slice(0,20))}</text>`;});y+=height+12;
    }
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y+55}" viewBox="0 0 ${width} ${y+55}"><style>text{font-family:system-ui,sans-serif}</style>${body}<text x="40" y="${y+28}" font-size="13" fill="#666">The Greenhouse / 월별 케이팝 티어</text></svg>`;
    try{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=y+55;const context=canvas.getContext('2d');if(!context)throw new Error();context.drawImage(img,0,0);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error();download(png,`kpop-${month.month}-${mode}.png`);tell('티어 이미지를 PNG로 저장했습니다.');}catch{download(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),`kpop-${month.month}-${mode}.svg`);tell('티어 이미지를 SVG로 저장했습니다.');}
  });
  load();readHash();render();
  window.addEventListener('hashchange',()=>{if(!root.isConnected)return;if(readHash())render();else if(mode==='shared' && !location.hash.startsWith('#tier=')){mode='author';tell('');load();render();}});
}
