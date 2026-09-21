import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFile, rm, mkdtemp } from 'node:fs/promises';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { JSDOM, VirtualConsole } from 'jsdom';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

test('Keystatic editor preserves the sample image and all three media blocks when saving', async () => {
  const temp = await mkdtemp(process.cwd() + '/.keystatic-check-');
  try {
    await build({
      entryPoints: ['keystatic.config.tsx'], bundle: true, packages: 'external', platform: 'node', format: 'esm',
      outfile: temp + '/config.mjs',
      // Exercise the editor's client field parser; the Node export is reader-only.
      plugins: [{ name: 'client-fields', setup(builder) {
        builder.onResolve({ filter: /^@keystatic\/core$/ }, () => ({
          path: process.cwd() + '/node_modules/@keystatic/core/dist/keystatic-core.js', external: true,
        }));
      } }],
    });
    const { default: config } = await import(pathToFileURL(temp + '/config.mjs'));
    const field = config.collections.trial.schema.body;
    const { content } = matter(await readFile('writing-trial/posts/a-song-for-today.mdx', 'utf8'));
    const image = await readFile('writing-trial/assets/a-song-for-today/greenhouse-home-hero.png');
    const value = field.parse(undefined, {
      content: Buffer.from(content), slug: 'a-song-for-today', other: new Map(),
      external: new Map([['writing-trial/assets', new Map([['greenhouse-home-hero.png', image]])]]),
    });
    const saved = field.serialize(value, { slug: 'a-song-for-today' });
    const body = Buffer.from(saved.content).toString();
    assert.match(body, /!\[초록빛 온실\]\(\/writing-assets\/a-song-for-today\/greenhouse-home-hero.png\)/);
    assert.equal((body.match(/<Media url=/g) || []).length, 3);
    assert.deepEqual(Buffer.from(saved.external.get('writing-trial/assets').get('greenhouse-home-hero.png')), image);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('Keystatic saves and reloads Korean text and an image, renders embeds in Astro, and cannot edit published posts', { timeout: 90000 }, async () => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const server = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, KEYSTATIC_TRIAL: 'editor' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  server.stdout.on('data', data => { logs += data; });
  server.stderr.on('data', data => { logs += data; });
  const origin = `http://127.0.0.1:${port}`;
  const postPath = 'writing-trial/posts/api-roundtrip-test.mdx';
  const imagePath = 'writing-trial/assets/api-roundtrip-test.png';
  const publishedPath = 'src/content/nursery/clearance-sale.md';
  const original = await readFile(publishedPath);
  const request = (path, options = {}) => fetch(origin + path, { ...options, signal: AbortSignal.timeout(15000) });
  const update = body => request('/api/keystatic/update', {
    method: 'POST', headers: { 'no-cors': '1', 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    const deadline = Date.now() + 30000;
    while (true) {
      try { const response = await request('/keystatic'); if (response.ok) break; } catch {}
      if (Date.now() > deadline) throw new Error('Editor did not start: ' + logs);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    const post = `---\ntitle: 한글 저장 확인\ndate: '2026-09-21'\nsummary: 사진과 음악\n---\n\n수정한 문장을 다시 열어 확인합니다.\n\n![테스트 사진](/writing-assets/api-roundtrip-test.png)\n\n<Media url="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" />\n\n<Media url="https://www.youtube.com/watch?v=HWPSYWGY0YA" />\n\n<Media url="https://github.com/Bunnykey/bunnykey.github.io" />\n`;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF1sAAAAASUVORK5CYII=', 'base64');
    const saved = await update({ additions: [
      { path: postPath, contents: Buffer.from(post).toString('base64url') },
      { path: imagePath, contents: png.toString('base64url') },
    ], deletions: [] });
    assert.equal(saved.status, 200, await saved.text());
    assert.equal(await readFile(postPath, 'utf8'), post);
    assert.deepEqual(await readFile(imagePath), png);
    const sha = createHash('sha1').update(`blob ${Buffer.byteLength(post)}\0`).update(post).digest('hex');
    const reopened = await request(`/api/keystatic/blob/${sha}/${postPath}`, { headers: { 'no-cors': '1' } });
    assert.equal(reopened.status, 200);
    assert.equal(await reopened.text(), post);
    const preview = await request('/writing-preview/api-roundtrip-test/');
    assert.equal(preview.status, 200, logs);
    const document = new JSDOM(await preview.text(), { virtualConsole: new VirtualConsole() }).window.document;
    assert.equal(document.querySelector('h1').textContent, '한글 저장 확인');
    assert.match(document.querySelector('article').textContent, /수정한 문장/);
    assert.equal(document.querySelectorAll('figure[data-provider]').length, 3);
    assert.equal(document.querySelectorAll('iframe').length, 2);
    assert.match(document.querySelector('meta[http-equiv="Content-Security-Policy"]').content, /frame-src https:\/\/www.youtube-nocookie.com https:\/\/open.spotify.com;/);
    assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
    const image = await request(document.querySelector('article img').getAttribute('src'));
    assert.equal(image.status, 200);
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    const forbidden = await update({ additions: [{ path: publishedPath, contents: Buffer.from('must not write').toString('base64url') }], deletions: [] });
    assert.equal(forbidden.status, 400);
    assert.deepEqual(await readFile(publishedPath), original);
    const removed = await update({ additions: [], deletions: [{ path: postPath }, { path: imagePath }] });
    assert.equal(removed.status, 200);
  } finally {
    server.kill('SIGTERM');
    await once(server, 'exit');
    await Promise.all([rm(postPath, { force: true }), rm(imagePath, { force: true })]);
  }
});
