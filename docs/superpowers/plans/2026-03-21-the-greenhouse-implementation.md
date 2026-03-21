# The Greenhouse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild bunnykey.github.io as "The Greenhouse" using the Stitch Greenhouse MD3 design system in a separate repo.

**Architecture:** Astro SSG with Tailwind CSS v4 for styling, React islands for interactive components (contact form, demos). Content collections mirror bunnykey's structure with renamed sections (ai→flora, garden→nursery, notes→seeds). Notion CMS adapters ported with name mapping updates.

**Tech Stack:** Astro 5, Tailwind CSS 4, React 19, @tailwindcss/typography, sharp (OG images)

**Spec:** `docs/superpowers/specs/2026-03-21-the-greenhouse-redesign-design.md`

**Source project:** `/Users/ralph/projects/bunnykey.github.io/`

---

## File Map

| File | Responsibility | Source |
|------|---------------|--------|
| `astro.config.mjs` | Astro + Tailwind + React + Sitemap config | New (based on bunnykey) |
| `package.json` | Dependencies | New |
| `tsconfig.json` | TypeScript config | Copy from bunnykey |
| `src/styles/global.css` | Greenhouse MD3 design tokens + base styles | New |
| `src/layouts/Layout.astro` | Navbar + Footer + Head + OG meta | New |
| `src/consts/site.ts` | Site name, URL, section fallbacks | New (based on bunnykey) |
| `src/consts/sections.ts` | Section config, stage emoji, sort helpers | New (based on bunnykey) |
| `src/utils/series.ts` | Series navigation utilities | Copy + rename types |
| `src/content/config.ts` | Astro content collection schemas | New (based on bunnykey) |
| `src/content/cms-contract.ts` | CMS entry schema | Copy from bunnykey |
| `src/content/cms-adapter.mjs` | CMS adapter | Copy + update section names |
| `src/content/notion-*.mjs` | Notion CMS sync | Copy + update section names |
| `scripts/sync_notion_content.mjs` | Notion sync CLI script | Port from bunnykey |
| `.env.example` | Required env vars template | New |
| `src/components/Navbar.astro` | Top navigation bar | New |
| `src/components/Footer.astro` | Footer with links | New |
| `src/components/SectionCard.astro` | Home page section card (Flora/Nursery/Seeds) | New |
| `src/components/PostCard.astro` | Section index post card | New |
| `src/components/PostSidebar.astro` | Post detail sidebar (series + tags) | New |
| `src/components/SeriesNav.astro` | Inline series navigation | Port from bunnykey |
| `src/components/ContactForm.tsx` | React island contact form | New |
| `src/components/demos/` | Interactive demos | Copy from bunnykey |
| `src/pages/index.astro` | Home: Section Hub + Latest | New |
| `src/pages/gardener.astro` | The Gardener: profile + contact | New |
| `src/pages/privacy.astro` | Privacy policy | New |
| `src/pages/rss.xml.ts` | Unified RSS feed | New |
| `src/pages/flora/index.astro` | Flora card grid index | New |
| `src/pages/flora/[...slug].astro` | Flora post detail | New (based on bunnykey ai/) |
| `src/pages/flora/series/[name].astro` | Flora series index | Port from bunnykey |
| `src/pages/nursery/index.astro` | Nursery card grid index | New |
| `src/pages/nursery/[...slug].astro` | Nursery post detail | New |
| `src/pages/nursery/series/[name].astro` | Nursery series index | New |
| `src/pages/seeds/index.astro` | Seeds card grid index | New |
| `src/pages/seeds/[...slug].astro` | Seeds post detail | New |
| `src/pages/og/[...slug].png.ts` | OG image generation | Port from bunnykey |
| `src/assets/fonts/` | Inter font files | New (or Google Fonts CDN) |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/favicon.svg`

- [ ] **Step 1: Initialize Astro project**

```bash
cd /Users/ralph/projects/the-greenhouse
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
```

Note: The directory is not empty (has `.git`, `docs/`). The `--yes` flag skips the overwrite prompt. If it still prompts, use the generated files as reference and manually create only `astro.config.mjs`, `package.json`, `tsconfig.json`.

- [ ] **Step 2: Update package.json**

Replace the generated `package.json` with:

```json
{
  "name": "the-greenhouse",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev --port 4321",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "node --test",
    "sync:notion": "node scripts/sync_notion_content.mjs"
  },
  "dependencies": {
    "@astrojs/react": "^5.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.7.0",
    "@tailwindcss/vite": "^4.2.1",
    "astro": "^5.17.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "sharp": "^0.33.0",
    "tailwindcss": "^4.2.1"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19"
  }
}
```

- [ ] **Step 3: Write astro.config.mjs**

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://bunnykey.github.io',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), react()]
});
```

- [ ] **Step 4: Copy tsconfig.json from bunnykey**

```bash
cp /Users/ralph/projects/bunnykey.github.io/tsconfig.json /Users/ralph/projects/the-greenhouse/tsconfig.json
```

- [ ] **Step 5: Create placeholder favicon**

Create `public/favicon.svg` — a simple greenhouse/plant icon.

- [ ] **Step 6: Install dependencies**

```bash
cd /Users/ralph/projects/the-greenhouse && npm install
```

- [ ] **Step 7: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro build
```

Expected: Build succeeds (empty site).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Astro project with Tailwind v4 + React"
```

---

### Task 2: Design Tokens & Global CSS

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write global.css with Greenhouse tokens**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* Surface hierarchy */
  --color-surface: #faf9f6;
  --color-surface-dim: #d6dbd5;
  --color-surface-container: #edeeea;
  --color-surface-container-low: #f4f4f0;
  --color-surface-container-high: #e6e9e4;
  --color-surface-container-highest: #e0e4de;
  --color-surface-container-lowest: #ffffff;

  /* Primary (neutral gray) */
  --color-primary: #5a5f62;
  --color-primary-dim: #4e5356;
  --color-primary-container: #dfe3e7;
  --color-on-primary: #f4f8fc;

  /* Secondary (sage) */
  --color-secondary: #546353;
  --color-secondary-container: #d7e7d3;
  --color-on-secondary-container: #475546;

  /* Tertiary (earth) */
  --color-tertiary: #7e572e;
  --color-tertiary-container: #d9a777;

  /* Text */
  --color-on-surface: #2f3430;
  --color-on-surface-variant: #5c605c;

  /* Borders */
  --color-outline: #777c77;
  --color-outline-variant: #afb3ae;

  /* Error */
  --color-error: #9e422c;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;

  /* Spacing scale */
  --spacing-micro: 0.5rem;
  --spacing-base: 1rem;
  --spacing-md: 1.4rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3.5rem;
  --spacing-2xl: 5.5rem;
  --spacing-3xl: 7rem;
}

