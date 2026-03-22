# Critical Frontend Fixes — Design Spec

**Date:** 2026-03-22
**Scope:** 4 critical issues in the-greenhouse

---

## 1. ContactForm Fix

**Problem:** Form action uses placeholder `FORM_ID`, making submissions fail.

**Changes:**
- Replace `https://formspree.io/f/FORM_ID` → `https://formspree.io/f/mbdzepdo`
- Replace inline `style={}` props with Tailwind utility classes for dark mode compatibility and responsive grid
- Name/email grid: `grid grid-cols-1 md:grid-cols-2 gap-4` (stacks on mobile, side-by-side on desktop)
- Keep `formStyle`, `labelStyle`, `inputStyle` as Tailwind classes on the elements directly
- No new dependencies — keep current custom fetch-based implementation

**Files:**
- `src/components/ContactForm.tsx` — form action URL + inline styles → Tailwind classes

---

## 2. Mobile Menu — Hamburger Drawer

**Problem:** Navbar uses `overflow-x-auto` as a band-aid. Links overflow or get clipped on small screens.

**Behavior:**
- `md:` breakpoint and above: current horizontal nav unchanged
- Below `md:`: show hamburger icon (3-line), hide nav links
- Click hamburger: drawer slides down from top with CSS transition (`max-height` + `opacity`, `300ms ease`)
- Click again, navigate, or press `Escape`: drawer closes
- Click outside drawer (on page body): drawer closes
- Active page indicator preserved in drawer links

**Implementation:**
- Pure Astro component with inline `<script>` for toggle (no React island)
- CSS transition on `.nav-drawer` for slide animation
- Hamburger button: `aria-expanded`, `aria-controls`, `aria-label="메뉴"`
- Focus trap not required (simple vertical list, not modal overlay)

**Files:**
- `src/components/Navbar.astro` — restructure markup, add hamburger + drawer

---

## 3. Dark Mode — Three-way Toggle

**Problem:** No dark mode. All colors hardcoded to light palette.

**Color tokens (dark variant):**

| Token | Light | Dark |
|-------|-------|------|
| `surface` | `#faf9f6` | `#111411` |
| `surface-dim` | `#d6dbd5` | `#0d0f0d` |
| `surface-container` | `#edeeea` | `#1a1d1a` |
| `surface-container-low` | `#f4f4f0` | `#151815` |
| `surface-container-high` | `#e6e9e4` | `#222522` |
| `surface-container-highest` | `#e0e4de` | `#2a2d2a` |
| `surface-container-lowest` | `#ffffff` | `#0a0c0a` |
| `primary` | `#5a5f62` | `#a8adb0` |
| `primary-dim` | `#4e5356` | `#9a9fa2` |
| `primary-container` | `#dfe3e7` | `#2a2e32` |
| `on-primary` | `#f4f8fc` | `#1a1e22` |
| `secondary` | `#546353` | `#8aab86` |
| `secondary-container` | `#d7e7d3` | `#2a3a28` |
| `on-secondary-container` | `#475546` | `#c0d4bc` |
| `tertiary` | `#7e572e` | `#c49a6c` |
| `tertiary-container` | `#d9a777` | `#3a2a18` |
| `on-surface` | `#2f3430` | `#e0e4de` |
| `on-surface-variant` | `#5c605c` | `#9a9e9a` |
| `outline` | `#777c77` | `#5c605c` |
| `outline-variant` | `#afb3ae` | `#3a3e3a` |
| `error` | `#9e422c` | `#e07a62` |

**How CSS variable override works with Tailwind v4:**
Tailwind v4 `@theme` tokens compile utility classes like `bg-surface` to `background-color: var(--color-surface)`. Since they reference CSS custom properties at runtime, overriding `--color-surface` under `[data-theme="dark"]` works without any build-time configuration.

**Tailwind Typography (prose) in dark mode:**
The `.greenhouse-prose` utility and direct `prose prose-neutral` usage (e.g., `privacy.astro`) use hardcoded neutral colors. Under `[data-theme="dark"]`, override Typography CSS variables:
- `--tw-prose-body`, `--tw-prose-headings`, `--tw-prose-links`, `--tw-prose-bold`, `--tw-prose-code`, `--tw-prose-pre-bg`, `--tw-prose-pre-code`, `--tw-prose-quotes`, `--tw-prose-counters`, `--tw-prose-bullets`, `--tw-prose-hr`, `--tw-prose-th-borders`, `--tw-prose-td-borders`

All mapped to the dark token equivalents.

**Toggle UI:**
- 3-state icon button in Navbar: sun (light) → moon (dark) → monitor (system)
- Cycle on click: light → dark → system → light
- Current state saved to `localStorage` key `theme`
- Icons: Inline SVG (simple sun/moon/monitor glyphs). No icon library dependency.

**FOUC prevention:**
- Inline `<script>` in `<head>` (before any CSS render):
  - Read `localStorage.theme`
  - If `"light"` or `"dark"`: set `document.documentElement.dataset.theme`
  - If `"system"` or absent: check `matchMedia('(prefers-color-scheme: dark)')`, set accordingly
- `matchMedia` change listener: only applies when `localStorage.theme` is `"system"` or absent. Explicit light/dark choice is never overridden by system changes.

**CSS strategy:**
- Light tokens remain as default in `@theme`
- Dark tokens applied via `[data-theme="dark"]` selector overriding CSS custom properties
- `color-scheme` on `html`: set dynamically to `light` or `dark` matching the resolved theme (not static `light dark`)

**Meta tag:**
- `theme-color` updated dynamically via the same inline script (`#faf9f6` for light, `#111411` for dark)

**Files:**
- `src/styles/global.css` — dark token overrides + Typography dark overrides
- `src/layouts/Layout.astro` — inline FOUC script, dynamic theme-color + color-scheme
- `src/components/Navbar.astro` — theme toggle button
- `src/components/ThemeToggle.astro` — new component (toggle logic + inline SVG icons)

---

## 4. 404 Page — With Navigation

**Problem:** No custom 404 page. Broken links show Astro's default error.

**Layout:**
- Uses shared `Layout.astro` (Navbar + Footer included)
- Generous vertical spacing: `py-32 md:py-40` on main container
- Centered content, `max-w-md mx-auto`

**Content (top to bottom):**
1. `404` — large heading (`text-6xl md:text-7xl`, `font-weight: 500`, `letter-spacing: -0.02em`)
2. Message — `이 페이지는 아직 싹이 트지 않았습니다.` (`text-on-surface-variant`, `text-base`, `mt-4`)
3. Spacer — `mt-12`
4. Section links — labeled "둘러보기" (`text-xs uppercase tracking-widest text-on-surface-variant mb-4`)
   - Pull from `SECTION_INDEX_CONFIG` (3 content sections: Flora, Nursery, Seeds)
   - Each link: section name (`text-sm font-medium text-secondary`) + description (`text-xs text-on-surface-variant`)
   - Separated by `border-b border-outline-variant/20`, padding `py-3`
5. Spacer — `mt-8`
6. Home link — `← 홈으로 돌아가기` (`text-sm text-on-surface-variant hover:text-on-surface`)

**Files:**
- `src/pages/404.astro` — new file

---

## Intentionally Excluded

- **Demo components** (`TokenFlowDemo.tsx`, `demos/shared/styles.ts`): Self-themed with dark backgrounds by design (terminal-style). Not part of the site's light/dark system.
- CI/CD pipeline (no deploy.yml)
- OG image generation
- Search, ToC, reading time
- Tag filtering
- Structured data (JSON-LD)

These are tracked as Important/Nice-to-have for a future iteration.
