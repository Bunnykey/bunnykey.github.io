import { parseMedia, renderMedia } from '../lib/media.mjs';
import { describeDeployment } from '../lib/publishing/status.mjs';

export function initWriting() {
  const status = document.getElementById('publishing-status');
  if (!status || status.dataset.initialized) return;
  status.dataset.initialized = 'true';
  const check = document.getElementById('check-deployment') as HTMLButtonElement;
  const message = document.getElementById('deployment-message')!;
  const link = document.getElementById('deployment-link') as HTMLAnchorElement;
  const refresh = document.getElementById('refresh-writing') as HTMLButtonElement;
  const fallbackLink = link.href;
  refresh.addEventListener('click', () => location.reload());
  check.addEventListener('click', async () => {
    check.disabled = true;
    status.setAttribute('aria-busy', 'true');
    refresh.hidden = true;
    link.href = fallbackLink;
    message.textContent = '배포 상태를 확인하고 있어요…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(status.dataset.statusUrl!, {signal: controller.signal, headers: {Accept: 'application/vnd.github+json'}});
      if (!response.ok) throw new Error('status unavailable');
      const data = await response.json();
      if (!Array.isArray(data.workflow_runs)) throw new Error('invalid status');
      const result = describeDeployment(data.workflow_runs, status.dataset.liveCommit);
      message.textContent = result.message;
      status.dataset.state = result.kind;
      link.href = result.url;
      refresh.hidden = result.kind !== 'refresh';
    } catch {
      status.dataset.state = 'unavailable';
      message.textContent = '지금은 자동 조회가 어렵습니다. GitHub에서 직접 확인하거나 잠시 뒤 다시 시도해 주세요.';
    } finally {
      clearTimeout(timer);
      check.disabled = false;
      status.removeAttribute('aria-busy');
    }
  });

  const form = document.getElementById('writing-media-form') as HTMLFormElement;
  const input = document.getElementById('writing-media-url') as HTMLInputElement;
  const result = document.getElementById('writing-media-result')!;
  const source = document.getElementById('writing-media-source') as HTMLTextAreaElement;
  const mediaMessage = document.getElementById('writing-media-message')!;
  const preview = document.getElementById('writing-media-preview')!;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const media = parseMedia(input.value);
    if (!media) {
      result.hidden = true;
      preview.replaceChildren();
      mediaMessage.textContent = '지원하는 Spotify·YouTube·GitHub 주소인지 확인해 주세요.';
      return;
    }
    source.value = `\`\`\`embed\n${media.url}\n\`\`\``;
    preview.innerHTML = renderMedia(media.url); // The shared renderer accepts only allowlisted URLs.
    result.hidden = false;
    mediaMessage.textContent = '아래 내용을 복사해 CMS 본문의 Source에 붙여 넣으세요.';
  });
  document.getElementById('copy-media-source')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(source.value);
      mediaMessage.textContent = '복사했어요. CMS 본문의 Source에 붙여 넣어 주세요.';
    } catch {
      source.focus();
      source.select();
      mediaMessage.textContent = '복사할 내용을 선택했어요. 길게 누르거나 복사 메뉴를 사용해 주세요.';
    }
  });
}
