# Animation Improvements — Design Spec

**Date:** 2026-03-22
**Scope:** 11 animation enhancements across 4 groups

---

## Group A: CSS-Only Micro-interactions (4 items)

### A1. PostCard Hover Lift + Shadow

Change outer `<a>` in `PostCard.astro` (line 20):
- Add: `hover:-translate-y-1 hover:shadow-lg transition-all duration-200`
- Remove: `transition-colors` (subsumed by `transition-all`)

### A2. Hamburger → X Morph

In `Navbar.astro`, the 3 spans (lines 62-64) already have `transition-transform` and `transition-opacity`. Add classes when `aria-expanded="true"`:
- Top span: `rotate-45 translate-y-[7px]`
- Middle span: `opacity-0`
- Bottom span: `-rotate-45 -translate-y-[7px]`

Toggle these classes in the existing `open()`/`close()` functions.

### A3. ThemeToggle Icon Rotation

In `ThemeToggle.astro`, add `transition-transform duration-300` to the `<button>`. On each `cycle()` call, add a brief rotation via class toggle or inline transform.

Simpler approach: wrap all 3 SVGs in a container div with `transition-opacity duration-200`. The existing `hidden`/visible swap becomes a fade.

### A4. ContactForm Input Focus Underline

In `global.css`, add animation for focus underline effect on ContactForm inputs:
- Use pseudo-element approach: parent `<div>` gets `relative` + `::after` with `scaleX(0)` → `scaleX(1)` on `focus-within`
- Or simpler: `transition-all duration-300` on the existing `border-b` + `focus:border-secondary` (already in place — just needs duration adjustment)

Recommendation: The existing `focus:border-secondary transition-colors` is already functional. Enhance by changing to `transition-all duration-300` and adding `focus:border-b-2` for a subtle thickness change. Minimal change, noticeable effect.

**Files:**
- `src/components/PostCard.astro`
- `src/components/Navbar.astro`
- `src/components/ThemeToggle.astro`
- `src/components/ContactForm.tsx`

---

## Group B: Astro/CSS Page-level (2 items)

### B1. View Transitions API

Enable Astro View Transitions:
- Import `ViewTransitions` from `astro:transitions` in `Layout.astro`
- Add `<ViewTransitions />` in `<head>`
- This gives automatic crossfade on all page navigations
- No per-page configuration needed for the default fade

Custom transition names for brand consistency:
- Main content area: `transition:name="content"` with `transition:animate="slide"`
- Navbar: `transition:persist` (stays across navigations)

### B2. Scroll Progress Bar

CSS-only reading progress indicator on post detail pages.

In `global.css`, add:
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

@keyframes scroll-progress {
  to { scale: 1 1; }
}
```

Add `<div class="scroll-progress"></div>` to post detail pages (flora/nursery/seeds `[...slug].astro`).

**Browser support note:** `animation-timeline: scroll()` is supported in Chrome 115+, Firefox 110+ (with flag), Safari 18.4+. For unsupported browsers, the bar simply doesn't appear (progressive enhancement).

**Files:**
- `src/layouts/Layout.astro`
- `src/styles/global.css`
- `src/pages/flora/[...slug].astro`
- `src/pages/nursery/[...slug].astro`
- `src/pages/seeds/[...slug].astro`

---

## Group C: JS + CSS Scroll-driven (4 items)

### C1. Prose Scroll Fade-in

Post content headings and paragraphs fade in as they enter the viewport.

CSS-only approach using `animation-timeline: view()`:
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
```

No JS needed. Progressive enhancement — unsupported browsers see static content.

### C2. Staggered Grid Entrance

SectionCards on home page and PostCards on index pages appear sequentially.

CSS approach with IntersectionObserver:
- Cards start with `opacity: 0; transform: translateY(1rem)`
- IntersectionObserver adds `.visible` class
- Each card gets `animation-delay` via `style="--delay: Nms"` (set by Astro loop index)
- `.visible` triggers CSS transition

### C3. Tag Filter Card Fade

Currently tag filtering uses `display: none` (instant). Change to opacity + max-height transition:
- Hidden: `opacity: 0; max-height: 0; overflow: hidden; margin: 0; padding: 0`
- Visible: `opacity: 1; max-height: 200px`
- `transition: all 300ms ease`

Update the tag filter script in all 3 index pages.

### C4. ToC Active Indicator Slide

Add a sliding indicator bar next to the active ToC link.

In `TableOfContents.astro`:
- Add `<div class="toc-indicator">` — a 2px wide bar with `position: absolute`, `background: var(--color-secondary)`
- On IntersectionObserver update, animate the indicator's `top` position with CSS transition to slide to the active link
- `transition: top 200ms ease`

**Files:**
- `src/styles/global.css` — fade-slide-in keyframes + scroll-driven rules
- `src/pages/index.astro` — stagger entrance setup
- `src/pages/flora/index.astro` — card fade + stagger
- `src/pages/nursery/index.astro` — card fade + stagger
- `src/pages/seeds/index.astro` — card fade + stagger
- `src/components/TableOfContents.astro` — indicator bar

---

## Group D: Brand Touch (1 item)

### D1. 404 Botanical Entrance

404 page elements enter with a "sprouting" animation — rising from below with a gentle ease-out.

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

Apply to the 404 page container with staggered delays:
- 404 heading: `animation: sprout 0.6s ease-out`
- Message: `animation: sprout 0.6s ease-out 0.1s both`
- Section links: `animation: sprout 0.6s ease-out 0.2s both`
- Home link: `animation: sprout 0.6s ease-out 0.3s both`

**Files:**
- `src/pages/404.astro`

---

## Design Principles

- **Progressive enhancement:** All scroll-driven animations use `animation-timeline` which gracefully degrades
- **Reduced motion:** Respect `prefers-reduced-motion` — add `@media (prefers-reduced-motion: reduce)` to disable all animations
- **Performance:** CSS-only where possible, no animation libraries
- **Botanical brand:** Elements "grow" upward (translateY positive → 0), not slide from sides
