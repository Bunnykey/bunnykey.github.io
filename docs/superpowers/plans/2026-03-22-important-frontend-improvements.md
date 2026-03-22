# Important Frontend Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 frontend quality improvements — JSON-LD, responsive typography, reading time, ToC, search, tag filtering, ContactForm a11y, TokenFlowDemo dark mode.

**Architecture:** All changes within existing Astro 5 + Tailwind 4 stack. One new npm dependency (pagefind). Reading time and ToC are utility/component additions. Tag filtering and search are new page-level features with inline JS. ContactForm and TokenFlowDemo are targeted fixes.

**Tech Stack:** Astro 5, Tailwind CSS 4, React 19 (ContactForm/TokenFlowDemo), Pagefind

**Spec:** `docs/superpowers/specs/2026-03-22-important-frontend-improvements-design.md`

**Testing strategy:** `npm run build` (must succeed) + `npm run dev` visual checks. No unit test framework.

**Dependency note:** Tasks 1, 7, 8 are fully independent. Tasks 2, 3, 4 all modify slug pages and should run sequentially. Task 5 modifies PostCard.astro (also touched by Task 2) — run Task 5 after Task 2. Task 6 modifies slug pages (data-pagefind-body) and Navbar — run after Tasks 2-3-4.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/styles/global.css` | Modify | Responsive typography + scroll-margin-top |
| `src/utils/reading-time.ts` | Create | Reading time calculation |
| `src/components/PostCard.astro` | Modify | Reading time display + data-tags attribute |
| `src/components/TableOfContents.astro` | Create | ToC with IntersectionObserver |
| `src/components/PostSidebar.astro` | Modify | Add ToC, make sticky |
| `src/components/ContactForm.tsx` | Modify | ARIA attributes + live regions |
| `src/components/Navbar.astro` | Modify | Add search icon |
| `src/components/demos/shared/styles.ts` | Modify | CSS variable theme integration |
| `src/components/demos/TokenFlowDemo.tsx` | Modify | Replace inline color references |
| `src/layouts/Layout.astro` | Modify | JSON-LD injection + articleDate prop |
| `src/pages/search.astro` | Create | Pagefind UI search page |
| `src/pages/flora/[...slug].astro` | Modify | reading time, articleDate, headings, data-pagefind-body |
| `src/pages/nursery/[...slug].astro` | Modify | reading time, articleDate, headings, data-pagefind-body |
| `src/pages/seeds/[...slug].astro` | Modify | reading time, articleDate, ToC details, data-pagefind-body |
| `src/pages/flora/index.astro` | Modify | Tag filter UI |
| `src/pages/nursery/index.astro` | Modify | Tag filter UI |
| `src/pages/seeds/index.astro` | Modify | Tag filter UI |
| `package.json` | Modify | Add pagefind + postbuild script |

---

### Task 1: Responsive Typography + scroll-margin-top

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Update heading styles in `@layer base`**

Replace the existing h1, h2, h3 rules (lines 66-78) with clamp-based responsive sizes:

```css
  h1 {
    font-size: clamp(2rem, 5vw, 3.75rem);
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: clamp(1.5rem, 3.5vw, 2.25rem);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  h3, h4, h5, h6 {
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    font-weight: 500;
  }
```

- [ ] **Step 2: Add scroll-margin-top for anchor jumps**

Add inside `@layer base`, after the heading rules:

```css
  h2, h3 {
    scroll-margin-top: 6rem;
  }
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add responsive typography with clamp() and scroll-margin-top"
```

---

### Task 2: Reading Time

**Files:**
- Create: `src/utils/reading-time.ts`
- Modify: `src/components/PostCard.astro`
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Create reading time utility**

Create `src/utils/reading-time.ts`:

```typescript
export function readingTime(text: string): number {
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const englishWords = text.replace(/[\u3131-\uD79D]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}
```

- [ ] **Step 2: Add reading time to PostCard**

In `src/components/PostCard.astro`, add `readingMin` to the Props interface and display it:

Add to interface:
```typescript
readingMin?: number;
```

Add to destructuring:
```typescript
const { title, date, summary, tags, href, highlight, seriesName, stage, variant = 'flora', readingMin } = Astro.props;
```

In the template, after the date `<span>`, add:
```astro
{readingMin && <span class="text-xs text-on-surface-variant">· {readingMin} min</span>}
```

Place it inside the existing `<div class="flex items-center justify-between mb-3">`, right after the date span, like:
```astro
<div class="flex items-center gap-2 mb-3">
  <span class="text-xs font-mono text-on-surface-variant">{formatArchiveDate(date)}</span>
  {readingMin && <span class="text-xs text-on-surface-variant">· {readingMin} min</span>}
  <div class="flex items-center gap-2 ml-auto">
    {highlight && <span class="text-xs text-tertiary-container">★</span>}
    {stage && <span title={`Stage: ${stage}`}>{NURSERY_STAGE_EMOJI[stage] || '🌱'}</span>}
  </div>
</div>
```

- [ ] **Step 3: Pass reading time from section index pages**

Each section index page already maps over posts. The `entry.body` property contains the raw markdown text. Import `readingTime` and pass it:

In `src/pages/flora/index.astro`, add import:
```typescript
import { readingTime } from '../../utils/reading-time';
```

In the PostCard call, add:
```astro
readingMin={readingTime(post.body)}
```

Do the same for `src/pages/nursery/index.astro` and `src/pages/seeds/index.astro`.

- [ ] **Step 4: Add reading time to post detail page headers**

In `src/pages/flora/[...slug].astro`, import and display:
```typescript
import { readingTime } from '../../utils/reading-time';
```

In the header `<div class="flex items-center gap-3 mb-4">`, after the date span:
```astro
<span class="text-xs text-on-surface-variant">· {readingTime(entry.body)} min</span>
```

Do the same for `nursery/[...slug].astro` and `seeds/[...slug].astro`.

- [ ] **Step 5: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/reading-time.ts src/components/PostCard.astro src/pages/flora/index.astro src/pages/nursery/index.astro src/pages/seeds/index.astro src/pages/flora/\[...slug\].astro src/pages/nursery/\[...slug\].astro src/pages/seeds/\[...slug\].astro
git commit -m "feat: add reading time display on post cards and detail pages"
```

---

### Task 3: JSON-LD Structured Data

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Add articleDate prop and JSON-LD to Layout.astro**

Add `articleDate` to the Props interface:
```typescript
interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  articleDate?: string;
}
```

Add to destructuring:
```typescript
const {
  title,
  description = SITE.defaultDescription,
  canonicalPath = Astro.url.pathname,
  ogTitle = title,
  ogDescription = description,
  ogImage,
  ogType = 'website',
  articleDate,
} = Astro.props;
```

Add JSON-LD script before `</head>` (after `<title>`):
```astro
{ogType === 'article' && articleDate ? (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ogTitle,
    "datePublished": articleDate,
    "author": { "@type": "Person", "name": "Bunnykey", "url": `${SITE.siteUrl}/gardener/` },
    "description": ogDescription,
    "image": ogImageUrl,
  })} />
) : (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.name,
    "url": SITE.siteUrl,
  })} />
)}
```

- [ ] **Step 2: Pass articleDate from slug pages**

In each slug page, add `articleDate` to the `<Layout>` call:

`src/pages/flora/[...slug].astro`:
```astro
<Layout
  title={entry.data.title}
  description={description}
  canonicalPath={`/flora/${entry.slug}/`}
  ogTitle={entry.data.title}
  ogDescription={description}
  ogType="article"
  articleDate={entry.data.date.toISOString()}
>
```

Same pattern for `nursery/[...slug].astro` and `seeds/[...slug].astro`.

- [ ] **Step 3: Add Person schema to gardener page**

In `src/pages/gardener.astro`, pass a special prop or add inline JSON-LD after the Layout opening. The simplest approach: add a `<script type="application/ld+json">` directly in the page content (inside the Layout slot):

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Bunnykey",
  "url": "https://bunnykey.github.io/gardener/",
  "jobTitle": "Software PM",
  "sameAs": ["https://github.com/bunnykey"]
})} />
```

Place this right after the opening `<Layout ...>` tag, before the `<div>`.

- [ ] **Step 4: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/pages/flora/\[...slug\].astro src/pages/nursery/\[...slug\].astro src/pages/seeds/\[...slug\].astro src/pages/gardener.astro
git commit -m "feat: add JSON-LD structured data for articles, website, and person"
```

