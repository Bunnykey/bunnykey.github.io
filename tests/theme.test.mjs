import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const source = readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');
function setup(saved, blocked = false) {
  const dom = new JSDOM('<meta id="meta-theme-color"><details id="theme-picker"><summary>Theme</summary><input name="reading-theme" type="radio" value="light"><input name="reading-theme" type="radio" value="dark"><input name="reading-theme" type="radio" value="system"></details>', { url: 'https://example.com', runScripts: 'outside-only' });
  const w = dom.window;
  let listener;
  const media = { matches: true, addEventListener: (_, fn) => { listener = fn; } };
  w.matchMedia = () => media;
  if (saved) w.localStorage.setItem('reading-theme', saved);
  if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw Error('blocked'); } });
  w.eval(source);
  return { dom, w, changeSystem(dark) { media.matches = dark; listener(); }, choose(value) { const input = w.document.querySelector(`input[value="${value}"]`); input.checked = true; input.dispatchEvent(new w.Event('change', { bubbles: true })); } };
}
test('system preference follows OS; explicit choice persists and overrides OS', () => {
  const x = setup(); const root = x.w.document.documentElement;
  assert.equal(root.dataset.theme, 'dark');
  x.changeSystem(false); assert.equal(root.dataset.theme, 'light');
  x.choose('dark'); assert.equal(x.w.localStorage.getItem('reading-theme'), 'dark');
  x.changeSystem(false); assert.equal(root.dataset.theme, 'dark');
  x.choose('system'); assert.equal(root.dataset.theme, 'light');
  x.changeSystem(true); assert.equal(root.dataset.theme, 'dark');
  x.dom.window.close();
});
test('saved preference is applied before paint and carried to Astro navigation', () => {
  const x = setup('light'); assert.equal(x.w.document.documentElement.dataset.theme, 'light');
  const incoming = x.w.document.implementation.createHTMLDocument();
  const event = new x.w.Event('astro:before-swap'); event.newDocument = incoming;
  x.w.document.dispatchEvent(event);
  assert.equal(incoming.documentElement.dataset.theme, 'light');
  const picker = x.w.document.getElementById('theme-picker'); picker.open = true;
  x.w.document.dispatchEvent(new x.w.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(picker.open, false); assert.equal(x.w.document.activeElement.tagName, 'SUMMARY');
  x.dom.window.close();
});
test('unavailable storage and invalid preferences fall back safely', () => {
  for (const x of [setup('garbage'), setup(null, true)]) {
    assert.equal(x.w.document.documentElement.dataset.theme, 'dark');
    x.choose('light'); assert.equal(x.w.document.documentElement.dataset.theme, 'light');
    x.dom.window.close();
  }
});
