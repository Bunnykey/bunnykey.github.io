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

현재 로컬 모드는 로그인 기능이 없으며 의도적으로 루프백 주소에만 바인딩합니다. 이 서버를 공개 URL로 노출하지 마세요. 공개 블로그는 GitHub Pages에 유지합니다.

## Vercel + Keystatic Cloud 배포

배포 코드까지 준비된 상태입니다. 실제 Vercel 연결과 Keystatic Cloud 프로젝트 생성·접근 승인은 아직 필요합니다.

1. Keystatic Cloud에서 본인 팀의 프로젝트를 만들고 `Bunnykey/bunnykey.github.io` 저장소를 연결합니다. 해당 팀에는 글을 편집할 본인만 둡니다.
2. Cloud 설정의 `team/project` 값을 Vercel 환경 변수 `PUBLIC_KEYSTATIC_CLOUD_PROJECT`에 입력합니다. 공개 프로젝트 식별자이며 비밀번호나 토큰이 아닙니다.
3. Vercel에 **별도 프로젝트**를 만듭니다. 저장소는 동일하고, 배포 브랜치는 `feat/keystatic-trial`로 지정합니다. 기존 GitHub Pages와 `main`은 유지합니다.
4. 프레임워크는 Astro, 루트는 저장소 루트, Node.js는 22, 설치 명령은 `npm ci`, 빌드 명령은 `npm run writing:deploy-build`로 설정합니다. Output Directory는 별도로 덮어쓰지 않습니다. Astro Vercel 어댑터가 `.vercel/output`을 만듭니다.
5. 발급된 주소의 `/keystatic`에서 Cloud 로그인을 완료합니다. `/writing-preview/`에서 배포된 시험 글을 확인합니다.

Cloud 설정이 없거나 Vercel이 `main`을 배포하려 하면 빌드를 중단합니다. 편집기 브랜치 선택기는 `feat/keystatic-trial` 접두사만 표시합니다. **이 필터는 GitHub 권한을 제한하는 보안 경계가 아닙니다.** Cloud 앱에 부여하는 접근 범위를 저장소 단위로 확인해야 합니다.

시험 중에는 정확히 `feat/keystatic-trial` 브랜치에 저장합니다. Vercel의 Git 연동이 이 커밋을 다시 빌드한 후 미리보기를 새로고침합니다. 현재는 실시간 미리보기가 아니며, 새 글도 배포가 완료되기 전에는 미리보기 주소가 없습니다. 시험 글은 공개 GitHub 저장소에 저장되므로 비공개 자료를 쓰지 않습니다.

원격 인증·저장·배포 E2E와 iPhone Safari 검증은 실제 계정 연결 뒤에 수행해야 합니다. 원격 빌드 성공만으로 이 검증을 완료했다고 보지 않습니다. PR #7은 계속 Draft로 둡니다.
