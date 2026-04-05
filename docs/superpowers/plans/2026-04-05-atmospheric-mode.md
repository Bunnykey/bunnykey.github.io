# Atmospheric Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add atmospheric modes (Sunny, Moonlight, Rain) with CSS color shifts, video overlay, unified theme popover, and keyboard shortcuts.

**Architecture:** `data-atmosphere` attribute on `<html>` works independently from `data-theme`. CSS variables override in layers: base theme → atmosphere shift. Video overlay is progressive enhancement over CSS gradient fallback. Unified popover replaces the existing 3-way cycle ThemeToggle.

**Tech Stack:** Astro 5 (inline `<script is:inline>`), Tailwind CSS v4, vanilla CSS custom properties, HTML5 `<video>`, Playwright E2E tests.

**Spec:** `docs/superpowers/specs/2026-04-05-atmospheric-mode.md`

---

## File Map

| File | Role | Action |
|------|------|--------|
| `src/styles/global.css` | Atmosphere CSS variable overrides, overlay gradients, prose damping, body transition | Modify |
| `src/components/ThemeToggle.astro` | Unified popover (theme + atmosphere), keyboard shortcuts, video loader | Rewrite |
| `src/layouts/Layout.astro` | FOUC-prevention script (add atmosphere), `<video>` element slot | Modify |
| `tests/e2e/atmosphere.spec.ts` | E2E tests for atmosphere toggle, persistence, keyboard shortcuts | Create |

---

### Task 1: Atmosphere CSS Variables + Overlay Gradients

**Files:**
- Modify: `src/styles/global.css:164-208` (after dark theme block)

- [ ] **Step 1: Add atmosphere color shift overrides**

Append after the `[data-theme="dark"]` block (after line 208) in `src/styles/global.css`:

```css
/* ===== Atmosphere color shifts ===== */

/* Sunny — warm cream/olive shift */
:root[data-atmosphere="sunny"] {
  --color-surface: #fdf8f0;
  --color-surface-raised: #f5efe4;
  --color-accent: #5a7a3a;
  --color-foreground-muted: #7a7060;
}

[data-theme="dark"][data-atmosphere="sunny"] {
  --color-surface: #141208;
  --color-surface-raised: #1e1a10;
  --color-accent: #a0c060;
  --color-foreground-muted: #8a8060;
}

/* Moonlight — cool blue shift */
:root[data-atmosphere="moonlight"] {
  --color-surface: #f4f6fa;
  --color-surface-raised: #e8ecf4;
  --color-accent: #4a6a8a;
  --color-foreground: #1a1e2a;
  --color-foreground-muted: #606878;
}

[data-theme="dark"][data-atmosphere="moonlight"] {
  --color-surface: #0a0e14;
  --color-surface-raised: #10161e;
  --color-accent: #6a9ac4;
  --color-foreground: #c0cade;
  --color-foreground-muted: #6a7a8e;
}

/* Rain — desaturated cool gray shift */
:root[data-atmosphere="rain"] {
  --color-surface: #f2f4f5;
  --color-surface-raised: #e6e9ec;
  --color-accent: #5a7068;
  --color-foreground-muted: #6a7278;
  --color-outline-subtle: #d0d4d8;
}

[data-theme="dark"][data-atmosphere="rain"] {
  --color-surface: #0c0e10;
  --color-surface-raised: #141618;
  --color-accent: #6a8a80;
  --color-foreground-muted: #6a7278;
  --color-outline-subtle: #1e2224;
}
```

- [ ] **Step 2: Add CSS overlay gradients and body transition**

Append directly after the atmosphere color shifts:

```css
/* ===== Atmosphere overlays (CSS fallback) ===== */

body {
  transition: background-color 300ms ease, color 200ms ease;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0;
  transition: opacity 500ms;
}

[data-atmosphere="sunny"] body::after {
  background: linear-gradient(135deg, rgba(255, 220, 100, 0.06), transparent 60%);
  opacity: 1;
}

[data-atmosphere="moonlight"] body::after {
  background: linear-gradient(180deg, rgba(100, 140, 200, 0.05), transparent 70%);
  opacity: 1;
}

[data-atmosphere="rain"] body::after {
  background: linear-gradient(180deg, rgba(120, 140, 160, 0.06), transparent);
  opacity: 1;
}

/* ===== Video overlay ===== */

.atmosphere-video {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 50;
  opacity: 0;
  transition: opacity 800ms;
}

[data-atmosphere="sunny"] .atmosphere-video {
  mix-blend-mode: multiply;
  opacity: 0.2;
}

[data-atmosphere="moonlight"] .atmosphere-video {
  mix-blend-mode: screen;
  opacity: 0.15;
}

[data-atmosphere="rain"] .atmosphere-video {
  mix-blend-mode: multiply;
  opacity: 0.25;
}

/* ===== Prose damping ===== */

[data-atmosphere]:not([data-atmosphere="none"]) .greenhouse-prose {
  position: relative;
  z-index: 51;
}

[data-atmosphere]:not([data-atmosphere="none"]) .greenhouse-prose::before {
  content: '';
  position: absolute;
  inset: -1rem -2rem;
  background: var(--color-surface);
  opacity: 0.85;
  border-radius: 8px;
  z-index: -1;
}
```

- [ ] **Step 3: Verify Astro dev server renders atmosphere styles**

Run: `cd /Users/ralph/projects/the-greenhouse && npx astro build 2>&1 | tail -5`

Expected: Build succeeds with no CSS errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add atmosphere CSS variable overrides, overlay gradients, prose damping"
```

---

### Task 2: FOUC Prevention + Video Element in Layout

**Files:**
- Modify: `src/layouts/Layout.astro:45-66` (head inline script), `src/layouts/Layout.astro:103-104` (body opening)

- [ ] **Step 1: Update FOUC-prevention script to apply atmosphere**

In `src/layouts/Layout.astro`, replace the existing inline script (lines 45-66) with:

```html
<script is:inline>
  (function() {
    var saved = localStorage.getItem('theme');
    var savedAtmo = localStorage.getItem('atmosphere') || 'none';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    function resolve(pref) {
      if (pref === 'light') return 'light';
      if (pref === 'dark') return 'dark';
      return prefersDark.matches ? 'dark' : 'light';
    }
    function apply(resolved) {
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
      var meta = document.getElementById('meta-theme-color');
      if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0c120c' : '#faf9f6');
    }
    document.documentElement.dataset.atmosphere = savedAtmo;
    apply(resolve(saved));
    prefersDark.addEventListener('change', function() {
      var current = localStorage.getItem('theme');
      if (!current || current === 'system') apply(resolve('system'));
    });
  })();
</script>
```

- [ ] **Step 2: Add video element in body**

In `src/layouts/Layout.astro`, add the video element right after the opening `<body>` tag (after line 103):

```html
<body class="min-h-screen flex flex-col">
  <video
    id="atmosphere-video"
    class="atmosphere-video"
    muted
    playsinline
    autoplay
    loop
    aria-hidden="true"
  ></video>
  <a href="#main-content" class="skip-link">Skip to content</a>
```

The `<video>` has no `src` by default — ThemeToggle's JS sets it dynamically when an atmosphere is chosen and video loading conditions are met.

- [ ] **Step 3: Build to verify no errors**

Run: `cd /Users/ralph/projects/the-greenhouse && npx astro build 2>&1 | tail -5`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add atmosphere FOUC prevention and video element to Layout"
```

---

### Task 3: Unified ThemeToggle Popover

**Files:**
- Rewrite: `src/components/ThemeToggle.astro`

This is the largest task. The existing 103-line ThemeToggle (3-way cycle button + inline script) is replaced with a unified popover containing Theme selection + Atmosphere selection + keyboard shortcuts + video loading logic.

