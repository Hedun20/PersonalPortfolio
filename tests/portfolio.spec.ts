import { expect, test } from '@playwright/test';

test('classic portfolio opens the built campus and returns to expertise', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#home canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore 3D campus' }).click();
  await expect(page).toHaveURL(/\/preview-campus\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable 3D' })).toBeVisible();
  const directory = page.getByRole('navigation', { name: 'Engineering avenue facilities' });
  await expect(directory.getByRole('button')).toHaveCount(5);
  await directory.getByRole('button', { name: /AI Core/ }).click();
  await expect(page.getByRole('heading', { name: 'AI Core', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore AI expertise' }).click();
  await expect(page).toHaveURL(/\/#expertise$/);
  await expect(page.locator('#expertise')).toBeVisible();
});

test('mobile menu is hidden until opened and supports native anchors and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('#mobile-navigation');
  const toggle = page.getByRole('button', { name: /Open menu|Close menu/ });
  await expect(menu).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Tech Stack' }).click();
  await expect(page).toHaveURL(/#techstack$/);
  await expect(menu).toBeHidden();
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});
