# Design System Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the-greenhouse's color token system from Material Design naming to semantic naming, fix dark mode readability, and prepare for Phase 2 atmospheric modes.

**Architecture:** Replace 7-level surface hierarchy with 4 levels, promote sage (secondary) to accent role, delete unused primary tokens. Dark mode gets green-tinted deep forest palette inspired by shadcn Maia. All token renames are mechanical find-replace within Tailwind classes across ~20 files.

**Tech Stack:** Astro 5, Tailwind CSS 4 (@theme), TypeScript, Playwright (E2E verification)

**Spec:** `docs/superpowers/specs/2026-04-05-design-system-overhaul.md`

---

## Token Migration Map

Reference for all tasks. Old class → new class:

| Old Tailwind class | New Tailwind class |
|---|---|
| `bg-surface-container-low` | `bg-surface-raised` |
| `bg-surface-container-high` | `bg-surface-overlay` |
| `bg-surface-container` | `bg-surface-overlay` |
| `bg-surface-container-highest` | `bg-surface-overlay` |
| `bg-surface-container-lowest` | `bg-surface` |
| `text-on-surface` | `text-foreground` |
| `bg-on-surface` | `bg-foreground` |
| `text-on-surface-variant` | `text-foreground-muted` |
| `text-on-surface-variant/70` | `text-foreground-muted/70` |
| `text-secondary` | `text-accent` |
| `text-secondary/80` | `text-accent/80` |
| `bg-secondary-container` | `bg-accent-muted` |
| `bg-secondary-container/30` | `bg-accent-muted/30` |
| `bg-secondary-container/10` | `bg-accent-muted/10` |
| `text-on-secondary-container` | `text-accent-on-muted` |
| `border-secondary-container` | `border-accent-muted` |
| `border-secondary` | `border-accent` |
| `hover:border-secondary` | `hover:border-accent` |
| `focus:border-secondary` | `focus:border-accent` |
| `hover:text-secondary` | `hover:text-accent` |
| `hover:text-secondary/80` | `hover:text-accent/80` |
| `bg-secondary` | `bg-accent` |
| `text-tertiary` | `text-earth` |
| `bg-tertiary-container` | `bg-earth-muted` |
| `bg-tertiary-container/30` | `bg-earth-muted/30` |
| `bg-tertiary-container/50` | `bg-earth-muted/50` |
| `text-tertiary-container` | `text-earth-muted` |
| `border-outline-variant` | `border-outline-subtle` |
| `border-outline-variant/10` | `border-outline-subtle/10` |
| `border-outline-variant/20` | `border-outline-subtle/20` |
| `border-outline-variant/30` | `border-outline-subtle/30` |
| `bg-primary` | `bg-accent` |
| `text-on-primary` | `text-surface` |

---

### Task 1: Redefine tokens in global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace @theme block with new token definitions**

Replace the entire `@theme { ... }` block:

```css
@theme {
  /* Surface hierarchy (4 levels) */
  --color-surface: #faf9f6;
  --color-surface-raised: #f0ede7;
  --color-surface-overlay: #e5e2db;
  --color-surface-sunken: #ece9e2;

  /* Accent (sage — promoted from secondary) */
  --color-accent: #4a6741;
  --color-accent-muted: #d7e7d3;
  --color-accent-on-muted: #3a5234;

  /* Earth (tertiary) */
  --color-earth: #7e572e;
  --color-earth-muted: #e8d4be;

  /* Foreground (text) */
  --color-foreground: #1a1f1a;
  --color-foreground-muted: #6b7168;
  --color-foreground-faint: #9a9e96;

  /* Outline (borders) */
  --color-outline: #777c77;
  --color-outline-subtle: #d8d5cf;

  /* Error */
  --color-error: #9e422c;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
}
```

- [ ] **Step 2: Replace `[data-theme="dark"]` block with new dark mode palette**

Replace the entire `[data-theme="dark"] { ... }` block:

