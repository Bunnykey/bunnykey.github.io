import {test, expect} from '@playwright/test';

test('theme follows the chosen preference through navigation, reload and system changes', async ({page}) => {
  await page.emulateMedia({colorScheme: 'light'});
  await page.goto('/');
  await page.locator('#theme-picker > summary').click();
  await page.getByRole('radio', {name: '어둡게', exact: true}).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation', {name: '글 주제'}).getByRole('link', {name: '음악', exact: true}).click();
  await expect(page).toHaveURL(/\/topics\/music\//);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#theme-picker > summary').click();
  await page.getByRole('radio', {name: '시스템 설정', exact: true}).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Escape');
  await expect(page.locator('#theme-picker')).not.toHaveAttribute('open', '');
});