---

### Task 4: Table of Contents

**Files:**
- Create: `src/components/TableOfContents.astro`
- Modify: `src/components/PostSidebar.astro`
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Create TableOfContents.astro**

Create `src/components/TableOfContents.astro`:

```astro
---
interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
  mobile?: boolean;
}

const { headings, mobile = false } = Astro.props;
const filtered = headings.filter(h => h.depth === 2 || h.depth === 3);
const show = filtered.length >= 3;
---

{show && (
  mobile ? (
    <details class="mb-8 bg-surface-container-low rounded-lg p-4">
      <summary class="text-xs font-medium uppercase tracking-widest text-on-surface-variant cursor-pointer">목차</summary>
      <nav class="mt-3" aria-label="Table of contents">
        <ul class="space-y-1.5">
          {filtered.map(h => (
            <li class:list={[h.depth === 3 && 'pl-4']}>
              <a href={`#${h.slug}`} class="toc-link text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  ) : (
    <div class="bg-surface-container-low rounded-lg p-5">
      <h3 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-3">목차</h3>
      <nav aria-label="Table of contents">
        <ul class="space-y-1.5">
          {filtered.map(h => (
            <li class:list={[h.depth === 3 && 'pl-4']}>
              <a href={`#${h.slug}`} class="toc-link text-xs text-on-surface-variant hover:text-on-surface transition-colors" data-slug={h.slug}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
)}

<script>
  const tocLinks = document.querySelectorAll('.toc-link[data-slug]');
  if (tocLinks.length > 0) {
    const slugs = Array.from(tocLinks).map(a => (a as HTMLAnchorElement).dataset.slug!);
    const headingEls = slugs.map(s => document.getElementById(s)).filter(Boolean) as HTMLElement[];
    const activeClass = ['text-on-surface', 'font-medium'];
    const inactiveClass = ['text-on-surface-variant'];
    let current: Element | null = null;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).map(e => e.target);
      if (visible.length === 0) return;
      const topmost = visible.reduce((a, b) => a.getBoundingClientRect().top < b.getBoundingClientRect().top ? a : b);
      const link = document.querySelector(`.toc-link[data-slug="${topmost.id}"]`);
      if (link && link !== current) {
        if (current) { current.classList.remove(...activeClass); current.classList.add(...inactiveClass); }
        link.classList.add(...activeClass);
        link.classList.remove(...inactiveClass);
        current = link;
      }
    }, { rootMargin: '-80px 0px -70% 0px' });

    headingEls.forEach(el => observer.observe(el));
  }
