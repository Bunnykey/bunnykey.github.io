# Critical Frontend Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 critical frontend issues — ContactForm, mobile menu, dark mode, 404 page.

**Architecture:** All changes are within the existing Astro 5 + Tailwind 4 stack. Dark mode uses CSS variable overrides on `[data-theme]`. Mobile menu and theme toggle are pure Astro components with inline `<script>`. No new dependencies.

**Tech Stack:** Astro 5, Tailwind CSS 4, React 19 (ContactForm only), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-critical-frontend-fixes-design.md`

**Testing strategy:** No unit test framework in project. Verify via `npm run build` (must succeed) + `npm run dev` visual checks. Each task ends with a build verification step.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/ContactForm.tsx` | Modify | Fix form action, inline styles → Tailwind |
| `src/components/Navbar.astro` | Modify | Add hamburger drawer + theme toggle slot |
| `src/components/ThemeToggle.astro` | Create | 3-way theme toggle with inline SVG icons |
| `src/styles/global.css` | Modify | Dark color tokens + Typography dark overrides |
| `src/layouts/Layout.astro` | Modify | FOUC prevention script, dynamic meta tags |
| `src/pages/404.astro` | Create | Custom 404 with section navigation |

---

### Task 1: ContactForm — Fix action URL and refactor styles

**Files:**
- Modify: `src/components/ContactForm.tsx`

- [ ] **Step 1: Replace the entire file with Tailwind-based implementation**

Replace the full contents of `src/components/ContactForm.tsx` with:

```tsx
import { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

function SubmitButton({ state }: { state: FormState }) {
  const label = state === 'success' ? 'Message sent!'
    : state === 'submitting' ? 'Sending...'
    : 'Send message';

  return (
    <button
      type="submit"
      disabled={state === 'submitting'}
      className="w-full py-3 bg-primary text-on-primary text-sm font-medium rounded-md transition-opacity disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
    >
      {label}
    </button>
  );
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;

    try {
      const res = await fetch(form.action, {
        method: 'POST', body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed');
      setState('success');
      form.reset();
    } catch {
      setState('error');
    }
  }

  return (
    <form action="https://formspree.io/f/mbdzepdo" method="POST" onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6">
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-[0.7rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2">Name</label>
          <input id="name" type="text" name="name" required className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors" />
        </div>
        <div>
          <label htmlFor="email" className="block text-[0.7rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
          <input id="email" type="email" name="email" required className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors" />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="message" className="block text-[0.7rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2">Message</label>
        <textarea id="message" name="message" required rows={4} placeholder="Start your message..." className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors resize-none" />
      </div>

      {state === 'error' && (
        <p className="text-xs text-error mb-3">
          메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.
        </p>
      )}

      <SubmitButton state={state} />
    </form>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactForm.tsx
git commit -m "fix: replace ContactForm placeholder with real Formspree ID and convert to Tailwind"
```

---

### Task 2: Mobile Menu — Hamburger Drawer

**Files:**
- Modify: `src/components/Navbar.astro`

- [ ] **Step 1: Restructure Navbar markup**

Replace the current single `<div class="flex items-center gap-6 ...">` with:
1. Desktop nav: wrap existing links in a container hidden below `md:` → `class="hidden md:flex items-center gap-8"`
2. Hamburger button: visible below `md:` only → `class="md:hidden"`
3. Drawer panel: full-width dropdown below the nav bar

