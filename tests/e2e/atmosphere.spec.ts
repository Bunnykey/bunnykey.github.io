import { test, expect } from '@playwright/test';

test.describe('Atmospheric Mode', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for toggle initialization
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });
    // Reset state
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });
  });

  test('popover opens and closes', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const popover = page.locator('#theme-popover');

    // Initially closed
    await expect(popover).toHaveClass(/invisible/);

    // Click to open
    await toggle.click();
    await expect(popover).toHaveClass(/visible/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Click outside to close
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(popover).toHaveClass(/invisible/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('popover closes on Escape', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const popover = page.locator('#theme-popover');

    await toggle.click();
    await expect(popover).toHaveClass(/visible/);

    await page.keyboard.press('Escape');
    await expect(popover).toHaveClass(/invisible/);
  });

  test('theme selection works in popover', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const html = page.locator('html');

    await toggle.click();
    await page.locator('[data-set-theme="dark"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');

    // Clean up
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });
  });

  test('atmosphere selection sets data-atmosphere and persists', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    const html = page.locator('html');

    // Select sunny
    await toggle.click();
    await page.locator('[data-set-atmo="sunny"]').click();
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    const stored = await page.evaluate(() => localStorage.getItem('atmosphere'));
    expect(stored).toBe('sunny');

    // Persists after reload
    await page.reload();
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });
  });

  test('keyboard shortcuts change atmosphere', async ({ page }) => {
    const html = page.locator('html');

    await page.keyboard.press('s');
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    await page.keyboard.press('m');
    await expect(html).toHaveAttribute('data-atmosphere', 'moonlight');

    await page.keyboard.press('r');
    await expect(html).toHaveAttribute('data-atmosphere', 'rain');

    await page.keyboard.press('n');
    await expect(html).toHaveAttribute('data-atmosphere', 'none');
  });

  test('D key toggles dark mode', async ({ page }) => {
    const html = page.locator('html');

    // Set known state
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.dataset.theme = 'light';
    });

    await page.keyboard.press('d');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.keyboard.press('d');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('keyboard shortcuts ignored when input focused', async ({ page }) => {
    // Navigate to a page with an input
    await page.goto('/gardener/');
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('data-initialized', 'true', { timeout: 10_000 });

    const html = page.locator('html');
    await page.evaluate(() => {
      localStorage.removeItem('atmosphere');
      document.documentElement.dataset.atmosphere = 'none';
    });

    // Focus on input and type 's'
    const input = page.getByRole('textbox', { name: /name/i });
    await input.focus();
    await page.keyboard.press('s');

    // Atmosphere should NOT change
    await expect(html).toHaveAttribute('data-atmosphere', 'none');
  });

  test('atmosphere CSS overlay is applied', async ({ page }) => {
    const html = page.locator('html');

    await page.keyboard.press('s');
    // Wait for the attribute to be set
    await expect(html).toHaveAttribute('data-atmosphere', 'sunny');

    // Wait for CSS transition to complete (body::after transitions opacity 0→1 over 500ms)
    await page.waitForFunction(() => {
      const style = getComputedStyle(document.body, '::after');
      return style.opacity === '1';
    }, { timeout: 2000 });

    const afterOpacity = await page.evaluate(() => {
      const style = getComputedStyle(document.body, '::after');
      return style.opacity;
    });
    expect(afterOpacity).toBe('1');
  });

});