</script>
```

- [ ] **Step 2: Add ToC to PostSidebar and make sticky**

In `src/components/PostSidebar.astro`:

Add import and prop:
```astro
---
import TableOfContents from './TableOfContents.astro';
import type { SeriesEntry } from '../utils/series';

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  seriesTitle?: string;
  seriesName?: string;
  seriesPosts?: SeriesEntry[];
  currentOrder?: number;
  collection?: string;
  tags?: string[];
  headings?: Heading[];
}

const { seriesTitle, seriesName, seriesPosts = [], currentOrder, collection, tags = [], headings = [] } = Astro.props;
---
```

Change the outer `<aside>` to be sticky:
```astro
<aside class="w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
```

Add ToC as the first child inside `<aside>`:
```astro
  <TableOfContents headings={headings} />
  {seriesTitle && seriesPosts.length > 0 && (
    ...existing series block...
  )}
```

- [ ] **Step 3: Pass headings from flora and nursery slug pages**

In `src/pages/flora/[...slug].astro`, change the render destructuring:
```typescript
const { Content, headings } = await entry.render();
```

Pass headings to PostSidebar:
```astro
<PostSidebar
  seriesTitle={series?.title}
  seriesName={series?.name}
  seriesPosts={seriesPosts}
  currentOrder={series?.order}
  collection="flora"
  tags={entry.data.tags}
  headings={headings}
