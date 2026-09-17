import { createRich, slugify } from './rich.bundle.js';
const $ = (sel) => document.querySelector(sel);
const els = {
  collection: $('#fm-collection'),
  slug: $('#fm-slug'),
  date: $('#fm-date'),
  title: $('#fm-title'),
  summary: $('#fm-summary'),
  tags: $('#fm-tags'),
  demo: $('#fm-demo'),
  draft: $('#fm-draft'),
  editor: $('#editor'),
  editorPane: $('#editor-pane'),
  preview: $('#preview'),
  previewPane: $('#preview-pane'),
  toc: $('#toc'),
  postList: $('#post-list'),
  statusMsg: $('#status-msg'),
  readingTime: $('#reading-time'),
  wordCount: $('#word-count'),
  fileInput: $('#file-input'),
  insertDemo: $('#insert-demo'),
  extBadge: $('#ext-badge'),
  slugWarn: $('#slug-warn'),
  tagSuggestions: $('#tag-suggestions'),
  gitBranch: $('#git-branch'),
  gitChanges: $('#git-changes'),
  divider: $('#divider'),
  split: $('#split'),
  findOverlay: $('#find-overlay'),
  findInput: $('#find-input'),
  replaceInput: $('#replace-input'),
  findCount: $('#find-count'),
  ghost: $('#ghost'),
  aiStatus: $('#ai-status'),
  aiToggle: $('#ai-toggle'),
};

let rich;
let richMode = true;
let richUpdating = false;
const newDocumentId=()=> 'post_'+Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
let currentDocument = {id:newDocumentId(),revision:null};
let mutationBusy = false;
let cleanFingerprint = '';
let currentSlug = null;
let currentExt = '.md';
let renderTimer = null;
let autoSaveTimer = null;
let listCache = {};
let findMatches = [];
let findIdx = 0;

const AUTOSAVE_KEY = 'bunnykey.editor.autosave.v2';
const draftKey = id => AUTOSAVE_KEY+':'+id;
const THEME_KEY = 'bunnykey.editor.theme';
const SPLIT_KEY = 'bunnykey.editor.split';
const AI_KEY = 'bunnykey.editor.ai';
const AI_DEBOUNCE_MS = 700;

// --- Status ---
function setStatus(msg, type = '') {
  els.statusMsg.textContent = msg;
  els.statusMsg.className = type;
}

// --- API ---
async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) {
    if (data.document?.id === currentDocument.id) currentDocument = data.document;
    const error = new Error(data.error || res.statusText); error.status = res.status; throw error;
  }
  return data;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// --- Sidebar ---
async function loadList() {
  listCache = await api('/api/list');
  els.postList.innerHTML = '';
  for (const [c, posts] of Object.entries(listCache)) {
    const group = document.createElement('div');
    group.className = 'collection-group';
    group.textContent = ({seeds:'짧은 기록',flora:'긴 글',nursery:'프로젝트'})[c] || c;
    els.postList.appendChild(group);
    for (const p of posts) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'post-item';
      item.dataset.collection = c;
      item.dataset.slug = p.slug;
      const draftBadge = p.draft ? '<span class="draft-badge">draft</span>' : '';
      const dateStr = p.date ? new Date(p.date).toISOString().slice(0, 10) : '';
      item.innerHTML = `
        <div>${draftBadge}${escapeHtml(p.title)}</div>
        <div class="meta">${dateStr} · ${p.ext}</div>
      `;
      item.addEventListener('click', () => loadPost(c, p.slug));
      els.postList.appendChild(item);
    }
  }
  highlightActive();
}

function highlightActive() {
  document.querySelectorAll('.post-item').forEach(el => {
    el.classList.toggle(
      'active',
      el.dataset.slug === currentSlug && el.dataset.collection === els.collection.value
    );
  });
}

// --- Git status ---
async function refreshGitStatus() {
  try {
    const st = await api('/api/git-status');
    els.gitBranch.textContent = st.branch || '';
    const dirty = (st.files || []).length;
    const ahead = st.ahead || 0;
    const parts = [];
    if (dirty) parts.push(`${dirty} 변경`);
    if (ahead) parts.push(`↑${ahead}`);
    els.gitChanges.textContent = parts.join(' · ') || '깨끗';
    els.gitChanges.className = dirty ? 'dirty' : (ahead ? 'ahead' : '');
  } catch {}
}

// --- Word count / reading time ---
function updateWordCount() {
  const text = els.editor.value;
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  els.wordCount.textContent = `${words}단어 · ${chars}자`;
  els.readingTime.textContent = `읽기 ${minutes}분`;
}

// --- Ext badge ---
function updateExtBadge() {
  const hasInlineDemo = /<(TokenFlowDemo|ApiFlowDemo)\b/.test(els.editor.value);
  if (hasInlineDemo) currentExt = '.mdx';
  els.extBadge.textContent = currentExt;
  els.extBadge.className = currentExt === '.mdx' ? 'mdx' : '';
}

