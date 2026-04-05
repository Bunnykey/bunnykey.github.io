import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.sh');

test('deploy script exists with safety flags and deployment commands', () => {
  const content = fs.readFileSync(deployScriptPath, 'utf8');

  assert.match(content, /^#!\/bin\/bash/m);
  assert.match(content, /set -euo pipefail/);
  assert.match(content, /git add -A/);
  assert.match(content, /git commit -m "content: \$\(date \+%Y-%m-%d\) update"/);
  assert.match(content, /git push origin main/);
  assert.match(content, /GitHub Actions will deploy automatically/);
});
