# Important Frontend Improvements — Design Spec

**Date:** 2026-03-22
**Scope:** 8 improvements for the-greenhouse frontend quality

---

## 1. JSON-LD Structured Data

**Problem:** No schema.org markup. Search engines can't generate rich snippets.

**Implementation:**

Article pages (`ogType === 'article'`): inject `<script type="application/ld+json">` in `Layout.astro` with:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<title>",
  "datePublished": "<date ISO>",
  "author": { "@type": "Person", "name": "Bunnykey", "url": "https://bunnykey.github.io/gardener/" },
  "description": "<description>",
  "image": "<ogImageUrl>"
}
```

Non-article pages: `WebSite` schema with `name` and `url`.

Gardener page: additional `Person` schema.

**Props to add to Layout.astro:**
- `articleDate?: string` (ISO date string for Article schema)

**Callers that must pass `articleDate`:**
- `src/pages/flora/[...slug].astro` — `articleDate={entry.data.date.toISOString()}`
- `src/pages/nursery/[...slug].astro` — `articleDate={entry.data.date.toISOString()}`
- `src/pages/seeds/[...slug].astro` — `articleDate={entry.data.date.toISOString()}`

**Files:**
- `src/layouts/Layout.astro` — conditional JSON-LD injection
- `src/pages/flora/[...slug].astro` — pass `articleDate` + `ogType="article"`
- `src/pages/nursery/[...slug].astro` — pass `articleDate` + `ogType="article"`
- `src/pages/seeds/[...slug].astro` — pass `articleDate` + `ogType="article"`

---

## 2. Responsive Typography

**Problem:** h1-h6 don't scale on mobile. Fixed sizes cause overflow or poor readability.

**Changes in `src/styles/global.css` `@layer base`:**

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

No other files affected. Tailwind utility classes like `text-6xl` on specific pages (404) override these base styles, which is correct.

**Files:**
- `src/styles/global.css`

---

## 3. Reading Time

**Problem:** Users can't estimate post length before clicking.

**Utility:** `src/utils/reading-time.ts`

```typescript
export function readingTime(text: string): number {
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const englishWords = text.replace(/[\u3131-\uD79D]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}
```

- Korean: 500 chars/min, English: 200 words/min
- Returns integer minutes, minimum 1
- **Known limitation:** Regex range `[\u3131-\uD79D]` includes CJK characters beyond Korean Hangul. Acceptable for a primarily Korean/English blog.

**Display:**
- `PostCard.astro`: add `· N min` after date, in `text-on-surface-variant text-xs`
- Post detail pages (`[...slug].astro`): add reading time in post header area

The `body` text is available from Astro's content collection `entry.body`.

**Files:**
- `src/utils/reading-time.ts` — new
- `src/components/PostCard.astro` — add reading time display
- `src/pages/flora/[...slug].astro` — add to header
- `src/pages/nursery/[...slug].astro` — add to header
- `src/pages/seeds/[...slug].astro` — add to header

---

## 4. Table of Contents (ToC)

**Problem:** Long posts have no navigable structure.

**Component:** `src/components/TableOfContents.astro`

Receives `headings` array from Astro's `entry.render()` result. Slug pages must destructure `{ Content, headings }` from `entry.render()` (currently only destructure `{ Content }`).

Renders a nested list of h2/h3 links (`<a href="#slug">`). h3 items indented under their parent h2.

**Placement:**
- **Flora/Nursery** (has PostSidebar): Desktop — inside `PostSidebar.astro`, above series nav. Sidebar gets `sticky top-24`. Mobile — `<details>` block above prose.
- **Seeds** (no sidebar, single-column): Mobile-style `<details>` only, placed above prose content. No sidebar added.

**Scroll anchor offset:** Add `scroll-margin-top: 6rem` to h2/h3 in `global.css` so anchor jumps clear the sticky nav.

**Active heading tracking:**
- Inline `<script>` in ToC component
- `IntersectionObserver` on all heading elements with `rootMargin: '-80px 0px -70% 0px'` (accounts for sticky nav + selects heading entering top 30% of viewport)
- When multiple headings are visible, highlight the topmost one
- Active link gets `text-on-surface font-medium` (vs default `text-on-surface-variant`)

**Conditional rendering:** Only render ToC if `headings.length >= 3` (too few headings = no value).

**Files:**
- `src/components/TableOfContents.astro` — new
- `src/components/PostSidebar.astro` — add ToC, make sticky
- `src/pages/flora/[...slug].astro` — pass headings to sidebar
- `src/pages/nursery/[...slug].astro` — pass headings to sidebar
- `src/pages/seeds/[...slug].astro` — add inline `<details>` ToC (no sidebar)
- `src/styles/global.css` — add `scroll-margin-top: 6rem` on h2, h3

---

## 5. Search — Pagefind

**Problem:** No way to find posts by keyword.

**Setup:**
- `npm install -D pagefind`
- Add `"postbuild": "pagefind --site dist"` to `package.json` scripts
- `npm run build` then automatically runs pagefind indexing

**Search page:** `src/pages/search.astro`
- Imports Pagefind UI CSS + JS from `/pagefind/pagefind-ui.css` and `/pagefind/pagefind-ui.js`
- Mounts `new PagefindUI({ element: "#search" })` via inline `<script>`
- Styled to match design system (override Pagefind default CSS variables)

**Content marking:**
- Post content in `[...slug].astro` pages already renders in `<article>` or `<main>` — Pagefind auto-indexes these
- Add `data-pagefind-body` to the prose content container
- `data-pagefind-body` on the prose container is the positive signal; Pagefind only indexes elements marked with this attribute. No need for explicit `data-pagefind-ignore` on nav/footer since they live outside `data-pagefind-body`.

**Nav integration:**
- Add search icon as a standalone `<a href="/search/">` next to `ThemeToggle`, before the hamburger button (same area as theme toggle, not in the `navLinks` text array)
- Magnifying glass inline SVG, `w-4 h-4`, same styling as ThemeToggle (`text-on-surface-variant hover:text-on-surface`)
- Also appears in mobile drawer as a text link "Search"

**Files:**
- `package.json` — add pagefind devDep + postbuild script
- `src/pages/search.astro` — new
- `src/components/Navbar.astro` — add search link
- `src/pages/flora/[...slug].astro` — add `data-pagefind-body`
- `src/pages/nursery/[...slug].astro` — add `data-pagefind-body`
- `src/pages/seeds/[...slug].astro` — add `data-pagefind-body`

---

## 6. Tag Filtering — Inline

**Problem:** Tags on posts are non-functional. Can't browse by topic.

**How it works:**
- Section index pages render all unique tags as buttons above the post list
- Each PostCard gets `data-tags="tag1,tag2"` attribute
- Clicking a tag button toggles it active, JS hides PostCards that don't match any active tag
- Multiple tags = OR logic (show posts matching ANY selected tag)
- No tag selected = show all
- Active tag button gets `bg-secondary-container text-on-secondary-container` style
- URL hash updates on filter (e.g., `#ai`) for shareability, read on page load

**Implementation:**
- Extract unique tags from posts in the Astro frontmatter
- Render tag buttons as `<button data-tag="ai">` with inline `<script>` for toggle logic
- PostCard already receives post data; add `data-tags` from `post.data.tags?.join(',')` (if tags are undefined/empty, omit attribute)
- Seeds index: ensure `tags` prop is passed to PostCard (currently may not be passed)

**Files:**
- `src/pages/flora/index.astro` — add tag filter UI + script
- `src/pages/nursery/index.astro` — add tag filter UI + script
- `src/pages/seeds/index.astro` — add tag filter UI + script
- `src/components/PostCard.astro` — add `data-tags` attribute

---

## 7. ContactForm Accessibility

**Problem:** Missing ARIA attributes for screen readers.

**Changes in `src/components/ContactForm.tsx`:**

Required fields:
```tsx
<input ... required aria-required="true" />
```

Error state — single generic error with `role="alert"`:
```tsx
{state === 'error' && (
  <p id="form-error" className="..." role="alert">
    메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.
  </p>
)}
```

Per-field `aria-invalid` is out of scope (no per-field validation — Formspree validates server-side). The error is a generic submission failure, so `aria-invalid` on individual fields would be misleading.

Success state — add live region:
```tsx
{state === 'success' && (
  <p role="status" className="...">
    메시지가 전송되었습니다. 감사합니다!
  </p>
)}
```

**Files:**
- `src/components/ContactForm.tsx`

---

## 8. TokenFlowDemo Dark Mode Compatibility

**Problem:** Demo uses hardcoded dark colors that don't integrate with the site's theme system.

**Current state:** `TokenFlowDemo.tsx` and `demos/shared/styles.ts` use hex colors like `#0a0a0a`, `#262626`, `#ededed`.

**Change:** The demo is intentionally dark-themed (terminal style). In light mode it stands out as a dark island, which is fine. In dark mode, it should blend with the page.

Replace existing custom property names in `styles.ts` (`var(--bg-color, ...)`, `var(--border-color, ...)`, `var(--text-color, ...)`) with the theme system variables directly:
- `--bg-color` / `#0a0a0a` → `var(--color-surface-container-lowest)`
- `--text-color` / `#ededed` → `var(--color-on-surface)`
- `--border-color` / `#262626` → `var(--color-outline-variant)`

Also update `TokenFlowDemo.tsx` inline references (line 49, 61) that use `var(--border-color, #262626)`.

Keep the colored bars (system prompt blue, skills green, etc.) as hardcoded — they are data visualization colors, not theme colors.

**Files:**
- `src/components/demos/shared/styles.ts` — replace custom property fallbacks with theme variables
- `src/components/demos/TokenFlowDemo.tsx` — replace inline `var(--border-color, ...)` references

---

## Out of Scope

- CI/CD pipeline
- RSS `<link>` tag in head
- manifest.json / PWA
- Font preload
- Code syntax highlighting config
- Image lazy loading / srcset
- "Back to top" button
- Page transitions
