import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, readFile, readdir, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('CMS-style Markdown builds images and embeds while drafts stay out of public routes and OG', {timeout: 120000}, async () => {
  const root = await mkdtemp(join(tmpdir(), 'pages-cms-build-'));
  try {
    for (const path of ['scripts', 'src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
      await cp(resolve(path), join(root, path), {recursive: true});
    }
    // Astro's virtual component paths require a real dependency tree at this root.
    await cp(resolve('node_modules'), join(root, 'node_modules'), {recursive: true});
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    await writeFile(join(root, 'public/img/cms-contract.png'), image);
    const body = '## 아이폰 본문\n\n![사진 설명](/img/cms-contract.png)\n\n' + [
      'https://youtu.be/dQw4w9WgXcQ',
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      'https://github.com/Bunnykey/bunnykey.github.io',
    ].map(url => `\`\`\`embed\n${url}\n\`\`\``).join('\n\n');
    for (const collection of ['flora', 'seeds', 'nursery']) {
      for (const draft of [true, false]) {
        const slug = `cms-${draft ? 'draft' : 'published'}`;
        const series = collection === 'seeds' ? '' : `series:\n  name: cms-series\n  title: CMS Series\n  order: ${draft ? 2 : 1}\n`;
        await writeFile(join(root, `src/content/${collection}/${slug}.md`),
          `---\ntitle: ${draft ? 'CMS_DRAFT_SENTINEL' : 'CMS 발행'} ${collection}\ndate: "2026-10-26"\ncategory: notes\ndraft: ${draft}\n${series}---\n\n${body}\n`);
      }
    }
    execFileSync('npm', ['run', 'build'], {cwd: root, stdio: 'pipe', timeout: 100000});
    for (const collection of ['flora', 'seeds', 'nursery']) {
      const html = await readFile(join(root, `dist/${collection}/cms-published/index.html`), 'utf8');
      assert.match(html, /src="\/img\/cms-contract.png"/);
      for (const provider of ['YouTube', 'Spotify', 'GitHub']) assert.ok(html.includes(`data-provider="${provider}"`));
      assert.match(html, /frame-src https:\/\/open.spotify.com https:\/\/www.youtube-nocookie.com/);
      await access(join(root, `dist/og/${collection}/cms-published.png`));
      for (const path of [`${collection}/cms-draft/index.html`, `og/${collection}/cms-draft.png`]) {
        await assert.rejects(access(join(root, 'dist', path)), {code: 'ENOENT'});
      }
      if (collection !== 'seeds') {
        const series = await readFile(join(root, `dist/${collection}/series/cms-series/index.html`), 'utf8');
        assert.match(series, /1 posts/);
        assert.ok(!series.includes('cms-draft'));
      }
    }
    async function checkPublicText(dir) {
      for (const entry of await readdir(dir, {withFileTypes: true})) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) await checkPublicText(path);
        else if (/\.(html|xml|json|js)$/.test(entry.name)) {
          const text = await readFile(path, 'utf8');
          assert.ok(!text.includes('CMS_DRAFT_SENTINEL'), `Draft title leaked into ${path}`);
          assert.ok(!text.includes('/cms-draft/'), `Draft route leaked into ${path}`);
        }
      }
    }
    await checkPublicText(join(root, 'dist'));
    assert.deepEqual(await readFile(join(root, 'dist/img/cms-contract.png')), image);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
