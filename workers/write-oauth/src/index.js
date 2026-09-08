const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

const COOKIE_NAME = 'greenhouse_oauth_state';
const TEN_MINUTES = 60 * 10;

function html(body, status = 200) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`, {
    status,
    headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control': 'no-store' },
  });
}

function escapeForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function readCookie(request, name) {
  const pair = (request.headers.get('cookie') || '').split(';').map((v) => v.trim()).find((v) => v.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function callbackPage({ token, origin }) {
  const payload = escapeForScript({ token, provider: 'github' });
  const targetOrigin = escapeForScript(origin);
  return html(`<script>
    window.opener?.postMessage('authorization:github:success:' + JSON.stringify(${payload}), ${targetOrigin});
    window.close();
  </script><p>로그인이 완료되었습니다. 이 창은 닫아도 됩니다.</p>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const callbackUrl = new URL('/callback', url.origin).toString();

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.ALLOWED_GITHUB_LOGIN || !env.ALLOWED_ORIGIN) {
      return html('Worker 설정이 완료되지 않았습니다.', 500);
    }

    if (url.pathname === '/auth') {
      const state = randomState();
      const authorize = new URL(GITHUB_AUTHORIZE_URL);
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', callbackUrl);
      authorize.searchParams.set('state', state);
      // The content repository is public, so do not request access to private repositories.
      authorize.searchParams.set('scope', 'public_repo');
      return new Response(null, {
        status: 302,
        headers: {
          location: authorize.toString(),
          'cache-control': 'no-store',
          'set-cookie': `${COOKIE_NAME}=${encodeURIComponent(state)}; Max-Age=${TEN_MINUTES}; Path=/callback; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const expectedState = readCookie(request, COOKIE_NAME);
      if (!code || !state || !expectedState || state !== expectedState) {
        return html('로그인 요청을 확인할 수 없습니다. 글쓰기 화면에서 다시 시도하세요.', 400);
      }

      const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) return html('GitHub 로그인 토큰을 가져오지 못했습니다.', 401);

      const userResponse = await fetch(GITHUB_USER_URL, {
        headers: { authorization: `Bearer ${tokenData.access_token}`, 'user-agent': 'greenhouse-write-oauth' },
      });
      const user = await userResponse.json();
      if (!userResponse.ok || String(user.login).toLowerCase() !== env.ALLOWED_GITHUB_LOGIN.toLowerCase()) {
        return html('이 GitHub 계정에는 글쓰기 권한이 없습니다.', 403);
      }

      const response = callbackPage({ token: tokenData.access_token, origin: env.ALLOWED_ORIGIN });
      response.headers.set('set-cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/callback; HttpOnly; Secure; SameSite=Lax`);
      return response;
    }

    return html('Not found', 404);
  },
};