// --- Load existing post ---
async function loadPost(collection, slug) {
  if (mutationBusy) return;
  saveAutosave();setBusy(true);
  try {
    const data = await api(`/api/get?collection=${collection}&slug=${slug}`);
    const { frontmatter, body, ext } = data;
    currentDocument = data.document;
    setMetadataFields(frontmatter);
    lockRoute();
    els.collection.value = collection;
    els.slug.value = slug;
    els.title.value = frontmatter.title || '';
    els.summary.value = frontmatter.summary || '';
    els.date.value = frontmatter.date ? new Date(frontmatter.date).toISOString().slice(0, 10) : '';
    els.tags.value = (frontmatter.tags || []).join(', ');
    els.draft.checked = !!frontmatter.draft;
    els.demo.value = frontmatter.demo || '';
    els.editor.value = body;
    currentSlug = slug;
    currentExt = ext || '.md';
    setEditorMode(currentExt !== '.mdx' && !/<[A-Za-z!]/.test(body));
    updateExtBadge();
    updateWordCount();
    highlightActive();
    cleanFingerprint=fingerprint();
    const backup=localStorage.getItem(draftKey(currentDocument.id));
    if(backup && confirm('이 기기의 미저장 수정본을 복원할까요?')) restoreSnapshot(JSON.parse(backup));
    render();
    $('#compare-conflict').hidden=!data.sourceChanged;
    setStatus(data.sourceChanged ? '원본이 변경됐습니다. 최신본 비교 후 병합해주세요.' : `불러옴: ${collection}/${slug} (${currentExt})`);
    checkSlug();
    // Mobile: collapse sidebar and scroll editor into view
    if (window.matchMedia('(max-width: 768px)').matches) {
      sidebar.classList.add('collapsed');
      requestAnimationFrame(() => {
        document.getElementById('topbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  } catch (e) {
    setStatus(`로드 실패: ${e.message}`, 'error');
  } finally {setBusy(false);lockRoute();}
}

// --- New post ---
$('#new-post').addEventListener('click', () => {
  if (mutationBusy) return;
  saveAutosave();
  currentDocument={id:newDocumentId(),revision:null};
  setMetadataFields({});lockRoute();
  els.slug.value = '';
  els.title.value = '';
  els.summary.value = '';
  els.tags.value = '';
  els.draft.checked = true;
  els.demo.value = '';
  els.date.value = new Date().toISOString().slice(0, 10);
  els.editor.value = '';
  currentSlug = null;
  currentExt = '.md';
  cleanFingerprint=fingerprint();
  $('#compare-conflict').hidden=true;
  setEditorMode(true);
  updateExtBadge();
  updateWordCount();
  highlightActive();
  render();
  els.title.focus();
  setStatus('새 글 작성 중');
});

// --- Render preview ---
let renderSequence = 0;
async function render() {
  const sequence = ++renderSequence;
  $('#preview-title').textContent=els.title.value || '제목 없음';
  $('#preview-date').textContent=els.date.value;
  $('#preview-summary').textContent=els.summary.value;
  $('#preview-summary').hidden=!els.summary.value;
  if (rich && !richUpdating && richMode && rich.getMarkdown() !== els.editor.value) rich.commands.setContent(els.editor.value, {contentType:'markdown',emitUpdate:false});
  try {
    const { html } = await api('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: els.editor.value }),
    });
    if(sequence !== renderSequence) return;
    els.preview.innerHTML = html;
    renderToc();
  } catch (e) {
    setStatus(`렌더 실패: ${e.message}`, 'error');
  }
}

function renderToc() {
  const headings = els.preview.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    els.toc.classList.add('empty');
    els.toc.innerHTML = '';
    return;
  }
  els.toc.classList.remove('empty');
  const items = [...headings].map(h => {
    const id = slugify(h.textContent);
    h.id = id;
    return `<li class="${h.tagName.toLowerCase()}"><a href="#${id}" data-heading>${escapeHtml(h.textContent)}</a></li>`;
  });
  els.toc.innerHTML = `<h4>목차</h4><ul>${items.join('')}</ul>`;
  // Smooth scroll in preview pane
  els.toc.querySelectorAll('a[data-heading]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = els.preview.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// --- Auto-save (localStorage) ---
function snapshot() {
  return {
    document: currentDocument,
    metadata: extraMetadata(),
    collection: els.collection.value,
    slug: els.slug.value,
    title: els.title.value,
    summary: els.summary.value,
    date: els.date.value,
    tags: els.tags.value,
    draft: els.draft.checked,
    demo: els.demo.value,
    body: els.editor.value,
    ext: currentExt,
    at: Date.now(),
  };
}
function refreshLocalDrafts() {
  const select=$('#local-drafts');select.replaceChildren(new Option('복원할 글 선택',''));
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key.startsWith(AUTOSAVE_KEY+':'))continue;try{const d=JSON.parse(localStorage.getItem(key));select.add(new Option(d.title || '제목 없는 글',key));}catch{}}
}
function fingerprint() {const {document,at,...fields}=snapshot();return JSON.stringify(fields);}
function saveAutosave() {
  if (fingerprint() === cleanFingerprint) return;
  if (!els.editor.value && !els.title.value) return;
  try { localStorage.setItem(draftKey(currentDocument.id),JSON.stringify(snapshot()));localStorage.setItem(AUTOSAVE_KEY,currentDocument.id);refreshLocalDrafts(); } catch {setStatus('기기 백업 공간이 부족합니다. 서버에 저장해주세요.','error');}
}
function clearAutosave() {
  cleanFingerprint=fingerprint();
  clearTimeout(autoSaveTimer);
  try {localStorage.removeItem(draftKey(currentDocument.id));if(localStorage.getItem(AUTOSAVE_KEY)===currentDocument.id)localStorage.removeItem(AUTOSAVE_KEY);refreshLocalDrafts();}catch{}
}
function restoreSnapshot(s) {
  currentDocument=s.document || {id:newDocumentId(),revision:null};
  els.collection.value=s.collection || 'seeds';els.slug.value=s.slug || '';els.title.value=s.title || '';
  els.summary.value=s.summary || '';els.date.value=s.date || new Date().toISOString().slice(0,10);
  els.tags.value=s.tags || '';els.draft.checked=true;els.demo.value=s.demo || '';els.editor.value=s.body || '';
  currentSlug=currentDocument.revision ? s.slug : null;currentExt=s.ext || '.md';setMetadataFields(s.metadata || {});lockRoute();
  setEditorMode(currentExt!=='.mdx' && !/<[A-Za-z!]/.test(els.editor.value));render();setStatus('기기 백업 복원됨 · 저장 시 서버 최신 버전을 확인합니다.');
}
function restoreAutosave() {
  try {
    const id=localStorage.getItem(AUTOSAVE_KEY);
    const raw=id ? localStorage.getItem(draftKey(id)) : localStorage.getItem('bunnykey.editor.autosave.v1');
    if(!raw)return false;
    if(!confirm('이 기기에 보관한 미저장 글을 복원할까요?'))return false;
    restoreSnapshot(JSON.parse(raw));return true;
  }catch{return false;}
}
$('#local-drafts').addEventListener('change',e=>{if(!e.target.value)return;const raw=localStorage.getItem(e.target.value);saveAutosave();if(raw)restoreSnapshot(JSON.parse(raw));});
window.addEventListener('pagehide',saveAutosave);
function extraMetadata() {
  const name=$('#fm-series-name').value.trim();
  return {category:$('#fm-category').value,stage:$('#fm-stage').value || null,series:name?{name,title:$('#fm-series-title').value,order:Number($('#fm-series-order').value)}:null};
}
function setMetadataFields(fm) {
  $('#fm-category').value=fm.category || 'notes';$('#fm-stage').value=fm.stage || '';
  $('#fm-series-name').value=fm.series?.name || '';$('#fm-series-title').value=fm.series?.title || '';$('#fm-series-order').value=fm.series?.order || '';
}
function lockRoute() { els.slug.readOnly=!!currentDocument.revision;els.collection.disabled=!!currentDocument.revision; }
function documentEnvelope() {return currentDocument.revision ? currentDocument : {...currentDocument,collection:els.collection.value,slug:els.slug.value};}
function setBusy(on) {mutationBusy=on;$('#main').inert=on;$('#sidebar').inert=on;rich?.setEditable(!on,false);}
function mutationError(e,label) {if(e.status===409)$('#compare-conflict').hidden=false;saveAutosave();setStatus(`${label}: ${e.message}${e.status===409?' · 입력은 기기 백업에 보관했습니다.':''}`,'error');}

let conflictView;
$('#compare-conflict').addEventListener('click',async()=>{
  try {
    const query=`?collection=${encodeURIComponent(els.collection.value)}&slug=${encodeURIComponent(els.slug.value)}`;
    const latest=await api('/api/get'+query), source=await api('/api/source'+query);
    conflictView={latest,source};
    $('#conflict-latest').value=JSON.stringify(latest.frontmatter,null,2)+'\n\n'+latest.body+(latest.sourceChanged?'\n\n--- 변경된 원본 ---\n'+JSON.stringify(source?.frontmatter,null,2)+'\n'+(source?.body || '(원본 삭제됨)'):'');
    $('#conflict-local').value=JSON.stringify({...extraMetadata(),title:els.title.value,summary:els.summary.value,date:els.date.value,tags:els.tags.value,demo:els.demo.value},null,2)+'\n\n'+els.editor.value;
    $('#conflict-dialog').showModal();
  }catch(e){mutationError(e,'비교 실패');}
});
$('#conflict-close').addEventListener('click',()=>$('#conflict-dialog').close());
$('#conflict-merge').addEventListener('click',async()=>{
  if(!conflictView || mutationBusy)return;
  // A colliding new URL is never allowed to adopt another document's identity.
  if(conflictView.latest.id!==currentDocument.id){setStatus('다른 문서가 사용 중인 주소입니다. 새 주소를 선택하세요.','error');$('#conflict-dialog').close();return;}
  const latest=conflictView.latest, source=conflictView.source;
  $('#conflict-dialog').close();setBusy(true);
  try {
    const result=await api('/api/reconcile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({collection:els.collection.value,slug:els.slug.value,document:latest.document,acknowledgedSourceRevision:source?.revision || null,frontmatter:{...extraMetadata(),title:els.title.value,summary:els.summary.value,date:els.date.value,tags:els.tags.value.split(',').map(t=>t.trim()).filter(Boolean),demo:els.demo.value || null},body:els.editor.value,ext:currentExt})});
    currentDocument=result.document;currentSlug=els.slug.value;lockRoute();clearAutosave();$('#compare-conflict').hidden=true;setStatus('병합한 초안을 저장했습니다. 공개 사이트는 변경되지 않았습니다.','success');await loadList();
  }catch(e){mutationError(e,'병합 실패');}finally{setBusy(false);lockRoute();}
});

// --- Editor input ---
els.editor.addEventListener('input', () => {
  updateExtBadge();
  updateWordCount();
  clearGhost();
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 250);
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveAutosave, 1500);
  if (aiEnabled) scheduleCompletion();
});

// --- Title → slug auto-fill ---
els.title.addEventListener('input', () => {
  if (currentSlug) return;
  els.slug.value = slugify(els.title.value).slice(0, 60);
  checkSlug();
});
els.slug.addEventListener('input', checkSlug);
els.collection.addEventListener('change', checkSlug);

// --- Slug uniqueness ---
async function checkSlug() {
  const slug = els.slug.value;
  if (!slug) { els.slugWarn.textContent = ''; return; }
  if (currentSlug === slug) { els.slugWarn.textContent = ''; return; }
  try {
    const { exists } = await api(`/api/check-slug?collection=${els.collection.value}&slug=${slug}`);
    els.slugWarn.textContent = exists ? '⚠ 이미 사용 중인 주소 — 기존 글을 열거나 새 주소를 입력하세요' : '';
  } catch {}
}

// --- Insert demo with auto-import ---
const DEMO_IMPORT_PATH = '../../components/demos';

function ensureImport(componentName) {
  const importLine = `import ${componentName} from '${DEMO_IMPORT_PATH}/${componentName}';`;
  if (els.editor.value.includes(importLine)) return;
  const lines = els.editor.value.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, importLine);
  } else {
    lines.unshift(importLine, '');
  }
  els.editor.value = lines.join('\n');
}