@layer base {
  html {
    @apply antialiased;
    font-family: var(--font-sans);
  }

  body {
    background-color: var(--color-surface);
    color: var(--color-on-surface);
    line-height: 1.7;
    margin: 0;
  }

  h1 {
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  h2 {
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  h3, h4, h5, h6 {
    font-weight: 500;
  }

  :focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 3px;
  }

  ::selection {
    background: color-mix(in srgb, var(--color-secondary) 30%, transparent);
    color: var(--color-on-surface);
  }
}

@layer utilities {
  .skip-link {
    position: absolute;
    left: 1rem;
    top: 1rem;
    transform: translateY(-200%);
    background: var(--color-surface);
    color: var(--color-on-surface);
    border: 1px solid var(--color-outline-variant);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    z-index: 100;
    text-decoration: none;
  }

  .skip-link:focus {
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css && git commit -m "feat: add Greenhouse MD3 design tokens"
```

---

### Task 3: Layout Shell (Navbar + Footer)

**Files:**
- Create: `src/components/Navbar.astro`, `src/components/Footer.astro`, `src/layouts/Layout.astro`
- Create: `src/consts/site.ts`

- [ ] **Step 1: Write site.ts constants**

```typescript
export const SITE = {
  name: "The Greenhouse",
  siteUrl: "https://bunnykey.github.io",
  defaultDescription:
    "The Greenhouse — AI 분석, 디지털 가든, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.",
  defaultOgImage: "/og-default.svg",
  pinnedRoutes: [
    "/",
    "/gardener/",
    "/flora/",
    "/nursery/",
    "/seeds/",
  ],
} as const;

export const SECTION_FALLBACKS = {
  home: "디지털 정원. AI, 크립토, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.",
  gardener: "The Gardener — 프로필, 소셜 링크, 연락처.",
  flora: "AI 런칭, 모델 변화, 에이전트 제품에 대한 큐레이션 노트.",
  nursery: "자라는 아이디어, 미완의 생각, 에버그린 노트.",
  seeds: "짧은 메모, 순간 포착, 씨앗 단계의 글.",
} as const;

export function toCanonicalUrl(pathname: string): string {
  const normalized =
    pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return `${SITE.siteUrl}${normalized}`;
}
```

- [ ] **Step 2: Write Navbar.astro**

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

<nav class="flex items-center justify-between px-6 md:px-10 py-6 bg-surface-container-low" aria-label="Main navigation">
  <a href="/" class="text-lg font-semibold tracking-tight text-on-surface hover:opacity-80 transition-opacity">
    {SITE.name}
  </a>
  <div class="flex items-center gap-6 md:gap-8 overflow-x-auto">
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
</nav>
```

- [ ] **Step 3: Write Footer.astro**

```astro
---
import { SITE } from '../consts/site';
---

<footer class="px-6 md:px-10 py-8 bg-surface-container-low" role="contentinfo">
  <div class="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
    <div>
      <span class="text-sm font-semibold text-on-surface">{SITE.name}</span>
      <p class="text-xs text-on-surface-variant mt-1">
        &copy; {new Date().getFullYear()} Cultivated with care.
      </p>
    </div>
    <div class="flex items-center gap-6">
      <a href="/privacy/" class="text-xs text-on-surface-variant hover:text-on-surface transition-colors">Privacy</a>
      <a href="/rss.xml" class="text-xs text-on-surface-variant hover:text-on-surface transition-colors">RSS</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Write Layout.astro**

```astro
---
import '../styles/global.css';
import { SITE, toCanonicalUrl } from '../consts/site';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

const {
  title,
  description = SITE.defaultDescription,
  canonicalPath = Astro.url.pathname,
  ogTitle = title,
  ogDescription = description,
  ogImage,
  ogType = 'website',
} = Astro.props;
const canonicalUrl = toCanonicalUrl(canonicalPath);
const currentPath = Astro.url.pathname;
const inferredOgImage =
  currentPath.match(/^\/(flora|nursery|seeds)\/[^/]+\/$/)
    ? `${currentPath.replace(/\/$/, '')}.png`.replace(/^\/(flora|nursery|seeds)\//, '/og/$1/')
    : undefined;
const resolvedOgImage = ogImage || inferredOgImage || SITE.defaultOgImage;
const ogImageUrl = resolvedOgImage.startsWith('http')
  ? resolvedOgImage
  : `${SITE.siteUrl}${resolvedOgImage}`;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonicalUrl} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={ogDescription} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={ogImageUrl} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={ogTitle} />
    <meta name="twitter:description" content={ogDescription} />
    <meta name="twitter:image" content={ogImageUrl} />
    <meta name="theme-color" content="#faf9f6" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" class="flex-grow">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Create a minimal index.astro to verify**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="The Greenhouse">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <h1 class="text-4xl tracking-tight">The Greenhouse.</h1>
    <p class="text-lg text-on-surface-variant mt-4">Coming soon.</p>
  </div>
</Layout>
```

- [ ] **Step 6: Run dev server to verify**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro dev --port 4321
```

Open http://localhost:4321 — verify navbar, footer, Inter font, Greenhouse colors render correctly.

- [ ] **Step 7: Commit**

```bash
git add src/ && git commit -m "feat: add Layout shell with Navbar, Footer, and design tokens"
```

---

### Task 4: Content Infrastructure

**Files:**
- Create: `src/content/config.ts`, `src/consts/sections.ts`, `src/utils/series.ts`
- Create: `src/content/flora/`, `src/content/nursery/`, `src/content/seeds/` (sample content)
- Copy: `src/content/cms-contract.ts`, `src/content/cms-adapter.mjs`, `src/content/notion-*.mjs`

- [ ] **Step 1: Write content/config.ts**

```typescript
import { z, defineCollection } from 'astro:content';

const seriesSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'series.name must be a URL-safe slug'),
  title: z.string(),
  order: z.number().int().positive(),
}).optional();

const floraCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    highlight: z.boolean().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema,
    demo: z.enum(['TokenFlowDemo']).optional(),
    draft: z.boolean().optional(),
  }),
});

const nurseryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    stage: z.enum(['seed', 'growing', 'evergreen']).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema,
    draft: z.boolean().optional(),
  }),
});

const seedsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema, // Schema retained for extensibility, no UI support in v1
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  flora: floraCollection,
  nursery: nurseryCollection,
  seeds: seedsCollection,
};
```

- [ ] **Step 2: Write consts/sections.ts**

```typescript
export type SectionKey = "flora" | "nursery" | "seeds";

export const SECTION_INDEX_CONFIG: Record<
  SectionKey,
  {
    pageTitle: string;
    heading: string;
    intro: string;
    emptyMessage: string;
    accentClass: string;
  }
> = {
  flora: {
    pageTitle: "Flora - The Greenhouse",
    heading: "Flora",
    intro: "AI 런칭, 모델 변화, 에이전트 제품, 그리고 생태계가 실제로 어디로 향하는지에 대한 큐레이션 노트.",
    emptyMessage: "No flora posts yet.",
    accentClass: "text-secondary",
  },
  nursery: {
    pageTitle: "Nursery - The Greenhouse",
    heading: "Nursery",
    intro: "자라는 아이디어, 미완의 생각, 그리고 계속 진화하는 에버그린 노트.",
    emptyMessage: "No nursery notes yet.",
    accentClass: "text-secondary",
  },
  seeds: {
    pageTitle: "Seeds - The Greenhouse",
    heading: "Seeds",
    intro: "짧은 메모, 순간 포착, 그리고 더 큰 조각이 되기 전의 씨앗들.",
    emptyMessage: "No seeds yet.",
    accentClass: "text-tertiary",
  },
};

export const NURSERY_STAGE_EMOJI: Record<string, string> = {
  seed: "🌱",
  growing: "🌿",
  evergreen: "🌳",
};

export function formatArchiveDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function filterPublished<T extends { data: { draft?: boolean } }>(items: T[]): T[] {
  if (import.meta.env.PROD) {
    return items.filter((item) => !item.data.draft);
  }
  return items;
}
```

- [ ] **Step 3: Write utils/series.ts**

Copy from bunnykey and update the type:

```typescript
type SupportedCollection = 'flora' | 'nursery' | 'seeds';

// ... rest is identical to bunnykey's src/utils/series.ts
```

```bash
cp /Users/ralph/projects/bunnykey.github.io/src/utils/series.ts /Users/ralph/projects/the-greenhouse/src/utils/series.ts
```

Then edit line 1: `'ai' | 'garden' | 'notes'` → `'flora' | 'nursery' | 'seeds'`

- [ ] **Step 4: Copy and update CMS adapters**

```bash
cp /Users/ralph/projects/bunnykey.github.io/src/content/cms-contract.ts /Users/ralph/projects/the-greenhouse/src/content/
cp /Users/ralph/projects/bunnykey.github.io/src/content/cms-adapter.mjs /Users/ralph/projects/the-greenhouse/src/content/
cp /Users/ralph/projects/bunnykey.github.io/src/content/notion-adapter.mjs /Users/ralph/projects/the-greenhouse/src/content/
cp /Users/ralph/projects/bunnykey.github.io/src/content/notion-client.mjs /Users/ralph/projects/the-greenhouse/src/content/
cp /Users/ralph/projects/bunnykey.github.io/src/content/notion-sync.mjs /Users/ralph/projects/the-greenhouse/src/content/
```

**`cms-adapter.mjs` edits:**
- Line 1: `SUPPORTED_SECTIONS = new Set(['ai', 'notes'])` → `new Set(['flora', 'seeds'])` (note: bunnykey never supported `garden` in CMS, so nursery is also not CMS-supported — keeping parity)

**`notion-sync.mjs` edits:**
- Line 36: `entry.section === 'ai'` → `entry.section === 'flora'`
- Line 40: `entry.section === 'notes' || entry.section === 'ai'` → `entry.section === 'seeds' || entry.section === 'flora'`

- [ ] **Step 4b: Port Notion sync script**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/scripts
cp /Users/ralph/projects/bunnykey.github.io/scripts/sync_notion_content.mjs /Users/ralph/projects/the-greenhouse/scripts/
```

**`scripts/sync_notion_content.mjs` edits:**
- Line 6: `PROJECT_ROOT` → `'/Users/ralph/projects/the-greenhouse'`
- Lines 8-11: `CONTENT_DIRS` keys and paths:
  ```javascript
  const CONTENT_DIRS = {
    flora: path.join(PROJECT_ROOT, 'src/content/flora'),
    seeds: path.join(PROJECT_ROOT, 'src/content/seeds'),
  };
  ```
- Line 41: `dataSources` keys: `ai` → `flora`, `notes` → `seeds`
- Lines 44-47: `gitOwnedSlugs` keys: `ai` → `flora`, `notes` → `seeds`
- Lines 60-61: `loadGitOwnedSlugs` calls: `'ai'` → `'flora'`, `'notes'` → `'seeds'`
- Env var names: `NOTION_AI_DATA_SOURCE_ID` → `NOTION_FLORA_DATA_SOURCE_ID`, `NOTION_NOTES_DATA_SOURCE_ID` → `NOTION_SEEDS_DATA_SOURCE_ID`

- [ ] **Step 4c: Create .env.example**

```
NOTION_TOKEN=
NOTION_FLORA_DATA_SOURCE_ID=
NOTION_SEEDS_DATA_SOURCE_ID=
```

- [ ] **Step 5: Copy sample content from bunnykey**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/src/content/{flora,nursery,seeds}
cp /Users/ralph/projects/bunnykey.github.io/src/content/ai/*.md /Users/ralph/projects/the-greenhouse/src/content/flora/
cp /Users/ralph/projects/bunnykey.github.io/src/content/garden/*.md /Users/ralph/projects/the-greenhouse/src/content/nursery/
cp /Users/ralph/projects/bunnykey.github.io/src/content/notes/*.md /Users/ralph/projects/the-greenhouse/src/content/seeds/
```

- [ ] **Step 6: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro build
```

Expected: Build succeeds. Content collections resolve correctly.

- [ ] **Step 7: Commit**

```bash
git add src/content/ src/consts/sections.ts src/utils/series.ts && git commit -m "feat: add content collections, sections config, series utils, CMS adapters"
```

---

### Task 5: Home Page — Section Hub + Latest

**Files:**
- Create: `src/components/SectionCard.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write SectionCard.astro**

```astro
---
interface Props {
  icon: string;
  name: string;
  description: string;
  count: number;
  href: string;
  variant?: 'sage' | 'earth';
}

const { icon, name, description, count, href, variant = 'sage' } = Astro.props;
const bgClass = variant === 'earth' ? 'bg-tertiary-container/30' : 'bg-secondary-container/30';
---

<a href={href} class:list={["block rounded-lg p-6 transition-all hover:shadow-sm", bgClass]}>
  <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant text-lg mb-4">
    {icon}
  </div>
  <h3 class="text-base font-medium text-on-surface mb-1">{name}</h3>
  <p class="text-sm text-on-surface-variant leading-relaxed mb-3">{description}</p>
  <span class="text-sm text-secondary">{count} posts &rarr;</span>
</a>
```

- [ ] **Step 2: Write index.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import SectionCard from '../components/SectionCard.astro';
import { getCollection } from 'astro:content';
import { SECTION_FALLBACKS } from '../consts/site';
import { filterPublished, sortByDateDesc, formatArchiveDate } from '../consts/sections';

const allFlora = filterPublished(await getCollection('flora'));
const allNursery = filterPublished(await getCollection('nursery'));
const allSeeds = filterPublished(await getCollection('seeds'));

const allPosts = sortByDateDesc([
  ...allFlora.map(p => ({ ...p, section: 'flora' as const, url: `/flora/${p.slug}/` })),
  ...allNursery.map(p => ({ ...p, section: 'nursery' as const, url: `/nursery/${p.slug}/` })),
  ...allSeeds.map(p => ({ ...p, section: 'seeds' as const, url: `/seeds/${p.slug}/` })),
]);

const sectionColors: Record<string, string> = {
  flora: 'text-secondary',
  nursery: 'text-secondary',
  seeds: 'text-tertiary',
};
---

<Layout title="The Greenhouse" description={SECTION_FALLBACKS.home} canonicalPath="/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <!-- Intro -->
    <section class="mb-12">
      <h1 class="text-4xl tracking-tight mb-3">The Greenhouse.</h1>
      <p class="text-lg text-on-surface-variant max-w-xl">
        디지털 정원. AI, 크립토, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.
      </p>
    </section>

    <!-- Section Cards -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
      <SectionCard
        icon="❀"
        name="Flora"
        description="AI 분석과 에이전트 생태계"
        count={allFlora.length}
        href="/flora/"
      />
      <SectionCard
        icon="🌱"
        name="Nursery"
        description="자라는 아이디어, 에버그린 노트"
        count={allNursery.length}
        href="/nursery/"
      />
      <SectionCard
        icon="🫘"
        name="Seeds"
        description="짧은 메모, 순간 포착"
        count={allSeeds.length}
        href="/seeds/"
        variant="earth"
      />
    </section>

    <!-- Latest -->
    <section>
      <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-8">Latest</h2>
      <div class="flex flex-col gap-4">
        {allPosts.slice(0, 10).map((post) => (
          <a href={post.url} class="flex items-baseline justify-between gap-4 group">
            <div class="flex items-baseline gap-3 min-w-0">
              <span class:list={["text-xs shrink-0", sectionColors[post.section]]}>{post.section}</span>
              <span class="text-base font-medium text-on-surface group-hover:text-secondary transition-colors truncate">
                {post.data.title}
              </span>
            </div>
            <span class="text-xs text-on-surface-variant font-mono shrink-0">
              {formatArchiveDate(post.data.date)}
            </span>
          </a>
        ))}
      </div>
    </section>
  </div>
</Layout>
```

- [ ] **Step 3: Verify in browser**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro dev --port 4321
```

Open http://localhost:4321 — verify section cards, latest posts, responsive layout.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/SectionCard.astro && git commit -m "feat: add home page with section hub and latest posts"
```

---

### Task 6: Section Index Pages (Card Grid)

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/pages/flora/index.astro`, `src/pages/nursery/index.astro`, `src/pages/seeds/index.astro`

- [ ] **Step 1: Write PostCard.astro**

```astro
---
import { formatArchiveDate, NURSERY_STAGE_EMOJI } from '../consts/sections';

interface Props {
  title: string;
  date: Date;
  summary?: string;
  tags?: string[];
  href: string;
  highlight?: boolean;
  seriesName?: string;
  stage?: string;
  variant?: 'flora' | 'nursery' | 'seeds';
}

const { title, date, summary, tags, href, highlight, seriesName, stage, variant = 'flora' } = Astro.props;
---

<a href={href} class="block bg-surface-container-low rounded-lg p-5 hover:bg-surface-container-high transition-colors group">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs font-mono text-on-surface-variant">{formatArchiveDate(date)}</span>
    <div class="flex items-center gap-2">
      {highlight && <span class="text-xs text-tertiary-container">★</span>}
      {stage && <span title={`Stage: ${stage}`}>{NURSERY_STAGE_EMOJI[stage] || '🌱'}</span>}
    </div>
  </div>
  <h3 class="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors mb-2">
    {title}
  </h3>
  {summary && variant !== 'seeds' && (
    <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-3">{summary}</p>
  )}
  {variant === 'seeds' && summary && (
    <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-1 mb-3">{summary}</p>
  )}
  {tags && tags.length > 0 && variant !== 'seeds' && (
    <div class="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span class="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
          {tag}
        </span>
      ))}
      {seriesName && (
        <span class="text-[10px] bg-tertiary-container text-on-surface px-2 py-0.5 rounded">
          series
        </span>
      )}
    </div>
  )}
</a>
```

- [ ] **Step 2: Write flora/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PostCard from '../../components/PostCard.astro';
import { SECTION_INDEX_CONFIG, sortByDateDesc, filterPublished } from '../../consts/sections';
import { SECTION_FALLBACKS } from '../../consts/site';

const config = SECTION_INDEX_CONFIG.flora;
const posts = sortByDateDesc(filterPublished(await getCollection('flora')));
---

<Layout title={config.pageTitle} description={SECTION_FALLBACKS.flora} canonicalPath="/flora/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <h1 class="text-3xl tracking-tight mb-3">{config.heading}</h1>
      <p class="text-base text-on-surface-variant leading-relaxed max-w-xl">{config.intro}</p>
    </header>

    {posts.length > 0 ? (
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            summary={post.data.summary}
            tags={post.data.tags}
            href={`/flora/${post.slug}/`}
            highlight={post.data.highlight}
            seriesName={post.data.series?.name}
            variant="flora"
          />
        ))}
      </div>
    ) : (
      <p class="text-sm text-on-surface-variant">{config.emptyMessage}</p>
    )}
  </div>
