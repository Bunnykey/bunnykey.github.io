# The Greenhouse — Blog Redesign Design Spec

bunnykey.github.io를 Stitch Greenhouse 디자인 시스템으로 전면 재설계. 별도 레포(`the-greenhouse`)에서 구현.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Evolved Greenhouse | Greenhouse 토큰+패턴 기반, 블로그 전용 레이아웃 새로 설계 |
| Sections | Flora / Nursery / Seeds / The Gardener | 가든 메타포 (seed→nursery→flora 성장 단계) |
| Theme | Light only | Greenhouse 원본 충실, `#faf9f6` 기반 |
| Stack | Astro + Tailwind v4 + React Islands | bunnykey와 동일, 블로그 인프라 재활용 |
| Repo | `the-greenhouse` (별도) | 디자인 실험 격리 |

## Design Tokens

Greenhouse의 MD3 기반 토큰을 그대로 사용.

### Colors

```css
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
```

### Typography

- Font: `Inter, system-ui, sans-serif`
- h1: `font-weight: 500`, `letter-spacing: -0.02em` (page titles, hero)
- h2: `font-weight: 600`, `letter-spacing: -0.02em` (article subheadings)
- h3-h6: `font-weight: 500` (card titles, section labels)
- Body: `font-size: base`, `line-height: relaxed`
- Labels: `text-transform: uppercase`, `letter-spacing: 0.15em`, `font-size: xs`

### Spacing

Non-linear scale: `micro(0.5rem)`, `base(1rem)`, `md(1.4rem)`, `lg(2rem)`, `xl(3.5rem)`, `2xl(5.5rem)`, `3xl(7rem)`

## Site Structure

### Section Mapping

| Section | URL path | Content source | Previous name |
|---------|----------|---------------|---------------|
| Flora | `/flora/` | AI 분석, 에이전트 생태계 | `ai` |
| Nursery | `/nursery/` | 자라는 아이디어, 에버그린 노트 | `garden` |
| Seeds | `/seeds/` | 짧은 메모, 순간 포착 | `notes` |
| The Gardener | `/gardener/` | 프로필 + Contact 폼 | `about` |

### Content Collections (Astro)

기존 bunnykey 스키마를 유지하되 컬렉션 이름 변경:

- `flora`: title, date, highlight?, summary?, tags?, series?, demo?, draft?
- `nursery`: title, date, stage?(seed/growing/evergreen), summary?, tags?, series?, draft?
- `seeds`: title, date, summary?, tags?, draft? (series 스키마는 유지하나 UI 미지원 — 확장성 보존)

`draft: true`인 글은 프로덕션 빌드에서 제외 (`import.meta.env.PROD` 체크).

## Page Designs

### Shared Layout Shell

모든 페이지 공통:

- **Navbar**: `surface-container-low` 배경, 왼쪽 "The Greenhouse" 브랜드, 오른쪽 Flora / Nursery / Seeds / The Gardener 링크. 현재 섹션 `font-weight: 500` + `on-surface` 컬러.
- **Footer**: `surface-container-low` 배경, 왼쪽 브랜드+copyright, 오른쪽 Privacy / RSS 링크. Newsletter는 v1에서 제외 (추후 외부 서비스 연동 시 추가).
- **Container**: `max-w-5xl mx-auto`
- **Skip link**: `<a href="#main-content" class="skip-link">` (bunnykey에서 이식)
- **Focus styles**: `:focus-visible` outline with `secondary` color
- **Accessibility**: ARIA landmarks (nav, main, footer), WCAG AA color contrast 준수

### Responsive Breakpoints

- **Mobile** (< 768px): 1-col. 카드 그리드 → 1-col stack. Post detail sidebar → 본문 아래로 이동. Navbar → 가로 스크롤 or hamburger.
- **Tablet** (768px-1024px): 2-col 카드 그리드 유지. Post detail sidebar → 본문 아래로 이동.
- **Desktop** (> 1024px): 풀 레이아웃. 홈 3-col, 섹션 2-col, post detail 2-col+sidebar.