els.insertDemo.addEventListener('change', (e) => {
  const name = e.target.value;
  if (!name) return;
  ensureImport(name);
  insertAtCursor(`\n\n<${name} client:visible />\n\n`);
  e.target.value = '';
  updateExtBadge();
});

// --- Save ---
async function save() {
  if(mutationBusy)return;setBusy(true);
  try {
    const tags = els.tags.value.split(',').map(s => s.trim()).filter(Boolean);
    const fm = {
      title: els.title.value,
      date: els.date.value,
    };
    if (els.summary.value) fm.summary = els.summary.value;
    if (tags.length) fm.tags = tags;
    if (els.draft.checked) fm.draft = true;
    if (els.demo.value) fm.demo = els.demo.value;

    const result = await api('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: els.collection.value,
        slug: els.slug.value,
        document: documentEnvelope(),
        frontmatter: {...fm,...extraMetadata(),summary:els.summary.value,tags,demo:els.demo.value || null},
        body: els.editor.value,
        ext: currentExt,
      }),
    });
    currentDocument=result.document;lockRoute();$('#compare-conflict').hidden=true;
    setStatus('초안 저장됨 · 공개 사이트는 변경되지 않았습니다.', 'success');
    currentSlug = els.slug.value;
    currentExt = result.ext;
    updateExtBadge();
    clearAutosave();
    await loadList();
    refreshGitStatus();
  } catch (e) {
    mutationError(e,'저장 실패');
  } finally {setBusy(false);lockRoute();}
}

