/** Shared, allowlisted media rendering for Astro and the writing studio. */
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseMedia(value) {
  let u; try { u = new URL(value.trim()); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
  const host = u.hostname.toLowerCase();
  if (host === 'open.spotify.com') {
    const m = u.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]{22})\/?$/);
    if (m) return { provider:'Spotify', url:`https://open.spotify.com/${m[1]}/${m[2]}`, src:`https://open.spotify.com/embed/${m[1]}/${m[2]}`, height:m[1] === 'track' ? 152 : 352 };
  }
  if (['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/)?.[1];
    if (/^[\w-]{11}$/.test(id || '')) return { provider:'YouTube', url:`https://www.youtube.com/watch?v=${id}`, src:`https://www.youtube-nocookie.com/embed/${id}`, height:360 };
  }
  if (host === 'github.com') {
    const m = u.pathname.match(/^\/([\w-]+)\/([\w.-]+)(?:\/(?:issues|pull)\/\d+)?\/?$/);
    if (m && m[2] !== '.' && m[2] !== '..') return { provider:'GitHub', url:u.origin+u.pathname.replace(/\/$/,''), label:`${m[1]} / ${m[2]}` };
  }
  return null;
}
export function renderMedia(value) {
  const m = parseMedia(value);
  if (!m) return `<p>지원하지 않는 미디어 주소: ${escapeHtml(value)}</p>`;
  const e = escapeHtml;
  const frame = m.src ? `<iframe src="${e(m.src)}" title="${m.provider} 플레이어" width="100%" height="${m.height}" style="border:0;${m.provider === 'YouTube' ? 'aspect-ratio:16/9;height:auto;' : ''}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<strong style="display:block;font-size:1.2em">${e(m.label)}</strong><span>저장소와 코드 살펴보기 ↗</span>`;
  return `<figure class="media-card" data-provider="${m.provider}" style="margin:1.5em 0;padding:16px;border:1px solid #879b8540;border-radius:14px;overflow:hidden"><div style="font-size:12px;opacity:.7;margin-bottom:10px">${m.provider}</div>${m.src ? frame : `<a href="${e(m.url)}" target="_blank" rel="noopener noreferrer">${frame}</a>`}<figcaption style="font-size:12px;margin-top:8px"><a href="${e(m.url)}" target="_blank" rel="noopener noreferrer">${m.provider}에서 열기 ↗</a></figcaption></figure>`;
}