```astro
---
import { SITE } from '../consts/site';

const currentPath = Astro.url.pathname;

const navLinks = [
  { label: 'Flora', href: '/flora/' },
  { label: 'Nursery', href: '/nursery/' },
  { label: 'Seeds', href: '/seeds/' },
  { label: 'The Gardener', href: '/gardener/' },
];
---

<nav class="relative px-6 md:px-10 py-6 bg-surface-container-low" aria-label="Main navigation">
  <div class="flex items-center justify-between">
    <a href="/" class="text-lg font-semibold tracking-tight text-on-surface hover:opacity-80 transition-opacity">
      {SITE.name}
    </a>

    <div class="flex items-center gap-4">
      {/* Desktop nav */}
      <div class="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = currentPath.startsWith(link.href);
          return (
            <a
              href={link.href}
              class:list={[
                'text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'text-on-surface font-medium'
                  : 'text-on-surface-variant hover:text-on-surface',
              ]}
              aria-current={isActive ? 'page' : undefined}
            >
              {link.label}
            </a>
          );
        })}
      </div>

      {/* Theme toggle slot — added in Task 4 */}

      {/* Hamburger button */}
      <button
        id="menu-toggle"
        class="md:hidden flex flex-col justify-center gap-1.5 w-6 h-6"
        aria-expanded="false"
        aria-controls="mobile-drawer"
        aria-label="메뉴"
      >
        <span class="block w-full h-0.5 bg-on-surface transition-transform origin-center"></span>
        <span class="block w-full h-0.5 bg-on-surface transition-opacity"></span>
        <span class="block w-full h-0.5 bg-on-surface transition-transform origin-center"></span>
      </button>
    </div>
  </div>

  {/* Mobile drawer */}
  <div
    id="mobile-drawer"
    class="nav-drawer md:hidden overflow-hidden max-h-0 opacity-0 transition-all duration-300 ease-in-out"
  >
    <div class="pt-4 pb-2 flex flex-col">
      {navLinks.map((link) => {
        const isActive = currentPath.startsWith(link.href);
        return (
          <a
            href={link.href}
            class:list={[
              'py-3 text-sm transition-colors border-b border-outline-variant/10',
              isActive
                ? 'text-on-surface font-medium'
                : 'text-on-surface-variant hover:text-on-surface',
            ]}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Add toggle script and CSS**

Add inline `<script>` at the bottom of `Navbar.astro`:

```astro
<script>
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (toggle && drawer) {
    function open() {
      drawer.classList.remove('max-h-0', 'opacity-0');
      drawer.classList.add('max-h-64', 'opacity-100');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      drawer.classList.add('max-h-0', 'opacity-0');
      drawer.classList.remove('max-h-64', 'opacity-100');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }
    toggle.addEventListener('click', () => isOpen() ? close() : open());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) close();
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !toggle.contains(e.target) && !drawer.contains(e.target)) close();
    });
  }
</script>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "feat: add hamburger drawer for mobile navigation"
```

---

### Task 3: Dark Mode — CSS Tokens and FOUC Script

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add dark token overrides to global.css**

After the `@layer base` block, add a single `[data-theme="dark"]` rule with all CSS custom property overrides (color tokens + Typography) in one block:

```css
[data-theme="dark"] {
  /* Surface hierarchy */
  --color-surface: #111411;
  --color-surface-dim: #0d0f0d;
  --color-surface-container: #1a1d1a;
  --color-surface-container-low: #151815;
  --color-surface-container-high: #222522;
  --color-surface-container-highest: #2a2d2a;
  --color-surface-container-lowest: #0a0c0a;

  /* Primary */
  --color-primary: #a8adb0;
  --color-primary-dim: #9a9fa2;
  --color-primary-container: #2a2e32;
  --color-on-primary: #1a1e22;

  /* Secondary */
  --color-secondary: #8aab86;
  --color-secondary-container: #2a3a28;
  --color-on-secondary-container: #c0d4bc;

  /* Tertiary */
  --color-tertiary: #c49a6c;
  --color-tertiary-container: #3a2a18;

  /* Text */
  --color-on-surface: #e0e4de;
  --color-on-surface-variant: #9a9e9a;

  /* Borders */
  --color-outline: #5c605c;
  --color-outline-variant: #3a3e3a;

  /* Error */
  --color-error: #e07a62;

  /* Tailwind Typography overrides */
  --tw-prose-body: #e0e4de;
  --tw-prose-headings: #e0e4de;
  --tw-prose-links: #8aab86;
  --tw-prose-bold: #e0e4de;
  --tw-prose-code: #e0e4de;
  --tw-prose-pre-bg: #151815;
  --tw-prose-pre-code: #e0e4de;
  --tw-prose-quotes: #9a9e9a;
  --tw-prose-counters: #9a9e9a;
  --tw-prose-bullets: #5c605c;
  --tw-prose-hr: #3a3e3a;
  --tw-prose-th-borders: #3a3e3a;
  --tw-prose-td-borders: #2a2d2a;
}
```

- [ ] **Step 2: Add FOUC prevention script to Layout.astro**

In `src/layouts/Layout.astro`:

1. Replace the static `<meta name="theme-color" content="#faf9f6" />` with:

```html
<meta name="theme-color" id="meta-theme-color" content="#faf9f6" />
```

2. Add this script immediately after `<meta charset="UTF-8" />` (before any stylesheets load, for true FOUC prevention):

```html
<script is:inline>
  (function() {
    var saved = localStorage.getItem('theme');
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
      if (meta) meta.setAttribute('content', resolved === 'dark' ? '#111411' : '#faf9f6');
    }
    apply(resolve(saved));
    prefersDark.addEventListener('change', function() {
      var current = localStorage.getItem('theme');
      if (!current || current === 'system') apply(resolve('system'));
    });
  })();
</script>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro
git commit -m "feat: add dark mode with CSS variable overrides and FOUC prevention"
```

---

### Task 4: Dark Mode — Three-way Theme Toggle Component

**Files:**
- Create: `src/components/ThemeToggle.astro`
- Modify: `src/components/Navbar.astro`

- [ ] **Step 1: Create ThemeToggle.astro**

```astro
---
---
<button
  id="theme-toggle"
  class="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
  aria-label="테마 변경"
  title="테마 변경"