</Layout>
```

- [ ] **Step 3: Write nursery/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PostCard from '../../components/PostCard.astro';
import { SECTION_INDEX_CONFIG, sortByDateDesc, filterPublished } from '../../consts/sections';
import { SECTION_FALLBACKS } from '../../consts/site';

const config = SECTION_INDEX_CONFIG.nursery;
const posts = sortByDateDesc(filterPublished(await getCollection('nursery')));
---

<Layout title={config.pageTitle} description={SECTION_FALLBACKS.nursery} canonicalPath="/nursery/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <h1 class="text-3xl tracking-tight mb-3">{config.heading}</h1>
      <p class="text-base text-on-surface-variant leading-relaxed max-w-xl">{config.intro}</p>
    </header>

    {posts.length > 0 ? (
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            summary={post.data.summary}
            tags={post.data.tags}
            href={`/nursery/${post.slug}/`}
            stage={post.data.stage}
            seriesName={post.data.series?.name}
            variant="nursery"
          />
        ))}
      </div>
    ) : (
      <p class="text-sm text-on-surface-variant">{config.emptyMessage}</p>
    )}
  </div>
</Layout>
```

- [ ] **Step 4: Write seeds/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PostCard from '../../components/PostCard.astro';
import { SECTION_INDEX_CONFIG, sortByDateDesc, filterPublished } from '../../consts/sections';
import { SECTION_FALLBACKS } from '../../consts/site';

