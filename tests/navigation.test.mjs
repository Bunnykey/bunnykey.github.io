import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('../src/components/Navbar.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

test('mobile navigation opens, closes on Escape and navigation, and disables hidden links', () => {
  const dom = new JSDOM(`<button id="menu-toggle" aria-expanded="false">Menu</button><div id="mobile-drawer" inert aria-hidden="true"><a href="/topics/notes/">Notes</a></div>`, { runScripts: 'outside-only' });
  const { document, MouseEvent, KeyboardEvent, Event } = dom.window;
  dom.window.eval(script);
  document.dispatchEvent(new Event('DOMContentLoaded'));
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  assert.equal(drawer.inert, true);
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(drawer.getAttribute('aria-hidden'), 'false');
  assert.equal(drawer.inert, false);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(drawer.inert, true);
  assert.equal(document.activeElement, toggle);
  toggle.click();
  drawer.querySelector('a').addEventListener('click', event => event.preventDefault());
  drawer.querySelector('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  toggle.click();
  document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(drawer.inert, true);
  dom.window.close();
});
