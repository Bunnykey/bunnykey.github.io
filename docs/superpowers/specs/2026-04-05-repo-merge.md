# Repo Merge: the-greenhouse → bunnykey.github.io

**Date:** 2026-04-05
**Scope:** the-greenhouse를 bunnykey.github.io의 upstream으로 만들어 GitHub Pages에 배포. 원본 the-greenhouse 레포는 디자인 시스템 레퍼런스로 보존.

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| Base repo | the-greenhouse (A) |
| 배포 대상 | bunnykey.github.io repo → GitHub Pages |
| 사이트 이름 | "The Greenhouse" |
| 도메인 | bunnykey.github.io |
| 콘텐츠 분류 | flora / nursery / seeds (A의 taxonomy) |
| 콘텐츠 | Context Engineering 글 1개만 유지, 나머지 삭제 |
| 원본 repo | the-greenhouse는 디자인 시스템 best practice 레퍼런스로 보존 |

---

## 1. Merge 방향

A (the-greenhouse)를 base로, B (bunnykey.github.io)에서 인프라만 가져온다.

**A가 base인 이유:** 디자인 시스템 (토큰, atmosphere), 컴포넌트 10개, Layout, E2E 테스트, 비디오 에셋이 모두 완성 상태. B에서 A로 이식하는 것보다 A에 B의 인프라를 추가하는 것이 작업량이 적다.

---

## 2. B에서 A로 가져올 항목

### 2.1 CI/CD Pipeline

`.github/workflows/deploy.yml` — B의 GitHub Actions 워크플로우를 복사.

수정 필요:
- postbuild 스크립트 반영 (pagefind 인덱싱)
- Python 검증 스크립트 경로가 A의 구조와 맞는지 확인
- Node.js 22 + npm cache 설정 유지

### 2.2 Notion Sync Infrastructure

B에서 복사:
- `src/content/notion-sync.mjs` — sync 오케스트레이터 (B 버전이 더 완전)
- `src/content/notion-adapter.mjs` — Notion → content entry 변환
- `src/content/notion-client.mjs` — Notion API 클라이언트
- `src/content/cms-contract.ts` — CMS entry schema (B에 이미 있고 A에도 있음, 통합 필요)

수정 필요:
- B의 section 매핑 (ai/garden/notes)을 A의 taxonomy (flora/nursery/seeds)로 변경
- `scripts/sync_notion_content.mjs` — B의 완전한 버전 사용, taxonomy 수정
- `scripts/run_notion_mcp.sh` — 복사

### 2.3 검증 스크립트

B에서 복사:
- `scripts/verify_content_structure.py` — 콘텐츠 무결성 검증
- `scripts/verify_dist.py` — 빌드 출력 검증
- `scripts/verify_repo_state.py` — git 상태 확인

수정 필요:
- 경로/섹션 이름을 flora/nursery/seeds로 변경
- pinnedRoutes를 A의 라우트 구조에 맞게 수정

### 2.4 GitHub Pages 설정

B에서 복사:
- `public/.nojekyll` — Jekyll 비활성화
- `public/robots.txt` — 검색 엔진 크롤링 설정
- `public/og-default.svg` — A에 이미 있으면 B 것은 무시

### 2.5 인프라 테스트

B에서 복사:
- `tests/cms-adapter.test.mjs`
- `tests/notion-adapter.test.mjs`
- `tests/notion-client.test.mjs`
- `tests/deploy-script.test.mjs`

수정 필요:
- taxonomy 참조를 flora/nursery/seeds로 변경

### 2.6 문서

B에서 복사:
- `docs/architecture/cms-adapter-contract.md`
- `docs/architecture/content-ownership.md`
- `docs/architecture/notion-cms.md`
- `docs/operations/deployment.md`

수정 필요:
- 섹션 이름/경로를 A의 taxonomy로 갱신
- 사이트 이름을 "The Greenhouse"로 변경

---

## 3. A에서 수정할 항목

### 3.1 콘텐츠 정리