$('#save').addEventListener('click', save);

// --- Publish ---
$('#publish').addEventListener('click', async () => {
  if(mutationBusy)return;
  if (!els.title.value || !els.slug.value) {
    setStatus('제목과 슬러그가 필요', 'error');
    return;
  }
  if (!confirm(`"${els.title.value}" 글을 공개 발행할까요?`)) return;
  setBusy(true);
  try {
    setStatus('발행 중...');
    const tags = els.tags.value.split(',').map(s => s.trim()).filter(Boolean);
    const fm = { title: els.title.value, date: els.date.value };
    if (els.summary.value) fm.summary = els.summary.value;
    if (tags.length) fm.tags = tags;
    if (els.demo.value) fm.demo = els.demo.value;
    const result = await api('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: els.collection.value,
        slug: els.slug.value,
        document: documentEnvelope(),
        frontmatter: {...fm,...extraMetadata(),summary:els.summary.value,tags,demo:els.demo.value || null},
        body: els.editor.value,
        ext: currentExt,
      }),
    });
    currentDocument=result.document;lockRoute();$('#compare-conflict').hidden=true;
    els.draft.checked = false;
    currentSlug = els.slug.value;
    currentExt = result.ext;
    setStatus('GitHub 전송 완료 · 사이트 배포 진행 상황을 확인하세요.', 'success');
    const link = document.createElement('a'); link.href=result.deploymentUrl; link.target='_blank'; link.rel='noopener'; link.textContent=' 배포 상태 ↗'; els.statusMsg.append(link);
    clearAutosave();
    await loadList();
    refreshGitStatus();
  } catch (e) {
    mutationError(e,'발행 실패');
    alert(`발행 실패: ${e.message}`);
  } finally { setBusy(false);lockRoute(); }
});