- [ ] **Step 1: Rewrite ThemeToggle.astro with popover HTML**

Replace the entire contents of `src/components/ThemeToggle.astro` with:

```astro
---
---
<div id="theme-popover-wrapper" class="relative">
  <button
    id="theme-toggle"
    class="p-1.5 text-foreground-muted hover:text-foreground transition-colors"
    aria-label="테마 및 분위기 설정"
    aria-haspopup="true"
    aria-expanded="false"
  >
    {/* Sun icon (light) */}
    <svg id="icon-sun" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    {/* Moon icon (dark) */}
    <svg id="icon-moon" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    {/* Monitor icon (system) */}
    <svg id="icon-monitor" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  </button>

  <div
    id="theme-popover"
    class="absolute right-0 top-full mt-2 w-52 rounded-xl border border-outline-subtle/30 bg-surface-raised shadow-lg opacity-0 invisible transition-all duration-200 z-[100]"
    role="menu"
    aria-label="테마 및 분위기 설정"
  >
    {/* Theme section */}
    <div class="px-3 pt-3 pb-2">
      <div class="text-[11px] uppercase tracking-wider text-foreground-faint mb-2">Theme</div>
      <div class="flex gap-1">
        <button data-set-theme="light" class="theme-option flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-surface-overlay transition-colors" role="menuitem">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span class="text-[11px] text-foreground-muted">Light</span>
        </button>
        <button data-set-theme="dark" class="theme-option flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-surface-overlay transition-colors" role="menuitem">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span class="text-[11px] text-foreground-muted">Dark</span>
        </button>
        <button data-set-theme="system" class="theme-option flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-surface-overlay transition-colors" role="menuitem">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="text-[11px] text-foreground-muted">System</span>
        </button>
      </div>
    </div>

    <div class="mx-3 border-t border-outline-subtle/20"></div>

    {/* Atmosphere section */}
    <div class="px-3 pt-2 pb-3">
      <div class="text-[11px] uppercase tracking-wider text-foreground-faint mb-1">Atmosphere</div>
      <button data-set-atmo="none" class="atmo-option w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-overlay transition-colors text-sm text-foreground-muted" role="menuitem">
        <span class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          None
        </span>
        <kbd class="text-[10px] px-1.5 py-0.5 bg-surface-overlay/50 rounded text-foreground-faint">N</kbd>
      </button>
      <button data-set-atmo="sunny" class="atmo-option w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-overlay transition-colors text-sm text-foreground-muted" role="menuitem">
        <span class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          Sunny
        </span>
        <kbd class="text-[10px] px-1.5 py-0.5 bg-surface-overlay/50 rounded text-foreground-faint">S</kbd>
      </button>
      <button data-set-atmo="moonlight" class="atmo-option w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-overlay transition-colors text-sm text-foreground-muted" role="menuitem">
        <span class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          Moonlight
        </span>
        <kbd class="text-[10px] px-1.5 py-0.5 bg-surface-overlay/50 rounded text-foreground-faint">M</kbd>
      </button>
      <button data-set-atmo="rain" class="atmo-option w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-overlay transition-colors text-sm text-foreground-muted" role="menuitem">
        <span class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>
          Rain
        </span>
        <kbd class="text-[10px] px-1.5 py-0.5 bg-surface-overlay/50 rounded text-foreground-faint">R</kbd>
      </button>
    </div>
  </div>
</div>

<script is:inline>
  (function() {
    var VIDEO_MAP = {
      sunny: '/videos/leaves.mp4',
      moonlight: '/videos/moon.mp4',
      rain: '/videos/rain.mp4',
    };

    function init() {
      var btn = document.getElementById('theme-toggle');
      var popover = document.getElementById('theme-popover');
      var wrapper = document.getElementById('theme-popover-wrapper');
      if (!btn || !popover || !wrapper || btn.dataset.initialized) return;
      btn.dataset.initialized = 'true';

      var icons = {
        light: document.getElementById('icon-sun'),
        dark: document.getElementById('icon-moon'),
        system: document.getElementById('icon-monitor'),
      };
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

      // --- Theme logic ---
      function getStoredTheme() {
        return localStorage.getItem('theme') || 'system';
      }

      function resolveTheme(pref) {
        if (pref === 'light') return 'light';
        if (pref === 'dark') return 'dark';
        return prefersDark.matches ? 'dark' : 'light';
      }

      function applyTheme(pref) {
        var resolved = resolveTheme(pref);
        document.documentElement.dataset.theme = resolved;
        document.documentElement.style.colorScheme = resolved;
        var meta = document.getElementById('meta-theme-color');
        if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0c120c' : '#faf9f6');
        updateTriggerIcon(pref);
        updateActiveStates();
      }

      function setTheme(pref) {
        localStorage.setItem('theme', pref);
        applyTheme(pref);
      }

      function updateTriggerIcon(pref) {
        Object.entries(icons).forEach(function(entry) {
          if (entry[1]) entry[1].classList.toggle('hidden', entry[0] !== pref);
        });
      }

      // --- Atmosphere logic ---
      function getStoredAtmo() {
        return localStorage.getItem('atmosphere') || 'none';
      }

      function applyAtmo(atmo) {
        document.documentElement.dataset.atmosphere = atmo;
        updateActiveStates();
        loadVideo(atmo);
      }

      function setAtmo(atmo) {
        localStorage.setItem('atmosphere', atmo);
        applyAtmo(atmo);
      }

      // --- Video loading ---
      function shouldLoadVideo() {
        if (navigator.connection && navigator.connection.saveData) return false;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        return true;
      }

      function loadVideo(atmo) {
        var video = document.getElementById('atmosphere-video');
        if (!video) return;
        if (atmo === 'none' || !VIDEO_MAP[atmo] || !shouldLoadVideo()) {
          video.removeAttribute('src');
          video.load();
          return;
        }
        var src = VIDEO_MAP[atmo];
        if (video.getAttribute('src') !== src) {
          video.src = src;
          video.load();
          video.play().catch(function() {});
        }
      }

      // Tab visibility — pause/resume video
      document.addEventListener('visibilitychange', function() {
        var video = document.getElementById('atmosphere-video');
        if (!video || !video.src) return;
        if (document.hidden) { video.pause(); }
        else { video.play().catch(function() {}); }
      });

      // --- Active state highlighting ---
      function updateActiveStates() {
        var currentTheme = getStoredTheme();
        var currentAtmo = getStoredAtmo();
        document.querySelectorAll('[data-set-theme]').forEach(function(el) {
          var isActive = el.getAttribute('data-set-theme') === currentTheme;
          el.classList.toggle('bg-surface-overlay', isActive);
          el.classList.toggle('text-foreground', isActive);
        });
        document.querySelectorAll('[data-set-atmo]').forEach(function(el) {
          var isActive = el.getAttribute('data-set-atmo') === currentAtmo;
          el.classList.toggle('bg-surface-overlay', isActive);
          el.classList.toggle('text-foreground', isActive);
        });
      }

      // --- Popover logic ---
      var isOpen = false;

      function openPopover() {
        popover.classList.remove('opacity-0', 'invisible');
        popover.classList.add('opacity-100', 'visible');
        btn.setAttribute('aria-expanded', 'true');
        isOpen = true;
      }

      function closePopover() {
        popover.classList.add('opacity-0', 'invisible');
        popover.classList.remove('opacity-100', 'visible');
        btn.setAttribute('aria-expanded', 'false');
        isOpen = false;
      }

      function togglePopover() {
        isOpen ? closePopover() : openPopover();
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePopover();
      });

      // Close on outside click
      document.addEventListener('click', function(e) {
        if (isOpen && !wrapper.contains(e.target)) closePopover();
      });

      // Close on Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) closePopover();
      });

      // --- Theme button clicks ---
      document.querySelectorAll('[data-set-theme]').forEach(function(el) {
        el.addEventListener('click', function() {
          setTheme(el.getAttribute('data-set-theme'));
        });
      });

      // --- Atmosphere button clicks ---
      document.querySelectorAll('[data-set-atmo]').forEach(function(el) {
        el.addEventListener('click', function() {
          setAtmo(el.getAttribute('data-set-atmo'));
          closePopover();
        });
      });

      // --- Keyboard shortcuts (global) ---
      document.addEventListener('keydown', function(e) {
        var tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (document.activeElement && document.activeElement.getAttribute('contenteditable')) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        switch (e.key.toLowerCase()) {
          case 'd':
            var current = resolveTheme(getStoredTheme());
            setTheme(current === 'dark' ? 'light' : 'dark');
            break;
          case 's': setAtmo('sunny'); break;
          case 'n': setAtmo('none'); break;
          case 'm': setAtmo('moonlight'); break;
          case 'r': setAtmo('rain'); break;
        }
      });

      // --- OS theme change sync ---
      prefersDark.addEventListener('change', function() {
        var stored = getStoredTheme();
        if (stored === 'system') applyTheme('system');
      });

      // --- Initialize ---
      applyTheme(getStoredTheme());
      applyAtmo(getStoredAtmo());
    }

    document.addEventListener('astro:page-load', init);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
</script>
```

