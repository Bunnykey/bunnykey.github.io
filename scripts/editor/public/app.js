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
  preview: $('#preview'),
  toc: $('#toc'),
  postList: $('#post-list'),
  status: $('#status'),
  fileInput: $('#file-input'),
  insertDemo: $('#insert-demo'),
  extBadge: $('#ext-badge'),
};

let currentSlug = null;
let currentExt = '.md';
let renderTimer = null;
let listCache = {};

function updateExtBadge() {
  const hasInlineDemo = /<(TokenFlowDemo|ApiFlowDemo)\b/.test(els.editor.value);
  currentExt = hasInlineDemo ? '.mdx' : (currentExt === '.mdx' ? '.mdx' : '.md');
  els.extBadge.textContent = currentExt;
  els.extBadge.className = currentExt === '.mdx' ? 'mdx' : '';
}

// --- Status ---
function setStatus(msg, type = '') {
  els.status.textContent = msg;
  els.status.className = type;
}

// --- API ---
async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// --- Sidebar ---
async function loadList() {
  listCache = await api('/api/list');
  els.postList.innerHTML = '';
  for (const [c, posts] of Object.entries(listCache)) {
    const group = document.createElement('div');
    group.className = 'collection-group';
    group.textContent = c;
    els.postList.appendChild(group);
    for (const p of posts) {
      const item = document.createElement('div');
      item.className = 'post-item';
      item.dataset.collection = c;
      item.dataset.slug = p.slug;
      const draftBadge = p.draft ? '<span class="draft-badge">draft</span>' : '';
      const dateStr = p.date ? new Date(p.date).toISOString().slice(0, 10) : '';
      item.innerHTML = `
        <div>${draftBadge}${escapeHtml(p.title)}</div>
        <div class="meta">${dateStr}</div>
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

// --- Load existing post ---
async function loadPost(collection, slug) {
  try {
    const { frontmatter, body } = await api(`/api/get?collection=${collection}&slug=${slug}`);
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
    currentExt = (await (await fetch(`/api/get?collection=${collection}&slug=${slug}`)).json()).ext || '.md';
    updateExtBadge();
    highlightActive();
    render();
    setStatus(`불러옴: ${collection}/${slug} (${currentExt})`);
  } catch (e) {
    setStatus(`로드 실패: ${e.message}`, 'error');
  }
}

// --- New post ---
$('#new-post').addEventListener('click', () => {
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
  updateExtBadge();
  highlightActive();
  render();
  els.title.focus();
  setStatus('새 글 작성 중');
});

// --- Render preview ---
async function render() {
  try {
    const { html } = await api('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: els.editor.value }),
    });
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
    return `<li class="${h.tagName.toLowerCase()}"><a href="#${id}">${escapeHtml(h.textContent)}</a></li>`;
  });
  els.toc.innerHTML = `<h4>목차</h4><ul>${items.join('')}</ul>`;
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// --- Live preview (debounced) ---
els.editor.addEventListener('input', () => {
  updateExtBadge();
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 250);
});

// --- Insert demo ---
const DEMO_IMPORT_PATH = '../../components/demos';

function ensureImport(componentName) {
  const importLine = `import ${componentName} from '${DEMO_IMPORT_PATH}/${componentName}';`;
  if (els.editor.value.includes(importLine)) return;
  const value = els.editor.value;
  // Insert after any existing imports, else at top
  const lines = value.split('\n');
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

// --- Auto-fill slug from title ---
els.title.addEventListener('input', () => {
  if (currentSlug) return;
  els.slug.value = slugify(els.title.value).slice(0, 60);
});

// --- Save ---
$('#save').addEventListener('click', save);

async function save() {
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
        frontmatter: fm,
        body: els.editor.value,
        ext: currentExt,
      }),
    });
    setStatus(`저장됨: ${result.path}`, 'success');
    currentSlug = els.slug.value;
    currentExt = result.ext;
    updateExtBadge();
    await loadList();
  } catch (e) {
    setStatus(`저장 실패: ${e.message}`, 'error');
  }
}

// --- Cmd+S to save ---
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
});

// --- Toolbar inserts ---
function insertAtCursor(text, selectOffset = null) {
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

document.querySelectorAll('#toolbar button[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const a = btn.dataset.action;
    if (a === 'code') insertAtCursor('\n```\n\n```\n', 5);
    else if (a === 'image') els.fileInput.click();
    else if (a === 'link') insertAtCursor('[]()', 1);
    else if (a === 'table') insertAtCursor('\n| 컬럼1 | 컬럼2 |\n|---|---|\n| a | b |\n');
    else if (a === 'h2') insertAtCursor('\n## ');
    else if (a === 'h3') insertAtCursor('\n### ');
  });
});

// --- Image upload ---
els.fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const { url, name } = await api('/api/upload', { method: 'POST', body: fd });
    insertAtCursor(`![${name}](${url})`);
    setStatus(`이미지 업로드: ${url}`, 'success');
  } catch (err) {
    setStatus(`업로드 실패: ${err.message}`, 'error');
  } finally {
    e.target.value = '';
  }
});

// --- Init ---
async function init() {
  els.date.value = new Date().toISOString().slice(0, 10);
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
  updateExtBadge();
  await loadList();
  render();
  setStatus('준비됨');
}

init();