// --- Delete ---
$('#delete-post').addEventListener('click', async () => {
  if(mutationBusy)return;
  if (!currentSlug) { setStatus('현재 글이 없음', 'error'); return; }
  if (!confirm(`"${els.title.value || currentSlug}" 의 서버 작업 초안을 버릴까요? 게시된 글은 유지됩니다.`)) return;
  setBusy(true);
  try {
    await api('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: els.collection.value, slug: currentSlug, document:documentEnvelope() }),
    });
    clearAutosave();els.editor.value='';els.title.value='';
    setStatus('작업 초안을 버렸습니다.', 'success');
    setBusy(false);$('#new-post').click();
    await loadList();
    refreshGitStatus();
  } catch (e) {
    mutationError(e,'초안 삭제 실패');
  } finally {setBusy(false);lockRoute();}
});

// --- Keyboard shortcuts ---
function wrapSelection(before, after = before) {
  const ed = els.editor;
  const start = ed.selectionStart;
  const end = ed.selectionEnd;
  const sel = ed.value.slice(start, end);
  ed.value = ed.value.slice(0, start) + before + sel + after + ed.value.slice(end);
  ed.selectionStart = start + before.length;
  ed.selectionEnd = end + before.length;
  ed.focus();
  ed.dispatchEvent(new Event('input'));
}

function insertAtCursor(text, selectOffset = null) {
  if (richMode && rich) { rich.chain().focus().insertContent(text, {contentType:'markdown'}).run(); return; }
  const ed = els.editor;
  const start = ed.selectionStart;
  const end = ed.selectionEnd;
  ed.value = ed.value.slice(0, start) + text + ed.value.slice(end);
  if (selectOffset !== null) {
    ed.selectionStart = ed.selectionEnd = start + selectOffset;
  } else {
    ed.selectionStart = ed.selectionEnd = start + text.length;
  }
  ed.focus();
  ed.dispatchEvent(new Event('input'));
}

window.addEventListener('keydown', (e) => {
  const cmd = e.metaKey || e.ctrlKey;
  if (!cmd) return;
  const inEditor = document.activeElement === els.editor;
  if (e.key === 's' && !e.shiftKey) { e.preventDefault(); save(); return; }
  if (e.key === 'f' && inEditor) { e.preventDefault(); openFind(); return; }
  if (!inEditor) return;
  if (e.key === 'b') { e.preventDefault(); wrapSelection('**'); }
  else if (e.key === 'i') { e.preventDefault(); wrapSelection('*'); }
  else if (e.key === 'k') {
    e.preventDefault();
    const sel = els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd);
    if (sel) wrapSelection('[', '](url)');
    else insertAtCursor('[]()', 1);
  }
  else if (e.key === 'c' && e.shiftKey) { e.preventDefault(); insertAtCursor('\n```\n\n```\n', 5); }
});

// --- List continuation ---
els.editor.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.shiftKey) return;
  const ed = els.editor;
  const pos = ed.selectionStart;
  const before = ed.value.slice(0, pos);
  const lineStart = before.lastIndexOf('\n') + 1;
  const line = before.slice(lineStart);
  const m = line.match(/^(\s*)([-*]\s|\d+\.\s|>\s)/);
  if (!m) return;
  const [, indent, marker] = m;
  // Empty bullet: Enter should remove the marker
  if (line.trim() === marker.trim()) {
    e.preventDefault();
    ed.value = ed.value.slice(0, lineStart) + ed.value.slice(pos);
    ed.selectionStart = ed.selectionEnd = lineStart;
    ed.dispatchEvent(new Event('input'));
    return;
  }
  e.preventDefault();
  let next = marker;
  const numMatch = marker.match(/^(\d+)\.\s$/);
  if (numMatch) next = `${parseInt(numMatch[1]) + 1}. `;
  const insert = `\n${indent}${next}`;
  ed.value = ed.value.slice(0, pos) + insert + ed.value.slice(pos);
  ed.selectionStart = ed.selectionEnd = pos + insert.length;
  ed.dispatchEvent(new Event('input'));
});

// --- Toolbar ---
document.querySelectorAll('#toolbar button[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const a = btn.dataset.action;
    if (richMode && rich && !['image','link'].includes(a)) {
      const chain = rich.chain().focus();
      if (a === 'bold') chain.toggleBold().run();
      else if (a === 'italic') chain.toggleItalic().run();
      else if (a === 'h2') chain.toggleHeading({level:2}).run();
      else if (a === 'h3') chain.toggleHeading({level:3}).run();
      else if (a === 'code') chain.toggleCodeBlock().run();
      else if (a === 'table') chain.insertTable({rows:3,cols:2,withHeaderRow:true}).run();
      return;
    }
    if (richMode && rich && a === 'link') { const url = prompt('링크 주소 (https://...)'); if (url && /^https?:\/\//.test(url)) rich.chain().focus().setLink({href:url}).run(); return; }
    if (a === 'bold') wrapSelection('**');
    else if (a === 'italic') wrapSelection('*');
    else if (a === 'link') {
      const sel = els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd);
      if (sel) wrapSelection('[', '](url)'); else insertAtCursor('[]()', 1);
    }
    else if (a === 'code') insertAtCursor('\n```\n\n```\n', 5);
    else if (a === 'image') els.fileInput.click();
    else if (a === 'table') insertAtCursor('\n| 컬럼1 | 컬럼2 |\n|---|---|\n| a | b |\n');
    else if (a === 'h2') insertAtCursor('\n## ');
    else if (a === 'h3') insertAtCursor('\n### ');
  });
});

