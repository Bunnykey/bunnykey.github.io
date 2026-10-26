# iPhone에서 Pages CMS로 글 쓰기

이 블로그는 Pages CMS를 GitHub 파일 편집기로 사용합니다. 공개 화면은 계속 Astro가 만들고, 기존 [`deploy.yml`](../../.github/workflows/deploy.yml)이 `main`을 GitHub Pages에 배포합니다. Vercel이나 별도 편집기 서버를 배포하지 않습니다. 설정은 루트 [`.pages.yml`](../../.pages.yml)에 있습니다.

## 처음 연결할 때

1. 이 변경의 PR을 `main`에 병합합니다. 병합 전에는 Pages CMS의 브랜치 선택기에서 `feat/pages-cms-iphone`을 선택해 설정을 확인할 수 있습니다. 그 브랜치에 저장한 글은 운영 사이트에 발행되지 않습니다.
2. iPhone Safari에서 <https://app.pagescms.org>를 열고 GitHub로 로그인합니다.
3. `Bunnykey/bunnykey.github.io`를 선택합니다. 저장소가 안 보이면 Pages CMS의 GitHub App에 이 저장소 접근 권한이 있는지 확인합니다. ChatGPT의 GitHub 연결과 Pages CMS의 앱 권한은 별개입니다.
4. 브랜치가 `main`인지 확인합니다. `Flora · 에세이`, `Seeds · 짧은 기록`, `Nursery · 자라는 글`, `글 이미지` 메뉴가 나타나는지 확인합니다.
5. 기존 글을 열어 제목·날짜·본문·이미지·초안 상태를 먼저 확인합니다. 화면 확인만으로 저장되었다고 판단하지 않습니다.

