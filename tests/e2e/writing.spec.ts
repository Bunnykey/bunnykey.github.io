import {test, expect} from '@playwright/test';

test('writing starts from the blog, offers each format and stays within a mobile viewport', async ({page}, info) => {
  await page.goto('/');
  await page.getByRole('navigation', {name: '하단 메뉴'}).getByRole('link', {name: '글쓰기', exact: true}).click();
  await expect(page.getByRole('heading', {name: '글쓰기', exact: true})).toBeVisible();
  for (const [label, name] of [['짧은 기록', 'seeds'], ['긴 글', 'flora'], ['계속 다듬는 글', 'nursery']]) {
    await expect(page.locator(`a[href="https://app.pagescms.org/Bunnykey/bunnykey.github.io/main/collection/${name}/new"]`)).toContainText(label);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({path: info.outputPath('writing.png'), fullPage: true});
});

test('media helper produces canonical embed blocks and recovers when clipboard access is unavailable', async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value: {writeText: async () => {throw new Error('denied');}}}));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({body: 'Video fixture', contentType: 'text/html'}));
  await page.goto('/write/');
  await page.getByLabel('미디어 주소', {exact: true}).fill('https://youtu.be/dQw4w9WgXcQ?si=test');
  await page.getByRole('button', {name: '삽입 형식 만들기'}).click();
  const source = page.getByLabel('CMS에 붙여 넣을 내용');
  await expect(source).toHaveValue('```embed\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n```');
  await expect(page.locator('#writing-media-preview iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  await page.getByRole('button', {name: '내용 복사', exact: true}).click();
  await expect(page.locator('#writing-media-message')).toContainText('복사할 내용을 선택했어요');
  await expect(source).toBeFocused();
  await page.getByLabel('미디어 주소', {exact: true}).fill('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', {name: '삽입 형식 만들기'}).click();
  await expect(page.locator('#writing-media-result')).toBeHidden();
  await expect(page.locator('#writing-media-message')).toContainText('주소인지 확인');
});

test('publishing status reports pending, cached, failed and unavailable states without automatic retries', async ({page}) => {
  let response = {status: 'in_progress', conclusion: null as string | null, head_sha: 'new'};
  let http = 200;
  await page.route('https://api.github.com/repos/Bunnykey/bunnykey.github.io/actions/runs**', route => route.fulfill({status: http, contentType: 'application/json', body: JSON.stringify({workflow_runs: [{...response, name: 'Deploy to GitHub Pages', head_branch: 'main', html_url: 'https://github.com/Bunnykey/bunnykey.github.io/actions/runs/123'}]})}));
  await page.goto('/');
  await page.getByRole('navigation', {name: '하단 메뉴'}).getByRole('link', {name: '글쓰기', exact: true}).click();
  const button = page.getByRole('button', {name: '배포 상태 확인', exact: true});
  const panel = page.locator('#publishing-status');
  await button.click();
  await expect(panel).toHaveAttribute('data-state', 'pending');
  response = {status: 'completed', conclusion: 'success', head_sha: 'new'};
  await button.click();
  const live = await panel.getAttribute('data-live-commit');
  await expect(panel).toHaveAttribute('data-state', live ? 'refresh' : 'success');
  response.conclusion = 'failure';
  await button.click();
  await expect(panel).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#deployment-message')).toContainText('이전에 공개한 사이트는 유지');
  http = 403;
  await button.click();
  await expect(panel).toHaveAttribute('data-state', 'unavailable');
  await expect(page.locator('#deployment-link')).toHaveAttribute('href', /actions\/workflows\/deploy.yml$/);
  await expect(button).toBeEnabled();
});

test('opted-in previews use the real article renderer and stay out of feeds, sitemaps, lists and search', async ({page, request}, info) => {
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({body: 'Video fixture', contentType: 'text/html'}));
  await page.route('https://open.spotify.com/**', route => route.fulfill({body: 'Music fixture', contentType: 'text/html'}));
  for (const collection of ['flora', 'seeds', 'nursery']) {
    await page.goto(`/preview/${collection}/acceptance-shared/`);
    await expect(page.getByRole('heading', {name: `미리보기전용확인문구 ${collection}`, exact: true})).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const image = page.getByRole('img', {name: '사진 설명', exact: true});
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    for (const provider of ['YouTube', 'Spotify', 'GitHub']) await expect(page.locator(`.media-card[data-provider="${provider}"]`)).toBeAttached();
    await expect(page.getByRole('link', {name: 'CMS에서 수정 ↗', exact: true})).toHaveAttribute('href', /\/collection\/.+\/edit\/src%2Fcontent/);
    await expect(page.getByText('(2/2)', {exact: true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await request.get(`/${collection}/acceptance-shared/`)).status()).toBe(404);
    expect((await request.get(`/preview/${collection}/acceptance-hidden/`)).status()).toBe(404);
    const archive = await request.get(`/${collection}/series/acceptance-series/`);
    expect(await archive.text()).not.toContain('미리보기전용확인문구');
  }
  await page.screenshot({path: info.outputPath('preview.png'), fullPage: true});
  for (const path of ['/', '/rss.xml', '/sitemap-0.xml']) {
    const text = await (await request.get(path)).text();
    expect(text).not.toContain('acceptance-shared');
    expect(text).not.toContain('acceptance-hidden');
    expect(text).not.toContain('/preview/');
  }
  await page.goto('/search/');
  await page.getByPlaceholder('검색어를 입력하세요', {exact: true}).fill('미리보기전용확인문구');
  await expect(page.locator('.pagefind-ui__message')).toContainText('검색 결과가 없습니다');
  await expect(page.locator('.pagefind-ui__result')).toHaveCount(0);
});
