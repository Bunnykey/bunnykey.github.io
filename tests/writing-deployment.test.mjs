import test from 'node:test';
import assert from 'node:assert/strict';
import { writingStorage, requireRemoteWriting, trialBranch } from '../scripts/writing-deployment.mjs';

test('remote writing fails closed without Cloud authentication configuration', () => {
  assert.throws(() => requireRemoteWriting({}), /must not be deployed/);
  assert.throws(() => requireRemoteWriting({ PUBLIC_KEYSTATIC_CLOUD_PROJECT: 'invalid' }), /team\/project/);
});

test('remote trial rejects main deployment and scopes the branch picker', () => {
  const env = { PUBLIC_KEYSTATIC_CLOUD_PROJECT: 'test-team/test-project' };
  assert.throws(() => requireRemoteWriting({ ...env, VERCEL_GIT_COMMIT_REF: 'main' }), /not main/);
  assert.doesNotThrow(() => requireRemoteWriting({ ...env, VERCEL_GIT_COMMIT_REF: trialBranch }));
  assert.deepEqual(writingStorage(env.PUBLIC_KEYSTATIC_CLOUD_PROJECT), {
    storage: { kind: 'cloud', branchPrefix: trialBranch }, cloud: { project: 'test-team/test-project' },
  });
  assert.deepEqual(writingStorage(undefined), { storage: { kind: 'local' } });
});