// --- Image upload (file input, paste, drop) ---
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { url, name } = await api('/api/upload', { method: 'POST', body: fd });
  if (richMode && rich) rich.chain().focus().setImage({src:url,alt:name || 'image'}).run();
  else insertAtCursor(`![${(name || 'image').replace(/[\[\]\r\n]/g, '')}](${url})`);
  setStatus(`이미지 업로드: ${url}`, 'success');
  refreshGitStatus();
}

els.fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try { await uploadImage(file); } catch (err) { setStatus(`업로드 실패: ${err.message}`, 'error'); }
  finally { e.target.value = ''; }
});

els.editor.addEventListener('paste', async (e) => {
  const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
  if (!item) return;
  e.preventDefault();
  const blob = item.getAsFile();
  if (!blob) return;
  try { await uploadImage(blob); } catch (err) { setStatus(`붙여넣기 실패: ${err.message}`, 'error'); }
});

els.editorPane.addEventListener('dragover', (e) => { e.preventDefault(); els.editorPane.classList.add('drop-target'); });
els.editorPane.addEventListener('dragleave', () => els.editorPane.classList.remove('drop-target'));
els.editorPane.addEventListener('drop', async (e) => {
  e.preventDefault();
  els.editorPane.classList.remove('drop-target');
  const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/'));
  for (const f of files) {
    try { await uploadImage(f); } catch (err) { setStatus(`드롭 실패: ${err.message}`, 'error'); }
  }
});

// --- Divider resize ---
let dragging = false;
els.divider.addEventListener('mousedown', () => {
  dragging = true;
  els.divider.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const rect = els.split.getBoundingClientRect();
  const ratio = Math.min(0.85, Math.max(0.15, (e.clientX - rect.left) / rect.width));
  const left = `${ratio * 100}%`;
  const right = `${(1 - ratio) * 100}%`;
  els.split.style.gridTemplateColumns = `${left} 6px ${right}`;
  localStorage.setItem(SPLIT_KEY, String(ratio));
});
window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  els.divider.classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// --- Theme toggle ---
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme=t;
  const theme=$('#studio-theme');
  theme.classList.toggle('dark',t==='dark');theme.classList.toggle('light',t!=='dark');
  localStorage.setItem(THEME_KEY, t);
}
$('#theme-toggle').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

// --- Sidebar collapse (mobile) ---
const sidebar = $('#sidebar');
$('#sidebar-toggle').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// --- Scroll sync ---
let syncing = false;
function syncScroll(from, to) {
  if (syncing) return;
  syncing = true;
  const ratio = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
  to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
  requestAnimationFrame(() => { syncing = false; });
}
els.editor.addEventListener('scroll', () => {
  els.ghost.scrollTop = els.editor.scrollTop;
  syncScroll(els.editor, els.previewPane);
});
els.previewPane.addEventListener('scroll', () => syncScroll(els.previewPane, els.editor));

// --- AI Autocomplete (Ollama via /api/complete) ---
let aiEnabled = false;
let aiTimer = null;
let aiAbort = null;
let currentSuggestion = '';
let suggestionAtPos = -1;

function setAiStatus(text) {
  if (!text) { els.aiStatus.hidden = true; els.aiStatus.textContent = ''; }
  else { els.aiStatus.hidden = false; els.aiStatus.textContent = text; }
}

function clearGhost() {
  currentSuggestion = '';
  suggestionAtPos = -1;
  els.ghost.innerHTML = '';
  els.editor.classList.remove('has-ghost');
}

function renderGhost() {
  if (!currentSuggestion || suggestionAtPos < 0) { clearGhost(); return; }
  const text = els.editor.value;
  const before = text.slice(0, suggestionAtPos);
  const after = text.slice(suggestionAtPos);
  els.ghost.innerHTML =
    escapeHtml(before) +
    `<span class="suggestion">${escapeHtml(currentSuggestion)}</span>` +
    escapeHtml(after);
  els.ghost.scrollTop = els.editor.scrollTop;
  els.editor.classList.add('has-ghost');
}

// Strip the longest overlap where prefix ends with start of suggestion
function stripPrefixOverlap(prefix, suggestion) {
  if (!suggestion) return suggestion;
  const max = Math.min(prefix.length, suggestion.length, 60);
  for (let k = max; k > 1; k--) {
    if (prefix.endsWith(suggestion.slice(0, k))) {
      return suggestion.slice(k);
    }
  }
  return suggestion;
}

function shouldSuggest() {
  if (!aiEnabled) return false;
  const pos = els.editor.selectionStart;
  if (pos !== els.editor.selectionEnd) return false; // selection active
  const text = els.editor.value;
  // Don't suggest mid-word
  const ch = text[pos];
  if (ch && /\S/.test(ch) && !/[\s.,!?;:)\]>]/.test(ch)) return false;
  // Need some context before cursor
  if (pos < 8) return false;
  return true;
}