/>
```

Also add mobile ToC above the prose content. Import `TableOfContents` and add:
```astro
<div class="lg:hidden">
  <TableOfContents headings={headings} mobile />
</div>
<div class="greenhouse-prose">
  <Content />
</div>
```

Same pattern for `nursery/[...slug].astro`.

- [ ] **Step 4: Add ToC to seeds slug page (details only, no sidebar)**

In `src/pages/seeds/[...slug].astro`, change destructuring:
```typescript
const { Content, headings } = await entry.render();
```

Import and add mobile ToC before prose:
```astro
---
import TableOfContents from '../../components/TableOfContents.astro';
---
```

Before `<div class="greenhouse-prose">`:
```astro
<TableOfContents headings={headings} mobile />
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TableOfContents.astro src/components/PostSidebar.astro src/pages/flora/\[...slug\].astro src/pages/nursery/\[...slug\].astro src/pages/seeds/\[...slug\].astro
git commit -m "feat: add table of contents with IntersectionObserver active heading tracking"
```

---

### Task 5: Tag Filtering

**Files:**
- Modify: `src/components/PostCard.astro`
- Modify: `src/pages/flora/index.astro`
- Modify: `src/pages/nursery/index.astro`
- Modify: `src/pages/seeds/index.astro`

- [ ] **Step 1: Add data-tags to PostCard**

In `src/components/PostCard.astro`, add `data-tags` attribute on the outer `<a>` element:

```astro
<a href={href} class="block bg-surface-container-low rounded-lg p-5 hover:bg-surface-container-high transition-colors group" data-tags={tags?.join(',') || undefined}>
```

- [ ] **Step 2: Add tag filter UI to flora index**

In `src/pages/flora/index.astro`, after the `<header>` and before the post grid, extract tags and render filter buttons:

In the frontmatter, add:
```typescript
const allTags = [...new Set(posts.flatMap(p => p.data.tags || []))].sort();
```

After `</header>`, before the grid:
```astro
{allTags.length > 0 && (
  <div class="flex flex-wrap gap-2 mb-6" id="tag-filter">
    {allTags.map(tag => (
      <button
        data-tag={tag}
        class="tag-btn text-xs px-3 py-1 rounded border border-outline-variant/30 text-on-surface-variant hover:border-secondary transition-colors"
      >
        {tag}
      </button>
    ))}
  </div>
)}
```

Wrap the post grid in a container for JS targeting:
```astro
<div id="post-list">
  {posts.length > 0 ? (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ...existing PostCard map...
    </div>
  ) : (
    <p class="text-sm text-on-surface-variant">{config.emptyMessage}</p>
  )}
</div>
```

Add inline script at the bottom:
```astro
<script>
  const buttons = document.querySelectorAll('.tag-btn');
  const cards = document.querySelectorAll('#post-list [data-tags]');
  const active = new Set<string>();

  function update() {
    // Update URL hash
    window.location.hash = active.size > 0 ? [...active].join(',') : '';
    // Toggle button styles
    buttons.forEach(btn => {
      const tag = (btn as HTMLElement).dataset.tag!;
      if (active.has(tag)) {
        btn.classList.add('bg-secondary-container', 'text-on-secondary-container', 'border-secondary-container');
        btn.classList.remove('text-on-surface-variant', 'border-outline-variant/30');
      } else {
        btn.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'border-secondary-container');
        btn.classList.add('text-on-surface-variant', 'border-outline-variant/30');
      }
    });
    // Filter cards
    cards.forEach(card => {
      const el = card as HTMLElement;
      if (active.size === 0) { el.style.display = ''; return; }
      const cardTags = (el.dataset.tags || '').split(',');
      el.style.display = cardTags.some(t => active.has(t)) ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = (btn as HTMLElement).dataset.tag!;
      active.has(tag) ? active.delete(tag) : active.add(tag);
      update();
    });
  });

  // Read hash on load
  const hash = window.location.hash.slice(1);
  if (hash) { hash.split(',').forEach(t => active.add(t)); update(); }
