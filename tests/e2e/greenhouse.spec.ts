import {test, expect} from '@playwright/test';

test('readers can open articles, empty topics and return to the complete list', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: '글', exact: true})).toBeVisible();
  const first = page.locator('.post-row h2 a').first();
  const title = await first.textContent();
  await first.click();
  await expect(page.getByRole('heading', {level: 1, name: title!, exact: true})).toBeVisible();
  await expect(page.locator('.greenhouse-prose')).toBeVisible();
  await page.goto('/topics/music/');
  await expect(page.getByText('아직 이 주제의 글이 없습니다.')).toBeVisible();
  await page.getByRole('link', {name: '전체 글 보기', exact: true}).click();
  await expect(page.locator('.post-row').first()).toBeVisible();
});

test('mobile menu closes on navigation and updates the persisted current topic', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  const toggle = page.getByRole('button', {name: '메뉴', exact: true});
  const drawer = page.locator('#mobile-drawer');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await drawer.getByRole('link', {name: '기술', exact: true}).click();
  await expect(page).toHaveURL(/\/topics\/tech\//);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await toggle.click();
  await expect(drawer.getByRole('link', {name: '기술', exact: true})).toHaveAttribute('aria-current', 'page');
  await drawer.getByRole('link', {name: '음악', exact: true}).click();
  await expect(page).toHaveURL(/\/topics\/music\//);
  await toggle.click();
  await expect(drawer.getByRole('link', {name: '음악', exact: true})).toHaveAttribute('aria-current', 'page');
  await expect(drawer.getByRole('link', {name: '기술', exact: true})).not.toHaveAttribute('aria-current');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('search starts without test-side repairs, returns results and recovers from a loader failure', async ({page}) => {
  let fail = true;
  await page.route('**/pagefind/pagefind-ui.js', route => fail ? route.abort() : route.continue());
  await page.goto('/search/');
  await expect(page.locator('#search-status')).toContainText('검색을 불러오지 못했어요');
  fail = false;
  await page.getByRole('button', {name: '다시 시도', exact: true}).click();
  const input = page.getByRole('searchbox');
  await expect(input).toBeVisible();
  await input.fill('AI');
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  await input.fill('존재하지않는검색어확인문구');
  await expect(page.locator('.pagefind-ui__message')).toContainText('검색 결과가 없습니다');
});

test('tag filters remove unmatched cards from the layout and restore selection after reload', async ({page}) => {
  await page.goto('/seeds/');
  const button = page.locator('.tag-btn').filter({hasText: /^test$/});
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tag-item]:visible')).toHaveCount(1);
  await page.reload();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tag-item]:visible')).toHaveCount(1);
  await page.getByRole('button', {name: '선택 해제', exact: true}).click();
  await expect(page.locator('[data-tag-item]:visible')).toHaveCount(await page.locator('[data-tag-item]').count());
});

test('404 offers a working return path and the default social image exists', async ({page, request}) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', {name: /길을.*잃었어요/})).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await page.getByRole('link', {name: '홈으로 돌아가기 →', exact: true}).click();
  await expect(page.getByRole('heading', {name: '글', exact: true})).toBeVisible();
  const og = await request.get('/og-default.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
});

test('articles remain readable without JavaScript', async ({browser}) => {
  const page = await browser.newPage({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  try {
    await page.goto('http://127.0.0.1:4321/');
    const first = page.locator('.post-row h2 a').first();
    const title = await first.textContent();
    await first.click();
    await expect(page.getByRole('heading', {name: title!, exact: true, level: 1})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  } finally {await page.close();}
});
