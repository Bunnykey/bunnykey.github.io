import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { build } from 'esbuild';
import { COLLECTIONS, CATEGORIES, DEMOS, STAGES, validateRoute } from '../src/lib/publishing/contract.mjs';
import { createPostStore } from '../src/lib/publishing/store.mjs';
import { parsePost } from '../src/lib/publishing/serialization.mjs';

const config = matter(`---\n${await readFile('.pages.yml', 'utf8')}\n---`).data;
const fieldsFor = name => config.content.find(item => item.name === name).fields.map(field => ({
  ...config.components[field.component], ...field,
}));
const values = field => field.options.values.map(value => typeof value === 'string' ? value : value.name);

// Use the actual Astro schema; only the virtual astro:content loader is replaced.
const compiled = await build({
  entryPoints: ['src/content/config.ts'], bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'astro-content-schema', setup(builder) {
    builder.onResolve({filter: /^astro:content$/}, () => ({path: 'schema', namespace: 'astro-schema'}));
    builder.onLoad({filter: /.*/, namespace: 'astro-schema'}, () => ({
      contents: "export { z } from 'astro/zod'; export const defineCollection = value => value;",
      resolveDir: process.cwd(),
    }));
  }}],
});
const { collections } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('Pages CMS exposes the existing collections, metadata choices and flat image contract', () => {
  assert.deepEqual(config.content.map(item => item.name), COLLECTIONS);
  assert.equal(config.settings.content.merge, true);
  assert.deepEqual(config.media.map(({input, output, rename}) => ({input, output, rename})), [
    {input: 'public/img', output: '/img', rename: 'random'},
  ]);
  for (const collection of config.content) {
    const fields = fieldsFor(collection.name);
    assert.equal(collection.path, `src/content/${collection.name}`);
    assert.equal(collection.subfolders, false);
    assert.equal(collection.format, 'yaml-frontmatter');
    assert.equal(collection.filename.field, 'create');
    assert.ok(collection.filename.template.endsWith('.md')); // .mdx is not offered by this collection.
    validateRoute(collection.name, '2026-10-26-123456');
    assert.deepEqual(collection.operations, {create: true, rename: false, delete: false});
    assert.deepEqual(values(fields.find(field => field.name === 'category')), CATEGORIES);
    assert.equal(fields.find(field => field.name === 'draft').default, true);
    assert.equal(fields.find(field => field.name === 'sharePreview').default, false);
    assert.equal(fields.find(field => field.name === 'date').options.format, 'yyyy-MM-dd');
    assert.equal(fields.find(field => field.name === 'body').options.media, 'images');
    assert.equal(fields.find(field => field.name === 'body').options.format, 'markdown');
    // These values stay under their current writer's ownership and survive via merge.
    for (const key of ['id', 'contractVersion', 'sourceId']) assert.ok(!fields.some(field => field.name === key));
    const demo = fields.find(field => field.name === 'demo');
    assert.deepEqual(demo ? values(demo) : [], DEMOS[collection.name]);
    const stage = fields.find(field => field.name === 'stage');
    if (collection.name === 'nursery') assert.deepEqual(values(stage), STAGES);
    else assert.equal(stage, undefined);
    assert.equal(fields.some(field => field.name === 'highlight'), collection.name === 'flora');
  }
});

test('CMS defaults and quoted dates pass the actual Astro schema; malformed dates still fail', () => {
  for (const collection of COLLECTIONS) {
    const defaults = Object.fromEntries(fieldsFor(collection).filter(field => field.default !== undefined).map(field => [field.name, field.default]));
    const metadata = {title: '아이폰에서 쓴 글', date: '2026-10-26', ...defaults};
    const parsed = collections[collection].schema.parse(metadata);
    assert.equal(parsed.date.toISOString(), '2026-10-26T00:00:00.000Z');
    assert.equal(parsed.draft, true);
    assert.equal(parsed.sharePreview, false);
    assert.equal(collections[collection].schema.safeParse({...metadata, sharePreview: 'true'}).success, false);
    assert.equal(parsed.category, 'notes');
    assert.ok(collections[collection].schema.safeParse({...metadata, date: new Date('2026-10-26')}).success);
    for (const date of ['2026-02-30', '2026-13-01', '26/10/2026', '', null, 1792972800000]) {
      assert.equal(collections[collection].schema.safeParse({...metadata, date}).success, false, String(date));
    }
    assert.equal(collections[collection].schema.safeParse({...metadata, series: {name: 'test', title: '연재', order: 1.5}}).success, false);
    const owned = {...metadata, id: 'post_0123456789abcdef0123456789abcdef', contractVersion: 1, sourceId: 'notion-owned', custom: {keep: true}};
    assert.deepEqual(collections[collection].schema.parse(owned).custom, {keep: true});
  }
});

test('existing content explicitly keeps its publication state when the CMS applies new-post defaults', async () => {
  for (const collection of COLLECTIONS) {
    for (const file of await readdir(`src/content/${collection}`)) {
      if (!/\.mdx?$/.test(file)) continue;
      const {frontmatter} = parsePost(await readFile(`src/content/${collection}/${file}`, 'utf8'));
      assert.equal(typeof frontmatter.draft, 'boolean', `${collection}/${file} needs an explicit draft flag before CMS editing`);
    }
  }
});

test('a pulled CMS edit is detected by the local draft store and cannot silently overwrite it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cms-coexistence-'));
  try {
    for (const collection of COLLECTIONS) await mkdir(join(root, 'src/content', collection), {recursive: true});
    const path = join(root, 'src/content/seeds/2026-10-26-123456.md');
    const raw = '---\ntitle: CMS 글\ndate: "2026-10-26"\ndraft: true\nsourceId: notion-imported\ncustom: keep\n---\n\nCMS 본문\n';
    await writeFile(path, raw);
    const store = createPostStore(root);
    const original = await store.read('seeds', '2026-10-26-123456');
    const document = post => ({id: post.id, revision: post.revision, collection: post.collection, slug: post.slug});
    const request = {collection: original.collection, slug: original.slug, document: document(original), frontmatter: original.frontmatter, body: '로컬 초안'};
    const saved = await store.save(request);
    assert.equal(await readFile(path, 'utf8'), raw);
    const cmsUpdate = raw.replace('CMS 본문', 'CMS에서 수정한 본문');
    await writeFile(path, cmsUpdate); // The source tree after git pull.
    assert.equal((await store.read(original.collection, original.slug)).sourceChanged, true);
    await assert.rejects(store.save({...request, document: document(saved)}), error => error.status === 409);
    await assert.rejects(store.promote(saved), error => error.status === 409);
    assert.equal(await readFile(path, 'utf8'), cmsUpdate);
    const source = await store.source(original.collection, original.slug);
    assert.equal(source.id, original.id); // A route-derived ID stays stable until persisted.
    assert.equal(source.frontmatter.sourceId, 'notion-imported');
    assert.equal(parsePost(cmsUpdate).frontmatter.custom, 'keep');
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
