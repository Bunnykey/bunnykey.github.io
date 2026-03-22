# Animation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 11 animation enhancements across 4 groups — micro-interactions, page transitions, scroll-driven animations, and brand touches.

**Architecture:** CSS-only where possible. View Transitions via Astro built-in. Scroll-driven animations via CSS `animation-timeline`. No external animation libraries.

**Tech Stack:** Astro 5 (View Transitions), CSS (scroll-driven animations, keyframes), Tailwind 4

**Spec:** `docs/superpowers/specs/2026-03-22-animation-improvements-design.md`

**Testing strategy:** `npm run build` + `npm run dev` visual checks.

**Dependencies:** Groups A, B, D are fully independent. Group C depends on global.css changes from Group B (shared keyframes). Run B before C.

---

## File Map

| File | Action | Items |
|------|--------|-------|
| `src/components/PostCard.astro` | Modify | A1 hover lift |
| `src/components/Navbar.astro` | Modify | A2 hamburger morph |
| `src/components/ThemeToggle.astro` | Modify | A3 icon fade |
| `src/components/ContactForm.tsx` | Modify | A4 input focus |
| `src/layouts/Layout.astro` | Modify | B1 View Transitions |
| `src/styles/global.css` | Modify | B2 scroll progress + C1 prose fade + reduced motion |
| `src/pages/flora/[...slug].astro` | Modify | B2 scroll progress bar |
| `src/pages/nursery/[...slug].astro` | Modify | B2 scroll progress bar |
| `src/pages/seeds/[...slug].astro` | Modify | B2 scroll progress bar |
| `src/pages/index.astro` | Modify | C2 stagger entrance |
| `src/pages/flora/index.astro` | Modify | C2+C3 stagger + filter fade |
| `src/pages/nursery/index.astro` | Modify | C2+C3 stagger + filter fade |
| `src/pages/seeds/index.astro` | Modify | C2+C3 stagger + filter fade |
| `src/components/TableOfContents.astro` | Modify | C4 indicator slide |
| `src/pages/404.astro` | Modify | D1 botanical entrance |

---

### Task 1: Group A — CSS Micro-interactions

**Files:**
- Modify: `src/components/PostCard.astro`
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/ThemeToggle.astro`
- Modify: `src/components/ContactForm.tsx`

- [ ] **Step 1: PostCard hover lift**

In `src/components/PostCard.astro`, change the outer `<a>` class from:
```
class="block bg-surface-container-low rounded-lg p-5 hover:bg-surface-container-high transition-colors group"
```
to:
```
class="block bg-surface-container-low rounded-lg p-5 hover:bg-surface-container-high hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
```

- [ ] **Step 2: Hamburger → X morph**

In `src/components/Navbar.astro`, give each hamburger span a unique id for JS targeting. Change the 3 spans to:
```astro
<span id="burger-top" class="block w-full h-0.5 bg-on-surface transition-all duration-300 origin-center"></span>
<span id="burger-mid" class="block w-full h-0.5 bg-on-surface transition-all duration-300"></span>
<span id="burger-bot" class="block w-full h-0.5 bg-on-surface transition-all duration-300 origin-center"></span>
```

Update the `open()` and `close()` functions in the `<script>`:
```javascript
function open() {
  drawer.classList.remove('max-h-0', 'opacity-0');
  drawer.classList.add('max-h-64', 'opacity-100');
  toggle.setAttribute('aria-expanded', 'true');
  document.getElementById('burger-top')?.classList.add('rotate-45', 'translate-y-[7px]');
  document.getElementById('burger-mid')?.classList.add('opacity-0');
  document.getElementById('burger-bot')?.classList.add('-rotate-45', '-translate-y-[7px]');
}
function close() {
  drawer.classList.add('max-h-0', 'opacity-0');
  drawer.classList.remove('max-h-64', 'opacity-100');
  toggle.setAttribute('aria-expanded', 'false');
  document.getElementById('burger-top')?.classList.remove('rotate-45', 'translate-y-[7px]');
  document.getElementById('burger-mid')?.classList.remove('opacity-0');
  document.getElementById('burger-bot')?.classList.remove('-rotate-45', '-translate-y-[7px]');
}
```

- [ ] **Step 3: ThemeToggle icon fade**

In `src/components/ThemeToggle.astro`, change each SVG's class from `class="w-4 h-4 hidden"` to include transition:
```astro
<svg id="icon-sun" class="w-4 h-4 hidden transition-opacity duration-200" ...>
<svg id="icon-moon" class="w-4 h-4 hidden transition-opacity duration-200" ...>
<svg id="icon-monitor" class="w-4 h-4 hidden transition-opacity duration-200" ...>
```

In the `apply()` function, instead of toggling `hidden` directly, use opacity for a brief fade. Replace:
```javascript
Object.values(icons).forEach(el => el?.classList.add('hidden'));
icons[pref as keyof typeof icons]?.classList.remove('hidden');
```
with:
```javascript
Object.values(icons).forEach(el => {
  el?.classList.add('opacity-0');
  setTimeout(() => el?.classList.add('hidden'), 200);
});
const next = icons[pref as keyof typeof icons];
if (next) {
  next.classList.remove('hidden');
  requestAnimationFrame(() => next.classList.remove('opacity-0'));
}
```

- [ ] **Step 4: ContactForm input focus enhancement**

In `src/components/ContactForm.tsx`, the inputs already have `focus:border-secondary transition-colors`. Change `transition-colors` to `transition-all duration-300` on all input/textarea elements for smoother border transitions.

- [ ] **Step 5: Verify build and commit**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
git add src/components/PostCard.astro src/components/Navbar.astro src/components/ThemeToggle.astro src/components/ContactForm.tsx
git commit -m "feat: add micro-interaction animations (hover lift, hamburger morph, icon fade, focus transition)"
```

