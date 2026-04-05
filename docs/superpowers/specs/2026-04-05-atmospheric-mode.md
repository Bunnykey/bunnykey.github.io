# Atmospheric Mode — The Greenhouse Phase 2

**Date:** 2026-04-05
**Depends on:** Phase 1 (design-system-overhaul.md) — 완료
**Scope:** Atmospheric 모드 3종 (Sunny, Moonlight, Rain) + 통합 토글 UI + 키보드 단축키

---

## 개요

온실(greenhouse) 컨셉에 맞는 ambient 분위기 레이어. 유리 온실에 비치는 햇살, 달빛, 빗방울을 CSS 색상 시프트 + 비디오 오버레이로 표현한다.

**레퍼런스:**
- [dany.works](https://dany.works/) — CSS 변수(4개/모드) + video overlay + .shader-overlay div
- [shadcn Maia preset](https://x.com/shadcn/status/2035772793942384921) — 다크모드 그린 틴트
- [taylor sunny mode](https://x.com/taydotfun/status/2037173278767243528) — sunny/rain/moonlight 컨셉

---

## 1. 아키텍처

### 속성 구조

`data-theme`과 `data-atmosphere`는 독립 속성. atmosphere는 theme을 강제하지 않는다.

```html
<html data-theme="light" data-atmosphere="none">
<html data-theme="light" data-atmosphere="sunny">
<html data-theme="dark" data-atmosphere="moonlight">
<html data-theme="dark" data-atmosphere="rain">
```

### CSS 레이어 순서

```css
/* 1. Base theme */
:root { /* light mode tokens */ }
[data-theme="dark"] { /* dark mode tokens */ }

/* 2. Atmosphere overrides — theme 위에 얹는 미세 조정 */
:root[data-atmosphere="sunny"] { /* warm shift */ }
:root[data-atmosphere="moonlight"] { /* cool blue shift */ }
:root[data-atmosphere="rain"] { /* desaturated cool shift */ }

/* 3. Theme + Atmosphere 조합 (필요시) */
[data-theme="dark"][data-atmosphere="sunny"] { /* dark sunny 특화 조정 */ }
```

### 저장

- `localStorage` 키: `atmosphere` (값: `none` | `sunny` | `moonlight` | `rain`)
- 기존 `theme` 키와 분리
- Layout.astro `<head>` 인라인 스크립트에서 `data-atmosphere` 초기화 (FOUC 방지)

---

## 2. 색상 시프트

각 atmosphere는 기존 theme CSS 변수를 오버라이드. 모드당 4~6개 변수만 조정하여 가볍게 유지.

### Sunny (따뜻한 시프트)

온실 유리에 햇살이 들어오는 느낌. 크림/아이보리 톤 + 따뜻한 초록.

```css
:root[data-atmosphere="sunny"] {
  --color-surface: #fdf8f0;       /* 크림톤으로 shift */
  --color-surface-raised: #f5efe4;
  --color-accent: #5a7a3a;        /* 따뜻한 올리브 초록 */
  --color-foreground-muted: #7a7060; /* 따뜻한 뮤트 */
}
```

### Moonlight (블루 시프트)

달빛이 온실 유리를 통해 스며드는 느낌. 차가운 남색 + 은빛.

```css
:root[data-atmosphere="moonlight"] {
  --color-surface: #f4f6fa;       /* 차가운 블루틴트 */
  --color-surface-raised: #e8ecf4;
  --color-accent: #4a6a8a;        /* 블루그린 */
  --color-foreground: #1a1e2a;    /* 남색 톤 */
  --color-foreground-muted: #606878;
}
```

### Rain (채도 감소 + 청회색)

유리 위 빗방울. 전체적으로 서늘하고 채도가 낮은 톤.

```css
:root[data-atmosphere="rain"] {
  --color-surface: #f2f4f5;       /* 청회색 */
  --color-surface-raised: #e6e9ec;
  --color-accent: #5a7068;        /* 탁한 초록 */
  --color-foreground-muted: #6a7278;
  --color-outline-subtle: #d0d4d8;
}
```

> 위 값은 초안. 구현 시 light/dark 양쪽에서 시각적 확인 후 조정. dark+atmosphere 조합은 별도 셀렉터로 필요시 추가.

---

## 3. 오버레이 레이어 (Hybrid)

### CSS Fallback (항상 작동)

atmosphere 활성 시 `body::after` pseudo-element로 은은한 분위기 표현.

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0;
  transition: opacity 500ms;
}

[data-atmosphere="sunny"] body::after {
  background: linear-gradient(135deg, rgba(255, 220, 100, 0.06), transparent 60%);
  opacity: 1;
}

[data-atmosphere="moonlight"] body::after {
  background: linear-gradient(180deg, rgba(100, 140, 200, 0.05), transparent 70%);
  opacity: 1;
}

[data-atmosphere="rain"] body::after {
  background: linear-gradient(180deg, rgba(120, 140, 160, 0.06), transparent);
  opacity: 1;
}
```

`prefers-reduced-motion: reduce` → 그라데이션만 표시, 애니메이션 없음.

### Video Enhancement

비디오는 progressive enhancement. 모든 플랫폼(데스크톱 + 모바일)에서 로딩하되, Save-Data 모드 또는 prefers-reduced-motion 시에만 CSS fallback.

```html
<video
  class="atmosphere-video"
  muted
  playsinline
  autoplay
  loop
  aria-hidden="true"
>
  <source src="/videos/leaves.mp4" type="video/mp4">
</video>
```

```css
.atmosphere-video {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 50;
  opacity: 0;
  transition: opacity 800ms;
}

/* 블렌딩 모드 */
[data-atmosphere="sunny"] .atmosphere-video {
  mix-blend-mode: multiply;
  opacity: 0.2;
}

[data-atmosphere="moonlight"] .atmosphere-video {
  mix-blend-mode: screen;
  opacity: 0.15;
}

[data-atmosphere="rain"] .atmosphere-video {
  mix-blend-mode: multiply;
  opacity: 0.25;
}
```

### 로딩 조건 (JS)

```js
const shouldLoadVideo = () => {
  // Save-Data 모드면 CSS만
  if (navigator.connection?.saveData) return false;
  // reduced motion이면 CSS만
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};
```

비디오는 lazy load. atmosphere 변경 시 해당 모드의 `<video>` src를 동적으로 세팅.

### 비디오 에셋 사양

| 항목 | 값 |
|------|-----|
| 해상도 | 720p (1280×720) |
| 프레임레이트 | 15fps |
| 코덱 | H.264 (MP4) |
| 목표 크기 | ≤ 1MB per video |
| 루프 | seamless (ffmpeg 편집) |

에셋 후보 목록: `docs/superpowers/video-candidates.md` 참조. 비디오 파일은 나중에 소싱하여 drop-in.

---

## 4. Prose 감쇠

비디오 오버레이가 전체 화면에 적용되되, prose(본문) 영역은 가독성을 위해 감쇠 처리.

```css
[data-atmosphere]:not([data-atmosphere="none"]) .greenhouse-prose {
  position: relative;
  z-index: 51; /* 오버레이(z:50) 위로 */
}

[data-atmosphere]:not([data-atmosphere="none"]) .greenhouse-prose::before {
  content: '';
  position: absolute;
  inset: -1rem -2rem;
  background: var(--color-surface);
  opacity: 0.85;
  border-radius: 8px;
  z-index: -1;
}
```

효과: 온실 유리 너머로 글을 읽는 느낌. 주변부에는 오버레이가 보이고, 본문 영역은 자연스럽게 약해진다.

---

## 5. 통합 토글 UI

기존 ThemeToggle (3-way cycle 버튼)을 **통합 popover**로 교체.

### 구조

```
[☀️ 버튼] → 클릭 → Popover
  ┌──────────────────┐
  │ THEME            │
  │ [☀️] [🌙] [🖥️]  │  ← Light / Dark / System 아이콘 선택
  │──────────────────│
  │ ATMOSPHERE       │
  │ ✕  None       N  │
  │ ☀️ Sunny      S  │  ← 리스트 + kbd 단축키 힌트
  │ 🌙 Moonlight  M  │
  │ 🌧️ Rain       R  │
  └──────────────────┘
```

### 아이콘

SVG, Lucide 스타일. Phase 1에서 ThemeToggle에 사용한 Sun/Moon/Monitor와 동일 스타일.

| 모드 | 아이콘 |
|------|--------|
| Light | Sun |
| Dark | Moon |
| System | Monitor |
| None | X |
| Sunny | Sun (accent color) |
| Moonlight | Moon (blue tint) |
| Rain | CloudRain |

트리거 버튼에는 현재 theme 아이콘 표시. atmosphere 활성 시 아이콘에 accent 색상 적용.

### Popover 동작

- 클릭 또는 Enter로 열기/닫기
- 바깥 클릭 또는 Escape로 닫기
- Theme 섹션: 아이콘 클릭으로 즉시 전환
- Atmosphere 섹션: 항목 클릭으로 즉시 전환 + popover 닫기
- 포커스 트랩 없음 (간단한 메뉴이므로)

### 키보드 단축키

popover 닫힌 상태에서도 전역 작동:

| 키 | 동작 |
|----|------|
| `D` | Dark mode 토글 (light ↔ dark) |
| `S` | Atmosphere → Sunny |
| `N` | Atmosphere → None |
| `M` | Atmosphere → Moonlight |
| `R` | Atmosphere → Rain |

**input/textarea 포커스 시 단축키 비활성화** — `document.activeElement.tagName`이 INPUT, TEXTAREA, SELECT이거나 `contenteditable`이면 무시.

---

## 6. 전환 애니메이션

```css
body {
  transition: background-color 300ms ease, color 200ms ease;
}
```

theme 또는 atmosphere 변경 시 부드러운 전환. 비디오 오버레이는 `opacity` transition 800ms로 페이드인/아웃.

---

## 7. 접근성 / 성능

| 항목 | 처리 |
|------|------|
| `prefers-reduced-motion` | 비디오 로딩 안 함, CSS 그라데이션만 정적 표시 |
| `Save-Data` | 비디오 로딩 안 함, CSS fallback만 |
| 모바일 | 비디오 적용 (muted+playsinline), Save-Data 시에만 CSS fallback |
| 비디오 최적화 | 720p, 15fps, H.264, ≤1MB. lazy load |
| 탭 비활성 | `document.hidden` 감지 → video.pause() / video.play() |
| FOUC 방지 | Layout.astro `<head>` 인라인 스크립트에서 `data-atmosphere` 세팅 |
| Screen reader | 비디오: `aria-hidden="true"`. Popover: 적절한 aria-label |

---

## 영향 범위

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/styles/global.css` | atmosphere CSS 변수 오버라이드, 오버레이 스타일, prose 감쇠, 전환 애니메이션 |
| `src/components/ThemeToggle.astro` | 3-way cycle → 통합 popover로 교체 |
| `src/layouts/Layout.astro` | `<head>` 인라인 스크립트에 atmosphere 초기화, `<video>` 엘리먼트 삽입 위치 |

### 신규 파일

| 파일 | 내용 |
|------|------|
| `public/videos/leaves.mp4` | Sunny 오버레이 (추후 소싱) |
| `public/videos/moon.mp4` | Moonlight 오버레이 (추후 소싱) |
| `public/videos/rain.mp4` | Rain 오버레이 (추후 소싱) |

### 변경 없는 파일

기존 컴포넌트(Navbar, Footer, PostCard 등)는 CSS 변수 기반이므로 수정 불필요. atmosphere 색상 시프트가 자동 반영된다.
