import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
export async function withPublishingLock(root, work) {
  const path=join(root,'.publishing-lock');
  try { await mkdir(path); } catch(error) { if(error.code === 'EEXIST') throw Object.assign(new Error('다른 저장 또는 발행 작업이 진행 중입니다. 잠시 후 다시 시도하세요.'),{status:423}); throw error; }
  try { await writeFile(join(path,'owner.json'),JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()})); return await work(); }
  finally { await rm(path,{recursive:true,force:true}); }
}