- `src/content/flora/` — Context Engineering 글 1개만 유지, 나머지 삭제
- `src/content/nursery/` — 전부 삭제 (빈 디렉토리 유지)
- `src/content/seeds/` — 전부 삭제 (빈 디렉토리 유지)

### 3.2 package.json 수정

- B의 누락 스크립트가 있으면 추가 (verify 관련)
- `name` 필드 확인 — `"the-greenhouse"` 유지

### 3.3 astro.config.mjs

- `site: 'https://bunnykey.github.io'` — 이미 설정되어 있음, 확인만

### 3.4 consts/site.ts

- `SITE.siteUrl`이 `https://bunnykey.github.io`인지 확인
- `SITE.name`이 `"The Greenhouse"`인지 확인

---

## 4. 배포 전환

### 4.1 Remote 설정

```bash
# the-greenhouse에서 작업
cd ~/projects/the-greenhouse

# bunnykey.github.io remote 추가
git remote add deploy git@github.com:Bunnykey/bunnykey.github.io.git

# main 브랜치를 deploy remote에 force push
git push deploy main --force
```

force push가 필요한 이유: B의 git history와 A의 history는 완전히 다르다. A의 코드로 B를 대체하는 것이 목적이므로 history를 깨끗하게 교체한다.

### 4.2 GitHub Pages 설정 확인

push 후 GitHub Actions가 자동으로 빌드+배포. `.github/workflows/deploy.yml`이 `main` push에 트리거되므로 자동 실행된다.

### 4.3 검증

- `https://bunnykey.github.io` 접속하여 사이트 확인
- Atmospheric mode (S/M/R 키) 동작 확인
- 다크모드 (D 키) 동작 확인
- 콘텐츠 페이지 접근 확인

---

## 5. 원본 the-greenhouse 레포 보존

merge 완료 후 원본 the-greenhouse 레포를:
- README를 업데이트하여 "Design System Reference" 용도임을 명시
- "이 디자인 시스템은 bunnykey.github.io에 적용됨" 안내
- 코드는 그대로 유지 — 디자인 토큰, atmospheric mode, 컴포넌트 패턴의 레퍼런스

---

## 6. 건드리지 않는 것

- A의 `src/styles/global.css` — 디자인 토큰 + atmosphere 그대로
- A의 컴포넌트 전체 (`src/components/`) — 그대로
- A의 `src/layouts/Layout.astro` — 그대로
- A의 E2E 테스트 (`tests/e2e/`) — 그대로
- A의 비디오 에셋 (`public/videos/`) — 그대로
- A의 페이지 구조 (`src/pages/`) — 그대로
- A의 유틸리티 (`src/utils/`) — 그대로

---

## 영향 범위

### 신규 파일 (B에서 복사)

| 파일 | 출처 |
|------|------|
| `.github/workflows/deploy.yml` | B |
| `src/content/notion-adapter.mjs` | B |
| `src/content/notion-client.mjs` | B |
| `scripts/verify_content_structure.py` | B |
| `scripts/verify_dist.py` | B |
| `scripts/verify_repo_state.py` | B |
| `scripts/run_notion_mcp.sh` | B |
| `public/.nojekyll` | B |
| `public/robots.txt` | B |
| `tests/cms-adapter.test.mjs` | B |
| `tests/notion-adapter.test.mjs` | B |
| `tests/notion-client.test.mjs` | B |
| `tests/deploy-script.test.mjs` | B |
| `docs/architecture/*.md` | B |
| `docs/operations/*.md` | B |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `src/content/notion-sync.mjs` | B 버전으로 교체 + taxonomy 수정 |
| `src/content/cms-contract.ts` | B와 통합 확인 |
| `scripts/sync_notion_content.mjs` | B 버전으로 교체 + taxonomy 수정 |
| `package.json` | verify 스크립트 추가 |

### 삭제 파일

| 파일 | 이유 |
|------|------|
| 대부분의 콘텐츠 .md 파일 | Context Engineering 1개만 남기고 삭제 |