const config = SECTION_INDEX_CONFIG.seeds;
const posts = sortByDateDesc(filterPublished(await getCollection('seeds')));
---

<Layout title={config.pageTitle} description={SECTION_FALLBACKS.seeds} canonicalPath="/seeds/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <h1 class="text-3xl tracking-tight mb-3">{config.heading}</h1>
      <p class="text-base text-on-surface-variant leading-relaxed max-w-xl">{config.intro}</p>
    </header>

    {posts.length > 0 ? (
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            summary={post.data.summary}
            href={`/seeds/${post.slug}/`}
            variant="seeds"
          />
        ))}
      </div>
    ) : (
      <p class="text-sm text-on-surface-variant">{config.emptyMessage}</p>
    )}
  </div>
</Layout>
```

- [ ] **Step 5: Verify all three section pages in browser**

- [ ] **Step 6: Commit**

```bash
git add src/components/PostCard.astro src/pages/flora/ src/pages/nursery/ src/pages/seeds/ && git commit -m "feat: add section index pages with card grid layout"
```

---

### Task 7: Post Detail Page — Two-Column with Sidebar

**Files:**
- Create: `src/components/PostSidebar.astro`, `src/components/SeriesNav.astro`
- Create: `src/pages/flora/[...slug].astro`
- Create: `src/pages/nursery/[...slug].astro`, `src/pages/seeds/[...slug].astro`

- [ ] **Step 1: Write SeriesNav.astro (rewritten with Tailwind, not ported CSS classes)**

The bunnykey version uses custom CSS classes (`.series-nav`, `.series-nav__header`, etc.) that are not in the Greenhouse `global.css`. Rewrite entirely with Tailwind utilities:

```astro
---
import type { SeriesEntry } from '../utils/series';

