import express from 'express';
import { COLLECTIONS, CATEGORIES, STAGES, DEMOS, slugify, validateRoute } from '../../src/lib/publishing/contract.mjs';
import { createPostStore } from '../../src/lib/publishing/store.mjs';
import { withPublishingLock } from '../../src/lib/publishing/lock.mjs';
import { renderMedia } from '../../src/lib/media.mjs';
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
const posts = createPostStore(ROOT);

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(join(__dirname, 'public')));
app.use('/img', express.static(PUBLIC_IMG));
app.use('/fonts', express.static(join(ROOT,'public','fonts')));
app.use('/design', express.static(join(ROOT,'public','design')));
// Prevent cross-origin forms from invoking local publishing APIs.
app.use('/api', (req, res, next) => {
  if (req.headers.origin && req.headers.origin !== `${req.protocol}://${req.headers.host}`) return res.status(403).json({error:'다른 사이트의 요청은 허용하지 않습니다.'});
  next();
});

// Local-only by default. Opt into a trusted LAN/tailnet with EDITOR_HOST.
const PORT = Number(process.env.EDITOR_PORT || 4322);

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
      if (token.lang === 'embed') return renderMedia(token.text);
      return token.html || `<pre><code>${token.text}</code></pre>`;
    },
  },
});

const safeSlug = slugify;

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

// Metadata and the same document envelope are shared by every editing client.
app.get('/api/contract', (_req,res)=>res.json({version:1,collections:COLLECTIONS,categories:CATEGORIES,stages:STAGES,demos:DEMOS}));
app.get('/api/list', async (_req,res)=>{
  const result=Object.fromEntries(COLLECTIONS.map(c=>[c,[]]));
  for(const post of await posts.list())result[post.collection].push({slug:post.slug,ext:post.ext,title:post.frontmatter.title,date:post.frontmatter.date,draft:post.hasDraft || !!post.frontmatter.draft,id:post.id,publication:post.publication});
  for(const rows of Object.values(result))rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  res.json(result);
});
app.get('/api/get', async(req,res)=>{
  try {
    const {collection,slug}=req.query;validateRoute(collection,slug);
    const post=await posts.read(collection,slug);
    if(!post)return res.status(404).json({error:'not found'});
    res.json({...post,document:{id:post.id,revision:post.revision,collection,slug}});
  }catch(e){res.status(e.status || 400).json({error:e.message});}
});