>
  {/* Sun icon — shown when current theme is light (click → dark) */}
  <svg id="icon-sun" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
  {/* Moon icon — shown when current theme is dark (click → system) */}
  <svg id="icon-moon" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
  {/* Monitor icon — shown when current theme is system (click → light) */}
  <svg id="icon-monitor" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
</button>

<script>
  const btn = document.getElementById('theme-toggle');
  const icons = {
    light: document.getElementById('icon-sun'),
    dark: document.getElementById('icon-moon'),
    system: document.getElementById('icon-monitor'),
  };
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getStored(): string {
    return localStorage.getItem('theme') || 'system';
  }

  function resolve(pref: string): string {
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    return prefersDark.matches ? 'dark' : 'light';
  }

  function apply(pref: string) {
    const resolved = resolve(pref);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#111411' : '#faf9f6');
    // Update icon visibility
    Object.values(icons).forEach(el => el?.classList.add('hidden'));
    icons[pref as keyof typeof icons]?.classList.remove('hidden');
  }

  function cycle() {
    const order = ['light', 'dark', 'system'];
    const current = getStored();
    const next = order[(order.indexOf(current) + 1) % order.length];
    localStorage.setItem('theme', next);
    apply(next);
  }

  btn?.addEventListener('click', cycle);

  // Sync when OS theme changes (only applies in system mode)
  prefersDark.addEventListener('change', () => {
    const stored = getStored();
    if (stored === 'system') apply('system');
  });

  // Initialize icon on load
  apply(getStored());
</script>
```

- [ ] **Step 2: Add ThemeToggle to Navbar**

In `src/components/Navbar.astro`, import and place the toggle:

```astro
---
import { SITE } from '../consts/site';
import ThemeToggle from './ThemeToggle.astro';
// ... rest of frontmatter
---
```

Place `<ThemeToggle />` inside the `<div class="flex items-center gap-4">`, between the desktop nav and the hamburger button:

```astro
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Hamburger button */}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Visual verification**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run dev
```

Check at `http://localhost:4321`:
- Theme toggle cycles through sun → moon → monitor icons
- Dark mode applies green-black palette across all pages
- Light mode restores original warm palette
- System mode follows OS preference
- Refresh preserves choice (no FOUC)
- Prose content (blog posts, privacy page) is readable in dark mode

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeToggle.astro src/components/Navbar.astro
git commit -m "feat: add three-way theme toggle (light/dark/system)"
```

---

### Task 5: 404 Page — With Navigation

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create the 404 page**

```astro
---
import Layout from '../layouts/Layout.astro';
import { SECTION_INDEX_CONFIG, SECTION_KEYS } from '../consts/sections';
---

<Layout title="404 - The Greenhouse">
  <div class="max-w-md mx-auto px-6 py-32 md:py-40 text-center">
    <h1 class="text-6xl md:text-7xl font-medium tracking-tight text-on-surface">
      404
    </h1>
    <p class="mt-4 text-base text-on-surface-variant">
      이 페이지는 아직 싹이 트지 않았습니다.
    </p>

    <div class="mt-12 text-left">
      <p class="text-xs uppercase tracking-widest text-on-surface-variant mb-4">
        둘러보기
      </p>
      <div class="flex flex-col">
        {SECTION_KEYS.map((key) => {
          const section = SECTION_INDEX_CONFIG[key];
          return (
            <a
              href={`/${key}/`}
              class="py-3 border-b border-outline-variant/20 group transition-colors"
            >
              <span class="text-sm font-medium text-secondary group-hover:text-secondary/80">
                {section.heading}
              </span>
              <span class="block text-xs text-on-surface-variant mt-0.5">
                {section.description}
              </span>
            </a>
          );
        })}
      </div>
    </div>

    <div class="mt-8">
      <a href="/" class="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
        ← 홈으로 돌아가기
      </a>
    </div>
  </div>
</Layout>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds. Check `dist/404.html` exists:

```bash
ls /Users/ralph/projects/the-greenhouse/dist/404.html
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add custom 404 page with section navigation"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Clean build**

```bash
cd /Users/ralph/projects/the-greenhouse && rm -rf dist && npm run build
```

Expected: Build succeeds with no warnings.

- [ ] **Step 2: Visual smoke test with dev server**

```bash
npm run dev
```

Check at `http://localhost:4321`:
1. **ContactForm** (`/gardener/`): form fields render, submit button visible, responsive grid stacks on mobile
2. **Mobile menu**: resize to < 768px, hamburger appears, click opens drawer, Escape closes
3. **Dark mode**: toggle cycles light → dark → system, all pages readable, prose content styled
4. **404**: navigate to `/nonexistent/`, custom page renders with section links and generous spacing

- [ ] **Step 3: Final commit (if any fixes needed)**

Only if adjustments were made during smoke test.