interface Props {
  collection: 'flora' | 'nursery' | 'seeds';
  currentOrder: number;
  seriesName: string;
  seriesTitle: string;
  posts: SeriesEntry[];
  seriesPath?: string;
}

const { collection, currentOrder, seriesName, seriesTitle, posts, seriesPath } = Astro.props;
const totalPosts = posts.length;
---

<aside
  class="border-l-4 border-secondary rounded-r-xl p-4 mb-8 bg-gradient-to-r from-secondary-container/10 to-transparent"
  aria-labelledby={`series-${seriesName}`}
>
  <div class="mb-3">
    <p class="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Series</p>
    <h2 id={`series-${seriesName}`} class="text-base font-semibold">
      {seriesPath ? (
        <a href={seriesPath} class="text-on-surface hover:text-secondary transition-colors">{seriesTitle}</a>
      ) : seriesTitle}
      <span class="ml-2 text-secondary font-normal">({currentOrder}/{totalPosts})</span>
    </h2>
  </div>

  <details>
    <summary class="text-sm font-semibold cursor-pointer hover:text-secondary transition-colors">
      Show series outline
    </summary>
    <ol class="mt-3 space-y-2 list-none pl-0">
      {posts.map((post) => {
        const isCurrent = post.data.series?.order === currentOrder;
        const postHref = `/${collection}/${post.slug}/`;
        return (
          <li>
            <a
              href={postHref}
              class:list={[
                'text-sm flex gap-2 transition-colors',
                isCurrent
                  ? 'text-secondary font-semibold'
                  : 'text-on-surface-variant/70 hover:text-on-surface hover:opacity-100',
              ]}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span class="tabular-nums w-6 shrink-0">{post.data.series?.order}.</span>
              <span>{post.data.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  </details>
</aside>
```

- [ ] **Step 2: Write PostSidebar.astro**

```astro
---
import type { SeriesEntry } from '../utils/series';

interface Props {
  seriesTitle?: string;
  seriesName?: string;
  seriesPosts?: SeriesEntry[];
  currentOrder?: number;
  collection?: string;
  tags?: string[];
}

const { seriesTitle, seriesName, seriesPosts = [], currentOrder, collection, tags = [] } = Astro.props;
---

<aside class="w-full lg:w-64 shrink-0 space-y-4">
  {seriesTitle && seriesPosts.length > 0 && (
    <div class="bg-surface-container-low rounded-lg p-5">
      <h3 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-3">Series</h3>
      <a href={`/${collection}/series/${seriesName}/`} class="text-sm font-semibold text-on-surface hover:text-secondary transition-colors">
        {seriesTitle}
      </a>
      <ol class="mt-3 space-y-2">
        {seriesPosts.map((post) => {
          const isCurrent = post.data.series?.order === currentOrder;
          return (
            <li>
              <a
                href={`/${collection}/${post.slug}/`}
                class:list={[
                  'text-xs flex gap-2 transition-colors',
                  isCurrent ? 'text-secondary font-medium' : 'text-on-surface-variant hover:text-on-surface opacity-60 hover:opacity-100',
                ]}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span class="tabular-nums w-5 shrink-0">{post.data.series?.order}.</span>
                <span class="truncate">{post.data.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  )}

  {tags.length > 0 && (
    <div class="bg-surface-container-low rounded-lg p-5">
      <h3 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-3">Tags</h3>
      <div class="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span class="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )}
</aside>
```

- [ ] **Step 3: Write flora/[...slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PostSidebar from '../../components/PostSidebar.astro';
import { SECTION_FALLBACKS } from '../../consts/site';
import { getSeriesNavigationFromEntries, getSeriesPosts } from '../../utils/series';
import { filterPublished, formatArchiveDate } from '../../consts/sections';
import TokenFlowDemo from '../../components/demos/TokenFlowDemo';

export async function getStaticPaths() {
  const entries = filterPublished(await getCollection('flora'));
  return entries.map(entry => ({
    params: { slug: entry.slug }, props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const description = entry.data.summary || SECTION_FALLBACKS.flora;
const series = entry.data.series;
const seriesPosts = series ? await getSeriesPosts('flora', series.name) : [];
const seriesNav = series
  ? getSeriesNavigationFromEntries(seriesPosts, series.order)
  : { previous: undefined, next: undefined };
---

<Layout
  title={entry.data.title}
  description={description}
  canonicalPath={`/flora/${entry.slug}/`}
  ogTitle={entry.data.title}
  ogDescription={description}
  ogType="article"
>
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <div class="flex flex-col lg:flex-row gap-10">
      <!-- Main column -->
      <article class="flex-1 min-w-0">
        <header class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">flora</span>
            <span class="text-xs font-mono text-on-surface-variant">{formatArchiveDate(entry.data.date)}</span>
            {entry.data.highlight && <span class="text-xs text-tertiary">★ highlight</span>}
          </div>
          <h1 class="text-3xl md:text-4xl tracking-tight mb-3">{entry.data.title}</h1>
          {entry.data.summary && (
            <p class="text-base text-on-surface-variant leading-relaxed">{entry.data.summary}</p>
          )}
        </header>

        <div class="border-t border-outline-variant/20 pt-8 prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-secondary hover:prose-a:text-secondary/80 prose-pre:bg-surface-container-low prose-code:text-on-surface">
          <Content />
        </div>

        {entry.data.demo === 'TokenFlowDemo' && (
          <section class="my-12">
            <TokenFlowDemo client:visible />
          </section>
        )}

        {series && (seriesNav.previous || seriesNav.next) && (
          <nav class="flex flex-col md:flex-row justify-between gap-4 mt-12 pt-6 border-t border-outline-variant/20" aria-label="Series navigation">
            <div>
              {seriesNav.previous && (
                <a href={`/flora/${seriesNav.previous.slug}/`} class="text-sm text-secondary hover:text-secondary/80 transition-colors">
                  ← {seriesNav.previous.data.title}
                </a>
              )}
            </div>
            <div class="text-right">
              {seriesNav.next && (
                <a href={`/flora/${seriesNav.next.slug}/`} class="text-sm text-secondary hover:text-secondary/80 transition-colors">
                  {seriesNav.next.data.title} →
                </a>
              )}
            </div>
          </nav>
        )}
      </article>

      <!-- Sidebar -->
      <PostSidebar
        seriesTitle={series?.title}
        seriesName={series?.name}
        seriesPosts={seriesPosts}
        currentOrder={series?.order}
        collection="flora"
        tags={entry.data.tags}
      />
    </div>
  </div>
</Layout>
```

- [ ] **Step 4: Write nursery/[...slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PostSidebar from '../../components/PostSidebar.astro';
import SeriesNav from '../../components/SeriesNav.astro';
import { SECTION_FALLBACKS } from '../../consts/site';
import { getSeriesNavigationFromEntries, getSeriesPosts } from '../../utils/series';
import { filterPublished, formatArchiveDate, NURSERY_STAGE_EMOJI } from '../../consts/sections';

export async function getStaticPaths() {
  const entries = filterPublished(await getCollection('nursery'));
  return entries.map(entry => ({
    params: { slug: entry.slug }, props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const description = entry.data.summary || SECTION_FALLBACKS.nursery;
const series = entry.data.series;
const seriesPosts = series ? await getSeriesPosts('nursery', series.name) : [];
const seriesNav = series
  ? getSeriesNavigationFromEntries(seriesPosts, series.order)
  : { previous: undefined, next: undefined };
const stageEmoji = NURSERY_STAGE_EMOJI[entry.data.stage || 'seed'];
---

<Layout
  title={entry.data.title}
  description={description}
  canonicalPath={`/nursery/${entry.slug}/`}
  ogTitle={entry.data.title}
  ogDescription={description}
  ogType="article"
>
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <div class="flex flex-col lg:flex-row gap-10">
      <article class="flex-1 min-w-0">
        <header class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">nursery</span>
            <span class="text-xs font-mono text-on-surface-variant">{formatArchiveDate(entry.data.date)}</span>
            <span title={`Stage: ${entry.data.stage || 'seed'}`}>{stageEmoji}</span>
          </div>
          <h1 class="text-3xl md:text-4xl tracking-tight mb-3">{entry.data.title}</h1>
          {entry.data.summary && (
            <p class="text-base text-on-surface-variant leading-relaxed">{entry.data.summary}</p>
          )}
        </header>

        {series && (
          <SeriesNav
            collection="nursery"
            currentOrder={series.order}
            seriesName={series.name}
            seriesTitle={series.title}
            posts={seriesPosts}
            seriesPath={`/nursery/series/${series.name}/`}
          />
        )}

        <div class="border-t border-outline-variant/20 pt-8 prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-secondary hover:prose-a:text-secondary/80 prose-pre:bg-surface-container-low prose-code:text-on-surface">
          <Content />
        </div>

        {series && (seriesNav.previous || seriesNav.next) && (
          <nav class="flex flex-col md:flex-row justify-between gap-4 mt-12 pt-6 border-t border-outline-variant/20" aria-label="Series navigation">
            <div>
              {seriesNav.previous && (
                <a href={`/nursery/${seriesNav.previous.slug}/`} class="text-sm text-secondary hover:text-secondary/80 transition-colors">
                  ← {seriesNav.previous.data.title}
                </a>
              )}
            </div>
            <div class="text-right">
              {seriesNav.next && (
                <a href={`/nursery/${seriesNav.next.slug}/`} class="text-sm text-secondary hover:text-secondary/80 transition-colors">
                  {seriesNav.next.data.title} →
                </a>
              )}
            </div>
          </nav>
        )}
      </article>

      <PostSidebar
        seriesTitle={series?.title}
        seriesName={series?.name}
        seriesPosts={seriesPosts}
        currentOrder={series?.order}
        collection="nursery"
        tags={entry.data.tags}
      />
    </div>
  </div>
</Layout>
```

- [ ] **Step 5: Write seeds/[...slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import { SECTION_FALLBACKS } from '../../consts/site';
import { filterPublished, formatArchiveDate } from '../../consts/sections';

export async function getStaticPaths() {
  const entries = filterPublished(await getCollection('seeds'));
  return entries.map(entry => ({
    params: { slug: entry.slug }, props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const description = entry.data.summary || SECTION_FALLBACKS.seeds;
---

<Layout
  title={entry.data.title}
  description={description}
  canonicalPath={`/seeds/${entry.slug}/`}
  ogTitle={entry.data.title}
  ogDescription={description}
  ogType="article"
>
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <article class="max-w-prose">
      <header class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs bg-tertiary-container text-on-surface px-2 py-0.5 rounded">seeds</span>
          <span class="text-xs font-mono text-on-surface-variant">{formatArchiveDate(entry.data.date)}</span>
        </div>
        <h1 class="text-3xl md:text-4xl tracking-tight mb-3">{entry.data.title}</h1>
        {entry.data.summary && (
          <p class="text-base text-on-surface-variant leading-relaxed">{entry.data.summary}</p>
        )}
      </header>

      <div class="border-t border-outline-variant/20 pt-8 prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-secondary hover:prose-a:text-secondary/80 prose-pre:bg-surface-container-low prose-code:text-on-surface">
        <Content />
      </div>

      {entry.data.tags && entry.data.tags.length > 0 && (
        <div class="mt-8 pt-6 border-t border-outline-variant/20 flex flex-wrap gap-1.5">
          {entry.data.tags.map((tag) => (
            <span class="text-xs bg-tertiary-container/50 text-on-surface px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}
    </article>
  </div>
</Layout>
```

- [ ] **Step 6: Verify a post page in browser**

Open http://localhost:4321/flora/[any-slug]/ — verify 2-col layout, sidebar, prose styling.

- [ ] **Step 7: Commit**

```bash
git add src/components/PostSidebar.astro src/components/SeriesNav.astro src/pages/flora/ src/pages/nursery/ src/pages/seeds/ && git commit -m "feat: add post detail pages with two-column sidebar layout"
```

---

### Task 8: Series Index Pages

**Files:**
- Create: `src/pages/flora/series/[name].astro`, `src/pages/nursery/series/[name].astro`

- [ ] **Step 1: Write flora/series/[name].astro**

```astro
---
import Layout from '../../../layouts/Layout.astro';
import { getSeriesPosts } from '../../../utils/series';
import { getCollection } from 'astro:content';
import { filterPublished, formatArchiveDate } from '../../../consts/sections';

export async function getStaticPaths() {
  const entries = filterPublished(await getCollection('flora'));
  const seriesMap = new Map<string, string>();

  for (const entry of entries) {
    const series = entry.data.series;
    if (!series || seriesMap.has(series.name)) continue;
    seriesMap.set(series.name, series.title);
  }

  const paths = await Promise.all(
    Array.from(seriesMap.entries()).map(async ([name, title]) => ({
      params: { name },
      props: {
        name,
        title,
        posts: await getSeriesPosts('flora', name),
      },
    })),
  );

  return paths;
}

const { name, title, posts } = Astro.props;
const publishedCount = posts.length;
const totalCount = Math.max(...posts.map((post) => post.data.series?.order ?? 0), 0);
---

<Layout
  title={`${title} | The Greenhouse`}
  description={`${title} series archive and reading order.`}
  canonicalPath={`/flora/series/${name}/`}
  ogTitle={title}
  ogDescription={`${publishedCount} published posts in the ${title} series.`}
>
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <p class="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Flora Series</p>
      <h1 class="text-3xl tracking-tight mb-3">{title}</h1>
      <p class="text-sm text-on-surface-variant">
        Progress: {publishedCount}/{totalCount || publishedCount}
      </p>
    </header>

    <ol class="space-y-3">
      {posts.map((post) => (
        <li>
          <a href={`/flora/${post.slug}/`} class="flex gap-3 items-baseline text-on-surface-variant/70 hover:text-on-surface transition-colors">
            <span class="tabular-nums w-6 shrink-0 text-sm">{post.data.series?.order}.</span>
            <span class="text-base">{post.data.title}</span>
          </a>
        </li>
      ))}
    </ol>
  </div>
</Layout>
```

- [ ] **Step 2: Write nursery/series/[name].astro**

```astro
---
import Layout from '../../../layouts/Layout.astro';
import { getSeriesPosts } from '../../../utils/series';
import { getCollection } from 'astro:content';
import { filterPublished } from '../../../consts/sections';

export async function getStaticPaths() {
  const entries = filterPublished(await getCollection('nursery'));
  const seriesMap = new Map<string, string>();

  for (const entry of entries) {
    const series = entry.data.series;
    if (!series || seriesMap.has(series.name)) continue;
    seriesMap.set(series.name, series.title);
  }

  const paths = await Promise.all(
    Array.from(seriesMap.entries()).map(async ([name, title]) => ({
      params: { name },
      props: {
        name,
        title,
        posts: await getSeriesPosts('nursery', name),
      },
    })),
  );

  return paths;
}

const { name, title, posts } = Astro.props;
const publishedCount = posts.length;
const totalCount = Math.max(...posts.map((post) => post.data.series?.order ?? 0), 0);
---

<Layout
  title={`${title} | The Greenhouse`}
  description={`${title} series archive and reading order.`}
  canonicalPath={`/nursery/series/${name}/`}
  ogTitle={title}
  ogDescription={`${publishedCount} published posts in the ${title} series.`}
>
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <header class="mb-10">
      <p class="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Nursery Series</p>
      <h1 class="text-3xl tracking-tight mb-3">{title}</h1>
      <p class="text-sm text-on-surface-variant">
        Progress: {publishedCount}/{totalCount || publishedCount}
      </p>
    </header>

    <ol class="space-y-3">
      {posts.map((post) => (
        <li>
          <a href={`/nursery/${post.slug}/`} class="flex gap-3 items-baseline text-on-surface-variant/70 hover:text-on-surface transition-colors">
            <span class="tabular-nums w-6 shrink-0 text-sm">{post.data.series?.order}.</span>
            <span class="text-base">{post.data.title}</span>
          </a>
        </li>
      ))}
    </ol>
  </div>
</Layout>
```

- [ ] **Step 3: Verify in browser**

- [ ] **Step 4: Commit**

```bash
git add src/pages/flora/series/ src/pages/nursery/series/ && git commit -m "feat: add series index pages for Flora and Nursery"
```

---

### Task 9: The Gardener Page

**Files:**
- Create: `src/components/ContactForm.tsx`
- Create: `src/pages/gardener.astro`

- [ ] **Step 1: Write ContactForm.tsx (React island)**

```tsx
import { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check
    if (data.get('_gotcha')) return;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setState('success');
        form.reset();
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      setState('error');
      setError('메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.');
    }
  }

  return (
    <form
      action="https://formspree.io/f/FORM_ID" // TODO: Replace FORM_ID with actual Formspree form ID before deployment
      method="POST"
      onSubmit={handleSubmit}
      style={{
        background: 'var(--color-surface-container-lowest)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label
            htmlFor="name"
            style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            style={{
              width: '100%',
              background: 'transparent',
              borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              paddingBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-on-surface)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            style={{
              width: '100%',
              background: 'transparent',
              borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              paddingBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-on-surface)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="message"
          style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Start your message..."
          style={{
            width: '100%',
            background: 'transparent',
            borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
            paddingBottom: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-on-surface)',
            outline: 'none',
            resize: 'none',
          }}
        />
      </div>

      {state === 'error' && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginBottom: '0.75rem' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dim))',
          color: 'var(--color-on-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: '0.375rem',
          border: 'none',
          cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: state === 'submitting' ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {state === 'success' ? 'Message sent!' : state === 'submitting' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Write gardener.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import ContactForm from '../components/ContactForm';
import { SECTION_FALLBACKS } from '../consts/site';
---

<Layout title="The Gardener - The Greenhouse" description={SECTION_FALLBACKS.gardener} canonicalPath="/gardener/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <!-- Profile -->
    <section class="mb-16 max-w-xl">
      <span class="inline-block text-xs font-medium tracking-widest text-on-surface-variant uppercase mb-6 px-3 py-1 bg-surface-container-low rounded">
        THE GARDENER
      </span>
      <h1 class="text-3xl tracking-tight mb-6">Bunnykey</h1>
      <div class="space-y-4 text-base text-on-surface-variant leading-relaxed">
        <p>소프트웨어 PM으로 AI 에이전트, 크립토, 디지털 가든을 탐구합니다.</p>
        <p>이 아카이브는 큐레이션된 AI 분석, 작업 노트, 그리고 보존할 가치가 있는 장기적 아이디어를 공개하는 공간입니다.</p>
      </div>
      <div class="flex gap-6 mt-6">
        <a href="https://github.com/bunnykey" target="_blank" class="text-sm text-secondary hover:text-secondary/80 transition-colors">
          GitHub ↗
        </a>
        <a href="mailto:sapphire7558@gmail.com" class="text-sm text-secondary hover:text-secondary/80 transition-colors">
          Email ↗
        </a>
      </div>
    </section>

    <!-- Contact -->
    <section class="bg-surface-container-low rounded-xl p-8 md:p-10">
      <div class="flex flex-col md:flex-row gap-10 max-w-xl md:max-w-none">
        <div class="flex-1">
          <h2 class="text-2xl tracking-tight mb-3">Plant a seed.</h2>
          <p class="text-sm text-on-surface-variant leading-relaxed">
            협업, 질문, 또는 인사 — 의미 있는 대화에 언제나 열려 있습니다.
          </p>
        </div>
        <div class="flex-1">
          <ContactForm client:visible />
        </div>
      </div>
    </section>
  </div>
</Layout>
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:4321/gardener/ — verify profile, contact form, responsive layout.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactForm.tsx src/pages/gardener.astro && git commit -m "feat: add The Gardener page with profile and contact form"
```

---

### Task 10: OG Images + RSS + Privacy

**Files:**
- Create: `src/pages/og/[...slug].png.ts`, `src/pages/rss.xml.ts`, `src/pages/privacy.astro`
- Copy: `src/assets/fonts/`

- [ ] **Step 1: Copy fonts from bunnykey**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/src/assets/fonts
cp /Users/ralph/projects/bunnykey.github.io/src/assets/fonts/* /Users/ralph/projects/the-greenhouse/src/assets/fonts/
```

- [ ] **Step 2: Port OG image generation**

Copy from bunnykey `pages/og/[...slug].png.ts` and update:
- `COLLECTIONS = ['flora', 'nursery', 'seeds']`
- `CollectionName` type accordingly
- SVG colors: `#0a0a0a` → `#2f3430`, `#111111` → `#edeeea`, `#ededed` → `#2f3430`, `#60a5fa` → `#546353`
- Brand text: `bunnykey` → `The Greenhouse`

Note: OG images use Pretendard fonts (copied from bunnykey) while the site uses Inter. This is intentional — OG images need embedded fonts for SVG rendering, and Pretendard provides good CJK support for Korean titles. Inter is loaded via Google Fonts CDN for the site itself.

- [ ] **Step 3: Write rss.xml.ts**

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts/site';
import { filterPublished, sortByDateDesc } from '../consts/sections';

export async function GET(context: { site: string }) {
  const allFlora = filterPublished(await getCollection('flora'));
  const allNursery = filterPublished(await getCollection('nursery'));
  const allSeeds = filterPublished(await getCollection('seeds'));

  const allPosts = sortByDateDesc([
    ...allFlora.map(p => ({ ...p, section: 'flora' })),
    ...allNursery.map(p => ({ ...p, section: 'nursery' })),
    ...allSeeds.map(p => ({ ...p, section: 'seeds' })),
  ]);

  return rss({
    title: SITE.name,
    description: SITE.defaultDescription,
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary || '',
      link: `/${post.section}/${post.slug}/`,
    })),
  });
}
```

(`@astrojs/rss` is already in `package.json` from Task 1.)

- [ ] **Step 4: Write privacy.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Privacy - The Greenhouse" canonicalPath="/privacy/">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-16">
    <article class="prose prose-neutral max-w-xl">
      <h1>Privacy</h1>
      <p>이 사이트는 개인 블로그로, 최소한의 데이터만 수집합니다.</p>
      <h2>수집 정보</h2>
      <ul>
        <li>Contact 폼을 통해 제출된 이름, 이메일, 메시지 (Formspree 경유)</li>
        <li>일반적인 웹 서버 로그 (GitHub Pages 호스팅)</li>
      </ul>
      <h2>쿠키</h2>
      <p>이 사이트는 쿠키를 사용하지 않습니다.</p>
      <h2>문의</h2>
      <p>개인정보에 대한 문의는 <a href="mailto:sapphire7558@gmail.com">이메일</a>로 연락해주세요.</p>
    </article>
  </div>
</Layout>
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro build
```

Expected: Build succeeds. OG images generated, RSS feed at `/rss.xml`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/og/ src/pages/rss.xml.ts src/pages/privacy.astro src/assets/fonts/ && git commit -m "feat: add OG images, RSS feed, and privacy page"
```

---

### Task 11: Interactive Demos (Port from bunnykey)

**Files:**
- Copy: `src/components/demos/`

- [ ] **Step 1: Copy demo components**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/src/components/demos
cp -r /Users/ralph/projects/bunnykey.github.io/src/components/demos/* /Users/ralph/projects/the-greenhouse/src/components/demos/
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/demos/ && git commit -m "feat: port interactive demo components from bunnykey"
```

---

### Task 12: Final Integration & Verification

- [ ] **Step 1: Full build**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro build
```

Expected: Clean build, no warnings.

- [ ] **Step 2: Visual verification**

```bash
cd /Users/ralph/projects/the-greenhouse && npx astro dev --port 4321
```

Check each page:
- `/` — Home: section hub cards + latest posts
- `/flora/` — Flora card grid
- `/flora/[any-slug]/` — Post detail with sidebar
- `/nursery/` — Nursery card grid with stage indicators
- `/seeds/` — Seeds compact cards
- `/gardener/` — Profile + contact form
- `/privacy/` — Privacy page
- `/rss.xml` — RSS feed

- [ ] **Step 3: Mobile viewport check (375px)**

Resize browser to 375px. Verify:
- Cards stack to 1-col
- Sidebar moves below article
- Navbar scrolls horizontally
- Contact form stacks vertically

- [ ] **Step 4: Keyboard navigation check**

Tab through all pages. Verify:
- Skip link works
- Focus styles visible (secondary color outline)
- All interactive elements reachable

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "chore: final integration verification"
```