```css
[data-theme="dark"] {
  /* Surface — deep forest green tint */
  --color-surface: #0c120c;
  --color-surface-raised: #141e14;
  --color-surface-overlay: #1e2a1e;
  --color-surface-sunken: #0a0f0a;

  /* Accent (sage, brightened for dark bg) */
  --color-accent: #7aad74;
  --color-accent-muted: #1e3018;
  --color-accent-on-muted: #7aad74;

  /* Earth (warm, brightened) */
  --color-earth: #c49a6c;
  --color-earth-muted: #2a1e10;

  /* Foreground — brightness raised for readability */
  --color-foreground: #d0daca;
  --color-foreground-muted: #7a8a74;
  --color-foreground-faint: #4a5a44;

  /* Outline */
  --color-outline: #3a4a3a;
  --color-outline-subtle: #1e2a1e;

  /* Error */
  --color-error: #e07a62;

  /* Tailwind Typography overrides */
  --tw-prose-body: #d0daca;
  --tw-prose-headings: #d0daca;
  --tw-prose-links: #7aad74;
  --tw-prose-bold: #d0daca;
  --tw-prose-code: #d0daca;
  --tw-prose-pre-bg: #0a0f0a;
  --tw-prose-pre-code: #d0daca;
  --tw-prose-quotes: #7a8a74;
  --tw-prose-counters: #7a8a74;
  --tw-prose-bullets: #3a4a3a;
  --tw-prose-hr: #1e2a1e;
  --tw-prose-th-borders: #1e2a1e;
  --tw-prose-td-borders: #1e2a1e;
}
```

- [ ] **Step 3: Update base styles and utility classes**

Update `@layer base` — change CSS variable references:

```css
body {
  background-color: var(--color-surface);
  color: var(--color-foreground);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
}

::selection {
  background: color-mix(in srgb, var(--color-accent) 30%, transparent);
  color: var(--color-foreground);
}
```

Update `.greenhouse-prose` utility:

```css
.greenhouse-prose {
  @apply border-t border-outline-subtle/20 pt-8 prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-accent hover:prose-a:text-accent/80 prose-pre:bg-surface-sunken prose-code:text-foreground;
}
```

Update `.skip-link`:

```css
.skip-link {
  background: var(--color-surface);
  color: var(--color-foreground);
  border: 1px solid var(--color-outline-subtle);
}
```

Update `.scroll-progress`:

```css
.scroll-progress {
  background: var(--color-accent);
}
```

- [ ] **Step 4: Remove prose scroll-reveal and sprout keyframe**

Delete this entire block (prose scroll-reveal):

