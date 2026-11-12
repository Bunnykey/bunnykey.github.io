# Content Ownership

Current editing, draft storage, version and publication rules are defined in [Publishing contract v1](publishing-contract.md). The route matrix below is historical context; existing public routes are preserved.

## Phase 1 Rule

Phase 1 production content is Git-owned. Astro is the only public presentation layer.

## Ownership Matrix

| Route / Content Type | Phase 1 Source | Future Source | Slug Owner | Template Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | Git | Astro route path | Astro layout | Core brand page |
| `/about/` | `src/pages/about.astro` | Git | Astro route path | Astro layout | Core trust page |
| `/flora/` | `src/pages/flora/index.astro` | Git + future CMS-fed list | Astro route path | Astro layout | Index may aggregate later |
| `/flora/[slug]/` | `src/content/flora/*.md` | Future CMS candidate | Astro content entry slug derived from file path | Astro detail template | Git wins on slug conflicts |
| `/nursery/` | `src/pages/nursery/index.astro` | Git | Astro route path | Astro layout | Curated section index |
| `/nursery/[slug]/` | `src/content/nursery/*.md` | Git by default | Astro content entry slug derived from file path | Astro detail template | No live CMS in phase 1 |
| `/seeds/` | `src/pages/seeds/index.astro` | Git + future CMS-fed list | Astro route path | Astro layout | Future CMS candidate |
| `/seeds/[slug]/` | `src/content/seeds/*.md` | Future CMS candidate | Astro content entry slug derived from file path | Astro detail template | Git remains authoritative |

## Conflict Rules

- Git-owned routes and content always win during phase 1.
- A future CMS entry may not replace a Git-owned slug without a later migration decision.
- Astro templates remain the only public renderer even after future CMS integration.

## 2026-11-12: 글 구분 제거

공개 글 6개를 삭제하고 사용자 화면에서 글 종류·주제·성장 단계·태그 선택을 제거했다. CMS 새 글과 로컬 편집기의 새 글은 기존 `flora` 저장 경로 한 곳을 사용한다. `flora`·`seeds`·`nursery`는 이전 백업·발행 계약과 충돌 검사의 호환을 위한 내부 키로만 유지한다. 저장 계약의 강제 마이그레이션은 이번 컨셉 정리 범위에 포함하지 않는다. 이전 목록 주소도 분류 없이 하나의 전체 글 목록을 보여 준다. Git 커밋 이력에는 복원 가능한 원본이 남는다.
