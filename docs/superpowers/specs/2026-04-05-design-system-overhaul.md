# Design System Overhaul — The Greenhouse

**Date:** 2026-04-05
**Scope:** Phase 1 색상 토큰 재설계 + 다크모드 수정. Phase 2 atmospheric 모드 확장 구조 확보.
**Target:** bunnykey.github.io에 the-greenhouse 배포 전 디자인 품질 향상

---

## Phase 1: 색상 토큰 재설계

### 1. 토큰 구조 변경

현재 Material Design 식 7단계 surface + 역할 불명확한 primary를 4단계 surface + 역할 기반 semantic 토큰으로 재설계.

#### Surface (7 → 4)

| 새 토큰 | 용도 | 대체하는 기존 토큰 |
|---------|------|-------------------|
| `--surface` | 페이지 배경 | `--surface` |
| `--surface-raised` | 카드, nav, footer, ToC, sidebar | `--surface-container-low` |
| `--surface-overlay` | hover, active state, 모달 | `--surface-container-high`, `-highest` |
| `--surface-sunken` | 코드블록, input, pre | `--surface-container`, `-dim` |

#### Semantic

| 새 토큰 | 용도 | 대체하는 기존 토큰 |
|---------|------|-------------------|
| `--accent` | 링크, CTA, active 표시 (sage) | `--secondary` |
| `--accent-muted` | 태그 배경, 배지, 약한 강조 | `--secondary-container` |
| `--accent-on-muted` | accent-muted 위 텍스트 | `--on-secondary-container` |
| `--earth` | 하이라이트, seeds 섹션 accent | `--tertiary` |
| `--earth-muted` | earth 배경 변형 | `--tertiary-container` |
| `--text` | 본문 텍스트 | `--on-surface` |
| `--text-muted` | 보조 텍스트, 메타 정보 | `--on-surface-variant` |
| `--text-faint` | 비활성, placeholder | (신규) |
| `--border` | 기본 구분선 | `--outline` |
| `--border-subtle` | 약한 구분선 | `--outline-variant` |
| `--error` | 에러 상태 | `--error` (유지) |

#### 삭제 토큰

- `--primary`, `--primary-dim`, `--primary-container`, `--on-primary` — 사용되지 않음
- `--surface-container-lowest` — 사용되지 않음
- `--on-secondary-container` → `--accent-on-muted`로 대체

### 2. Light Mode 팔레트

```css
:root {
  /* Surface */
  --surface: #faf9f6;
  --surface-raised: #f0ede7;
  --surface-overlay: #e5e2db;
  --surface-sunken: #ece9e2;

  /* Accent (sage) */
  --accent: #4a6741;
  --accent-muted: #d7e7d3;
  --accent-on-muted: #3a5234;

  /* Earth */
  --earth: #7e572e;
  --earth-muted: #e8d4be;

  /* Text */
  --text: #1a1f1a;
  --text-muted: #6b7168;
  --text-faint: #9a9e96;

  /* Border */
  --border: #777c77;
  --border-subtle: #d8d5cf;

  /* Error */
  --error: #9e422c;
}
```

변경점: surface 간 명도차 확대 (기존 2~3% → 4~6%). warm tone 유지.

### 3. Dark Mode 팔레트 (shadcn Maia 참고)

```css
[data-theme="dark"] {
  /* Surface — deep forest green tint */
  --surface: #0c120c;
  --surface-raised: #141e14;
  --surface-overlay: #1e2a1e;
  --surface-sunken: #0a0f0a;

  /* Accent (sage, brightened) */
  --accent: #7aad74;
  --accent-muted: #1e3018;
  --accent-on-muted: #7aad74;

  /* Earth (warm, brightened) */
  --earth: #c49a6c;
  --earth-muted: #2a1e10;

  /* Text — 밝기 대폭 상향 */
  --text: #d0daca;
  --text-muted: #7a8a74;
  --text-faint: #4a5a44;

  /* Border */
  --border: #3a4a3a;
  --border-subtle: #1e2a1e;

  /* Error */
  --error: #e07a62;
}
```

핵심: 그린 틴트가 모든 surface에 스며듦. 기존 neutral gray → deep forest green. 텍스트 밝기 대폭 상향으로 가독성 확보.

### 4. Tailwind Typography 다크모드 오버라이드

```css
[data-theme="dark"] {
  --tw-prose-body: var(--text);
  --tw-prose-headings: var(--text);
  --tw-prose-links: var(--accent);
  --tw-prose-bold: var(--text);
  --tw-prose-code: var(--text);
  --tw-prose-pre-bg: var(--surface-sunken);
  --tw-prose-pre-code: var(--text);
  --tw-prose-quotes: var(--text-muted);
  --tw-prose-counters: var(--text-muted);
  --tw-prose-bullets: var(--border);
  --tw-prose-hr: var(--border-subtle);
  --tw-prose-th-borders: var(--border-subtle);
  --tw-prose-td-borders: var(--border-subtle);
}
```

### 5. Phase 2 확장을 위한 구조

```html
<!-- Phase 1: 기본 -->
<html data-theme="light">
<html data-theme="dark">

<!-- Phase 2: atmosphere 추가 -->
<html data-theme="light" data-atmosphere="sunny">
<html data-theme="dark" data-atmosphere="moonlight">
<html data-theme="light" data-atmosphere="rain">
```

CSS 구조:
```css
/* Phase 1 — base themes */
:root { /* light */ }
[data-theme="dark"] { /* dark */ }

/* Phase 2 — atmosphere overrides (색상 미세 조정) */
[data-atmosphere="rain"] { --surface: #9aa4b0; /* ... */ }
[data-atmosphere="sunny"] { /* ... */ }
[data-atmosphere="moonlight"] { /* ... */ }
```

