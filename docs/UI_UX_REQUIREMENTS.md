# 📋 Personal Platform UI/UX 디자인 시스템

> **프로젝트**: 개인 플랫폼 (블로그 + 확장 가능한 기능들)  
> **작성일**: 2026-01-29  
> **버전**: 2.0

---

## 🎯 디자인 철학

### 핵심 컨셉: "Digital Warmth"
AI 시대에 **사람의 온기가 느껴지는** 개인 플랫폼을 만든다. 완벽함보다 **진정성**을, 무균질한 디자인보다 **개성**을 추구한다.

### 디자인 원칙
1. **Imperfect by Design** - 의도적인 불완전함으로 인간미 표현
2. **Consistent yet Flexible** - 일관된 시스템 안에서 각 섹션의 개성 허용
3. **Typography First** - 콘텐츠가 주인공, 타이포그래피가 핵심
4. **Subtle Motion** - 과하지 않은 마이크로 애니메이션으로 생동감
5. **Accessible Warmth** - 따뜻하면서도 접근성을 놓치지 않음

### 확장성 고려
```
현재 구조                    미래 확장 가능 구조
─────────────               ─────────────────────────
/                           /                (홈/랜딩)
/blog                       /blog            (블로그)
/admin                      /projects        (프로젝트/포트폴리오)
                            /tools           (유틸리티 도구들)
                            /about           (소개/이력서)
                            /guestbook       (방명록)
                            /links           (링크 모음)
                            /admin           (관리자)
```

---

## 🧩 디자인 토큰 (Design Tokens)

### 컬러 시스템

```css
/* CSS 변수로 정의 - 전역 사용 */

:root {
  /* === Core Colors === */
  --color-background: #FAF9F6;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #6B6B6B;
  --color-text-tertiary: #9A9A9A;
  
  --color-border: #E8E4DE;
  --color-border-light: #F0EDE8;
  
  /* === Accent Colors === */
  --color-accent-primary: #E6A23C;      /* 따뜻한 앰버 */
  --color-accent-secondary: #5B8DEF;    /* 차분한 블루 */
  --color-accent-tertiary: #6BCB77;     /* 자연스러운 그린 */
  
  /* === Semantic Colors === */
  --color-success: #6BCB77;
  --color-warning: #F0B254;
  --color-error: #E85D5D;
  --color-info: #5B8DEF;
  
  /* === Special Effects === */
  --color-highlight: rgba(255, 230, 0, 0.35);
  --color-glow: rgba(230, 162, 60, 0.15);
  --color-shadow: rgba(45, 45, 45, 0.08);
}

[data-theme="dark"] {
  --color-background: #1A1A1A;
  --color-surface: #242424;
  --color-surface-raised: #2D2D2D;
  
  --color-text-primary: #F5F5F5;
  --color-text-secondary: #A0A0A0;
  --color-text-tertiary: #707070;
  
  --color-border: #333333;
  --color-border-light: #2A2A2A;
  
  --color-accent-primary: #F0B254;
  --color-accent-secondary: #7BA3F0;
  --color-accent-tertiary: #7DD886;
  
  --color-highlight: rgba(255, 200, 0, 0.25);
  --color-glow: rgba(240, 178, 84, 0.1);
  --color-shadow: rgba(0, 0, 0, 0.3);
}
```

### 스페이싱 시스템

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
}
```

### 타이포그래피 스케일

```css
:root {
  /* Font Families */
  --font-sans: 'Pretendard', 'Noto Sans KR', -apple-system, sans-serif;
  --font-serif: 'Noto Serif KR', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-handwritten: 'Nanum Pen Script', 'Caveat', cursive;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 2rem;       /* 32px */
  --text-4xl: 2.5rem;     /* 40px */
  --text-5xl: 3rem;       /* 48px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
}
```

### 고급 타이포그래피 (Advanced Typography)

#### Fluid Typography (유동적 폰트 크기)

```css
:root {
  /* Fluid Typography with clamp() */
  /* 최소값, 선호값 (viewport 기반), 최대값 */
  --text-fluid-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --text-fluid-base: clamp(1rem, 0.9rem + 0.35vw, 1.125rem);
  --text-fluid-lg: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  --text-fluid-xl: clamp(1.25rem, 1rem + 1vw, 1.75rem);
  --text-fluid-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --text-fluid-3xl: clamp(2rem, 1.5rem + 2vw, 3rem);
  --text-fluid-4xl: clamp(2.5rem, 1.8rem + 3vw, 4rem);
  --text-fluid-5xl: clamp(3rem, 2rem + 4vw, 5rem);
}

/* 제목에 적용 */
h1 { font-size: var(--text-fluid-4xl); }
h2 { font-size: var(--text-fluid-3xl); }
h3 { font-size: var(--text-fluid-2xl); }
h4 { font-size: var(--text-fluid-xl); }
```

#### Numeric Typography (숫자 타이포그래피)

```css
/* 테이블, 카운터, 가격 등 숫자 정렬이 필요한 곳 */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* 분수 표기 */
.fractions {
  font-variant-numeric: diagonal-fractions;
}

/* 서수 표기 (1st, 2nd, 3rd) */
.ordinals {
  font-variant-numeric: ordinal;
}
```

#### Text Wrapping (텍스트 줄바꿈)

```css
/* 제목: 균형 잡힌 줄바꿈 */
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}

/* 본문 단락: 예쁜 줄바꿈 (마지막 줄 외톨이 단어 방지) */
p {
  text-wrap: pretty;
}

/* 강제 줄바꿈 방지 (짧은 텍스트) */
.nowrap {
  text-wrap: nowrap;
}
```

#### Optical Margin Alignment (광학 여백 정렬)

```css
/* 인용 부호, 숫자 등이 시각적으로 정렬되도록 */
.optical-align {
  hanging-punctuation: first last;
}

/* 리스트 마커 들여쓰기 */
ul, ol {
  list-style-position: outside;
  padding-left: 1.5em;
}

/* 인용문 들여쓰기 보정 */
blockquote {
  margin-left: -0.4em; /* 인용 부호 너비만큼 당김 */
}
```

#### Font Loading Strategy (폰트 로딩 전략)

```css
/* font-display 전략 */
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* FOUT 허용, 빠른 텍스트 표시 */
}