- [ ] **Step 2: Build to verify no errors**

Run: `cd /Users/ralph/projects/the-greenhouse && npx astro build 2>&1 | tail -5`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: replace ThemeToggle with unified popover (theme + atmosphere)"
```

---

### Task 4: E2E Tests for Atmosphere Mode

**Files:**
- Create: `tests/e2e/atmosphere.spec.ts`

- [ ] **Step 1: Write E2E test file**

Create `tests/e2e/atmosphere.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Atmospheric Mode', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for toggle initialization
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });
    // Reset state
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });
  });

  test('popover opens and closes', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const popover = page.locator('#theme-popover');

    // Initially closed
    await expect(popover).toHaveClass(/invisible/);

    // Click to open
    await toggle.click();
    await expect(popover).toHaveClass(/visible/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Click outside to close
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(popover).toHaveClass(/invisible/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('popover closes on Escape', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const popover = page.locator('#theme-popover');

    await toggle.click();
    await expect(popover).toHaveClass(/visible/);

    await page.keyboard.press('Escape');
    await expect(popover).toHaveClass(/invisible/);
  });

  test('theme selection works in popover', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const html = page.locator('html');

    await toggle.click();
    await page.locator('[data-set-theme="dark"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');

    // Clean up
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });
  });

  test('atmosphere selection sets data-atmosphere and persists', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const html = page.locator('html');

    // Select sunny
    await toggle.click();
    await page.locator('[data-set-atmo="sunny"]').click();
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    const stored = await page.evaluate(() => localStorage.getItem('atmosphere'));
    expect(stored).toBe('sunny');

    // Persists after reload
    await page.reload();
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });
  });

  test('keyboard shortcuts change atmosphere', async ({ page }) => {
    const html = page.locator('html');

    await page.keyboard.press('s');
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    await page.keyboard.press('m');
    await expect(html).toHaveAttribute('data-atmosphere', 'moonlight');

    await page.keyboard.press('r');
    await expect(html).toHaveAttribute('data-atmosphere', 'rain');

    await page.keyboard.press('n');
    await expect(html).toHaveAttribute('data-atmosphere', 'none');
  });

  test('D key toggles dark mode', async ({ page }) => {
    const html = page.locator('html');

    // Set known state
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });

    await page.keyboard.press('d');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.keyboard.press('d');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('keyboard shortcuts ignored when input focused', async ({ page }) => {
    // Navigate to a page with an input
    await page.goto('/gardener/');
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });

    const html = page.locator('html');
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });

    // Focus on input and type 's'
    const input = page.getByRole('textbox', { name: /name/i });
    await input.focus();
    await page.keyboard.press('s');

    // Atmosphere should NOT change
    await expect(html).toHaveAttribute('data-atmosphere', 'none');
  });

  test('atmosphere CSS overlay is applied', async ({ page }) => {
    await page.keyboard.press('s');

    // body::after should have a non-zero opacity via the [data-atmosphere="sunny"] rule
    const afterOpacity = await page.evaluate(() => {
      const style = getComputedStyle(document.body, '::after');
      return style.opacity;
    });
    expect(afterOpacity).toBe('1');
  });

});
```

- [ ] **Step 2: Run E2E tests to verify they pass**

Run: `cd /Users/ralph/projects/the-greenhouse && npx playwright test tests/e2e/atmosphere.spec.ts --reporter=list 2>&1 | tail -20`

Expected: All 8 tests pass. If the build hasn't been run yet, Playwright's webServer config will trigger `npm run build && npm run preview` automatically.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/atmosphere.spec.ts
git commit -m "test: add E2E tests for atmospheric mode popover and shortcuts"
```

