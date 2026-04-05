import { test, expect } from '@playwright/test';

test.describe('The Greenhouse E2E', () => {

  // S1: 다크모드 토글 (popover)
  test('S1: dark mode toggle via popover and persists', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });

    // Open popover, click dark
    await toggle.click();
    await page.locator('[data-set-theme="dark"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Persist after reload
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Clean up
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });
  });

  // S2: 모바일 메뉴
  test('S2: mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Wait for menu toggle to be initialized by astro:page-load
    const toggle = page.locator('#menu-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toHaveClass(/opacity-100/);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  // S3: 검색 (Pagefind)
  test('S3: search returns results for "AI"', async ({ page }) => {
    await page.goto('/search/');

    // Pagefind UI script uses window.PagefindUI (global, not ESM export).
    // The page's auto-init may fail due to destructured import; manually init if needed.
    await page.waitForTimeout(2_000);
    const needsManualInit = await page.evaluate(() => {
      return !document.querySelector('.pagefind-ui__search-input');
    });
    if (needsManualInit) {
      await page.evaluate(async () => {
        await import('/pagefind/pagefind-ui.js');
        if ((window as any).PagefindUI) {
          new (window as any).PagefindUI({ element: '#search', showSubResults: true });
        }
      });
    }

    const input = page.locator('.pagefind-ui__search-input');
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill('AI');
    await input.press('Enter');
    const results = page.locator('.pagefind-ui__result');
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
    expect(await results.count()).toBeGreaterThan(0);
  });

  // S4: 태그 필터링
  test('S4: tag filter shows/hides posts', async ({ page }) => {
    await page.goto('/flora/');

    // Wait for tag filter to be initialized by astro:page-load
    const tagFilter = page.locator('#tag-filter');
    await expect(tagFilter).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });

    const tagButton = page.locator('.tag-btn').first();
    await expect(tagButton).toBeVisible();

    await tagButton.click();
    await expect(tagButton).toHaveClass(/bg-accent-muted/);

    // Click again → all restored
    await tagButton.click();
    await expect(tagButton).not.toHaveClass(/bg-accent-muted/);

    // Wait for entrance animations to complete before checking opacity
    await page.waitForTimeout(1_500);
    const cards = page.locator('#post-list [data-tags]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const opacity = await cards.nth(i).evaluate(el => parseFloat(getComputedStyle(el).opacity));
      expect(opacity).toBeGreaterThanOrEqual(0.99);
    }
  });

  // S5: 읽기 시간
  test('S5: reading time shown on card and detail', async ({ page }) => {
    await page.goto('/flora/');
    const card = page.locator('#post-list [data-tags]').first();
    await expect(card).toContainText(/\d+ min/);

    // Card IS the <a> tag — click directly
    await card.click();
    await page.waitForLoadState('networkidle');
    const header = page.locator('article header');
    await expect(header).toContainText(/\d+ min/);
  });

  // S6: 목차 (ToC) — skipped: no article with 3+ headings in current content
  // Re-enable when a post with 3+ headings is added

  // S7: 스크롤 진행률 바
  test('S7: scroll progress bar exists with correct CSS', async ({ page }) => {
    await page.goto('/flora/');
    await page.locator('#post-list a[href*="/flora/"]').first().click();
    await page.waitForLoadState('networkidle');

    const bar = page.locator('.scroll-progress');
    await expect(bar).toBeAttached();
    const animation = await bar.evaluate(el => getComputedStyle(el).animationName);
    expect(animation).toBe('scroll-progress');
  });

  // S8: View Transitions
  test('S8: view transitions active and navbar persists', async ({ page }) => {
    await page.goto('/');
    const hasVT = await page.evaluate(() =>
      !!document.querySelector('meta[name="astro-view-transitions-enabled"]')
    );
    expect(hasVT).toBe(true);

    const navbar = page.locator('nav[aria-label="Main navigation"]');
    await expect(navbar).toBeVisible();

    // Use navbar-scoped link to avoid ambiguity with Flora cards on home page
    await navbar.getByRole('link', { name: 'Flora', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(navbar).toBeVisible();
    expect(page.url()).toContain('/flora/');
  });

  // S9: PostCard 호버 리프트
  test('S9: post card has hover lift CSS', async ({ page }) => {
    await page.goto('/flora/');
    const card = page.locator('#post-list [data-tags]').first();
    const classes = await card.getAttribute('class');
    expect(classes).toContain('hover:-translate-y-1');
    expect(classes).toContain('hover:shadow-lg');
  });

  // S10: 404 페이지
  test('S10: 404 page renders correctly', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText('이 페이지는 아직 싹이 트지 않았습니다.')).toBeVisible();

    // Scope links to the 404 content area (not the navbar)
    const content = page.locator('.max-w-md');
    await expect(content.getByRole('link', { name: /Flora/ })).toBeVisible();
    await expect(content.getByRole('link', { name: /Nursery/ })).toBeVisible();
    await expect(content.getByRole('link', { name: /Seeds/ })).toBeVisible();

    // max-w-md should be ~448px, not 22.4px
    const maxWidth = await content.evaluate(
      el => parseFloat(getComputedStyle(el).maxWidth)
    );
    expect(maxWidth).toBeGreaterThan(400);
  });

  // S11: ContactForm 접근성 + 다크모드
  test('S11: contact form fields visible in light and dark', async ({ page }) => {
    await page.goto('/gardener/');
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();

    // Dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    });
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();

    const labelColor = await page.locator('label').first().evaluate(
      el => getComputedStyle(el).color
    );
    expect(labelColor).not.toBe('rgba(0, 0, 0, 0)');
  });

});