@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* 선택적 폰트 (장식용) */
@font-face {
  font-family: 'Nanum Pen Script';
  src: url('/fonts/NanumPenScript-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: optional; /* 캐시된 경우만 사용 */
}
```

```html
<!-- Preload 중요 폰트 (head에 추가) -->
<link rel="preload" href="/fonts/Pretendard-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Pretendard-Bold.woff2" as="font" type="font/woff2" crossorigin>
```

### 애니메이션 토큰

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Easings */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px var(--color-shadow);
  --shadow-md: 0 4px 6px var(--color-shadow);
  --shadow-lg: 0 10px 15px var(--color-shadow);
  --shadow-xl: 0 20px 25px var(--color-shadow);
}
```

### 반응형 브레이크포인트

```css
/* Tailwind 기준 */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## 🎨 아날로그 감성 요소

### 1. 텍스처 & 질감

```css
/* 종이 질감 배경 */
.paper-texture {
  background-color: var(--color-background);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

/* 따뜻한 그라데이션 */
.warm-gradient {
  background: linear-gradient(
    135deg,
    var(--color-background) 0%,
    color-mix(in srgb, var(--color-accent-primary) 5%, var(--color-background)) 100%
  );
}
```

### 2. 하이라이터 효과

```css
/* 형광펜 밑줄 */
.highlight {
  background: linear-gradient(
    180deg,
    transparent 60%,
    var(--color-highlight) 60%
  );
  padding: 0 4px;
  margin: 0 -4px;
}

/* 호버 시 확장 */
.highlight-hover {
  background-size: 100% 0%;
  background-position: 0 100%;
  transition: background-size var(--duration-normal) var(--ease-out);
}
.highlight-hover:hover {
  background-size: 100% 40%;
}
```

### 3. 손그림 스타일

```css
/* 손그림 밑줄 */
.hand-underline {
  text-decoration: none;
  background-image: url("data:image/svg+xml,..."); /* 손그림 SVG */
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 3px;
}

/* 살짝 기울어진 요소 */
.tilted {
  transform: rotate(-0.5deg);
}

.tilted-hover:hover {
  transform: rotate(0deg) translateY(-2px);
}
```

### 4. 스탬프/태그 스타일

```css
.stamp {
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid currentColor;
  border-radius: 4px;
  font-family: var(--font-handwritten);
  transform: rotate(-2deg);
  opacity: 0.85;
}
```

---

## 🧱 공통 컴포넌트

### 1. 버튼

```
Primary Button:
├── 배경: accent-primary
├── 텍스트: white
├── hover: 밝기 110% + scale(1.02)
├── active: scale(0.98)
└── 둥근 모서리: 8px

Secondary Button:
├── 배경: transparent
├── 테두리: border
├── hover: surface + 그림자
└── 둥근 모서리: 8px

Ghost Button:
├── 배경: transparent
├── hover: surface-raised
└── 미니멀한 스타일
```

### 2. 카드

```
Base Card:
├── 배경: surface
├── 테두리: border-light
├── 그림자: shadow-sm
├── 둥근 모서리: 12px
└── 패딩: space-lg

Hover State:
├── translateY(-4px)
├── 그림자: shadow-md
└── 부드러운 전환: duration-normal

Interactive Card:
├── 클릭 가능 표시
├── 커서: pointer
└── focus 상태 명확
```

### 3. 입력 필드

```
Text Input:
├── 배경: surface
├── 테두리: border (focus 시 accent)
├── 패딩: 12px 16px
├── 둥근 모서리: 8px
└── 레이블: 상단에 위치

States:
├── default: border
├── focus: accent + glow
├── error: error color + 메시지
└── disabled: 투명도 50%
```

#### Form UX 상세 명세 (Form UX Specifications)

##### Autocomplete 속성 요구사항

```html
<!-- 필수 autocomplete 속성 -->
<input type="email" autocomplete="email" />
<input type="text" autocomplete="name" />
<input type="text" autocomplete="given-name" />
<input type="text" autocomplete="family-name" />
<input type="tel" autocomplete="tel" />
<input type="text" autocomplete="street-address" />
<input type="text" autocomplete="address-line1" />
<input type="text" autocomplete="postal-code" />
<input type="text" autocomplete="country" />
<input type="password" autocomplete="current-password" />
<input type="password" autocomplete="new-password" />
<input type="text" autocomplete="one-time-code" />  <!-- OTP -->
<input type="text" autocomplete="organization" />
<input type="url" autocomplete="url" />

<!-- 신용카드 (필요시) -->
<input type="text" autocomplete="cc-name" />
<input type="text" autocomplete="cc-number" />
<input type="text" autocomplete="cc-exp" />
<input type="text" autocomplete="cc-csc" />

<!-- 검색 필드는 autocomplete 끄기 -->
<input type="search" autocomplete="off" />
```

##### 검증 전략 (Validation Strategy)

```typescript
// 검증 타이밍 매트릭스
const validationTiming = {
  // 실시간 검증 (입력 중) - onInput/onChange
  realtime: [
    "비밀번호 강도 표시",
    "글자 수 카운터",
    "사용자명 중복 확인",
    "실시간 검색 제안",
  ],

  // 포커스 해제 시 검증 - onBlur
  onBlur: [
    "이메일 형식 검증",
    "필수 필드 검증",
    "전화번호 형식",
    "URL 형식",
    "숫자 범위",
  ],

  // 제출 시에만 검증 - onSubmit
  onSubmit: [
    "전체 폼 일관성 검사",
    "서버 사이드 검증",
    "비밀번호 일치 확인",
    "비즈니스 로직 검증",
  ],
};

// 검증 규칙
const validationRules = {
  // 실시간 피드백은 debounce 적용 (300ms)
  debounceTime: 300,

  // 에러 표시는 최초 입력 후부터 (pristine 상태에서는 숨김)
  showErrorAfter: "touched",

  // 성공 표시는 blur 이후에만
  showSuccessAfter: "blurred",

  // 에러 메시지는 필드 바로 아래
  errorPosition: "below",
};
```

##### 에러 복구 패턴 (Error Recovery Patterns)

```typescript
// 에러 표시 규칙
const errorPatterns = {
  // 1. 인라인 에러 메시지
  inline: {
    position: "immediately-below-input",
    animation: "fade-in + slide-down (150ms)",
    color: "var(--color-error)",
    icon: "exclamation-circle",
    fontSize: "var(--text-sm)",
  },

  // 2. 필드 하이라이트
  fieldHighlight: {
    borderColor: "var(--color-error)",
    backgroundColor: "rgba(var(--color-error-rgb), 0.05)",
    labelColor: "var(--color-error)",
  },

  // 3. 에러 발생 시 자동 포커스
  autoFocus: {
    enabled: true,
    scrollIntoView: true,
    scrollBehavior: "smooth",
    scrollMargin: "100px", // 헤더 고려
  },

  // 4. 에러 해결 시 피드백
  onResolve: {
    clearErrorImmediately: true,
    showSuccessIcon: false, // 성공 아이콘은 blur 후에만
    hapticFeedback: false, // 모바일에서 진동 없음
  },
};

// 에러 메시지 작성 가이드
const errorMessageGuidelines = {
  // DO: 구체적이고 해결책 제시
  good: [
    "이메일 주소에 '@'가 필요합니다",
    "비밀번호는 최소 8자 이상이어야 합니다",
    "이 사용자명은 이미 사용 중입니다. 다른 이름을 시도해보세요",
  ],
  // DON'T: 모호하거나 기술적인 용어
  bad: [
    "잘못된 입력입니다",
    "형식이 올바르지 않습니다",
    "Validation error",
  ],
};
```

##### 성공 상태 & Celebration

```typescript
// 성공 피드백 패턴
const successPatterns = {
  // 1. 필드 레벨 성공 (미묘하게)
  fieldSuccess: {
    borderColor: "var(--color-success)",
    icon: "checkmark",
    iconColor: "var(--color-success)",
    animation: "scale-pop (150ms)", // 살짝 커졌다 작아짐
  },

  // 2. 폼 제출 성공 (명확하게)
  formSuccess: {
    // 버튼 상태 변화
    button: {
      text: "제출됨 ✓",
      backgroundColor: "var(--color-success)",
      animation: "checkmark-draw (300ms)",
    },
    // 토스트 알림
    toast: {
      type: "success",
      duration: 3000,
      position: "top-center",
    },
    // 선택적: 컨페티 (중요한 순간에만)
    confetti: {
      trigger: ["signup", "first-post", "achievement"],
      duration: 2000,
      particleCount: 50,
    },
  },

  // 3. 저장 완료 피드백 (autosave)
  saveSuccess: {
    indicator: "subtle-checkmark-fade",
    text: "저장됨",
    duration: 1500,
  },
};
```

##### 자동 저장 동작 (Autosave Behavior)

```typescript
// Autosave 구현 패턴
const autosaveConfig = {
  // 1. 트리거 조건
  triggers: {
    onChange: true,
    debounceTime: 2000, // 2초 입력 멈춤 후
    onBlur: true,       // 필드 벗어날 때
    interval: 30000,    // 30초마다 (폴백)
    onVisibilityChange: true, // 탭 전환 시
  },

  // 2. UI 표시
  indicators: {
    saving: {
      text: "저장 중...",
      icon: "spinner",
      position: "top-right-of-editor",
    },
    saved: {
      text: "저장됨",
      icon: "checkmark",
      fadeOutAfter: 2000,
    },
    error: {
      text: "저장 실패 - 재시도 중",
      icon: "warning",
      retryButton: true,
    },
    offline: {
      text: "오프라인 - 연결 시 저장됨",
      icon: "cloud-offline",
      persistUntilOnline: true,
    },
  },

  // 3. 충돌 해결
  conflictResolution: {
    strategy: "last-write-wins", // 또는 "merge", "prompt-user"
    showConflictModal: true,
    keepLocalBackup: true,
  },

  // 4. 로컬 백업
  localBackup: {
    storage: "IndexedDB", // 또는 localStorage
    maxVersions: 5,
    cleanupAfter: "7days",
  },
};
```

### 4. 네비게이션

```
Header Nav:
├── 고정 위치 (스크롤 시)
├── 배경: surface (blur 효과)
├── 높이: 64px
└── 로고 + 메뉴 + 다크모드 토글

Mobile Nav:
├── 햄버거 메뉴
├── 슬라이드 인 패널
└── 전체 높이
```

### 5. 푸터

```
Footer:
├── 배경: surface 또는 background
├── 상단 구분선
├── 링크 그룹들
├── 저작권 표시
└── SNS 아이콘
```

### 6. 컴포넌트 상태 매트릭스 (Component State Matrix)

모든 인터랙티브 컴포넌트는 아래 상태를 명확히 정의해야 합니다.

#### 버튼 상태 매트릭스

```css
/* === Default State === */
.button {
  background: var(--color-accent-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

/* === Hover State === */
.button:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* === Active/Pressed State === */
.button:active:not(:disabled) {
  transform: scale(0.98) translateY(0);
  filter: brightness(0.95);
  box-shadow: none;
}

/* === Focus State (키보드 네비게이션) === */
.button:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-glow);
}

/* === Disabled State === */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

/* === Loading State === */
.button[data-loading="true"] {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.button[data-loading="true"]::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* === Error State (제출 실패 등) === */
.button[data-error="true"] {
  background: var(--color-error);
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

#### 입력 필드 상태 매트릭스

```css
/* === Default State === */
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: var(--text-base);
  transition: all var(--duration-fast) var(--ease-default);
}

/* === Hover State === */
.input:hover:not(:disabled):not(:focus) {
  border-color: var(--color-text-tertiary);
}

/* === Focus State === */
.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-glow);
}

/* === Filled State (값이 있을 때) === */
.input:not(:placeholder-shown) {
  border-color: var(--color-border);
}

/* === Valid State (검증 통과) === */
.input[data-valid="true"] {
  border-color: var(--color-success);
  padding-right: 40px; /* 체크 아이콘 공간 */
}

/* === Error State === */
.input[data-error="true"] {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 5%, var(--color-surface));
}

/* === Disabled State === */
.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-surface-raised);
}

/* === Read-only State === */
.input:read-only {
  background: var(--color-surface-raised);
  cursor: default;
}

/* === Loading State (비동기 검증 중) === */
.input[data-loading="true"] {
  padding-right: 40px;
}

.input-wrapper[data-loading="true"]::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

#### 카드 상태 매트릭스

```css
/* === Default State === */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

/* === Hover State (인터랙티브 카드만) === */
.card[data-interactive="true"]:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border);
}

/* === Active/Pressed State === */
.card[data-interactive="true"]:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* === Focus State === */
.card[data-interactive="true"]:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* === Selected State === */
.card[data-selected="true"] {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 1px var(--color-accent-primary);
}

/* === Loading State (스켈레톤) === */
.card[data-loading="true"] {
  position: relative;
  overflow: hidden;
}

.card[data-loading="true"] .skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-raised) 25%,
    var(--color-border-light) 50%,
    var(--color-surface-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* === Error State === */
.card[data-error="true"] {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 5%, var(--color-surface));
}

/* === Disabled State === */
.card[data-disabled="true"] {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(0.2);
}
```

#### 링크/네비게이션 상태 매트릭스

```css
/* === Default State === */
.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all var(--duration-fast) var(--ease-default);
}