---

### Task 2: Group B — View Transitions + Scroll Progress

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/styles/global.css`
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Enable View Transitions**

In `src/layouts/Layout.astro`, add import and component:

In the frontmatter:
```astro
import { ViewTransitions } from 'astro:transitions';
```

In `<head>`, before `</head>` (after `<title>`):
```astro
<ViewTransitions />
```

Add `transition:persist` to the Navbar to keep it across navigations:
```astro
<Navbar transition:persist />
```

- [ ] **Step 2: Add scroll progress bar and animation keyframes to global.css**

At the end of `@layer utilities` in `src/styles/global.css`, add:

```css
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--color-secondary);
    transform-origin: left;
    scale: 0 1;
    animation: scroll-progress linear;
    animation-timeline: scroll();
    z-index: 50;
  }
```

After `@layer utilities` closing brace (and before `[data-theme="dark"]`), add keyframes and scroll-driven prose animations:

```css
@keyframes scroll-progress {
  to { scale: 1 1; }
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Add scroll progress bar to post detail pages**

In each slug page, add `<div class="scroll-progress"></div>` as the first child inside the `<Layout>` slot (before the `<div class="max-w-5xl...">`):

`src/pages/flora/[...slug].astro`:
```astro
<Layout ...>
  <div class="scroll-progress"></div>
  <div class="max-w-5xl mx-auto ...">
```

Same for `nursery/[...slug].astro` and `seeds/[...slug].astro`.

- [ ] **Step 4: Verify build and commit**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
git add src/layouts/Layout.astro src/styles/global.css src/pages/flora/\[...slug\].astro src/pages/nursery/\[...slug\].astro src/pages/seeds/\[...slug\].astro
git commit -m "feat: add View Transitions, scroll progress bar, and prose fade-in animations"
```

---

### Task 3: Group C — Stagger Entrance + Filter Fade + ToC Indicator

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/flora/index.astro`
- Modify: `src/pages/nursery/index.astro`
- Modify: `src/pages/seeds/index.astro`
- Modify: `src/components/TableOfContents.astro`

- [ ] **Step 1: Add stagger entrance to home page SectionCards**

In `src/pages/index.astro`, add `style` attribute with `--delay` to each SectionCard for staggered animation. Add a class `animate-entrance` to each card:

```astro
<section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
  <div class="animate-entrance" style="--delay: 0ms"><SectionCard ... /></div>
  <div class="animate-entrance" style="--delay: 100ms"><SectionCard ... /></div>
  <div class="animate-entrance" style="--delay: 200ms"><SectionCard ... /></div>
</section>
```

Add inline `<style>` at the bottom:
```astro
<style>
  .animate-entrance {
    opacity: 0;
    transform: translateY(1rem);
    animation: fade-slide-in 0.5s ease-out forwards;
    animation-delay: var(--delay, 0ms);
  }
</style>
```

- [ ] **Step 2: Add stagger entrance to section index PostCards**

In `src/pages/flora/index.astro`, wrap each PostCard in a stagger container. Update the map loop:

```astro
{posts.map((post, i) => (
  <div class="animate-entrance" style={`--delay: ${i * 50}ms`}>
    <PostCard ... />
  </div>
))}
```

Add the same `<style>` block as in Step 1. Same for `nursery/index.astro` and `seeds/index.astro`.

- [ ] **Step 3: Tag filter card fade transition**

In the 3 section index pages, update the tag filter script. Replace the card visibility toggle:

Change:
```javascript
el.style.display = cardTags.some(t => active.has(t)) ? '' : 'none';
```
To:
```javascript
const match = cardTags.some(t => active.has(t));
el.style.opacity = match ? '1' : '0';
el.style.transform = match ? 'translateY(0)' : 'translateY(0.5rem)';
el.style.transition = 'opacity 300ms ease, transform 300ms ease';
el.style.pointerEvents = match ? '' : 'none';
```

And for the "show all" case:
Change:
```javascript
if (active.size === 0) { el.style.display = ''; return; }
```
To:
```javascript
if (active.size === 0) {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  el.style.transition = 'opacity 300ms ease, transform 300ms ease';
  el.style.pointerEvents = '';
  return;
}
```

Apply to all 3 index pages.

- [ ] **Step 4: ToC active indicator slide**

In `src/components/TableOfContents.astro`, add a sliding indicator bar.

In the desktop (non-mobile) `<nav>`, wrap the `<ul>` in a `relative` container and add an indicator `<div>`:

```astro
<nav aria-label="Table of contents" class="relative">
  <div id="toc-indicator" class="absolute left-0 w-0.5 bg-secondary rounded transition-all duration-200" style="top: 0; height: 0;"></div>
  <ul class="space-y-1.5 pl-3">
    ...existing links...
  </ul>
</nav>
```

Update the IntersectionObserver callback in the `<script>` to also move the indicator:

After the existing `link.classList.add(...activeClass)` block, add:
```javascript
const indicator = document.getElementById('toc-indicator');
if (indicator && link instanceof HTMLElement) {
  indicator.style.top = `${link.offsetTop}px`;
  indicator.style.height = `${link.offsetHeight}px`;
}
```

- [ ] **Step 5: Verify build and commit**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
git add src/pages/index.astro src/pages/flora/index.astro src/pages/nursery/index.astro src/pages/seeds/index.astro src/components/TableOfContents.astro
git commit -m "feat: add stagger entrance, filter fade transitions, and ToC indicator slide"
```

---

### Task 4: Group D — 404 Botanical Entrance

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Add sprout animation to 404 elements**

In `src/pages/404.astro`, add animation classes with staggered delays. The `sprout` keyframe is already defined in `global.css` (from Task 2).

Update the page content to use inline styles for animation:

```astro
<Layout title="404 - The Greenhouse">
  <div class="max-w-md mx-auto px-6 py-32 md:py-40 text-center">
    <h1 class="text-6xl md:text-7xl font-medium tracking-tight text-on-surface" style="animation: sprout 0.6s ease-out both">
      404
    </h1>
    <p class="mt-4 text-base text-on-surface-variant" style="animation: sprout 0.6s ease-out 0.1s both">
      이 페이지는 아직 싹이 트지 않았습니다.
    </p>

    <div class="mt-12 text-left" style="animation: sprout 0.6s ease-out 0.2s both">
      ...section links unchanged...
    </div>

    <div class="mt-8" style="animation: sprout 0.6s ease-out 0.3s both">
      ...home link unchanged...
    </div>
  </div>
</Layout>
```

- [ ] **Step 2: Verify build and commit**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
git add src/pages/404.astro
git commit -m "feat: add botanical sprout entrance animation to 404 page"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Clean build**

```bash
cd /Users/ralph/projects/the-greenhouse && rm -rf dist && npm run build
```

- [ ] **Step 2: Visual smoke test**

```bash
npm run dev
```

Check at `http://localhost:4321`:
1. **View Transitions**: navigate between pages — crossfade effect visible
2. **PostCard hover**: cards lift with shadow on hover
3. **Hamburger**: lines morph to X on mobile
4. **Theme toggle**: icons fade on switch
5. **Scroll progress**: green bar at top grows while scrolling a post
6. **Prose fade-in**: headings/paragraphs fade in as you scroll
7. **Stagger entrance**: home SectionCards and index PostCards appear sequentially
8. **Tag filter fade**: filtered cards fade out instead of disappearing
9. **ToC indicator**: green bar slides to active heading
10. **404 sprout**: elements rise from below with stagger
11. **Reduced motion**: enable reduced motion in OS settings — all animations disabled
