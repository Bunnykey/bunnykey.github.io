import express from 'express';
import multer from 'multer';
import { marked } from 'marked';
import matter from 'gray-matter';
import { codeToHtml } from 'shiki';
import { readFile, writeFile, readdir, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename, extname } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const CONTENT = join(ROOT, 'src', 'content');
const PUBLIC_IMG = join(ROOT, 'public', 'img');
const COLLECTIONS = ['flora', 'nursery', 'seeds'];

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(join(__dirname, 'public')));

// Bind localhost only — never expose
const PORT = 4322;

// Markdown renderer using same Shiki theme as Astro config
marked.use({
  async: true,
  async walkTokens(token) {
    if (token.type === 'code') {
      const lang = token.lang || 'text';
      try {
        token.html = await codeToHtml(token.text, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        });
      } catch {
        token.html = await codeToHtml(token.text, {
          lang: 'text',
          themes: { light: 'github-light', dark: 'github-dark' },
        });
      }
    }
  },
  renderer: {
    code(token) {
      return token.html || `<pre><code>${token.text}</code></pre>`;
    },
  },
});

function safeSlug(s) {
  return s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

function safeCollection(c) {
  if (!COLLECTIONS.includes(c)) throw new Error(`invalid collection: ${c}`);
  return c;
}

function findPostFile(collection, slug) {
  for (const ext of ['.mdx', '.md']) {
    const p = join(CONTENT, collection, `${slug}${ext}`);
    if (existsSync(p)) return { path: p, ext };
  }
  return null;
}

// List all posts grouped by collection
app.get('/api/list', async (_req, res) => {
  const result = {};
  for (const c of COLLECTIONS) {
    const dir = join(CONTENT, c);
    if (!existsSync(dir)) { result[c] = []; continue; }
    const files = (await readdir(dir)).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    result[c] = await Promise.all(files.map(async f => {
      const raw = await readFile(join(dir, f), 'utf8');
      const { data } = matter(raw);
      const ext = extname(f);
      return {
        slug: basename(f, ext),
        ext,
        title: data.title || basename(f, ext),
        date: data.date || null,
        draft: !!data.draft,
      };
    }));
    result[c].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  res.json(result);
});

// Get one post
app.get('/api/get', async (req, res) => {
  try {
    const c = safeCollection(req.query.collection);
    const slug = safeSlug(req.query.slug);
    const hit = findPostFile(c, slug);
    if (!hit) return res.status(404).json({ error: 'not found' });
    const raw = await readFile(hit.path, 'utf8');
    const { data, content } = matter(raw);
    res.json({ frontmatter: data, body: content, ext: hit.ext });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const DEMO_COMPONENTS = ['TokenFlowDemo', 'ApiFlowDemo'];

function preprocessDemos(md) {
  // Replace <DemoName /> or <DemoName client:visible /> with a placeholder div
  const pattern = new RegExp(
    `<(${DEMO_COMPONENTS.join('|')})\\b[^>]*/?>(\\s*</\\1>)?`,
    'g',
  );
  return md.replace(pattern, (_m, name) =>
    `<div class="demo-placeholder" data-demo="${name}">📊 ${name} (배포 시 렌더)</div>`,
  );
}

// Render markdown to HTML (uses Shiki for code)
app.post('/api/render', async (req, res) => {
  try {
    const preprocessed = preprocessDemos(req.body.markdown || '');
    const html = await marked.parse(preprocessed);
    res.json({ html });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Save markdown file
app.post('/api/save', async (req, res) => {
  try {
    const c = safeCollection(req.body.collection);
    const slug = safeSlug(req.body.slug);
    if (!slug) throw new Error('slug required');
    const fm = req.body.frontmatter || {};
    if (!fm.title) throw new Error('title required');
    if (!fm.date) throw new Error('date required');

    // Stringify date as ISO YYYY-MM-DD
    const dateStr = typeof fm.date === 'string' ? fm.date : new Date(fm.date).toISOString().slice(0, 10);
    const cleanFm = { ...fm, date: dateStr };
    if (cleanFm.draft === false) delete cleanFm.draft;
    if (Array.isArray(cleanFm.tags) && cleanFm.tags.length === 0) delete cleanFm.tags;

    const body = req.body.body || '';
    // Auto-detect MDX: inline JSX tags for demo components
    const hasJsx = /<(TokenFlowDemo|ApiFlowDemo)\b/.test(body);
    const preferredExt = req.body.ext === '.mdx' || hasJsx ? '.mdx' : '.md';

    // If existing file has different extension, remove the old one
    const existing = findPostFile(c, slug);
    if (existing && existing.ext !== preferredExt) {
      await (await import('node:fs/promises')).unlink(existing.path);
    }

    const file = matter.stringify(body, cleanFm);
    const path = join(CONTENT, c, `${slug}${preferredExt}`);
    await writeFile(path, file, 'utf8');
    res.json({ ok: true, path: path.replace(ROOT + '/', ''), ext: preferredExt });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Image upload
const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await mkdir(PUBLIC_IMG, { recursive: true });
      cb(null, PUBLIC_IMG);
    },
    filename: (_req, file, cb) => {
      const ts = Date.now();
      const ext = extname(file.originalname).toLowerCase() || '.png';
      const base = safeSlug(basename(file.originalname, ext)) || 'img';
      cb(null, `${ts}-${base}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  res.json({ url: `/img/${req.file.filename}`, name: req.file.originalname });
});

// Delete a post
app.post('/api/delete', async (req, res) => {
  try {
    const c = safeCollection(req.body.collection);
    const slug = safeSlug(req.body.slug);
    const hit = findPostFile(c, slug);
    if (!hit) return res.status(404).json({ error: 'not found' });
    await unlink(hit.path);
    res.json({ ok: true, path: hit.path.replace(ROOT + '/', '') });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Git helpers
function git(args, opts = {}) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

app.get('/api/git-status', (_req, res) => {
  const st = git(['status', '--porcelain']);
  if (st.status !== 0) return res.json({ dirty: false, files: [], ahead: 0, branch: null });
  const files = st.stdout.split('\n').filter(Boolean).map(l => ({ status: l.slice(0, 2), file: l.slice(3) }));
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  // count commits ahead of origin/branch
  let ahead = 0;
  const rev = git(['rev-list', '--count', `origin/${branch}..HEAD`]);
  if (rev.status === 0) ahead = parseInt(rev.stdout.trim(), 10) || 0;
  res.json({ dirty: files.length > 0, files, ahead, branch });
});

// Publish: save (draft off) + commit + push
app.post('/api/publish', async (req, res) => {
  try {
    const c = safeCollection(req.body.collection);
    const slug = safeSlug(req.body.slug);
    if (!slug) throw new Error('slug required');
    const fm = req.body.frontmatter || {};
    if (!fm.title) throw new Error('title required');
    if (!fm.date) throw new Error('date required');

    const dateStr = typeof fm.date === 'string' ? fm.date : new Date(fm.date).toISOString().slice(0, 10);
    const cleanFm = { ...fm, date: dateStr };
    delete cleanFm.draft;
    if (Array.isArray(cleanFm.tags) && cleanFm.tags.length === 0) delete cleanFm.tags;

    const body = req.body.body || '';
    const hasJsx = /<(TokenFlowDemo|ApiFlowDemo)\b/.test(body);
    const preferredExt = req.body.ext === '.mdx' || hasJsx ? '.mdx' : '.md';
    const existing = findPostFile(c, slug);
    if (existing && existing.ext !== preferredExt) await unlink(existing.path);
    const file = matter.stringify(body, cleanFm);
    const relPath = `src/content/${c}/${slug}${preferredExt}`;
    await writeFile(join(ROOT, relPath), file, 'utf8');

    const add = git(['add', relPath, 'public/img']);
    if (add.status !== 0) throw new Error(`git add failed: ${add.stderr}`);

    const msg = req.body.message || `content: publish "${fm.title}"`;
    const commit = git(['commit', '-m', msg]);
    if (commit.status !== 0) {
      // commit might fail if nothing to commit — that's OK for re-publish with no changes
      if (!/nothing to commit/.test(commit.stdout + commit.stderr)) {
        throw new Error(`git commit failed: ${commit.stderr || commit.stdout}`);
      }
    }

    const push = git(['push', 'origin', 'HEAD']);
    if (push.status !== 0) throw new Error(`git push failed: ${push.stderr}`);

    res.json({ ok: true, path: relPath, committed: commit.status === 0 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// All tags (union across posts)
app.get('/api/tags', async (_req, res) => {
  const all = new Set();
  for (const c of COLLECTIONS) {
    const dir = join(CONTENT, c);
    if (!existsSync(dir)) continue;
    const files = (await readdir(dir)).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const f of files) {
      const raw = await readFile(join(dir, f), 'utf8');
      const { data } = matter(raw);
      for (const t of data.tags || []) all.add(t);
    }
  }
  res.json([...all].sort());
});

// Autocomplete via Ollama
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_COMPLETION_MODEL = process.env.EDITOR_COMPLETION_MODEL || 'qwen3.5:2b';

app.post('/api/complete', async (req, res) => {
  const { prefix = '', suffix = '', model = DEFAULT_COMPLETION_MODEL } = req.body || {};
  // Trim context (last 1200 chars before cursor, first 200 after)
  const pre = prefix.slice(-1200);
  const suf = suffix.slice(0, 200);
  const prompt = [
    'You are a Korean tech-blog writing assistant. The user is mid-draft.',
    'Continue from the cursor naturally in Korean, matching the surrounding tone.',
    'Output ONLY the continuation text. No commentary, no code fences, no labels.',
    'Stop after one or two sentences, or at a natural pause. Max ~120 characters.',
    'If the user already finished a sentence, suggest the next short sentence.',
    'Never repeat what is already there.',
    '',
    '=== DRAFT BEFORE CURSOR ===',
    pre,
    '=== DRAFT AFTER CURSOR ===',
    suf,
    '=== CONTINUATION ===',
  ].join('\n');

  const controller = new AbortController();
  let clientGone = false;
  res.on('close', () => { clientGone = true; controller.abort(); });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const upstream = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        think: false,
        options: {
          temperature: 0.4,
          top_p: 0.9,
          num_predict: 80,
          stop: ['\n\n', '===', 'CONTINUATION'],
        },
      }),
      signal: controller.signal,
    });
    if (!upstream.ok || !upstream.body) {
      res.status(502).end(`upstream ${upstream.status}`);
      return;
    }
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let totalChars = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const j = JSON.parse(line);
          if (j.response) {
            res.write(j.response);
            totalChars += j.response.length;
            if (totalChars > 200) { controller.abort(); break; }
          }
          if (j.done) { res.end(); return; }
        } catch {}
      }
    }
    res.end();
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
    else res.end();
  }
});

// Check slug uniqueness
app.get('/api/check-slug', (req, res) => {
  try {
    const c = safeCollection(req.query.collection);
    const slug = safeSlug(req.query.slug);
    const hit = findPostFile(c, slug);
    res.json({ exists: !!hit, ext: hit?.ext || null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Demo enum from config.ts (parsed simply)
app.get('/api/demos', async (_req, res) => {
  const cfg = await readFile(join(CONTENT, 'config.ts'), 'utf8');
  const matches = [...cfg.matchAll(/demo:\s*z\.enum\(\[([^\]]+)\]\)/g)];
  const all = new Set();
  for (const m of matches) {
    for (const v of m[1].matchAll(/'([^']+)'/g)) all.add(v[1]);
  }
  res.json([...all]);
});

let tailnet = null;
try {
  const raw = execSync('tailscale status --json', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  const self = JSON.parse(raw).Self || {};
  tailnet = (self.DNSName || '').replace(/\.$/, '') || (self.TailscaleIPs || [])[0] || null;
} catch {}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Editor running:`);
  console.log(`  local:    http://localhost:${PORT}`);
  if (tailnet) console.log(`  tailnet:  http://${tailnet}:${PORT}`);
});