Phase 1에서는 `data-theme`만 사용. `data-atmosphere` 구조는 CSS에 자리만 마련해 두고 Phase 2에서 값을 채움.

---

## 컴포넌트 변경 사항

### SectionCard
- 이모지 아이콘 → **SVG 아이콘** (Phosphor 또는 Lucide에서 선택)
- 기존: `icon` prop (string, 이모지) → 변경: `icon` prop (component 또는 SVG string)

### PostCard (Nursery stage)
- 이모지 stage 표시 (🌱🌿🌳) → **도트 프로그레스** (●●○)
- `NURSERY_STAGE_EMOJI` 상수 → `NURSERY_STAGE_DOTS` 또는 Astro 컴포넌트로 변경

### 토큰 이름 마이그레이션 (전체 컴포넌트)
- `bg-surface-container-low` → `bg-surface-raised`
- `bg-surface-container-high` → `bg-surface-overlay`
- `text-on-surface` → `text-text`(또는 Tailwind @theme에서 semantic alias)
- `text-on-surface-variant` → `text-text-muted`
- `text-secondary` → `text-accent`
- `bg-secondary-container` → `bg-accent-muted`
- `text-on-secondary-container` → `text-accent-on-muted`
- `text-tertiary` → `text-earth`
- `bg-tertiary-container` → `bg-earth-muted`
- `border-outline-variant` → `border-border-subtle`

### greenhouse-prose 유틸리티
```css
.greenhouse-prose {
  @apply border-t border-border-subtle/20 pt-8
    prose prose-neutral max-w-none
    prose-headings:tracking-tight
    prose-a:text-accent hover:prose-a:text-accent/80
    prose-pre:bg-surface-sunken
    prose-code:text-text;
}
```

---

## 타이포그래피

- **Inter + clamp() 반응형 스케일** — 유지, 변경 없음
- **Google Fonts → self-hosting 전환** — `@font-face`로 Inter woff2 로컬 번들
- **meta/date 표시의 monospace** — 유지

---

## 모션 / 인터랙션

| 애니메이션 | 판단 | 비고 |
|-----------|------|------|
| `fade-slide-in` (SectionCard 진입) | 유지 | |
| `scroll-progress` (포스트 상단 바) | 유지 | |
| `prose scroll-reveal` (본문 요소) | **제거** | 긴 본문에서 스크롤 시마다 요소가 슬라이드인 되어 읽기 방해. 블로그 본문에 부적합. |
| `sprout` | **삭제** | 정의만 있고 미사용 |
| hover transitions (카드, 링크) | 유지 | 200ms |
| ViewTransitions | 유지 | Astro built-in |
| ToC indicator | 유지 | JS + transition |
| 테마 전환 transition | **Phase 2에서 추가** | body에 `transition: background-color 300ms, color 200ms` |

`prefers-reduced-motion` 대응 — 이미 구현됨, 유지.

---

## Theme Toggle

- **Phase 1:** 현재 3-way cycle (light → dark → system) 유지
- **Phase 2:** atmosphere 선택 UI 분리 + 키보드 단축키 (D/S/N/M/R)

---

## 영향 범위

### 수정 파일 (Phase 1)

| 파일 | 변경 내용 |
|------|----------|
| `src/styles/global.css` | 토큰 재정의, 다크모드 팔레트, prose scroll-reveal 제거, sprout 삭제 |
| `src/components/Navbar.astro` | 토큰 이름 마이그레이션 |
| `src/components/Footer.astro` | 토큰 이름 마이그레이션 |
| `src/components/PostCard.astro` | 토큰 이름 + stage 도트 프로그레스 |
| `src/components/SectionCard.astro` | 토큰 이름 + SVG 아이콘 |
| `src/components/PostSidebar.astro` | 토큰 이름 마이그레이션 |
| `src/components/TableOfContents.astro` | 토큰 이름 마이그레이션 |
| `src/components/ThemeToggle.astro` | meta-theme-color 값 업데이트 |
| `src/layouts/Layout.astro` | theme script의 색상값 업데이트, font self-hosting |
| `src/consts/sections.ts` | `NURSERY_STAGE_EMOJI` → 도트 프로그레스 변환 |
| `src/pages/index.astro` | 토큰 이름 마이그레이션 |
| `src/pages/flora/[...slug].astro` | 토큰 이름 마이그레이션 |
| `src/pages/nursery/[...slug].astro` | 토큰 이름 마이그레이션 |
| `src/pages/seeds/[...slug].astro` | 토큰 이름 마이그레이션 |
| `src/pages/gardener.astro` | 토큰 이름 마이그레이션 |
| `src/pages/search.astro` | 토큰 이름 마이그레이션 |
| `src/pages/404.astro` | 토큰 이름 마이그레이션 |
| `src/pages/privacy.astro` | 토큰 이름 마이그레이션 |

### 참고 자료
- [shadcn Maia preset](https://x.com/shadcn/status/2035772793942384921) — 다크모드 그린 틴트 레퍼런스
- [dany.works](https://dany.works/) — Phase 2 atmospheric 모드 구현 레퍼런스
- [taylor sunny mode](https://x.com/taydotfun/status/2037173278767243528) — sunny/rain/moonlight 컨셉

---

## Phase 2 (별도 스펙)

Phase 1 완료 후 별도 디자인 사이클:
- Atmospheric 오버레이 (sunny, moonlight, rain)
- 모드별 색상 미세 조정값
- 비디오 에셋 제작/소싱
- Theme toggle UI 확장
- 키보드 단축키
- 테마 전환 transition 애니메이션