```css
.greenhouse-prose > h2,
.greenhouse-prose > h3,
.greenhouse-prose > p,
.greenhouse-prose > ul,
.greenhouse-prose > ol,
.greenhouse-prose > blockquote {
  animation: fade-slide-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

Delete the `@keyframes sprout` block:

```css
@keyframes sprout {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds. There will be Tailwind warnings for old class names still in components (that's fine — we migrate those in subsequent tasks).

- [ ] **Step 6: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/styles/global.css
git commit -m "$(cat <<'EOF'
refactor: redesign color token system

Replace Material Design 7-level surface hierarchy with 4-level semantic tokens.
Promote sage (secondary) to accent role. Delete unused primary tokens.
Dark mode gets green-tinted deep forest palette for better readability.
Remove prose scroll-reveal animation and unused sprout keyframe.
EOF
)"
```

---

### Task 2: Update Layout.astro

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Update theme script color values**

In the inline `<script is:inline>` block, update the meta-theme-color values:

Change:
```js
if (meta) meta.setAttribute('content', resolved === 'dark' ? '#111411' : '#faf9f6');
```
To:
```js
if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0c120c' : '#faf9f6');
```

- [ ] **Step 2: Update meta-theme-color default**

Change:
```html
<meta name="theme-color" id="meta-theme-color" content="#faf9f6" />
```
No change needed — `#faf9f6` is still the light surface color.

- [ ] **Step 3: Self-host Inter font**

Download Inter woff2 files and add `@font-face` declarations. Replace Google Fonts links:

Remove these two lines from `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

Download Inter woff2 to `src/assets/fonts/`:

```bash
cd /Users/ralph/projects/the-greenhouse
mkdir -p src/assets/fonts
curl -L "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2" -o src/assets/fonts/inter-400.woff2
curl -L "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjQ.woff2" -o src/assets/fonts/inter-500.woff2
curl -L "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjQ.woff2" -o src/assets/fonts/inter-600.woff2
```

Add `@font-face` declarations at the top of `src/styles/global.css` (before `@import "tailwindcss"`):

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("../assets/fonts/inter-400.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("../assets/fonts/inter-500.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("../assets/fonts/inter-600.woff2") format("woff2");
}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds. Font files bundled.

- [ ] **Step 5: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/layouts/Layout.astro src/styles/global.css src/assets/fonts/
git commit -m "$(cat <<'EOF'
refactor: update theme colors, self-host Inter font

Update dark mode meta-theme-color to new forest green.
Replace Google Fonts CDN with local @font-face woff2 bundles.
EOF
)"
```

---

### Task 3: Migrate core UI components

**Files:**
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Migrate Navbar.astro**

Apply token migration map. Key changes:

| Line | Old | New |
|------|-----|-----|
| 15 | `bg-surface-container-low` | `bg-surface-raised` |
| 17 | `text-on-surface` | `text-foreground` |
| 32 | `text-on-surface` | `text-foreground` |
| 33 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |
| 47 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |
| 62-64 | `bg-on-surface` (3 hamburger lines) | `bg-foreground` |
| 81 | `border-outline-variant/10` | `border-outline-subtle/10` |
| 83 | `text-on-surface` | `text-foreground` |
| 84 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |
| 92 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |

- [ ] **Step 2: Migrate Footer.astro**

| Line | Old | New |
|------|-----|-----|
| 5 | `bg-surface-container-low` | `bg-surface-raised` |
| 8 | `text-on-surface` | `text-foreground` |
| 9-10 | `text-on-surface-variant` | `text-foreground-muted` |
| 14-15 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |

- [ ] **Step 3: Migrate ThemeToggle.astro**

| Line | Old | New |
|------|-----|-----|
| 5 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |

Also update the meta-theme-color values in the `apply()` function:

Change:
```js
if (meta) meta.setAttribute('content', resolved === 'dark' ? '#111411' : '#faf9f6');
```
To:
```js
if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0c120c' : '#faf9f6');
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/components/Navbar.astro src/components/Footer.astro src/components/ThemeToggle.astro
git commit -m "refactor: migrate Navbar, Footer, ThemeToggle to new tokens"
```

---

### Task 4: Migrate content components

**Files:**
- Modify: `src/components/PostCard.astro`
- Modify: `src/components/PostSidebar.astro`
- Modify: `src/components/TableOfContents.astro`
- Modify: `src/components/SeriesNav.astro`
- Modify: `src/components/ContactForm.tsx`

- [ ] **Step 1: Migrate PostCard.astro**

| Line | Old | New |
|------|-----|-----|
| 20 | `bg-surface-container-low`, `bg-surface-container-high` | `bg-surface-raised`, `bg-surface-overlay` |
| 22-23 | `text-on-surface-variant` | `text-foreground-muted` |
| 25 | `text-tertiary-container` | `text-earth-muted` |
| 29 | `text-on-surface`, `text-secondary` | `text-foreground`, `text-accent` |
| 33, 36 | `text-on-surface-variant` | `text-foreground-muted` |
| 41 | `bg-secondary-container`, `text-on-secondary-container` | `bg-accent-muted`, `text-accent-on-muted` |
| 46 | `bg-tertiary-container`, `text-on-surface` | `bg-earth-muted`, `text-foreground` |

- [ ] **Step 2: Migrate PostSidebar.astro**

| Line | Old | New |
|------|-----|-----|
| 27 | `bg-surface-container-low` | `bg-surface-raised` |
| 28 | `text-on-surface-variant` | `text-foreground-muted` |
| 29 | `text-on-surface`, `text-secondary` | `text-foreground`, `text-accent` |
| 41 | `text-secondary`, `text-on-surface-variant`, `text-on-surface` | `text-accent`, `text-foreground-muted`, `text-foreground` |
| 56 | `bg-surface-container-low` | `bg-surface-raised` |
| 57 | `text-on-surface-variant` | `text-foreground-muted` |
| 60 | `bg-secondary-container`, `text-on-secondary-container` | `bg-accent-muted`, `text-accent-on-muted` |

- [ ] **Step 3: Migrate TableOfContents.astro**

| Line | Old | New |
|------|-----|-----|
| 20 | `bg-surface-container-low` | `bg-surface-raised` |
| 21 | `text-on-surface-variant` | `text-foreground-muted` |
| 26 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |
| 35 | `bg-surface-container-low` | `bg-surface-raised` |
| 36 | `text-on-surface-variant` | `text-foreground-muted` |
| 38 | `bg-secondary` | `bg-accent` |
| 42 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |
| 64 | `text-on-surface` → active class array | `text-foreground` |
| 65 | `text-on-surface-variant` → inactive class array | `text-foreground-muted` |

- [ ] **Step 4: Migrate SeriesNav.astro**

| Line | Old | New |
|------|-----|-----|
| 18 | `border-secondary`, `bg-secondary-container/10` | `border-accent`, `bg-accent-muted/10` |
| 22 | `text-on-surface-variant` | `text-foreground-muted` |
| 25 | `text-on-surface`, `text-secondary` | `text-foreground`, `text-accent` |
| 27 | `text-secondary` | `text-accent` |
| 32 | `text-secondary` | `text-accent` |
| 46 | `text-secondary` | `text-accent` |
| 47 | `text-on-surface-variant/70`, `text-on-surface` | `text-foreground-muted/70`, `text-foreground` |

- [ ] **Step 5: Migrate ContactForm.tsx**

| Line | Old | New |
|------|-----|-----|
| 14 | `bg-primary`, `text-on-primary` | `bg-accent`, `text-surface` |
| 46 | `bg-surface-container-lowest` | `bg-surface` |
| 51, 55, 61 | `text-on-surface-variant` | `text-foreground-muted` |
| 52, 56, 62 | `border-outline-variant/30`, `text-on-surface`, `focus:border-secondary` | `border-outline-subtle/30`, `text-foreground`, `focus:border-accent` |
| 72 | `text-secondary` | `text-accent` |

- [ ] **Step 6: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/components/PostCard.astro src/components/PostSidebar.astro src/components/TableOfContents.astro src/components/SeriesNav.astro src/components/ContactForm.tsx
git commit -m "refactor: migrate content components to new tokens"
```

---

### Task 5: Migrate SectionCard to SVG icons

**Files:**
- Modify: `src/components/SectionCard.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Update SectionCard.astro**

Replace emoji icon with SVG slot approach. Also migrate token names:

```astro
---
interface Props {
  name: string;
  description: string;
  count: number;
  href: string;
  variant?: 'sage' | 'earth';
}

const { name, description, count, href, variant = 'sage' } = Astro.props;
const bgClass = variant === 'earth' ? 'bg-earth-muted/30' : 'bg-accent-muted/30';
---

<a href={href} class:list={["block rounded-lg p-6 transition-all hover:shadow-sm", bgClass]}>
  <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-overlay text-foreground-muted mb-4">
    <slot name="icon" />
  </div>
  <h3 class="text-base font-medium text-foreground mb-1">{name}</h3>
  <p class="text-sm text-foreground-muted leading-relaxed mb-3">{description}</p>
  <span class="text-sm text-accent">{count} posts &rarr;</span>
</a>
```

- [ ] **Step 2: Update index.astro SectionCard usage**

Replace emoji `icon` props with SVG slots. Also migrate other token names:

```astro
<section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
  <div class="animate-entrance" style="--delay: 0ms">
    <SectionCard name="Flora" description="AI 분석과 에이전트 생태계" count={allFlora.length} href="/flora/">
      <svg slot="icon" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 8v8m-4-4h8"/></svg>
    </SectionCard>
  </div>
  <div class="animate-entrance" style="--delay: 100ms">
    <SectionCard name="Nursery" description="자라는 아이디어, 에버그린 노트" count={allNursery.length} href="/nursery/">
      <svg slot="icon" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10M12 20V10m0 0c-2-4-6-4-8-2m8 2c2-4 6-4 8-2"/></svg>
    </SectionCard>
  </div>
  <div class="animate-entrance" style="--delay: 200ms">
    <SectionCard name="Seeds" description="짧은 메모, 순간 포착" count={allSeeds.length} href="/seeds/" variant="earth">
      <svg slot="icon" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>
    </SectionCard>
  </div>
</section>
```

Also migrate the rest of index.astro token names:

| Line | Old | New |
|------|-----|-----|
| 22 | `text-on-surface-variant` | `text-foreground-muted` |
| 34 | `text-on-surface-variant` | `text-foreground-muted` |
| 40 | `text-on-surface`, `text-secondary` | `text-foreground`, `text-accent` |
| 44 | `text-on-surface-variant` | `text-foreground-muted` |

- [ ] **Step 3: Verify build + preview homepage**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds. SVG icons render in place of emoji.

- [ ] **Step 4: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/components/SectionCard.astro src/pages/index.astro
git commit -m "refactor: replace emoji icons with SVG slots in SectionCard"
```

---

### Task 6: Replace nursery stage emoji with dot progress

**Files:**
- Modify: `src/consts/sections.ts`
- Modify: `src/components/PostCard.astro`

- [ ] **Step 1: Update sections.ts**

Replace `NURSERY_STAGE_EMOJI` with dot progress data. Also update accent classes:

```typescript
export const NURSERY_STAGE_DOTS: Record<string, { filled: number; total: number; label: string }> = {
  seed: { filled: 1, total: 3, label: "seed" },
  growing: { filled: 2, total: 3, label: "growing" },
  evergreen: { filled: 3, total: 3, label: "evergreen" },
};
```

Update `SECTION_INDEX_CONFIG` accent classes:

```typescript
flora: {
  // ...
  accentClass: "text-accent",
},
nursery: {
  // ...
  accentClass: "text-accent",
},
seeds: {
  // ...
  accentClass: "text-earth",
},
```

Keep `NURSERY_STAGE_EMOJI` exported (for backward compat) but mark deprecated, or remove if no other consumers. Check: it's only used in PostCard.astro.

- [ ] **Step 2: Update PostCard.astro stage rendering**

Replace the emoji stage display. Change the import:

```astro
import { formatArchiveDate, NURSERY_STAGE_DOTS } from '../consts/sections';
```

Replace the stage rendering (around line 26):

Old:
```astro
{stage && <span title={`Stage: ${stage}`}>{NURSERY_STAGE_EMOJI[stage] || '🌱'}</span>}
```

New:
```astro
{stage && NURSERY_STAGE_DOTS[stage] && (
  <span class="flex items-center gap-0.5" title={`Stage: ${NURSERY_STAGE_DOTS[stage].label}`}>
    {Array.from({ length: NURSERY_STAGE_DOTS[stage].total }, (_, i) => (
      <span class:list={[
        "w-1.5 h-1.5 rounded-full",
        i < NURSERY_STAGE_DOTS[stage].filled ? "bg-accent" : "bg-surface-overlay"
      ]} />
    ))}
  </span>
)}
```

- [ ] **Step 3: Run unit tests**

Run: `cd /Users/ralph/projects/the-greenhouse && npm test 2>&1`

Expected: All tests pass. If `sections.test.js` references `NURSERY_STAGE_EMOJI`, update the test to use `NURSERY_STAGE_DOTS`.

- [ ] **Step 4: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/consts/sections.ts src/components/PostCard.astro
git commit -m "refactor: replace stage emoji with dot progress indicator"
```

---

### Task 7: Migrate all page files

**Files:**
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/flora/index.astro` (including JS tag filter)
- Modify: `src/pages/flora/series/[name].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/nursery/index.astro` (including JS tag filter)
- Modify: `src/pages/nursery/series/[name].astro`
- Modify: `src/pages/seeds/[...slug].astro`
- Modify: `src/pages/seeds/index.astro` (including JS tag filter)
- Modify: `src/pages/gardener.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Migrate flora pages**

**flora/[...slug].astro** — apply migration map:

| Line | Old | New |
|------|-----|-----|
| 43 | `bg-secondary-container`, `text-on-secondary-container` | `bg-accent-muted`, `text-accent-on-muted` |
| 44-45 | `text-on-surface-variant` | `text-foreground-muted` |
| 46 | `text-tertiary` | `text-earth` |
| 50 | `text-on-surface-variant` | `text-foreground-muted` |
| 63 | `border-outline-variant/20` | `border-outline-subtle/20` |
| 66, 73 | `text-secondary`, `text-secondary/80` | `text-accent`, `text-accent/80` |

**flora/index.astro** — apply migration map to Astro template AND JavaScript:

Template changes:
| Line | Old | New |
|------|-----|-----|
| 17 | `text-on-surface-variant` | `text-foreground-muted` |
| 24 | `border-outline-variant/30`, `text-on-surface-variant`, `hover:border-secondary` | `border-outline-subtle/30`, `text-foreground-muted`, `hover:border-accent` |
| 41 | `text-on-surface-variant` | `text-foreground-muted` |

JavaScript tag filter update (the `update()` function, ~line 62-67):

Old:
```js
btn.classList.add('bg-secondary-container', 'text-on-secondary-container', 'border-secondary-container');
btn.classList.remove('text-on-surface-variant', 'border-outline-variant/30');
```

New:
```js
btn.classList.add('bg-accent-muted', 'text-accent-on-muted', 'border-accent-muted');
btn.classList.remove('text-foreground-muted', 'border-outline-subtle/30');
```

Old:
```js
btn.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'border-secondary-container');
btn.classList.add('text-on-surface-variant', 'border-outline-variant/30');
```

New:
```js
btn.classList.remove('bg-accent-muted', 'text-accent-on-muted', 'border-accent-muted');
btn.classList.add('text-foreground-muted', 'border-outline-subtle/30');
```

**flora/series/[name].astro** — apply migration map:
| Lines | Old | New |
|-------|-----|-----|
| 39, 41 | `text-on-surface-variant` | `text-foreground-muted` |
| 49 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |

- [ ] **Step 2: Migrate nursery pages**

Same pattern as flora. Apply identical token migration map to:
- `nursery/[...slug].astro`
- `nursery/index.astro` (including JS tag filter — same changes as flora)
- `nursery/series/[name].astro`

- [ ] **Step 3: Migrate seeds pages**

**seeds/[...slug].astro**:
| Line | Old | New |
|------|-----|-----|
| 35 | `bg-tertiary-container`, `text-on-surface` | `bg-earth-muted`, `text-foreground` |
| 36-37 | `text-on-surface-variant` | `text-foreground-muted` |
| 41 | `text-on-surface-variant` | `text-foreground-muted` |
| 52 | `border-outline-variant/20` | `border-outline-subtle/20` |
| 54 | `bg-tertiary-container/50`, `text-on-surface` | `bg-earth-muted/50`, `text-foreground` |

**seeds/index.astro** — same pattern as flora/index.astro with JS tag filter migration.

- [ ] **Step 4: Migrate gardener, search, privacy, 404**

**gardener.astro**:
| Line | Old | New |
|------|-----|-----|
| 19 | `text-on-surface-variant`, `bg-surface-container-low` | `text-foreground-muted`, `bg-surface-raised` |
| 23 | `text-on-surface-variant` | `text-foreground-muted` |
| 28, 31 | `text-secondary`, `text-secondary/80` | `text-accent`, `text-accent/80` |
| 38 | `bg-surface-container-low` | `bg-surface-raised` |
| 42 | `text-on-surface-variant` | `text-foreground-muted` |

**search.astro** line 9: `text-on-surface-variant` → `text-foreground-muted`

**404.astro**:
| Line | Old | New |
|------|-----|-----|
| 8 | `text-on-surface` | `text-foreground` |
| 11, 16 | `text-on-surface-variant` | `text-foreground-muted` |
| 25 | `border-outline-variant/20` | `border-outline-subtle/20` |
| 27 | `text-secondary`, `text-secondary/80` | `text-accent`, `text-accent/80` |
| 30 | `text-on-surface-variant` | `text-foreground-muted` |
| 40 | `text-on-surface-variant`, `text-on-surface` | `text-foreground-muted`, `text-foreground` |

Also replace `sprout` animation references with `fade-slide-in`:

Change all 4 inline `style="animation: sprout ..."` to:
```
style="animation: fade-slide-in 0.5s ease-out both"
style="animation: fade-slide-in 0.5s ease-out 0.1s both"
style="animation: fade-slide-in 0.5s ease-out 0.2s both"
style="animation: fade-slide-in 0.5s ease-out 0.3s both"
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npm run build 2>&1 | tail -10`

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/ralph/projects/the-greenhouse
git add src/pages/
git commit -m "refactor: migrate all page files to new design tokens"
```

---

### Task 8: Full build verification and visual check

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

```bash
cd /Users/ralph/projects/the-greenhouse
rm -rf dist
npm run build 2>&1
```

Expected: Build succeeds with zero errors. Pagefind indexes successfully.

- [ ] **Step 2: Run unit tests**

```bash
cd /Users/ralph/projects/the-greenhouse
npm test 2>&1
```

Expected: All tests pass.

- [ ] **Step 3: Visual verification — start preview and check key pages**

```bash
cd /Users/ralph/projects/the-greenhouse
npx astro preview --port 4322 &
```

Check these pages in both light and dark mode:
- `http://localhost:4322/` — homepage, SectionCards with SVG icons
- `http://localhost:4322/flora/` — tag filter works, PostCards render
- `http://localhost:4322/flora/context-engineering-token-flow/` — prose styling, sidebar, ToC
- `http://localhost:4322/gardener/` — contact form, profile
- `http://localhost:4322/nursery/` — dot progress stage indicators

Verify:
- Dark mode text is readable (no more invisible text)
- Surface levels are visually distinct
- Green tint is present in dark mode
- Tag filter toggles still work (class names in JS updated)
- SVG icons display correctly in SectionCards
- Dot progress shows correct stages

- [ ] **Step 4: Run E2E tests**

```bash
cd /Users/ralph/projects/the-greenhouse
npx playwright test 2>&1
```

Expected: E2E tests pass. If any fail due to color/selector changes, update them.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
cd /Users/ralph/projects/the-greenhouse
git add -A
git commit -m "fix: address visual verification findings"
```

Only create this commit if fixes were made.

---

## Summary

| Task | Description | Files | Est. |
|------|-------------|-------|------|
| 1 | Redefine tokens in global.css | 1 | 10 min |
| 2 | Update Layout.astro + self-host fonts | 2 + fonts | 10 min |
| 3 | Migrate core UI components | 3 | 5 min |
| 4 | Migrate content components | 5 | 10 min |
| 5 | SectionCard SVG icons | 2 | 5 min |
| 6 | Stage dots | 2 | 5 min |
| 7 | Migrate all pages | 12 | 15 min |
| 8 | Full verification | 0 | 10 min |