---

### Task 5: Update Existing E2E Test for New Toggle

**Files:**
- Modify: `tests/e2e/greenhouse.spec.ts:6-35` (S1 test)

The existing S1 test clicks the old cycle toggle. It needs updating for the new popover-based toggle.

- [ ] **Step 1: Update S1 dark mode test**

Replace the S1 test (lines 6-35 in `tests/e2e/greenhouse.spec.ts`) with:

```typescript
  // S1: 다크모드 토글 (popover)
  test('S1: dark mode toggle via popover and persists', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });

    // Open popover, click dark
    await toggle.click();
    await page.locator('[data-set-theme="dark"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Persist after reload
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Clean up
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });
  });
```

- [ ] **Step 2: Run existing E2E suite to verify no regressions**

Run: `cd /Users/ralph/projects/the-greenhouse && npx playwright test --reporter=list 2>&1 | tail -25`

Expected: All tests pass (both greenhouse.spec.ts and atmosphere.spec.ts).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/greenhouse.spec.ts
git commit -m "test: update S1 dark mode test for popover-based toggle"
```

---

### Task 6: Create Placeholder Video Directory

**Files:**
- Create: `public/videos/.gitkeep`

The video files (leaves.mp4, moon.mp4, rain.mp4) will be sourced later. Create the directory structure so the video loading code has a valid path prefix and future drop-in is straightforward.

- [ ] **Step 1: Create videos directory with gitkeep**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/public/videos
touch /Users/ralph/projects/the-greenhouse/public/videos/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add public/videos/.gitkeep
git commit -m "chore: add placeholder videos directory for atmospheric mode assets"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Full build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds.

- [ ] **Step 2: Run all tests**

Run: `cd /Users/ralph/projects/the-greenhouse && npx playwright test --reporter=list 2>&1 | tail -30`

Expected: All E2E tests pass (greenhouse.spec.ts + atmosphere.spec.ts).

- [ ] **Step 3: Run unit tests**

Run: `cd /Users/ralph/projects/the-greenhouse && npm test 2>&1`

Expected: All unit tests pass (no changes to unit-tested code).

- [ ] **Step 4: Manual smoke test checklist**

Verify in browser at `http://localhost:4321`:
- [ ] Click theme toggle → popover opens with Theme + Atmosphere sections
- [ ] Select Dark → page goes dark, popover highlights Dark
- [ ] Select Sunny → warm color shift visible, body::after gradient appears
- [ ] Select Moonlight → cool blue shift visible
- [ ] Select Rain → desaturated cool shift visible
- [ ] Press N → atmosphere resets to none
- [ ] Press D → dark mode toggles
- [ ] Keyboard shortcuts ignored when typing in search/contact form
- [ ] Reload → both theme and atmosphere persist
- [ ] Prose content area has subtle surface background behind it (damping)
