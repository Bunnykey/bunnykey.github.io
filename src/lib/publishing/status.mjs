import { ACTIONS_URL } from './paths.mjs';

export function describeDeployment(runs, liveCommit = '') {
  const run = runs.find(item => item.name === 'Deploy to GitHub Pages' && item.head_branch === 'main');
  if (!run) return {kind: 'unknown', message: '아직 확인할 배포가 없습니다. GitHub에서 상태를 확인해 주세요.', url: ACTIONS_URL};
  const url = /^https:\/\/github\.com\/Bunnykey\/bunnykey\.github\.io\/actions\/runs\/\d+$/.test(run.html_url || '') ? run.html_url : ACTIONS_URL;
  if (run.status !== 'completed') return {kind: 'pending', message: '저장한 내용을 반영하고 있어요. 잠시 뒤 다시 확인해 주세요.', url};
  if (run.conclusion === 'success') {
    return liveCommit && run.head_sha !== liveCommit
      ? {kind: 'refresh', message: '새 배포가 완료됐어요. 새로고침하면 최신 글과 미리보기를 확인할 수 있습니다.', url}
      : {kind: 'success', message: '마지막 배포가 완료됐어요. 글과 사진이 의도대로 보이는지 확인해 주세요.', url};
  }
  if (run.conclusion === 'cancelled') return {kind: 'error', message: '배포가 취소됐어요. 이전에 공개한 사이트는 유지됩니다. 배포 기록을 확인해 주세요.', url};
  return {kind: 'error', message: '새 내용을 반영하지 못했어요. 이전에 공개한 사이트는 유지됩니다. 배포 기록에서 오류를 확인해 주세요.', url};
}