</script>
```

- [ ] **Step 3: Apply same pattern to nursery and seeds index pages**

Copy the same tag extraction, filter UI, post-list wrapper, and script to `src/pages/nursery/index.astro` and `src/pages/seeds/index.astro`. The only differences are the collection name and config variable.

For seeds, add `tags={post.data.tags}` to the PostCard call (currently missing).

- [ ] **Step 4: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/PostCard.astro src/pages/flora/index.astro src/pages/nursery/index.astro src/pages/seeds/index.astro
git commit -m "feat: add inline tag filtering on section index pages"
```

---

### Task 6: Search with Pagefind

**Files:**
- Modify: `package.json`
- Create: `src/pages/search.astro`
- Modify: `src/components/Navbar.astro`
- Modify: `src/pages/flora/[...slug].astro`
- Modify: `src/pages/nursery/[...slug].astro`
- Modify: `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Install pagefind and add postbuild script**

```bash
cd /Users/ralph/projects/the-greenhouse && npm install -D pagefind
```

In `package.json`, add postbuild script:
```json
"scripts": {
  "dev": "astro dev --port 4321",
  "build": "astro build",
  "postbuild": "pagefind --site dist",
  "preview": "astro preview",
  ...
}
```

- [ ] **Step 2: Add data-pagefind-body to slug pages**

In each slug page's prose container, add the attribute:

`src/pages/flora/[...slug].astro`:
```astro
<div class="greenhouse-prose" data-pagefind-body>
  <Content />
</div>
```

Same for `nursery/[...slug].astro` and `seeds/[...slug].astro`.

- [ ] **Step 3: Create search page**

Create `src/pages/search.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Search - The Greenhouse" description="Search posts by keyword." canonicalPath="/search/">
  <div class="max-w-3xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <h1 class="text-3xl tracking-tight mb-3">Search</h1>
      <p class="text-base text-on-surface-variant">키워드로 글을 검색합니다.</p>
    </header>
    <div id="search"></div>
  </div>
</Layout>

<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />

<style>
  :root {
    --pagefind-ui-scale: 0.9;
    --pagefind-ui-primary: var(--color-secondary);
    --pagefind-ui-text: var(--color-on-surface);
    --pagefind-ui-background: var(--color-surface);
    --pagefind-ui-border: var(--color-outline-variant);
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-border-radius: 0.5rem;
    --pagefind-ui-font: var(--font-sans);
  }
</style>

<script>
  async function initPagefind() {
    // @ts-ignore — Pagefind UI loaded from static assets
    const { PagefindUI } = await import('/pagefind/pagefind-ui.js');
    new PagefindUI({ element: '#search', showSubResults: true });
  }
  initPagefind();
</script>
```

- [ ] **Step 4: Add search icon to Navbar**

In `src/components/Navbar.astro`, add search link next to ThemeToggle.

In the `<div class="flex items-center gap-4">`, after `<ThemeToggle />` and before the hamburger button:

```astro
      {/* Search */}
      <a href="/search/" class="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="검색" title="검색">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </a>
```

Also add "Search" as a text link in the mobile drawer, after the nav links:
```astro
<a href="/search/" class="py-3 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
  Search
