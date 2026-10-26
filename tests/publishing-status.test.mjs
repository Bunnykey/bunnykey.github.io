import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeDeployment } from '../src/lib/publishing/status.mjs';
import { isSharedPreview, postUrl, cmsEditUrl } from '../src/lib/publishing/paths.mjs';
const run = {name: 'Deploy to GitHub Pages', head_branch: 'main', status: 'completed', conclusion: 'success', head_sha: 'new', html_url: 'https://github.com/Bunnykey/bunnykey.github.io/actions/runs/123'};
test('publishing status distinguishes a stale cached screen, pending, failure, cancellation and completed delivery', () => {
  assert.equal(describeDeployment([run], 'old').kind, 'refresh');
  assert.equal(describeDeployment([run], 'new').kind, 'success');
  for (const status of ['queued', 'in_progress', 'waiting']) assert.equal(describeDeployment([{...run, status}], 'old').kind, 'pending');
  for (const conclusion of ['failure', 'cancelled', 'timed_out']) {
    const result = describeDeployment([{...run, conclusion}], 'old');
    assert.equal(result.kind, 'error');
    assert.match(result.message, /이전.*사이트는 유지/);
  }
  assert.equal(describeDeployment([{...run, name: 'Other workflow'}]).kind, 'unknown');
  assert.equal(describeDeployment([{...run, html_url: 'javascript:alert(1)'}]).url.startsWith('https://github.com/'), true);
});
test('shared preview URLs require explicit consent and remain distinct from published URLs', () => {
  const entry = {slug: '아이폰-글', data: {draft: true}};
  assert.equal(isSharedPreview(entry), false);
  assert.equal(isSharedPreview({...entry, data: {draft: true, sharePreview: false}}), false);
  assert.equal(isSharedPreview({...entry, data: {draft: true, sharePreview: 'true'}}), false);
  const shared = {...entry, data: {draft: true, sharePreview: true}};
  assert.equal(postUrl('seeds', shared), '/preview/seeds/아이폰-글/');
  assert.equal(postUrl('seeds', {...entry, data: {draft: false, sharePreview: true}}), '/seeds/아이폰-글/');
  assert.ok(cmsEditUrl('seeds', entry.slug).endsWith(encodeURIComponent('src/content/seeds/아이폰-글.md')));
  assert.throws(() => cmsEditUrl('seeds', '../outside'));
});