/* === Hover State === */
.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-raised);
}

/* === Active State (현재 페이지) === */
.nav-link[data-active="true"] {
  color: var(--color-accent-primary);
  background: color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
  font-weight: 500;
}

/* === Focus State === */
.nav-link:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: -2px;
}

/* === Disabled State === */
.nav-link[data-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
}
```

#### 토글/스위치 상태 매트릭스

```css
/* === Default State (Off) === */
.toggle {
  width: 48px;
  height: 24px;
  background: var(--color-border);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default);
}

.toggle::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform var(--duration-fast) var(--ease-bounce);
  box-shadow: var(--shadow-sm);
}

/* === Hover State === */
.toggle:hover {
  background: var(--color-text-tertiary);
}

/* === Checked State (On) === */
.toggle[data-checked="true"] {
  background: var(--color-accent-primary);
}

.toggle[data-checked="true"]::after {
  transform: translateX(24px);
}

/* === Focus State === */
.toggle:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* === Disabled State === */
.toggle[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Loading State === */
.toggle[data-loading="true"]::after {
  opacity: 0.5;
}
```

---

## 📖 섹션별 디자인 가이드

### 🏠 홈 / 랜딩 페이지

```
목적: 첫인상, 사이트 전체 소개
톤: 개성 있고 기억에 남는

구성:
├── 히어로: 이름/타이틀 + 한 줄 소개 + CTA
├── 섹션 미리보기: 블로그, 프로젝트 등 하이라이트
├── 소개: 간단한 자기소개
└── 푸터

특별 요소:
├── 손글씨 스타일 강조 텍스트 가능
├── 아날로그 감성 요소 적극 활용
└── 인터랙티브 요소 (optional)
```

### 📝 블로그 섹션

```
목적: 글 읽기에 최적화
톤: 따뜻하고 읽기 편한

글 목록 (/blog):
├── 그리드 또는 리스트 레이아웃
├── 카드: 썸네일, 제목, 발췌, 날짜, 태그
├── 필터/검색 (선택적)
└── 페이지네이션 또는 무한 스크롤

글 상세 (/blog/[slug]):
├── 제목 (크게, bold)
├── 메타: 날짜, 읽는 시간, 태그
├── 본문: 최대 720px, 중앙 정렬
├── 코드 블록: 별도 스타일링
├── 인용구: 손글씨 폰트
└── 이전/다음 글 네비게이션

아날로그 요소:
├── blockquote → 손글씨
├── 중요 문장 → 하이라이터
├── hr → 손그림 구분선
└── 배경 → 종이 질감 (subtle)
```

### 💼 프로젝트 / 포트폴리오

```
목적: 작업물 쇼케이스
톤: 프로페셔널 + 개성

프로젝트 목록 (/projects):
├── 그리드 레이아웃 (마소니 또는 균등)
├── 카드: 썸네일, 제목, 설명, 기술 스택
├── 필터: 카테고리/기술별
└── hover: 상세 정보 overlay

프로젝트 상세:
├── 히어로 이미지/영상
├── 프로젝트 개요
├── 기술 스택 (뱃지 스타일)
├── 주요 기능/성과
├── 스크린샷 갤러리
└── 링크: 데모, GitHub 등
```

### 🛠️ 도구 / 유틸리티

```
목적: 유용한 미니 도구 제공
톤: 깔끔하고 기능적

도구 목록 (/tools):
├── 카드 그리드
├── 아이콘 + 이름 + 설명
└── 바로 사용 가능한 인터랙션

개별 도구:
├── 간단하고 직관적인 UI
├── 즉각적인 피드백
├── 복사/공유 기능
└── 반응형 필수

예시 도구:
├── 색상 변환기
├── 단위 변환기
├── JSON 포맷터
├── QR 코드 생성기
└── 그라데이션 생성기
```

### 👤 소개 / About

```
목적: 개인/전문성 소개
톤: 진정성 있고 친근한

구성:
├── 프로필 사진 (있다면)
├── 자기소개 텍스트
├── 경력/학력 타임라인 (선택적)
├── 기술 스택
├── 연락처/SNS
└── 이력서 다운로드 (선택적)

특별 요소:
├── 손글씨 서명 (하단)
├── 개인적인 톤의 글
└── 사진은 자연스러운 스타일
```

### 📮 방명록 / 게스트북

```
목적: 방문자 소통
톤: 캐주얼하고 재미있는

구성:
├── 메시지 입력 폼
├── 메시지 리스트 (최신순)
├── 간단한 인증 (스팸 방지)
└── 반응/답글 (선택적)

스타일:
├── 포스트잇 또는 메모지 스타일
├── 손글씨 폰트 적용
├── 살짝 기울어진 배치
└── 아날로그 감성 극대화
```

### 🔗 링크 모음

```
목적: SNS/외부 링크 허브
톤: 간결하고 미니멀

구성:
├── 프로필 영역
├── 링크 버튼 리스트
└── 심플한 배경

스타일:
├── Linktree 스타일
├── 버튼은 일관된 디자인
└── 호버 효과
```

---

## 📦 콘텐츠 엣지 케이스 (Content Edge Cases)

### Empty States (빈 상태 디자인)

```typescript
// Empty State 구성 요소
interface EmptyStateProps {
  // 필수 요소
  illustration: React.ReactNode;  // SVG 일러스트레이션 또는 아이콘
  title: string;                  // 명확한 상태 설명
  description: string;            // 다음 행동 안내

  // 선택 요소
  action?: {
    label: string;
    onClick: () => void;
    variant: "primary" | "secondary";
  };
}

// Empty State 유형별 가이드
const emptyStatePatterns = {
  // 1. 검색 결과 없음
  noSearchResults: {
    title: "검색 결과가 없습니다",
    description: "다른 검색어를 시도하거나 필터를 조정해보세요",
    illustration: "search-not-found.svg",
    actions: ["검색어 제안", "필터 초기화"],
  },

  // 2. 첫 사용 (데이터 없음)
  firstUse: {
    title: "아직 작성한 글이 없습니다",
    description: "첫 번째 글을 작성하여 블로그를 시작해보세요",
    illustration: "empty-pencil.svg",
    action: { label: "새 글 작성", variant: "primary" },
  },

  // 3. 필터 결과 없음
  noFilterResults: {
    title: "조건에 맞는 항목이 없습니다",
    description: "필터를 변경하거나 모든 항목을 확인해보세요",
    illustration: "filter-empty.svg",
    action: { label: "필터 초기화", variant: "secondary" },
  },

  // 4. 에러로 인한 빈 상태
  error: {
    title: "콘텐츠를 불러올 수 없습니다",
    description: "잠시 후 다시 시도해주세요",
    illustration: "error-cloud.svg",
    action: { label: "다시 시도", variant: "primary" },
  },

  // 5. 권한 없음
  noPermission: {
    title: "접근 권한이 없습니다",
    description: "이 콘텐츠를 보려면 로그인이 필요합니다",
    illustration: "locked.svg",
    action: { label: "로그인", variant: "primary" },
  },
};
```

```css
/* Empty State 스타일 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
  min-height: 300px;
}

.empty-state__illustration {
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-lg);
  opacity: 0.8;
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.empty-state__description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 360px;
  margin-bottom: var(--space-lg);
}
```

### Long Content Truncation (긴 콘텐츠 자르기)

```css
/* 1. 단일 줄 자르기 */
.truncate-single {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 2. 여러 줄 자르기 (line-clamp) */
.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 3. "더 보기" 패턴 */
.expandable-content {
  position: relative;
}

.expandable-content[data-collapsed="true"] {
  max-height: 120px;
  overflow: hidden;
}

.expandable-content[data-collapsed="true"]::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--color-surface));
}