</a>
```

- [ ] **Step 5: Build and verify pagefind indexing**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

Expected: Build succeeds, followed by pagefind output showing indexed pages. Check `dist/pagefind/` directory exists.

```bash
ls dist/pagefind/
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/pages/search.astro src/components/Navbar.astro src/pages/flora/\[...slug\].astro src/pages/nursery/\[...slug\].astro src/pages/seeds/\[...slug\].astro
git commit -m "feat: add Pagefind search with search page and navbar icon"
```

---

### Task 7: ContactForm Accessibility

**Files:**
- Modify: `src/components/ContactForm.tsx`

- [ ] **Step 1: Add ARIA attributes and live regions**

Replace the full contents of `src/components/ContactForm.tsx`:

```tsx
import React, { useState, type FormEvent } from 'react';

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
          <input id="name" type="text" name="name" required aria-required="true" className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors" />
        </div>
        <div>
          <label htmlFor="email" className="block text-[0.7rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
          <input id="email" type="email" name="email" required aria-required="true" className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors" />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="message" className="block text-[0.7rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2">Message</label>
        <textarea id="message" name="message" required aria-required="true" rows={4} placeholder="Start your message..." className="w-full bg-transparent border-b border-outline-variant/30 pb-2 text-sm text-on-surface outline-none focus:border-secondary transition-colors resize-none" />
      </div>

      {state === 'error' && (
        <p id="form-error" className="text-xs text-error mb-3" role="alert">
          메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.
        </p>
      )}

      {state === 'success' && (
        <p className="text-xs text-secondary mb-3" role="status">
          메시지가 전송되었습니다. 감사합니다!
        </p>
      )}

      <SubmitButton state={state} />
    </form>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ContactForm.tsx
git commit -m "feat: improve ContactForm accessibility with ARIA attributes and live regions"
```

---

### Task 8: TokenFlowDemo Dark Mode

**Files:**
- Modify: `src/components/demos/shared/styles.ts`
- Modify: `src/components/demos/TokenFlowDemo.tsx`

- [ ] **Step 1: Update styles.ts to use theme variables**

Replace `src/components/demos/shared/styles.ts`:

```typescript
export const colors = {
  system: '#ef4444',
  skills: '#f59e0b',
  user: '#3b82f6',
  response: '#10b981',
  clipped: '#6b7280',
} as const;

export const demoContainer: React.CSSProperties = {
  background: 'var(--color-surface-container-lowest)',
  color: 'var(--color-on-surface)',
  border: '1px solid var(--color-outline-variant)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  fontSize: '0.875rem',
};
```

- [ ] **Step 2: Update TokenFlowDemo.tsx inline references**

In `src/components/demos/TokenFlowDemo.tsx`:

Line 49 — TokenBar border:
```tsx
// Change:
border: '1px solid var(--border-color, #262626)'
// To:
border: '1px solid var(--color-outline-variant)'
```

Line 61 — empty space pattern:
```tsx
// Change:
background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border-color, #262626) 4px, var(--border-color, #262626) 5px)'
// To:
background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--color-outline-variant) 4px, var(--color-outline-variant) 5px)'
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/shared/styles.ts src/components/demos/TokenFlowDemo.tsx
git commit -m "feat: integrate TokenFlowDemo with theme system for dark mode compatibility"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Clean build**

```bash
cd /Users/ralph/projects/the-greenhouse && rm -rf dist && npm run build
```

Expected: Build succeeds + pagefind indexes pages.

- [ ] **Step 2: Visual smoke test**

```bash
npm run dev
```

Check at `http://localhost:4321`:
1. **Typography**: headings scale smoothly on mobile resize
2. **Reading time**: visible on PostCards and post detail headers
3. **JSON-LD**: view page source on a post, verify `<script type="application/ld+json">`
4. **ToC**: visible in sidebar on flora/nursery posts, as `<details>` on seeds, active heading tracks on scroll
5. **Search**: `/search/` page renders Pagefind UI, typing returns results
6. **Tags**: flora/nursery/seeds index pages show tag buttons, clicking filters posts
7. **ContactForm**: screen reader can identify required fields, error/success announced
8. **TokenFlowDemo**: demo blends with page in dark mode, colored bars still visible