기존 Keystatic 시험 PR [#7](https://github.com/Bunnykey/bunnykey.github.io/pull/7)은 이 경로에 필요하지 않습니다.

## 새 글 → 사진 → 미리보기 → 발행

1. 원하는 컬렉션에서 새 글을 만듭니다. 제목과 날짜를 입력하고 **초안 (공개하지 않음)**을 켜 둡니다. 기본값은 켜짐입니다.
2. 파일 이름은 `2026-10-26-153000.md` 같은 날짜·시각으로 자동 제안됩니다. 한글 제목만 입력해도 빈 주소가 만들어지지 않습니다. 필요하면 **처음 만들 때만** `2026-10-26-iphone-note.md`처럼 바꿉니다. 확장자는 `.md`, 주소는 소문자·숫자·한글·하이픈의 한 구간, 확장자를 제외하고 100자 이하로 유지합니다. 공백·슬래시·밑줄은 사용하지 않습니다.
3. 본문의 **Editor**에서 글을 씁니다. 이미지 삽입 메뉴에서 iPhone 사진 또는 파일을 선택하고, 사진 설명을 입력합니다. 파일은 `public/img/`에 저장되고 본문에는 `/img/...`가 기록됩니다. 임의 파일 이름으로 업로드하므로 같은 이름의 사진이 기존 사진을 덮어쓰지 않습니다.
4. 지원 이미지 형식은 JPG/JPEG, PNG, GIF, WebP, AVIF입니다. HEIC/HEIF는 이 설정에서 받지 않습니다. 선택기가 변환하지 않으면 JPG/PNG로 내보낸 뒤 다시 선택합니다. **실제 iPhone 사진 선택기의 변환·업로드 동작은 미검증**입니다. 새 폴더를 만들지 말고 기본 이미지 폴더를 사용합니다.
5. Editor와 Source를 오가며 문단·서식·사진을 확인합니다. **CMS의 Editor는 본문 편집 미리보기입니다. Astro의 글꼴·목차·레이아웃·플레이어·React 데모를 재현하는 배포 미리보기는 아닙니다.**
6. 초안 상태로 저장한 뒤 글을 다시 열어 내용과 이미지가 남아 있는지 확인합니다. 저장은 현재 브랜치에 GitHub 커밋을 만듭니다. `main`에 저장하면 기존 배포 작업이 실행되지만 초안 글은 공개 HTML·목록·RSS·사이트맵·검색 대상·OG 이미지에서 제외됩니다.
7. 공개할 준비가 되면 초안을 **끄고 저장**합니다. `main` 저장 → GitHub Actions 테스트·Astro 빌드 → GitHub Pages 배포 순서입니다. CMS의 저장 성공 표시는 배포 성공 표시가 아닙니다.
8. [Actions](https://github.com/Bunnykey/bunnykey.github.io/actions/workflows/deploy.yml)에서 **해당 저장 커밋**의 build와 deploy가 모두 성공했는지 확인합니다. 이어 `https://bunnykey.github.io/<collection>/<파일이름에서 .md를 뺀 값>/`를 Safari에서 열어 제목·본문·사진·임베드를 확인합니다. 기존 탭이라면 새로고침합니다.

`draft: true`는 사이트 출력 제외 기능입니다. **공개 저장소의 원본 글과 Git 이력은 공개이며, `public/img/`의 사진도 글의 초안 여부와 무관하게 배포됩니다.** 비공개 글이나 비공개 사진을 저장하는 기능으로 사용하지 않습니다.

## 기존 공개 글을 수정할 때

기존 글 6개에는 `draft: false`만 명시했습니다. 본문·날짜·주소는 바꾸지 않았습니다. 이는 새 글의 `draft: true` 기본값이 기존 글에 적용되어 글이 내려가는 것을 방지합니다. 앞으로 직접 추가하는 글도 `draft`를 명시해야 하며 테스트가 이를 확인합니다.

공개 글에서 초안을 켜고 `main`에 저장하면 다음 배포 때 그 URL이 내려갑니다. 기존 공개 버전을 유지하며 고치려면 GitHub에서 `main` 기준 작업 브랜치를 만들고, Pages CMS에서 그 브랜치를 선택해 수정·저장합니다. 공개 글의 `draft: false`는 유지하고, GitHub에서 PR을 만들어 검증 후 `main`에 병합합니다. 브랜치에 저장한 변경은 운영 배포를 시작하지 않습니다.

이 설정은 저장 후의 파일 이름 변경과 글 삭제를 막습니다. 제목 변경은 URL을 바꾸지 않습니다. 이동·삭제·리디렉션이 필요한 경우 기존 발행 계약에 따라 별도 작업합니다.

## Spotify · YouTube · GitHub

기존 저장 형식인 `embed` 코드 블록을 그대로 사용합니다. Source 모드에서 아래처럼 입력합니다. URL을 일반 링크로 붙이는 것만으로 플레이어가 생기지는 않습니다.

````markdown
```embed
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

```embed
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```

```embed
https://github.com/Bunnykey/bunnykey.github.io
```
````

Astro는 기존 공용 렌더러로 Spotify·YouTube 플레이어와 GitHub 링크 카드를 만듭니다. Pages CMS 편집기에서는 코드 블록으로 보일 수 있습니다. 임베드나 원본 HTML을 편집할 때는 Source 모드를 유지하고, 저장 후 다시 열어 코드 블록이 남아 있는지 확인합니다. 실제 플레이어 재생은 제공자·Safari·사용자 세션의 영향을 받으며 이번 작업에서 검증하지 않았습니다.

데모가 필요한 `.md` 글은 `demo` 필드에서 컬렉션별 허용 항목을 선택합니다. `.mdx`는 `.md` 컬렉션의 편집 대상에 포함되지 않습니다. MDX의 import·JSX와 복잡한 HTML은 기존 로컬 편집기/Git으로 수정합니다. Astro 빌드는 계속 MD와 MDX를 모두 지원합니다.

## 정확한 Astro 화면을 발행 전에 확인하려면

이번 연결에는 원격 Astro 초안 미리보기 서버가 없습니다. iPhone만으로 확인 가능한 발행 전 화면은 Pages CMS의 본문 Editor까지입니다. 이를 운영 화면과 같은 미리보기로 표시하지 않습니다.

실제 Astro 화면이 필요하면 변경을 내려받은 컴퓨터에서 다음을 실행합니다.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

같은 신뢰할 수 있는 네트워크의 iPhone에서 `http://<컴퓨터 주소>:4321/<collection>/<slug>/`를 엽니다. Astro 개발 모드에서는 초안도 보입니다. 컴퓨터가 켜져 있어야 하며 로컬 개발 서버를 인터넷에 공개하지 않습니다. 이는 선택적인 로컬 검수 경로이고 추가 호스팅은 아닙니다. 실제 iPhone 접속은 미검증입니다.

## Notion·로컬 편집기와 함께 사용하기

공개 원본은 계속 `src/content/<collection>/<slug>.md[x]`입니다. [Publishing contract v1](../architecture/publishing-contract.md)의 로컬 API 저장·발행·충돌 규칙은 그대로입니다.

| 항목 | Pages CMS | 기존 작성 경로와의 관계 |
|---|---|---|
| 저장 | 선택한 GitHub 브랜치의 파일에 커밋 | 로컬 편집기의 `.publishing/` 초안 저장과 다름 |
| 발행 | `main`의 `draft: false` 변경을 기존 Actions가 배포 | 로컬 발행도 같은 `main`/Actions 사용 |
| ID·버전 | `id`, `contractVersion`을 편집 필드로 노출하지 않음 | `settings.content.merge: true`로 기존 값 보존. 일반 UUID를 `post_…` ID 대신 쓰지 않음 |
| 새 글 ID | ID 없는 파일도 기존 읽기 규약으로 처리 | 로컬 저장소가 경로 기반 안정 ID를 만들고 첫 로컬 발행에 기록 |
| Notion 메타데이터 | `sourceId` 등 설정 밖 키를 병합 보존 | 기존 Notion import-only 정책 유지 |
| 이미지 | `public/img/` → `/img/`, 파일 이름은 임의 생성 | Notion 해시 이름·로컬 업로드 이름과 공존 |
| 날짜 | `yyyy-MM-dd` | 기존 YAML Date와 인용된 문자열을 모두 Astro Date로 읽고 잘못된 날짜는 거부 |
| 동시 편집 | GitHub 파일 리비전/브랜치에 의존 | 원격 CMS는 로컬 `.publishing-lock`에 참여하지 않음 |

같은 글을 CMS와 로컬 편집기에서 동시에 수정하지 않습니다. 도구를 바꿀 때에는 먼저 현재 입력을 저장하고, 로컬 편집기를 멈춘 뒤 작업 트리가 깨끗한지 확인하고 `git pull --ff-only`로 원본을 갱신합니다. `.publishing/` 초안은 Git으로 옮겨지지 않으므로 버리지 않습니다. 로컬 편집기를 다시 열었을 때 원본 변경 충돌이 나면 **최신본 비교**로 본문·메타데이터를 병합합니다. 자동 덮어쓰기나 강제 push로 해결하지 않습니다.

로컬 발행 후 CMS를 쓸 때도 CMS에서 글을 새로 열어 최신 커밋을 읽습니다. CMS에서 새로 만든 글은 로컬이 pull하기 전까지 로컬 도구에 보이지 않습니다. 원격 변경을 내려받지 않은 상태에서 로컬 발행을 시도하면 push가 거부될 수 있습니다. 기존 초안·발행 영수증을 유지한 채 Git 충돌을 해결합니다.

Notion 동기화 전에도 먼저 원본을 갱신합니다. importer는 기존 원본·로컬 초안·MDX 주소·문서 ID가 차지한 항목을 덮어쓰지 않습니다. CMS로 저장한 파일도 Git 소유이므로 같은 주소의 Notion 항목은 건너뜁니다. Notion Published는 가져오기 대상 표시이며 Pages 배포 완료 표시가 아닙니다. Notion으로 되돌려 쓰는 양방향 동기화는 추가하지 않았습니다.

`merge: true`는 설정에 없는 메타데이터를 보존하기 위한 설정입니다. CMS에서 기존 시리즈 전체를 비우는 동작은 병합 과정에서 기존 값을 유지할 수 있으므로, 시리즈 제거는 로컬 편집기/Git으로 처리하고 diff를 확인합니다. 본문의 Source는 YAML frontmatter 편집기가 아닙니다.

## 검증과 남은 확인

자동 검증:

- Pages CMS 공식 `ConfigSchema`에 설정을 대입한 정적 검증 통과. 확인한 upstream: `hunvreus/pagescms@6f4e860a35d934406580287e7042e5e111e207a1`.
- `npm test`: 기존 테스트 및 CMS 필드·문자열 날짜·로컬 초안 충돌·실제 Astro 빌드 회귀 검사.
- CMS가 저장할 수 있는 MD 예제를 격리된 임시 저장소에서 빌드. 세 컬렉션의 사진·세 임베드 출력, iframe CSP, 초안 HTML/OG 부재, RSS/사이트맵/목록에서 초안 제목·주소 부재 확인.
- `npm run build`, 기존 저장소/콘텐츠/dist 검사. PR에는 배포 권한이 없는 별도 검증 워크플로를 추가했고 기존 운영 배포 워크플로는 유지.

실제 계정/단말에서 이어서 확인해야 할 사항:

2026-10-26 확인 브라우저에서는 Pages CMS 로그인 화면이 표시되었습니다. 기존 계정의 로그인 세션과 저장소 편집 권한은 확인하지 못했으며, 계정 설정을 바꾸거나 운영 글을 저장하지 않았습니다.

- [ ] Pages CMS 로그인 및 이 저장소에 대한 편집 권한
- [ ] 세 메뉴·필드·기존 글의 `draft: false` 상태 표시
- [ ] iPhone 한글 입력·사진 선택/업로드·이미지 설명·좁은 화면 조작
- [ ] 초안 저장 → Safari 재접속 → 본문/사진/메타데이터 재조회
- [ ] 원본 모드의 `embed` 코드 블록 보존과 실제 플레이어 재생
- [ ] `main`의 발행 저장 커밋 → 해당 Actions 배포 성공 → 운영 URL/사진 확인

로컬 빌드나 테스트 결과를 위 계정·모바일·운영 E2E 완료로 간주하지 않습니다. 실패 시 CMS 저장 커밋, 배포 run, 문제가 있는 URL을 함께 확인합니다. 빌드가 실패하면 마지막 성공한 Pages 배포는 유지되며, 잘못된 파일을 수정하거나 해당 변경 커밋을 revert하고 같은 배포 경로로 복구합니다.

## 공식 자료

- [Pages CMS 시작하기](https://pagescms.org/docs/quick-start/)
- [미디어 경로·파일 이름](https://pagescms.org/docs/configuration/media/)
- [메타데이터 병합 설정](https://pagescms.org/docs/configuration/settings/)
- [Rich-text의 Editor/Source와 이미지](https://pagescms.org/docs/configuration/fields/rich-text/)
- [파일 이름 생성](https://pagescms.org/docs/configuration/content/filename/)
- [이름 변경·삭제 제한](https://pagescms.org/docs/configuration/content/operations/)
