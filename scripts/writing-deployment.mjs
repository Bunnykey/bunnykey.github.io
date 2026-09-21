export const trialBranch = 'feat/keystatic-trial';

export function writingStorage(project) {
  if (!project) return { storage: { kind: 'local' } };
  if (!/^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/.test(project)) {
    throw new Error('PUBLIC_KEYSTATIC_CLOUD_PROJECT must be the team/project value from Keystatic Cloud.');
  }
  return {
    storage: { kind: 'cloud', branchPrefix: trialBranch },
    cloud: { project },
  };
}

export function requireRemoteWriting(env) {
  if (!env.PUBLIC_KEYSTATIC_CLOUD_PROJECT) {
    throw new Error('Remote writing requires PUBLIC_KEYSTATIC_CLOUD_PROJECT. Local storage must not be deployed.');
  }
  writingStorage(env.PUBLIC_KEYSTATIC_CLOUD_PROJECT);
  if (env.VERCEL_GIT_COMMIT_REF && env.VERCEL_GIT_COMMIT_REF !== trialBranch) {
    throw new Error(`Deploy the writing trial from ${trialBranch}, not ${env.VERCEL_GIT_COMMIT_REF}.`);
  }
}