### Home — Section Hub + Latest

1. **Intro**: 사이트명 큰 텍스트 + 한 줄 설명
2. **Section Cards**: 3-col grid. 각 카드에 아이콘 + 섹션명 + 설명 + 글 수 + 링크. Flora/Nursery는 `secondary-container`, Seeds는 `tertiary-container` 배경.
3. **Latest**: 전체 섹션 통합 최신 글 목록. 섹션 라벨(flora/nursery/seeds) + 제목 + 날짜.

### Section Index — Card Grid

1. **Header**: 섹션명(h1) + 소개 문구
2. **Card Grid**: 2-col grid. 각 카드는 `surface-container-low` 배경.
   - 날짜 (monospace, `on-surface-variant`)
   - 제목 (`font-weight: 500`)
   - 요약 (1-2줄, `on-surface-variant`)
   - 태그 (`secondary-container` badge)
   - Flora: highlight 별표, series badge(`tertiary-container`)
   - Nursery: stage emoji indicator, stage별 subtle 배경 변화
   - Seeds: compact (요약만, 태그 없음), earth 톤 accent

### Post Detail — Two-Column with Sidebar

1. **Main column** (왼쪽, flex-1):
   - Meta: 섹션 badge + 날짜 + highlight
   - Title: h1, `font-weight: 500`, `tracking-tight`
   - Summary: `on-surface-variant`
   - Article body: prose styling, `border-top` 구분
   - Code blocks: `surface-container-low` 배경, monospace
   - Series pagination: 이전/다음 글 링크 (`border-top` 구분)

2. **Sidebar** (오른쪽, `w-64`, sticky):
   - Series card: `surface-container-low` 배경, 시리즈 제목 + 전체 목차, 현재 글 `secondary` 하이라이트
   - Tags card: `surface-container-low` 배경, `secondary-container` badge

### The Gardener — Compact Profile + Contact

1. **Profile section**:
   - "THE GARDENER" uppercase tag
   - 이름(h1) + 소개 (2-3 문단)
   - 소셜 링크 (GitHub, Email) inline, `secondary` 컬러

2. **Contact section** (`surface-container-low` 배경):
   - 2-col: 왼쪽 "Plant a seed." 헤드라인 + 설명, 오른쪽 폼
   - 폼: Name/Email 2-col grid + Message textarea, bottom-border 스타일 input
   - Submit: `primary` gradient 버튼
   - Backend: Formspree (또는 동등한 서비스). 별도 API route 불필요.
   - Validation: 클라이언트 HTML5 기본 validation (required, type="email")
   - Anti-spam: honeypot hidden field
   - States: idle → submitting (버튼 disabled) → success ("Message sent!") → error (inline 에러 메시지, `error` 컬러)

## Infrastructure

### From bunnykey (이식 + 마이그레이션)

- Astro content collections (스키마 + 타입)
- Notion CMS adapter (`cms-adapter.mjs`, `notion-adapter.mjs`, `notion-client.mjs`, `notion-sync.mjs`)
- Series navigation (`utils/series.ts`, `SeriesNav.astro`)
- OG image generation (`pages/og/[...slug].png.ts`)
- Content config (`content/config.ts`)
- Build/deploy scripts

### Migration Notes (bunnykey → the-greenhouse)

이식 시 반드시 변경해야 하는 이름 매핑:

| Location | Before | After |
|----------|--------|-------|
| Content dirs | `content/ai/`, `garden/`, `notes/` | `content/flora/`, `nursery/`, `seeds/` |
| `config.ts` collections | `ai`, `garden`, `notes` | `flora`, `nursery`, `seeds` |
| `series.ts` SupportedCollection | `'ai' \| 'garden' \| 'notes'` | `'flora' \| 'nursery' \| 'seeds'` |
| `sections.ts` SectionKey | `'ai' \| 'garden' \| 'notes'` | `'flora' \| 'nursery' \| 'seeds'` |
| Layout.astro OG regex | `/(ai\|garden\|notes)/` | `/(flora\|nursery\|seeds)/` |
| `site.ts` SITE | `name: "bunnykey"`, old pinnedRoutes | `name: "The Greenhouse"`, new routes |
| `site.ts` SECTION_FALLBACKS | ai/garden/notes keys | flora/nursery/seeds/gardener keys |
| CMS adapters | section mapping `ai→`, `garden→`, `notes→` | `flora→`, `nursery→`, `seeds→` |
| `GARDEN_STAGE_EMOJI` | sections.ts에 유지 | `NURSERY_STAGE_EMOJI`로 리네이밍 |

### New

- `global.css`: Greenhouse 토큰 (bunnykey의 dark/light CSS 변수 → Greenhouse MD3 토큰)
- `Layout.astro`: Greenhouse navbar + footer shell (다크모드 토글 제거)
- Section index components: `FloraIndex`, `NurseryIndex`, `SeedsIndex` (card grid variants)
- Post detail components: `PostDetail` (2-col + sidebar), `SeriesCard`, `TagsCard`
- `GardenerPage`: profile + contact form
- `HomePage`: section hub + latest
- `ContactForm.tsx`: React island (상태 관리 필요)
- `rss.xml.ts`: 전체 섹션 통합 RSS feed (flora+nursery+seeds, 날짜순)
- `privacy.astro`: 간단한 프라이버시 정책 페이지

### File Structure

```
the-greenhouse/
├── src/
│   ├── styles/global.css          # Greenhouse tokens
│   ├── layouts/Layout.astro       # Navbar + Footer shell
│   ├── pages/
│   │   ├── index.astro            # Home (Section Hub + Latest)
│   │   ├── gardener.astro         # The Gardener
│   │   ├── flora/
│   │   │   ├── index.astro        # Flora card grid
│   │   │   ├── [...slug].astro    # Flora post detail
│   │   │   └── series/[name].astro
│   │   ├── nursery/
│   │   │   ├── index.astro
│   │   │   ├── [...slug].astro
│   │   │   └── series/[name].astro
│   │   ├── seeds/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── og/[...slug].png.ts
│   │   ├── rss.xml.ts            # 전체 통합 RSS feed
│   │   └── privacy.astro
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── SectionCard.astro      # Home section cards
│   │   ├── PostCard.astro         # Section index cards
│   │   ├── PostSidebar.astro      # Detail sidebar (series + tags)
│   │   ├── SeriesNav.astro        # Series prev/next
│   │   ├── ContactForm.tsx        # React island
│   │   └── demos/                 # Interactive demos (from bunnykey)
│   ├── content/
│   │   ├── config.ts
│   │   ├── flora/                 # AI content (from bunnykey ai/)
│   │   ├── nursery/               # Garden content (from bunnykey garden/)
│   │   ├── seeds/                 # Notes content (from bunnykey notes/)
│   │   └── notion-*.mjs           # CMS adapters
│   ├── consts/
│   │   ├── site.ts
│   │   └── sections.ts
│   └── utils/
│       └── series.ts
├── public/
├── docs/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Dependencies

- `astro` ^5.x
- `@astrojs/react` ^5.x
- `react`, `react-dom` ^19.x
- `tailwindcss` ^4.x
- `@tailwindcss/vite` ^4.x
- `@tailwindcss/typography` ^0.5.x (prose styling)
- `@astrojs/sitemap` ^3.x

## Testing Strategy

- `astro build` 성공 확인 (SSG 빌드)
- 각 페이지 수동 확인 (`astro dev`)
- 기존 bunnykey 콘텐츠 마이그레이션 후 전체 빌드
- Lighthouse: Performance 90+, Accessibility 90+
- 키보드 네비게이션: tab 순서, skip link, focus 스타일 확인
- 모바일 뷰포트(375px) 레이아웃 깨짐 확인
