import {cp, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

// Test posts exist only in this isolated site; they never enter the author's source tree.
const site = await mkdtemp(join(tmpdir(), 'greenhouse-browser-'));
let exitCode = 1;
try {
  for (const path of ['src', 'public', 'scripts', 'node_modules', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
    await cp(resolve(path), join(site, path), {recursive: true});
  }
  const body = '## 사진과 문단\n\n브라우저에서 본문을 확인합니다.\n\n![사진 설명](/img/notion-33afd41ccc4c803f9945c92d518856d5.jpeg)\n\n## 미디어\n\n' + [
    'https://youtu.be/dQw4w9WgXcQ',
    'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    'https://github.com/Bunnykey/bunnykey.github.io',
  ].map(url => `\`\`\`embed\n${url}\n\`\`\``).join('\n\n') + '\n\n## 마지막 메모\n\n검증용 글입니다.\n';
  for (const collection of ['flora', 'seeds', 'nursery']) {
    for (const state of ['published', 'shared', 'hidden']) {
      const metadata = `title: ${state === 'shared' ? '미리보기전용확인문구' : state === 'hidden' ? '숨긴초안확인문구' : '브라우저 검증 공개 글'} ${collection}\ndate: "2026-10-26"\ncategory: notes\ndraft: ${state !== 'published'}\nsharePreview: ${state === 'shared'}\nseries:\n  name: acceptance-series\n  title: 브라우저 검증 시리즈\n  order: ${state === 'published' ? 1 : state === 'shared' ? 2 : 3}\n`;
      await writeFile(join(site, `src/content/${collection}/acceptance-${state}.md`), `---\n${metadata}---\n\n${body}`);
    }
  }
  const build = spawnSync('npm', ['run', 'build'], {cwd: site, stdio: 'inherit'});
  if (build.status === 0) {
    const result = spawnSync(process.execPath, [resolve('node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], {
      cwd: process.cwd(), stdio: 'inherit', env: {...process.env, E2E_SITE_ROOT: site},
    });
    exitCode = result.status ?? 1;
  }
} finally {
  await rm(site, {recursive: true, force: true});
}
process.exitCode = exitCode;