/* 4. 긴 단어 처리 */
.break-word {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* 5. 긴 URL/코드 처리 */
.break-all {
  word-break: break-all;
}
```

```typescript
// Truncation 유틸리티
const truncationRules = {
  // 제목
  title: {
    maxLines: 2,
    maxChars: 80,
    showTooltipOnTruncate: true,
  },

  // 설명/발췌
  description: {
    maxLines: 3,
    maxChars: 150,
    showExpandButton: false,
  },

  // 댓글/리뷰
  comment: {
    maxLines: 4,
    maxChars: 300,
    showExpandButton: true,
    expandLabel: "더 보기",
    collapseLabel: "접기",
  },

  // 태그 목록
  tags: {
    maxVisible: 3,
    showMoreCount: true, // "+3 more"
  },
};
```

### Image Aspect Ratio Constraints (이미지 비율 제약)

```css
/* 표준 비율 컨테이너 */
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-portrait { aspect-ratio: 3 / 4; }
.aspect-wide { aspect-ratio: 21 / 9; }
.aspect-card { aspect-ratio: 4 / 3; }

/* 이미지 적합 전략 */
.img-cover {
  object-fit: cover;
  object-position: center;
  width: 100%;
  height: 100%;
}

.img-contain {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

/* 반응형 이미지 컨테이너 */
.responsive-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background: var(--color-surface-raised);
}

.responsive-image-container img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

```typescript
// 이미지 비율 가이드
const imageAspectRatios = {
  // 블로그 썸네일
  blogThumbnail: {
    ratio: "16:9",
    minWidth: 320,
    maxWidth: 1200,
    fallback: "placeholder-blog.svg",
  },

  // 프로필 사진
  avatar: {
    ratio: "1:1",
    sizes: [32, 48, 64, 96, 128],
    fallback: "default-avatar.svg",
  },

  // 프로젝트 스크린샷
  projectScreenshot: {
    ratio: "16:10", // 일반적인 모니터 비율
    maxWidth: 1920,
    fallback: "placeholder-project.svg",
  },

  // 갤러리 이미지
  gallery: {
    ratio: "preserve", // 원본 비율 유지
    maxHeight: 600,
    objectFit: "contain",
  },

  // OG 이미지
  ogImage: {
    ratio: "1.91:1", // 1200x630
    required: true,
  },
};
```

### Fallback Content Strategy (폴백 콘텐츠 전략)

```typescript
// 폴백 계층 구조
const fallbackHierarchy = {
  // 이미지 폴백
  image: [
    "원본 이미지",
    "WebP → JPEG 폴백",
    "저해상도 blur placeholder",
    "브랜드 색상 placeholder",
    "기본 아이콘",
  ],

  // 폰트 폴백
  font: [
    "커스텀 웹폰트 (Pretendard)",
    "시스템 폰트 (Apple SD Gothic Neo / Malgun Gothic)",
    "기본 sans-serif",
  ],

  // 아바타 폴백
  avatar: [
    "사용자 업로드 이미지",
    "이름 이니셜 생성 (배경색: 이름 해시 기반)",
    "기본 실루엣 아이콘",
  ],

  // 콘텐츠 폴백
  content: [
    "실제 콘텐츠",
    "캐시된 콘텐츠 (stale-while-revalidate)",
    "스켈레톤 UI",
    "에러 상태 UI",
  ],
};

// 이미지 에러 처리
const ImageWithFallback = ({ src, fallback, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? fallback : imgSrc}
      alt={alt}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};
```

```css
/* Blur Placeholder (Next.js Image 스타일) */
.image-with-placeholder {
  position: relative;
}

.image-placeholder {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  transform: scale(1.1); /* blur edge 숨김 */
  transition: opacity var(--duration-normal);
}

.image-placeholder[data-loaded="true"] {
  opacity: 0;
}

/* 색상 기반 Placeholder */
.color-placeholder {
  background: linear-gradient(
    135deg,
    var(--color-surface-raised),
    var(--color-border-light)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-placeholder__icon {
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
}
```

### Loading Content Priorities (로딩 콘텐츠 우선순위)

```typescript
// 로딩 우선순위 매트릭스
const loadingPriority = {
  // Critical (즉시 로드)
  critical: [
    "Navigation header",
    "Above-the-fold hero text",
    "Critical CSS (인라인)",
    "Primary CTA button",
  ],

  // High (LCP 전)
  high: [
    "Hero image",
    "Main content heading",
    "Primary web fonts",
    "Above-the-fold images",
  ],

  // Medium (FCP 후)
  medium: [
    "Below-the-fold content",
    "Secondary images",
    "Sidebar content",
    "Comments section",
  ],

  // Low (Idle 시)
  low: [
    "Related posts",
    "Footer content",
    "Analytics scripts",
    "Decorative images",
  ],

  // Lazy (필요시)
  lazy: [
    "Modal content",
    "Tooltip content",
    "Dropdown menus",
    "Off-screen images",
  ],
};

// 스켈레톤 표시 전략
const skeletonStrategy = {
  // 즉시 스켈레톤 (데이터 fetching 중)
  immediate: [
    "글 목록 카드",
    "프로필 정보",
    "통계 숫자",
  ],

  // 지연 스켈레톤 (200ms 후에도 로딩 중이면)
  delayed: [
    "검색 결과",
    "필터링 결과",
    "무한 스크롤 추가 항목",
  ],

  // 스켈레톤 없음 (빠른 전환 예상)
  none: [
    "탭 전환",
    "토글 상태",
    "캐시된 데이터",
  ],
};
```

```css
/* 스켈레톤 컴포넌트 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-raised) 0%,
    var(--color-border-light) 50%,
    var(--color-surface-raised) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-text:last-child {
  width: 70%;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-image {
  aspect-ratio: 16 / 9;
  width: 100%;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 지연 스켈레톤 (200ms 후 표시) */
.skeleton-delayed {
  opacity: 0;
  animation: skeleton-fade-in 0s 200ms forwards, skeleton-shimmer 1.5s 200ms ease-in-out infinite;
}

@keyframes skeleton-fade-in {
  to { opacity: 1; }
}
```

---

## ✨ 인터랙션 & 애니메이션

### 페이지 전환

```css
/* View Transitions API 또는 Framer Motion */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all var(--duration-normal) var(--ease-out);
}
```

### 스크롤 애니메이션

```css
/* Intersection Observer 활용 */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all var(--duration-slow) var(--ease-out);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 호버 효과

```css
/* 카드 호버 */
.card-interactive {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* 링크 호버 */
.link-underline {
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size var(--duration-normal) var(--ease-out);
}

.link-underline:hover {
  background-size: 100% 2px;
}
```

### 로딩 상태

```
스켈레톤 UI:
├── 콘텐츠와 동일한 레이아웃
├── shimmer 애니메이션
├── 색상: surface-raised
└── 로드 완료 시 fade 전환

스피너:
├── 간단한 회전 애니메이션
├── 브랜드 색상 사용
└── 작은 사이즈 (버튼 내부 등)
```

### 고급 애니메이션 시스템 (Advanced Animation System)

#### Spring Physics (Framer Motion 규칙)

```typescript
// Framer Motion Spring Presets
const springPresets = {
  // 일반적인 인터랙션 - 빠르고 반응적
  snappy: { type: "spring", stiffness: 400, damping: 30 },

  // 부드러운 전환 - 자연스러운 느낌
  gentle: { type: "spring", stiffness: 200, damping: 20 },

  // 바운시한 효과 - 재미있는 UI 요소
  bouncy: { type: "spring", stiffness: 300, damping: 10, mass: 1 },

  // 느린 전환 - 큰 요소나 페이지 전환
  slow: { type: "spring", stiffness: 100, damping: 20, mass: 1.5 },

  // 모달/오버레이 - 명확하고 안정적
  modal: { type: "spring", stiffness: 500, damping: 35 },

  // 드래그 후 스냅백
  snapback: { type: "spring", stiffness: 600, damping: 30, mass: 0.8 },
};

// 기본값 (명시하지 않을 때)
const defaultSpring = { type: "spring", stiffness: 300, damping: 25 };
```

#### Staggered Animation Orchestration (순차 애니메이션)

```typescript
// Framer Motion Variants 패턴
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,      // 자식 간 간격 (80ms)
      delayChildren: 0.1,         // 시작 전 지연 (100ms)
      when: "beforeChildren",     // 부모 먼저 애니메이션
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,       // 역순으로 사라짐
      when: "afterChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// 사용 예시
<motion.ul variants={containerVariants} initial="hidden" animate="visible" exit="exit">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants} />
  ))}
</motion.ul>
```

#### Exit Animations (퇴장 애니메이션)

```typescript
// AnimatePresence 필수 규칙
import { AnimatePresence, motion } from "framer-motion";