function scheduleCompletion() {
  clearTimeout(aiTimer);
  if (aiAbort) { try { aiAbort.abort(); } catch {} }
  aiAbort = null;
  setAiStatus('');
  aiTimer = setTimeout(runCompletion, AI_DEBOUNCE_MS);
}

async function runCompletion() {
  if (!shouldSuggest()) return;
  const pos = els.editor.selectionStart;
  const text = els.editor.value;
  const prefix = text.slice(0, pos);
  const suffix = text.slice(pos);
  aiAbort = new AbortController();
  setAiStatus('AI ●●●');
  try {
    const res = await fetch('/api/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, suffix }),
      signal: aiAbort.signal,
    });
    if (!res.ok || !res.body) { setAiStatus(''); return; }
    suggestionAtPos = pos;
    currentSuggestion = '';
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      // If user moved or typed, abort
      if (els.editor.selectionStart !== suggestionAtPos || els.editor.value !== text) {
        try { aiAbort.abort(); } catch {}
        clearGhost();
        setAiStatus('');
        return;
      }
      currentSuggestion += chunk;
      // Trim on newline-newline (paragraph end)
      const dn = currentSuggestion.indexOf('\n\n');
      if (dn !== -1) {
        currentSuggestion = currentSuggestion.slice(0, dn);
        renderGhost();
        try { aiAbort.abort(); } catch {}
        break;
      }
      renderGhost();
    }
    // Final trim: strip leading whitespace; strip overlap with prefix tail
    currentSuggestion = currentSuggestion.replace(/^[ \t]+/, '').trimEnd();
    currentSuggestion = stripPrefixOverlap(prefix, currentSuggestion);
    renderGhost();
    setAiStatus(currentSuggestion ? 'Tab 수락' : '');
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('AI error', e);
    setAiStatus('');
  }
}

function acceptSuggestion() {
  if (!currentSuggestion || suggestionAtPos < 0) return false;
  const text = els.editor.value;
  els.editor.value = text.slice(0, suggestionAtPos) + currentSuggestion + text.slice(suggestionAtPos);
  const newPos = suggestionAtPos + currentSuggestion.length;
  clearGhost();
  setAiStatus('');
  els.editor.focus();
  els.editor.selectionStart = els.editor.selectionEnd = newPos;
  els.editor.dispatchEvent(new Event('input'));
  return true;
}

els.editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && currentSuggestion) {
    e.preventDefault();
    acceptSuggestion();
    return;
  }
  if (e.key === 'Escape' && currentSuggestion) {
    e.preventDefault();
    clearGhost();
    setAiStatus('');
    return;
  }
  // Any other key: clear current suggestion (input handler will reschedule)
  if (currentSuggestion && e.key.length === 1) {
    clearGhost();
  }
});

// Caret/scroll movements should clear ghost
els.editor.addEventListener('click', clearGhost);
els.editor.addEventListener('selectionchange', () => {
  if (suggestionAtPos >= 0 && els.editor.selectionStart !== suggestionAtPos) clearGhost();
});

els.aiToggle.addEventListener('change', () => {
  aiEnabled = els.aiToggle.checked;
  localStorage.setItem(AI_KEY, aiEnabled ? '1' : '0');
  if (!aiEnabled) {
    if (aiAbort) try { aiAbort.abort(); } catch {}
    clearGhost();
    setAiStatus('');
  }
});

// --- Find & Replace ---
function openFind() {
  els.findOverlay.hidden = false;
  els.findInput.focus();
  els.findInput.select();
}
function closeFind() { els.findOverlay.hidden = true; els.editor.focus(); }
$('#find-close').addEventListener('click', closeFind);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.findOverlay.hidden) { closeFind(); }
});

function computeFindMatches() {
  const q = els.findInput.value;
  if (!q) { findMatches = []; findIdx = 0; els.findCount.textContent = '0/0'; return; }
  findMatches = [];
  const val = els.editor.value;
  let i = 0;
  while (i < val.length) {
    const idx = val.indexOf(q, i);
    if (idx === -1) break;
    findMatches.push([idx, idx + q.length]);
    i = idx + q.length;
  }
  findIdx = findMatches.length > 0 ? 0 : -1;
  els.findCount.textContent = findMatches.length ? `${findIdx + 1}/${findMatches.length}` : '0/0';
  if (findMatches.length) jumpTo(findMatches[findIdx]);
}
function jumpTo([start, end]) {
  els.editor.focus();
  els.editor.setSelectionRange(start, end);
  // Try to scroll match into view
  const text = els.editor.value.slice(0, start);
  const line = text.split('\n').length - 1;
  const lineHeight = 13 * 1.7;
  els.editor.scrollTop = Math.max(0, line * lineHeight - els.editor.clientHeight / 2);
}
els.findInput.addEventListener('input', computeFindMatches);
$('#find-next').addEventListener('click', () => {
  if (!findMatches.length) return;
  findIdx = (findIdx + 1) % findMatches.length;
  els.findCount.textContent = `${findIdx + 1}/${findMatches.length}`;
  jumpTo(findMatches[findIdx]);
});
$('#find-prev').addEventListener('click', () => {
  if (!findMatches.length) return;
  findIdx = (findIdx - 1 + findMatches.length) % findMatches.length;
  els.findCount.textContent = `${findIdx + 1}/${findMatches.length}`;
  jumpTo(findMatches[findIdx]);
});
$('#replace-one').addEventListener('click', () => {
  if (!findMatches.length || findIdx < 0) return;
  const [s, e] = findMatches[findIdx];
  els.editor.value = els.editor.value.slice(0, s) + els.replaceInput.value + els.editor.value.slice(e);
  els.editor.dispatchEvent(new Event('input'));
  computeFindMatches();
});
$('#replace-all').addEventListener('click', () => {
  if (!findMatches.length) return;
  const q = els.findInput.value;
  const r = els.replaceInput.value;
  els.editor.value = els.editor.value.split(q).join(r);
  els.editor.dispatchEvent(new Event('input'));
  computeFindMatches();
  setStatus(`전체 치환 완료`, 'success');
});

