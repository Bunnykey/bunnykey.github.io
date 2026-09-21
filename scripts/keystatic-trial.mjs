import { spawn } from 'node:child_process';
import { requireRemoteWriting } from './writing-deployment.mjs';

const build = process.argv.includes('--build');
const remote = process.argv.includes('--remote');
if (remote) requireRemoteWriting(process.env);
const child = spawn(process.execPath, ['node_modules/astro/astro.js', ...(build
  ? ['build', ...(remote ? [] : ['--outDir', './writing-trial-dist'])]
  : ['dev', '--host', '127.0.0.1', '--port', '4322'])], {
  stdio: 'inherit',
  env: { ...process.env, KEYSTATIC_TRIAL: remote ? 'remote' : build ? 'preview' : 'editor' },
});
child.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
