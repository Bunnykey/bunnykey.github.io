# 웹 글쓰기 화면 설정

`https://bunnykey.github.io/write/`는 Decap CMS 기반의 웹 글쓰기 화면이다. 콘텐츠와 이미지가 GitHub 저장소에 커밋되고, 기존 GitHub Pages 배포가 이를 자동으로 공개한다.

## 보안 모델

- `/write/` 경로 자체는 비밀이 아니다. GitHub OAuth 로그인이 반드시 필요하다.
- OAuth Worker는 `ALLOWED_GITHUB_LOGIN`과 일치하는 GitHub 사용자만 토큰을 CMS에 전달한다.
- GitHub OAuth client secret은 Cloudflare Worker secret으로만 보관한다. 저장소, 브라우저 JavaScript, `config.yml`에는 넣지 않는다.
- GitHub 계정에 패스키 또는 2단계 인증을 켠다.

## 최초 1회 설정

### 1. Cloudflare Worker 주소 만들기

Cloudflare 계정에 로그인한 뒤, 저장소의 `workers/write-oauth` 디렉터리에서 실행한다.

```bash
npx wrangler login
npx wrangler deploy
```

출력된 `https://<worker>.workers.dev` 주소를 기록한다. 아직 secret이 없으므로 이 시점의 Worker는 로그인 요청에 오류를 내는 것이 정상이다.

### 2. GitHub OAuth App 만들기

GitHub Settings → Developer settings → OAuth Apps → New OAuth App에서 다음처럼 만든다.

- Homepage URL: `https://bunnykey.github.io`
- Authorization callback URL: `https://<worker>.workers.dev/callback`

Client ID와 Client Secret을 기록한다. Client Secret은 한 번만 표시되므로 비밀번호 관리자에 보관한다.

### 3. Worker secret 설정

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ALLOWED_GITHUB_LOGIN
npx wrangler secret put ALLOWED_ORIGIN
npx wrangler deploy
```

각 값은 다음과 같다.

- `ALLOWED_GITHUB_LOGIN`: `bunnykey`
- `ALLOWED_ORIGIN`: `https://bunnykey.github.io`

GitHub OAuth App의 callback URL이 정확히 `<worker URL>/callback`인지 확인한다.

### 4. CMS에 Worker 주소 넣기

`public/write/config.yml`의 `base_url`을 Worker URL로 바꾼다.

```yaml
base_url: https://greenhouse-write-oauth.<account>.workers.dev
```

이를 `main` 브랜치에 반영하면 GitHub Pages 배포 후 `https://bunnykey.github.io/write/`에서 **Login with GitHub**으로 글을 작성할 수 있다.

## 운영 주의사항

- Worker URL이나 `/write/` 주소를 숨기는 것에 의존하지 않는다.
- OAuth 앱의 권한 요청 화면에서 `public_repo` 권한을 검토한다. 이 권한은 공개 저장소에 글과 이미지를 커밋하기 위해 필요하며, 비공개 저장소 접근 권한은 요청하지 않는다.
- 더 이상 웹 글쓰기를 쓰지 않으면 GitHub OAuth App을 삭제하거나 Client Secret을 재발급하고 Worker를 삭제한다.
