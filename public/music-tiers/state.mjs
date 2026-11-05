export const TIERS = ['S', 'A', 'B', 'C', 'D', 'unranked'];
export function emptyRows(month) {
  return Object.fromEntries(TIERS.map(tier => [tier, tier === 'unranked' ? month.tracks.map(t => t.id) : []]));
}
export function authorRows(month) {
  const rows = emptyRows(month); rows.unranked = [];
  for (const track of month.tracks) rows[TIERS.includes(track.tier) ? track.tier : 'unranked'].push(track.id);
  return rows;
}
export function validateState(value, month) {
  if (!value || value.v !== 1 || value.month !== month.month || value.revision !== month.revision) throw new Error('곡 목록 버전이 달라 불러올 수 없습니다.');
  const ids = new Set(month.tracks.map(t => t.id)), seen = new Set();
  if (!value.rows || TIERS.some(t => !Array.isArray(value.rows[t]))) throw new Error('티어 데이터 형식을 확인해 주세요.');
  const rows = Object.fromEntries(TIERS.map(tier => [tier, value.rows[tier].map(id => {
    if (typeof id !== 'string' || !ids.has(id) || seen.has(id)) throw new Error('알 수 없거나 중복된 곡이 있습니다.');
    seen.add(id); return id;
  })]));
  for (const id of ids) if (!seen.has(id)) rows.unranked.push(id);
  return rows;
}
export function moveTrack(rows, id, tier, beforeId) {
  if (!TIERS.includes(tier) || !TIERS.some(t => rows[t].includes(id))) return rows;
  if (id === beforeId) return rows;
  const next = Object.fromEntries(TIERS.map(t => [t, rows[t].filter(x => x !== id)]));
  const position = next[tier].indexOf(beforeId);
  next[tier].splice(position < 0 ? next[tier].length : position, 0, id); return next;
}
export function snapshot(month, rows) { return {v: 1, month: month.month, revision: month.revision, rows}; }
export function encodeState(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeState(token) {
  if (!token || token.length > 24000 || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('공유 링크 형식이 올바르지 않습니다.');
  const encoded = token.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))));
}
export function safeListenUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && ['open.spotify.com','www.youtube.com','youtube.com','youtu.be'].includes(u.hostname) ? u.href : null; } catch { return null; }
}
export function safeCoverPath(value) {
  return typeof value === 'string' && /^\/img\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|avif|gif)$/i.test(value) && !value.includes('..') ? value : null;
}
export function assertCatalog(catalog) {
  if(!Array.isArray(catalog))throw new Error('월별 케이팝 목록은 배열이어야 합니다.');
  const months=new Set();
  for(const month of catalog){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month.month)||months.has(month.month))throw new Error('발매 월이 잘못되었거나 중복되었습니다.');months.add(month.month);
    if(typeof month.revision!=='string'||!month.revision.trim()||month.revision.length>80)throw new Error(`${month.month}: 곡 목록 버전이 필요합니다.`);
    if(typeof month.published!=='boolean'||typeof month.demo!=='boolean')throw new Error(`${month.month}: 공개·가상 데이터 값을 확인하세요.`);
    if(!Array.isArray(month.tracks)||month.tracks.length>300)throw new Error(`${month.month}: 곡 수는 300곡 이하여야 합니다.`);
    const ids=new Set();
    for(const t of month.tracks){
      if(!/^[a-zA-Z0-9_-]{1,80}$/.test(t.id)||ids.has(t.id))throw new Error(`${month.month}: 곡 ID가 잘못되었거나 중복되었습니다.`);ids.add(t.id);
      if(typeof t.title!=='string'||!t.title.trim()||t.title.length>100||typeof t.artist!=='string'||!t.artist.trim()||t.artist.length>100||!TIERS.includes(t.tier))throw new Error(`${month.month}: 곡 제목·아티스트·평가를 확인하세요.`);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(t.released)||!t.released.startsWith(month.month)||isNaN(Date.parse(t.released))||new Date(t.released).toISOString().slice(0,10)!==t.released)throw new Error(`${month.month}: 곡의 발매일을 확인하세요.`);
      if(t.cover&&!safeCoverPath(t.cover))throw new Error(`${month.month}: 이미지는 /img/ 내부 파일이어야 합니다.`);
      if(t.listenUrl&&!safeListenUrl(t.listenUrl))throw new Error(`${month.month}: 공식 YouTube 또는 Spotify HTTPS 주소를 입력하세요.`);
    }
  }
  return catalog;
}