app.get('/api/source', async(req,res)=>{
  try {const src=await posts.source(req.query.collection,req.query.slug);res.json(src?{frontmatter:src.frontmatter,body:src.body,revision:src.revision}:null);}
  catch(e){res.status(e.status || 400).json({error:e.message});}
});
app.post('/api/reconcile', async(req,res)=>{
  try {const draft=await withPublishingLock(ROOT,()=>posts.save(req.body,true));res.json({...draft,ok:true,document:{id:draft.id,revision:draft.revision,collection:draft.collection,slug:draft.slug}});}
  catch(e){res.status(e.status || 400).json({error:e.message});}
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

// Saved drafts never change the public source tree.
app.post('/api/save', async(req,res)=>{
  try {
    const draft=await withPublishingLock(ROOT,()=>posts.save(req.body));
    res.json({...draft,ok:true,document:{id:draft.id,revision:draft.revision,collection:draft.collection,slug:draft.slug}});
  }catch(e){res.status(e.status || 400).json({error:e.message});}
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
  fileFilter: (_req, file, cb) => {
    const valid = /^image\/(png|jpeg|gif|webp|avif)$/.test(file.mimetype) && /\.(png|jpe?g|gif|webp|avif)$/i.test(file.originalname);
    cb(valid ? null : new Error('PNG, JPEG, GIF, WebP, AVIF 이미지를 선택하세요.'), valid);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  res.json({ url: `/img/${req.file.filename}`, name: req.file.originalname });
});

// Discard only a working draft. Removing an already published URL needs a separate lifecycle.
app.post('/api/delete', async(req,res)=>{
  try {
    await withPublishingLock(ROOT, async()=>{
      const post=await posts.check(req.body);
      if(!post?.hasDraft)throw Object.assign(new Error('삭제할 작업 초안이 없습니다. 게시된 글은 유지됩니다.'),{status:409});
      await unlink(join(ROOT,'.publishing','drafts',post.id+'.json'));
    });
    res.json({ok:true});
  }catch(e){res.status(e.status || 400).json({error:e.message});}
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

// Publication receipts distinguish repository delivery from verified public deployment.
app.post('/api/publish', async(req,res)=>{
  let draft, promotion, commitSha, phase='validation', toAdd=[];
  try {
    const result=await withPublishingLock(ROOT,async()=>{
      try {
        if(git(['branch','--show-current']).stdout.trim()!=='main')throw new Error('발행은 main 브랜치에서 실행하세요.');
        draft=await posts.save(req.body);
        await posts.record(draft.id,{state:'building',revision:draft.revision});phase='build';
        promotion=await posts.promote(draft);
        const build=spawnSync('npm',['run','build'],{cwd:ROOT,encoding:'utf8',timeout:120000});
        if(build.status!==0)throw new Error('Astro 빌드 실패: '+(build.stderr || build.stdout || build.error?.message).slice(-2000));
        const relPath=`src/content/${draft.collection}/${draft.slug}${draft.ext}`;
        toAdd=[relPath];
        if(promotion.old && promotion.old.ext!==draft.ext)toAdd.push(`src/content/${draft.collection}/${draft.slug}${promotion.old.ext}`);
        for(const match of draft.body.matchAll(/\/img\/([a-zA-Z0-9_\p{L}.-]+)/gu)) {
          const image=`public/img/${match[1]}`;if(existsSync(join(ROOT,image)))toAdd.push(image);
        }
        phase='commit';
        const add=git(['add',...toAdd]);if(add.status!==0)throw new Error(add.stderr);
        const diff=git(['diff','--quiet','HEAD','--',...toAdd]);
        if(![0,1].includes(diff.status))throw new Error(diff.stderr);
        if(diff.status===1) {const commit=git(['commit','--only','-m',`content: publish "${draft.frontmatter.title}"`,'--',...toAdd]);if(commit.status!==0)throw new Error(commit.stderr || commit.stdout);}
        commitSha=git(['rev-parse','HEAD']).stdout.trim();
        await posts.record(draft.id,{state:'committed',commitSha,revision:promotion.revision});phase='push';
        const push=git(['push','origin','HEAD']);if(push.status!==0)throw new Error(push.stderr);
        await posts.record(draft.id,{state:'pushed',commitSha,revision:promotion.revision});
        const document=await posts.finish(draft,promotion);
        return {ok:true,path:relPath,ext:draft.ext,document,state:'pushed',commitSha,deploymentVerified:false,deploymentUrl:'https://github.com/Bunnykey/bunnykey.github.io/actions'};
      }catch(error){
        if(draft){
          if(promotion && !commitSha){
            await posts.rollback(promotion);
            if(toAdd.length)git(['reset','-q','HEAD','--',...toAdd]);
          }else if(promotion && commitSha){draft=await posts.rebase(draft,promotion);}
          await posts.record(draft.id,{state:'failed',phase,commitSha,error:error.message,revision:draft.revision});
          error.document={id:draft.id,revision:draft.revision,collection:draft.collection,slug:draft.slug};
        }
        throw error;
      }
    });
    res.json(result);
  }catch(e){res.status(e.status || 400).json({error:e.message,phase,state:'failed',document:e.document});}
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
app.get('/api/check-slug', async (req, res) => {
  try {
    const c = safeCollection(req.query.collection);
    const slug = safeSlug(req.query.slug);
    const hit = await posts.read(c, slug);
    res.json({ exists: !!hit, ext: hit?.ext || null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Demo enum from config.ts (parsed simply)
app.get('/api/demos', (_req,res)=>res.json([...new Set(Object.values(DEMOS).flat())]));

app.use((error, _req, res, _next) => res.status(400).json({error:error.message}));

let tailnet = null;
try {
  const raw = execSync('tailscale status --json', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  const self = JSON.parse(raw).Self || {};
  tailnet = (self.DNSName || '').replace(/\.$/, '') || (self.TailscaleIPs || [])[0] || null;
} catch {}

app.listen(PORT, process.env.EDITOR_HOST || '127.0.0.1', () => {
  console.log(`Editor running:`);
  console.log(`  local:    http://localhost:${PORT}`);
  if (tailnet) console.log(`  tailnet:  http://${tailnet}:${PORT}`);
});
