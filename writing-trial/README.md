# Keystatic writing trial

기존 Astro 블로그에 붙일 편집기를 시험하는 공간입니다. `src/content`의 기존 글은 편집 목록에 포함하지 않습니다. 저장은 로컬 파일에만 반영되며 GitHub 커밋이나 실제 발행을 수행하지 않습니다.

## 실행

저장소 루트에서 Node.js 22 이상으로 실행합니다.

```sh
npm ci
npm run writing:dev
```

- 편집기: `http://127.0.0.1:4322/keystatic`
- 저장된 글 미리보기: `http://127.0.0.1:4322/writing-preview/`

`시험용 글 → 오늘 들은 노래`를 열어 수정하거나 새 글을 만듭니다. 새 글 주소는 영문 소문자·숫자·하이픈으로 입력합니다. 본문 도구 모음에서 사진을 추가하고, `음악 · 영상 · GitHub` 블록에 해당 서비스의 URL을 넣습니다. **저장한 다음 미리보기**를 여세요. 미저장 변경 사항은 미리보기에 반영되지 않습니다.

사진은 `writing-trial/assets/<글 주소>/`에, 글은 `writing-trial/posts/`에 저장됩니다. 예시 사진은 기존 저장소의 온실 이미지를 재사용했습니다. 미리보기는 실제 Astro MDX 렌더러, 블로그 레이아웃·글꼴·본문 스타일과 기존 미디어 렌더러를 사용합니다.

## 확인

```sh
node --test tests/keystatic-trial.test.mjs
npm run writing:build
npm run build
python3 scripts/verify_dist.py dist
```

`writing:build`는 시험용 미리보기를 `writing-trial-dist`에 생성합니다. 이 결과에는 편집기 서버가 없습니다. 일반 `build`는 편집기·API·시험 글·시험 이미지 경로를 포함하지 않고 GitHub Pages용 `dist`를 생성합니다.

자동 검증 범위:

- Keystatic 편집기 필드의 MDX 읽기/쓰기에서 이미지와 세 미디어 블록 보존
- 실제 Keystatic HTTP API로 한글 글·이미지 저장 및 다시 읽기
- Astro 미리보기의 본문·이미지 응답·두 플레이어·GitHub 카드 HTML
- 기존 공개 글 경로에 대한 쓰기 요청 거부

아직 검증하지 않은 항목:

- 브라우저 편집 화면의 클릭·키보드 동작과 플레이어 재생
- 실제 iPhone Safari의 한글 조합 입력, 사진 선택, 스크롤 및 임시 작성 복구
- 원격 로그인, GitHub 저장, 공개 사이트 발행

이번 Work 세션의 Cloud Browser는 로컬 주소 접속을 `ERR_BLOCKED_BY_CLIENT`로 차단했습니다. HTTP/직렬화 검증은 브라우저 E2E 통과를 의미하지 않습니다.

## 원격 사용 전

현재 로컬 모드는 로그인 기능이 없으며 의도적으로 루프백 주소에만 바인딩합니다. 이 서버를 공개 URL로 노출하지 마세요. iPhone에서 독립적으로 쓰려면 관리 화면의 별도 서버 호스팅과 Keystatic GitHub/Cloud 인증을 연결해야 합니다. 공개 블로그는 GitHub Pages에 유지할 수 있습니다. 이 시험 PR에서는 계정 생성·서비스 결제·기존 글 이전을 하지 않습니다.
