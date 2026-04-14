import express from 'express';
import multer from 'multer';
import { marked } from 'marked';
import matter from 'gray-matter';
import { codeToHtml } from 'shiki';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename, extname } from 'node:path';

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

// List all posts grouped by collection
app.get('/api/list', async (_req, res) => {
  const result = {};
  for (const c of COLLECTIONS) {
    const dir = join(CONTENT, c);
    if (!existsSync(dir)) { result[c] = []; continue; }
    const files = (await readdir(dir)).filter(f => f.endsWith('.md'));
    result[c] = await Promise.all(files.map(async f => {
      const raw = await readFile(join(dir, f), 'utf8');
      const { data } = matter(raw);
      return {
        slug: basename(f, '.md'),
        title: data.title || basename(f, '.md'),
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
    const path = join(CONTENT, c, `${slug}.md`);
    if (!existsSync(path)) return res.status(404).json({ error: 'not found' });
    const raw = await readFile(path, 'utf8');
    const { data, content } = matter(raw);
    res.json({ frontmatter: data, body: content });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Render markdown to HTML (uses Shiki for code)
app.post('/api/render', async (req, res) => {
  try {
    const html = await marked.parse(req.body.markdown || '');
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

    const file = matter.stringify(req.body.body || '', cleanFm);
    const path = join(CONTENT, c, `${slug}.md`);
    await writeFile(path, file, 'utf8');
    res.json({ ok: true, path: path.replace(ROOT + '/', '') });
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

import { execSync } from 'node:child_process';

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