// 1. 모든 조건부 렌더링은 AnimatePresence로 감싸기
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="unique-key"  // key 필수!
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}  // exit 필수!
    />
  )}
</AnimatePresence>

// 2. 페이지 전환 (Next.js App Router)
// layout.tsx
<AnimatePresence mode="wait" initial={false}>
  {children}
</AnimatePresence>

// page.tsx
<motion.main
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* 페이지 콘텐츠 */}
</motion.main>

// 3. 리스트 아이템 제거
<AnimatePresence mode="popLayout">  // 레이아웃 shift 자동 처리
  {items.map(item => (
    <motion.div
      key={item.id}
      layout  // 레이아웃 애니메이션
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
    />
  ))}
</AnimatePresence>
```

#### Gesture-based Interactions (제스처 기반 인터랙션)

```typescript
// 드래그
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}        // 경계 밖 탄성 (0-1)
  dragMomentum={false}     // 관성 끄기 (카드 정렬 등)
  whileDrag={{ scale: 1.05, cursor: "grabbing" }}
  onDragEnd={(_, info) => {
    // info.offset, info.velocity 활용
    if (Math.abs(info.offset.x) > 100) {
      // 스와이프 액션
    }
  }}
/>

// 탭 & 롱프레스
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.02 }}
  onTap={() => console.log("tapped")}
  onTapStart={() => console.log("tap start")}
  onTapCancel={() => console.log("tap cancelled")}
/>

// 팬 (스와이프)
<motion.div
  onPan={(_, info) => {
    // info.delta.x, info.delta.y 실시간 추적
  }}
  onPanEnd={(_, info) => {
    if (info.velocity.x > 500) {
      // 빠른 스와이프
    }
  }}
/>

// 핀치 줌 (터치 디바이스)
<motion.img
  style={{ scale, x, y }}
  drag
  dragElastic={0.2}
  whileTap={{ cursor: "grabbing" }}
/>
```

#### Animation Interruptibility (애니메이션 중단 가능성)

```typescript
// 1. 애니메이션 중단 및 새 목표로 전환
const controls = useAnimation();

// 언제든 새 애니메이션으로 전환 가능
controls.start({ x: 100 });  // 진행 중에
controls.start({ x: 200 });  // 즉시 새 목표로 변경 (자연스럽게)

// 2. 사용자 인터랙션으로 애니메이션 중단
<motion.div
  animate={controls}
  whileHover="hover"  // 호버 시 현재 애니메이션 덮어씀
  whileTap="tap"      // 탭 시 즉시 반응
/>

// 3. 레이아웃 애니메이션 중단
<motion.div
  layout
  layoutId="shared-element"
  transition={{
    layout: { type: "spring", stiffness: 300, damping: 30 },
  }}
/>

// 4. 스크롤 기반 애니메이션 중단
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
// 스크롤 방향 바뀌면 즉시 반응
```

#### Reduced Motion 지원

```typescript
// Framer Motion의 자동 지원 활용
import { useReducedMotion } from "framer-motion";

function Component() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={shouldReduceMotion
        ? { duration: 0 }  // 즉시 전환
        : { type: "spring", stiffness: 300 }
      }
    />
  );
}

// 전역 설정 (옵션)
import { MotionConfig } from "framer-motion";

<MotionConfig reducedMotion="user">  // 시스템 설정 존중
  <App />
</MotionConfig>
```

---

## 🌙 다크모드

### 구현 요구사항

```javascript
// 초기 로드 시 깜빡임 방지
// <head>에 인라인 스크립트로 삽입