// --- Init ---
async function init() {
  // Theme
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  // Split ratio
  const split = parseFloat(localStorage.getItem(SPLIT_KEY));
  if (split && split > 0.15 && split < 0.85) {
    els.split.style.gridTemplateColumns = `${split * 100}% 6px ${(1 - split) * 100}%`;
  }
  // Date default
  els.date.value = new Date().toISOString().slice(0, 10);

  // Demos
  try {
    const demos = await api('/api/demos');
    for (const d of demos) {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      els.demo.appendChild(opt);
      const opt2 = document.createElement('option');
      opt2.value = d; opt2.textContent = `<${d} />`;
      els.insertDemo.appendChild(opt2);
    }
  } catch {}

  // Tags
  try {
    const tags = await api('/api/tags');
    for (const t of tags) {
      const opt = document.createElement('option');
      opt.value = t;
      els.tagSuggestions.appendChild(opt);
    }
  } catch {}

  // AI toggle restore
  aiEnabled = localStorage.getItem(AI_KEY) === '1';
  els.aiToggle.checked = aiEnabled;

  updateExtBadge();
  updateWordCount();
  await loadList();
  await refreshGitStatus();
  setInterval(refreshGitStatus, 10000);

  // Try restore
  restoreAutosave();refreshLocalDrafts();
  setEditorMode(currentExt !== '.mdx' && !/<[A-Za-z!]/.test(els.editor.value));
  render();
  setStatus('준비됨');
  const requested=new URLSearchParams(location.search);
  if(requested.get('collection') && requested.get('slug')) await loadPost(requested.get('collection'),requested.get('slug'));
}

function setEditorMode(visual) {
  richMode = visual;
  $('#rich-editor').hidden = !visual;
  $('#editor-stack').hidden = visual;
  $('#mode-toggle').textContent = visual ? 'Markdown' : '서식 편집';
  $('#mode-toggle').setAttribute('aria-pressed', String(!visual));
  if (visual && rich) rich.commands.setContent(els.editor.value, {contentType:'markdown',emitUpdate:false});
}
rich = createRich($('#rich-editor'), markdown => {
  richUpdating = true; els.editor.value = markdown; els.editor.dispatchEvent(new Event('input')); richUpdating = false;
}, file => uploadImage(file).catch(e=>setStatus(e.message,'error')));
$('#mode-toggle').addEventListener('click', () => {
  if (!richMode && (currentExt === '.mdx' || /<[A-Za-z!]/.test(els.editor.value))) { setStatus('MDX와 HTML이 포함된 글은 원문 보존을 위해 Markdown으로 편집합니다.'); return; }
  setEditorMode(!richMode);
});
$('#preview-toggle').addEventListener('click', () => {
  const on = $('#main').classList.toggle('preview-focus');
  $('#preview-toggle').setAttribute('aria-pressed', String(on));
  $('#preview-toggle').textContent = on ? '계속 쓰기' : '미리보기';
  render();
});
$('#media-insert').addEventListener('click', () => { $('#media-error').textContent=''; $('#media-dialog').showModal(); });
$('#media-cancel').addEventListener('click', () => $('#media-dialog').close());
$('#media-form').addEventListener('submit', async e => {
  e.preventDefault();
  const url = $('#media-url').value.trim();
  const response = await api('/api/render', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({markdown:'```embed\n'+url+'\n```'})});
  if (!response.html.includes('class="media-card"')) { $('#media-error').textContent='지원하는 Spotify, YouTube 또는 GitHub 주소를 입력하세요.'; return; }
  $('#media-dialog').close();
  insertAtCursor('\n\n```embed\n'+url+'\n```\n\n'); $('#media-url').value='';
});
document.querySelectorAll('#fm-category,#fm-stage,#fm-series-name,#fm-series-title,#fm-series-order').forEach(el=>el.addEventListener('input',saveAutosave));
init();

// Keep metadata preview and recovery current even when only the title changes.
[els.title,els.summary,els.date,els.tags].forEach(el=>el.addEventListener('input',()=>{
  saveAutosave();clearTimeout(renderTimer);renderTimer=setTimeout(render,250);
}));