(function() {
  const theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
```

### 토글 동작

```
1. 시스템 설정 자동 감지 (기본값)
2. 수동 토글 버튼 (sun/moon 아이콘)
3. 선택값 localStorage 저장
4. 색상 전환: 300ms transition
```

### 특별 고려사항

```
코드 블록:
├── 라이트: 밝은 syntax theme
└── 다크: 어두운 syntax theme (예: One Dark)

이미지:
├── 필요시 밝기/대비 조절
└── 다크 전용 이미지 제공 (선택적)

그림자:
├── 다크모드에서 더 진하게
└── 또는 glow 효과로 대체
```

---

## 📱 반응형 가이드

### 레이아웃 패턴

```
Mobile (< 640px):
├── 단일 컬럼
├── 햄버거 메뉴
├── 터치 친화적 (최소 44px 터치 영역)
├── 여백: 16px
└── 폰트: base size 16px

Tablet (640px ~ 1024px):
├── 2컬럼 그리드
├── 사이드바 토글 가능
├── 여백: 24px
└── 일부 호버 효과 유지

Desktop (> 1024px):
├── 3-4컬럼 그리드
├── 풍부한 호버 효과
├── 여백: 32px ~ 48px
└── 최대 너비 제한 (1280px)
```

### 컨테이너 너비

```css
.container-sm { max-width: 640px; }   /* 글 본문 */
.container-md { max-width: 768px; }   /* 일반 콘텐츠 */
.container-lg { max-width: 1024px; }  /* 카드 그리드 */
.container-xl { max-width: 1280px; }  /* 전체 레이아웃 */
```

---

## 🔗 URL 상태 관리 (URL State Management)

### Query Parameter Synchronization (쿼리 파라미터 동기화)

```typescript
// URL에 동기화해야 하는 상태들
const urlSyncedState = {
  // 필터
  filters: {
    params: ["category", "tag", "status", "author"],
    format: "key=value",
    example: "?category=tech&tag=react",
  },

  // 정렬
  sort: {
    params: ["sortBy", "order"],
    default: { sortBy: "date", order: "desc" },
    example: "?sortBy=title&order=asc",
  },

  // 페이지네이션
  pagination: {
    params: ["page", "limit"],
    default: { page: 1, limit: 10 },
    example: "?page=2&limit=20",
  },

  // 검색
  search: {
    params: ["q", "in"],
    debounce: 300,
    example: "?q=react&in=title,content",
  },

  // 뷰 모드
  view: {
    params: ["view"],
    options: ["grid", "list", "compact"],
    default: "grid",
    example: "?view=list",
  },

  // 탭/패널 상태
  tab: {
    params: ["tab"],
    example: "?tab=settings",
  },
};

// Next.js App Router 구현 패턴
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function useUrlState<T>(key: string, defaultValue: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = (newValue: T) => {
    const params = new URLSearchParams(searchParams);
    if (newValue === defaultValue || newValue === null) {
      params.delete(key);
    } else {
      params.set(key, String(newValue));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [value, setValue] as const;
}
```

### Deep Linking Requirements (딥 링킹 요구사항)

```typescript
// 공유 가능해야 하는 상태들
const shareableStates = {
  // 필수: URL만으로 동일한 뷰 재현 가능
  required: [
    "현재 페이지/라우트",
    "필터 및 정렬 상태",
    "페이지네이션 위치",
    "검색 쿼리",
    "선택된 탭",
  ],

  // 권장: 사용자 경험 향상
  recommended: [
    "모달 열림 상태 (id 기반)",
    "사이드바 열림/닫힘",
    "스크롤 위치 (긴 페이지)",
  ],

  // 제외: URL에 저장하지 않음
  excluded: [
    "호버 상태",
    "포커스 상태",
    "로딩 상태",
    "에러 상태",
    "사용자 인증 정보",
  ],
};

// 모달 딥 링킹 패턴
// URL: /posts?modal=post-123
function PostModal() {
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modal");

  if (!modalId) return null;

  return (
    <Modal
      open={true}
      onClose={() => {
        // URL에서 modal 파라미터 제거
        const params = new URLSearchParams(searchParams);
        params.delete("modal");
        router.replace(`${pathname}?${params.toString()}`);
      }}
    >
      <PostDetail id={modalId} />
    </Modal>
  );
}
```

### Browser Back Button Behavior (브라우저 뒤로가기 동작)

```typescript
// 뒤로가기 버튼 처리 규칙
const backButtonRules = {
  // 1. 모달/오버레이: 뒤로가기로 닫기
  modal: {
    behavior: "뒤로가기 시 모달 닫힘",
    implementation: "URL에 모달 상태 저장",
    fallback: "모달 없는 상태로 이동",
  },

  // 2. 필터/정렬: 이전 필터 상태로
  filters: {
    behavior: "뒤로가기 시 이전 필터 복원",
    implementation: "URLSearchParams 활용",
  },

  // 3. 무한 스크롤: 스크롤 위치 복원
  infiniteScroll: {
    behavior: "뒤로가기 시 스크롤 위치 복원",
    implementation: "scrollRestoration: 'manual' + sessionStorage",
  },

  // 4. 폼 진행: 이전 단계로
  multiStepForm: {
    behavior: "뒤로가기 시 이전 단계",
    implementation: "URL에 step 파라미터",
    warning: "미저장 데이터 경고 표시",
  },

  // 5. 검색: 이전 검색어로
  search: {
    behavior: "뒤로가기 시 이전 검색어 복원",
    implementation: "URL q 파라미터",
  },
};

// 스크롤 위치 복원 구현
if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

// 페이지 떠날 때 스크롤 위치 저장
useEffect(() => {
  const saveScrollPosition = () => {
    sessionStorage.setItem(
      `scroll-${pathname}`,
      String(window.scrollY)
    );
  };

  window.addEventListener("beforeunload", saveScrollPosition);
  return () => window.removeEventListener("beforeunload", saveScrollPosition);
}, [pathname]);

// 페이지 진입 시 스크롤 위치 복원
useEffect(() => {
  const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
  if (savedPosition && navigation.type === "back") {
    window.scrollTo(0, parseInt(savedPosition));
  }
}, [pathname]);
```

### Prefetch Strategy (프리페치 전략)

```typescript
// Next.js 프리페치 전략
const prefetchStrategy = {
  // 1. 링크 호버 시 프리페치 (기본)
  onHover: {
    delay: 0,
    priority: "low",
    routes: ["내부 링크 전체"],
  },

  // 2. 뷰포트 진입 시 프리페치
  onViewport: {
    routes: ["다음 페이지 (페이지네이션)", "추천 글"],
    options: { rootMargin: "200px" },
  },

  // 3. 사전 프리페치 (확실히 방문할 곳)
  eager: {
    routes: ["홈 → 블로그 목록", "블로그 목록 → 첫 번째 글"],
    priority: "high",
  },

  // 4. 프리페치 비활성화
  disabled: {
    routes: ["외부 링크", "다운로드 링크", "인증 필요 페이지"],
  },
};

// Next.js Link 프리페치 제어
<Link href="/blog" prefetch={true}>블로그</Link>  // 즉시 프리페치
<Link href="/admin" prefetch={false}>관리자</Link> // 프리페치 안 함

// 프로그래밍 방식 프리페치
import { useRouter } from "next/navigation";

function BlogCard({ slug }) {
  const router = useRouter();

  return (
    <article
      onMouseEnter={() => router.prefetch(`/blog/${slug}`)}
      onClick={() => router.push(`/blog/${slug}`)}
    >
      {/* ... */}
    </article>
  );
}
```

---

## 📱 터치 & 모바일 인터랙션 (Touch & Mobile Interactions)

### Touch Action 설정

```css
/* 기본 터치 동작 최적화 */
* {
  /* 더블탭 줌 비활성화, 핀치 줌은 유지 */
  touch-action: manipulation;
}

/* 스크롤 영역 */
.scrollable {
  touch-action: pan-y;          /* 수직 스크롤만 */
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
}

.scrollable-horizontal {
  touch-action: pan-x;          /* 수평 스크롤만 */
}

/* 제스처가 필요한 요소 */
.gesture-area {
  touch-action: none;           /* 브라우저 기본 동작 없음 */
}

/* 버튼/링크 */
button, a, [role="button"] {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### Tap Highlight 설정

```css
/* iOS 탭 하이라이트 비활성화 후 커스텀 피드백 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 커스텀 탭 피드백 (선택적) */
.tap-highlight {
  position: relative;
}

.tap-highlight::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--color-text-primary);
  opacity: 0;
  transition: opacity var(--duration-fast);
  pointer-events: none;
  border-radius: inherit;
}

.tap-highlight:active::after {
  opacity: 0.1;
}

/* 또는 scale 피드백 */
.tap-scale:active {
  transform: scale(0.98);
}
```

### Overscroll Behavior

```css
/* 모달/오버레이: 스크롤 체이닝 방지 */
.modal-content,
.drawer-content,
.dropdown-content {
  overscroll-behavior: contain;
}

/* 전체 페이지: pull-to-refresh 방지 (필요시) */
html {
  overscroll-behavior-y: none; /* 또는 contain */
}

/* 가로 스크롤 영역: 브라우저 뒤로가기 제스처 방지 */
.horizontal-scroll {
  overscroll-behavior-x: contain;
}
```

### Minimum Touch Target Sizes (최소 터치 영역)

```css
/* WCAG 2.2 기준: 최소 44x44px, 권장 48x48px */
:root {
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
}

/* 버튼 최소 크기 */
button,
[role="button"],
.clickable {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}

/* 인라인 링크: 패딩으로 터치 영역 확장 */
a {
  padding: 8px 0;
  margin: -8px 0;
}

/* 작은 아이콘 버튼: 투명 터치 영역 확장 */
.icon-button {
  position: relative;
  width: 24px;
  height: 24px;
}

.icon-button::before {
  content: "";
  position: absolute;
  inset: -12px; /* 48px 터치 영역 */
}

/* 체크박스/라디오: 레이블 전체 클릭 가능 */
.form-check {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: var(--touch-target-min);
  cursor: pointer;
}

/* 리스트 아이템 */
.list-item {
  min-height: var(--touch-target-comfortable);
  padding: var(--space-md);
}
```

### 모바일 전용 인터랙션

```typescript
// 스와이프 동작 가이드
const swipePatterns = {
  // 카드 스와이프 (삭제/아카이브)
  cardSwipe: {
    threshold: 100, // px
    velocityThreshold: 0.5,
    leftAction: "archive",
    rightAction: "delete",
    hapticFeedback: true,
  },

  // 풀 투 리프레시
  pullToRefresh: {
    threshold: 80,
    indicator: "spinner",
    resistance: 0.5, // 당길 때 저항감
  },

  // 이미지 갤러리 스와이프
  gallerySwipe: {
    threshold: 50,
    snapToItem: true,
    momentum: true,
  },
};

// 모바일 감지 및 조건부 인터랙션
const isTouchDevice = () =>
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

const useMobileInteraction = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isTouchDevice() && window.innerWidth < 768);
  }, []);

  return isMobile;
};
```

```css
/* 호버 효과: 터치 디바이스에서 비활성화 */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

/* 터치 디바이스 전용 스타일 */
@media (hover: none) and (pointer: coarse) {
  /* 호버 대신 탭 피드백 */
  .card:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  /* 툴팁은 롱프레스로 표시 */
  .tooltip-trigger::after {
    display: none; /* 호버 툴팁 숨김 */
  }
}

/* Safe Area (노치/홈 인디케이터) */
.fixed-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.fixed-top {
  padding-top: env(safe-area-inset-top);
}

.full-width {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## ♿ 접근성 요구사항

### 필수 체크리스트

```
[ ] 색상 대비 WCAG AA (4.5:1) 이상
[ ] 키보드 네비게이션 가능
[ ] 명확한 포커스 표시
[ ] 모든 이미지에 alt 텍스트
[ ] 시맨틱 HTML (header, nav, main, article, footer)
[ ] Skip to content 링크
[ ] 폼 레이블 연결
[ ] 에러 메시지 명확
[ ] 애니메이션 줄이기 옵션 (prefers-reduced-motion)
[ ] 스크린 리더 테스트
```

### 포커스 스타일

```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* 마우스 클릭 시에는 outline 숨김 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 모션 설정

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🌍 국제화 준비 (Internationalization Readiness)

### 날짜/시간 포맷팅 (Intl.DateTimeFormat)

```typescript
// 날짜 포맷팅 유틸리티
const dateFormatters = {
  // 상대 시간 (1시간 전, 어제, 3일 전)
  relative: (date: Date, locale = "ko-KR") => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const diff = date.getTime() - Date.now();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    const diffMinutes = Math.round(diff / (1000 * 60));

    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
    return dateFormatters.medium(date, locale);
  },

  // 짧은 날짜 (1월 30일)
  short: (date: Date, locale = "ko-KR") =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date),

  // 중간 날짜 (2026년 1월 30일)
  medium: (date: Date, locale = "ko-KR") =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),

  // 전체 날짜 + 시간 (2026년 1월 30일 오후 3:45)
  full: (date: Date, locale = "ko-KR") =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date),

  // ISO 형식 (API/정렬용)
  iso: (date: Date) => date.toISOString(),
};

// 사용 예시
<time dateTime={dateFormatters.iso(post.createdAt)}>
  {dateFormatters.relative(post.createdAt)}
</time>
```

### 숫자 포맷팅 (Intl.NumberFormat)

```typescript
const numberFormatters = {
  // 일반 숫자 (1,234)
  decimal: (num: number, locale = "ko-KR") =>
    new Intl.NumberFormat(locale).format(num),

  // 통화 (₩1,234 / $1,234.00)
  currency: (num: number, currency = "KRW", locale = "ko-KR") =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "KRW" ? 0 : 2,
    }).format(num),

  // 퍼센트 (12.5%)
  percent: (num: number, locale = "ko-KR") =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num),

  // 축약 숫자 (1.2만, 3.4K)
  compact: (num: number, locale = "ko-KR") =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(num),

  // 파일 크기
  fileSize: (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  },

  // 읽는 시간
  readingTime: (minutes: number, locale = "ko-KR") => {
    if (locale === "ko-KR") {
      return `${minutes}분 소요`;
    }
    return `${minutes} min read`;
  },
};
```

### 텍스트 확장 고려사항 (Text Expansion Considerations)

```typescript
// 언어별 텍스트 길이 비율 (영어 = 1.0 기준)
const textExpansionRatios = {
  en: 1.0,     // 영어 (기준)
  ko: 0.8,     // 한국어 (더 짧음)
  ja: 0.9,     // 일본어
  zh: 0.7,     // 중국어 (가장 짧음)
  de: 1.3,     // 독일어 (더 김)
  fr: 1.2,     // 프랑스어
  ru: 1.3,     // 러시아어
  ar: 1.25,    // 아랍어
};

// UI 설계 시 고려사항
const textExpansionGuidelines = {
  // 버튼: 최대 1.5배 확장 가능하도록
  button: {
    minWidth: "auto",
    padding: "12px 24px", // 충분한 패딩
    textOverflow: "ellipsis", // 최후의 수단
  },

  // 네비게이션: 유연한 너비
  navigation: {
    useFlexbox: true,
    allowWrap: true, // 모바일에서
    abbreviateOnMobile: true,
  },

  // 레이블: 충분한 공간 확보
  formLabels: {
    display: "block", // 인라인 아님
    marginBottom: "8px",
  },

  // 테이블 헤더: 줄바꿈 허용
  tableHeaders: {
    whiteSpace: "normal",
    minWidth: "80px",
  },
};
```

```css
/* 텍스트 확장에 유연한 레이아웃 */
.flexible-button {
  /* 고정 너비 대신 min-width 사용 */
  min-width: 120px;
  width: auto;
  max-width: 100%;

  /* 텍스트 줄바꿈 방지하되 넘침 처리 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 아이콘 + 텍스트 조합 */
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-text__icon {
  flex-shrink: 0; /* 아이콘 크기 유지 */
}

.icon-text__text {
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### RTL 레이아웃 인식 (RTL Layout Awareness)

```css
/* 논리적 속성 사용 (RTL 자동 지원) */
.card {
  /* margin-left 대신 */
  margin-inline-start: var(--space-md);

  /* padding-right 대신 */
  padding-inline-end: var(--space-lg);

  /* border-left 대신 */
  border-inline-start: 2px solid var(--color-accent-primary);

  /* text-align: left 대신 */
  text-align: start;
}

/* Flexbox 방향도 자동 전환 */
.nav {
  display: flex;
  flex-direction: row; /* RTL에서 자동으로 우→좌 */
  gap: var(--space-md);
}

/* 수동 RTL 처리가 필요한 경우 */
[dir="rtl"] .custom-arrow {
  transform: scaleX(-1); /* 화살표 방향 반전 */
}

/* RTL 감지 */
:root[dir="rtl"] {
  --direction: rtl;
}

:root:not([dir="rtl"]) {
  --direction: ltr;
}
```

```typescript
// RTL 언어 목록
const rtlLanguages = ["ar", "he", "fa", "ur"];

// 언어에 따른 문서 방향 설정
function getTextDirection(locale: string): "ltr" | "rtl" {
  const language = locale.split("-")[0];
  return rtlLanguages.includes(language) ? "rtl" : "ltr";
}

// Next.js에서 적용
// app/layout.tsx
export default function RootLayout({ children, params }) {
  const dir = getTextDirection(params.locale);

  return (
    <html lang={params.locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

### 다국어 폰트 전략

```css
/* 언어별 폰트 스택 */
:root {
  /* 기본 (한국어 최적화) */
  --font-sans: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
}

/* 영어 콘텐츠 */
:lang(en) {
  --font-sans: "Inter", -apple-system, sans-serif;
}

/* 일본어 콘텐츠 */
:lang(ja) {
  --font-sans: "Noto Sans JP", -apple-system, sans-serif;
}

/* 중국어 콘텐츠 */
:lang(zh) {
  --font-sans: "Noto Sans SC", -apple-system, sans-serif;
}

/* 아랍어 콘텐츠 */
:lang(ar) {
  --font-sans: "Noto Sans Arabic", -apple-system, sans-serif;
  line-height: 1.8; /* 아랍어는 더 높은 줄 높이 필요 */
}

/* 적용 */
body {
  font-family: var(--font-sans);
}
```

---

## ⚡ 성능 요구사항 (Performance Requirements)

### Core Web Vitals 목표

```typescript
// Google Core Web Vitals 목표 (2024 기준)
const coreWebVitalsTargets = {
  // LCP (Largest Contentful Paint) - 최대 콘텐츠 페인트
  LCP: {
    good: 2500,       // ms 이하 (Good)
    needsImprovement: 4000, // ms 이하 (Needs Improvement)
    target: 2000,     // ms (목표값)
    elements: [
      "Hero 이미지",
      "블로그 썸네일",
      "첫 번째 콘텐츠 블록",
    ],
  },

  // FID (First Input Delay) → INP (Interaction to Next Paint)
  INP: {
    good: 200,        // ms 이하 (Good)
    needsImprovement: 500, // ms 이하 (Needs Improvement)
    target: 100,      // ms (목표값)
    criticalInteractions: [
      "버튼 클릭",
      "링크 클릭",
      "폼 입력",
      "모달 열기/닫기",
    ],
  },

  // CLS (Cumulative Layout Shift) - 누적 레이아웃 이동
  CLS: {
    good: 0.1,        // 이하 (Good)
    needsImprovement: 0.25, // 이하 (Needs Improvement)
    target: 0.05,     // (목표값)
    preventionStrategies: [
      "이미지에 aspect-ratio 지정",
      "폰트 swap 시 레이아웃 예약",
      "동적 콘텐츠 공간 예약",
      "광고/임베드 공간 예약",
    ],
  },

  // TTFB (Time to First Byte)
  TTFB: {
    good: 800,        // ms 이하
    target: 200,      // ms (목표값 - Edge/CDN 활용)
  },

  // FCP (First Contentful Paint)
  FCP: {
    good: 1800,       // ms 이하
    target: 1000,     // ms (목표값)
  },
};

// 측정 도구 설정
const performanceMonitoring = {
  tools: [
    "Vercel Analytics (자동)",
    "Google PageSpeed Insights",
    "Chrome DevTools Lighthouse",
    "WebPageTest",
  ],
  frequency: "매 배포 후 + 주간 정기 점검",
};
```

### Bundle Size Budgets (번들 크기 예산)

```typescript
// 번들 크기 예산 (gzipped 기준)
const bundleSizeBudgets = {
  // JavaScript
  javascript: {
    initial: 100,     // KB - 첫 페이지 로드 JS
    perPage: 50,      // KB - 페이지별 추가 JS
    total: 300,       // KB - 전체 사이트 JS
    thirdParty: 50,   // KB - 서드파티 라이브러리
  },

  // CSS
  css: {
    initial: 30,      // KB - 첫 페이지 로드 CSS
    perPage: 10,      // KB - 페이지별 추가 CSS
    total: 100,       // KB - 전체 CSS
  },

  // 이미지
  images: {
    hero: 150,        // KB - 히어로 이미지
    thumbnail: 50,    // KB - 썸네일
    avatar: 10,       // KB - 아바타
    icon: 5,          // KB - 아이콘
  },

  // 폰트
  fonts: {
    primary: 100,     // KB - 메인 폰트 (전체 weight)
    secondary: 50,    // KB - 보조 폰트
    icons: 20,        // KB - 아이콘 폰트
  },
};

// 초과 시 경고 설정 (Next.js)
// next.config.js
module.exports = {
  experimental: {
    webpackBuildWorker: true,
  },
  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "./analyze/client.html",
        })
      );
    }
    return config;
  },
};
```

### Image Optimization Strategy (이미지 최적화 전략)

```typescript
// Next.js Image 컴포넌트 설정
const imageOptimization = {
  // 지원 포맷 우선순위
  formats: ["avif", "webp", "jpeg"],

  // 반응형 크기
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

  // 품질 설정
  quality: {
    hero: 85,         // 히어로 이미지
    thumbnail: 75,    // 썸네일
    avatar: 80,       // 아바타
    content: 80,      // 콘텐츠 이미지
  },

  // 로딩 전략
  loading: {
    aboveTheFold: "eager",     // 첫 화면
    belowTheFold: "lazy",      // 스크롤 필요
    background: "lazy",        // 배경 이미지
  },

  // Placeholder 전략
  placeholder: {
    type: "blur",              // blur | empty | color
    blurDataURL: "자동 생성",   // Next.js Image 자동
  },
};

// 이미지 컴포넌트 사용 패턴
<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority              // LCP 요소는 priority
  placeholder="blur"
  blurDataURL={blurDataURL}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// 외부 이미지 도메인 설정
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.notion.so",
      },
    ],
  },
};
```

### Font Loading Strategy (폰트 로딩 전략)

```typescript
// Next.js 폰트 최적화
import { Pretendard, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";

// 로컬 폰트 (권장 - 완전한 제어)
const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-sans",
  fallback: ["-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

// Google Fonts (대안)
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  variable: "--font-sans-kr",
});

// 폰트 로딩 전략
const fontLoadingStrategy = {
  // Critical 폰트 (첫 화면에 필요)
  critical: {
    fonts: ["Pretendard-Regular", "Pretendard-Bold"],
    strategy: "preload + swap",
  },

  // Secondary 폰트 (나중에 로드)
  secondary: {
    fonts: ["Nanum Pen Script", "JetBrains Mono"],
    strategy: "optional", // 캐시되면 사용, 아니면 폴백
  },

  // FOUT 방지 설정
  fontDisplay: {
    primary: "swap",      // 즉시 폴백 표시, 로드 후 교체
    secondary: "optional", // 빠르면 사용, 아니면 폴백 유지
  },
};
```

```css
/* 폰트 로딩 완료 전 레이아웃 안정화 */
html {
  /* 폰트 메트릭 조정으로 FOUT 최소화 */
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 폰트 로딩 상태에 따른 조정 */
.fonts-loading {
  /* 폴백 폰트로 레이아웃 예약 */
  letter-spacing: -0.02em; /* 시스템 폰트와 맞춤 */
}

.fonts-loaded {
  letter-spacing: normal;
}
```

### Virtualization for Long Lists (긴 리스트 가상화)

```typescript
// 50개 이상의 아이템은 가상화 필수
const virtualizationConfig = {
  threshold: 50,        // 가상화 시작 아이템 수
  overscan: 5,          // 뷰포트 외 렌더링 아이템
  estimatedItemSize: 80, // 예상 아이템 높이 (px)
};

// React Virtual (TanStack Virtual) 사용
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => virtualizationConfig.estimatedItemSize,
    overscan: virtualizationConfig.overscan,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: "600px", overflow: "auto" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 가상화가 필요한 컴포넌트 목록
const virtualizationRequired = [
  "블로그 포스트 목록 (무한 스크롤)",
  "댓글 목록",
  "검색 결과",
  "태그/카테고리 필터 목록",
  "테이블 (100행 이상)",
  "이미지 갤러리 (그리드)",
];
```

### Code Splitting & Lazy Loading

```typescript
// 동적 임포트 전략
import dynamic from "next/dynamic";

// 1. 모달/오버레이 (필요할 때만 로드)
const Modal = dynamic(() => import("@/components/Modal"), {
  loading: () => <div className="modal-skeleton" />,
});

// 2. 차트/복잡한 시각화 (사용할 때만)
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false, // 클라이언트만
  loading: () => <ChartSkeleton />,
});

// 3. 마크다운 에디터 (작성 페이지만)
const MarkdownEditor = dynamic(
  () => import("@/components/MarkdownEditor"),
  { ssr: false }
);

// 4. 코드 하이라이터 (코드 블록 있을 때만)
const CodeBlock = dynamic(
  () => import("@/components/CodeBlock"),
  {
    loading: () => <pre className="code-skeleton" />,
  }
);

// 라우트 기반 코드 분할 (자동)
// /blog/[slug] → 자동으로 별도 청크

// 컴포넌트 preload (호버 시)
function BlogCard({ post }) {
  const router = useRouter();

  return (
    <article
      onMouseEnter={() => {
        // 마우스 올리면 미리 로드
        router.prefetch(`/blog/${post.slug}`);
      }}
    >
      {/* ... */}
    </article>
  );
}
```

### Performance Checklist

```markdown
## 배포 전 성능 체크리스트

### Core Web Vitals
- [ ] LCP < 2.5s (Lighthouse 측정)
- [ ] INP < 200ms (실사용자 데이터)
- [ ] CLS < 0.1 (레이아웃 이동 없음)

### 번들 크기
- [ ] 초기 JS < 100KB (gzipped)
- [ ] 초기 CSS < 30KB (gzipped)
- [ ] 불필요한 의존성 제거

### 이미지
- [ ] 모든 이미지 Next/Image 사용
- [ ] 적절한 sizes 속성 지정
- [ ] LCP 이미지에 priority 설정
- [ ] WebP/AVIF 포맷 제공

### 폰트
- [ ] 로컬 폰트 또는 next/font 사용
- [ ] font-display: swap 적용
- [ ] 필요한 weight만 로드

### 코드 분할
- [ ] 페이지별 코드 분할 확인
- [ ] 대형 컴포넌트 dynamic import
- [ ] 서드파티 라이브러리 필요시만 로드

### 리스트 최적화
- [ ] 50+ 아이템 리스트 가상화
- [ ] 무한 스크롤 구현 확인

### 캐싱
- [ ] 정적 자산 장기 캐싱
- [ ] API 응답 적절한 캐싱
- [ ] stale-while-revalidate 전략
```

---

## 🚀 구현 로드맵

### Phase 1: 기반 시스템 (필수)
- [ ] 디자인 토큰 CSS 변수 설정
- [ ] 타이포그래피 시스템
- [ ] 다크모드 기본 구현
- [ ] 반응형 컨테이너
- [ ] 기본 버튼/입력 컴포넌트

### Phase 2: 공통 컴포넌트 (필수)
- [ ] 네비게이션 (헤더 + 모바일 메뉴)
- [ ] 카드 컴포넌트
- [ ] 푸터
- [ ] 스켈레톤 로딩

### Phase 3: 아날로그 감성 (핵심)
- [ ] 종이 질감 배경
- [ ] 하이라이터 효과
- [ ] 손글씨 폰트 적용
- [ ] 손그림 구분선/요소

### Phase 4: 인터랙션 (향상)
- [ ] 페이지 전환 애니메이션
- [ ] 카드 호버 효과
- [ ] 스크롤 reveal
- [ ] 토스트 알림 개선

### Phase 5: 섹션 확장 (점진적)
- [ ] 프로젝트 섹션
- [ ] 도구 섹션
- [ ] About 페이지
- [ ] 링크 페이지

---

## 📝 AI 프롬프트 (구현 시 사용)

```markdown
당신은 2026년 최신 웹 디자인 트렌드에 능통한 프론트엔드 개발자입니다.
다음 요구사항에 맞춰 Next.js 14 + Tailwind CSS 개인 플랫폼의 UI를 구현해주세요.

## 디자인 컨셉: "Digital Warmth"
- AI 시대에 사람의 온기가 느껴지는 플랫폼
- "Imperfect by Design" 철학 적용
- 아날로그 감성 + 모던 인터랙션의 조화
- 블로그 외 다양한 섹션 확장 가능한 구조

## 디자인 시스템 (Design Tokens):

### 컬러
- Background: #FAF9F6 (라이트) / #1A1A1A (다크)
- Surface: #FFFFFF / #242424
- Text Primary: #2D2D2D / #F5F5F5
- Accent Primary: #E6A23C (따뜻한 앰버)
- Highlight: rgba(255, 230, 0, 0.35)

### 타이포그래피
- 본문: Pretendard, Noto Sans KR
- 손글씨: Nanum Pen Script, Caveat
- 코드: JetBrains Mono
- 본문 크기: 18px, line-height: 1.75
- 최대 너비: 720px (글), 1280px (전체)

### 스페이싱
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

## 필수 구현 사항:

### 1. 공통 레이아웃
- 헤더: 로고 + 네비게이션 + 다크모드 토글
- 푸터: 링크 + 저작권
- 반응형: Mobile < 640px, Tablet < 1024px, Desktop

### 2. 다크모드
- 시스템 설정 감지 + 수동 토글
- localStorage 저장
- 초기 로드 깜빡임 방지

### 3. 아날로그 감성 요소
- 글 페이지에 미세한 종이 질감 배경
- blockquote에 손글씨 폰트 + 살짝 기울임
- 중요 텍스트에 형광펜 하이라이터
- hr 대신 손그림 스타일 구분선

### 4. 마이크로 애니메이션
- 페이지 전환: fade + slide (300ms)
- 카드 호버: translateY(-4px) + shadow
- 스크롤 reveal 애니메이션
- 스켈레톤 로딩 UI

### 5. 확장 가능한 구조
- /blog - 블로그
- /projects - 프로젝트 (예정)
- /tools - 도구 (예정)
- /about - 소개 (예정)
각 섹션에 동일한 디자인 시스템 적용, 섹션별 개성 허용

### 6. 접근성
- WCAG AA 색상 대비
- 키보드 네비게이션
- 시맨틱 HTML
- prefers-reduced-motion 지원

현재 프로젝트 구조:
- /src/app/ - Next.js App Router 페이지
- /src/components/ - 공통 컴포넌트
- tailwind.config.ts - Tailwind 설정
- /workers/ - Cloudflare Workers API

먼저 globals.css에 디자인 토큰을 정의하고,
공통 컴포넌트부터 단계적으로 구현해주세요.
```

---

## 💡 참고 레퍼런스

### 개인 플랫폼 예시
- [https://leerob.io](https://leerob.io) - 블로그 + 포트폴리오
- [https://paco.me](https://paco.me) - 미니멀 + 개성
- [https://brianlovin.com](https://brianlovin.com) - 다양한 섹션
- [https://www.joshwcomeau.com](https://www.joshwcomeau.com) - 인터랙티브 블로그

### 아날로그 감성
- Notion 마케팅 페이지
- 손글씨 노트 앱 (Goodnotes, Notability)
- Papier 스타일 웹사이트

---

*이 문서는 프로젝트 진행에 따라 업데이트됩니다.*
