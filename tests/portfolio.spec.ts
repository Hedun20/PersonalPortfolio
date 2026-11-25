import { expect, test } from '@playwright/test';

test('home opens the campus directly, with professional links and classic expertise', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#engineering-world')).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn ↗', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/tymur-abbasov/');
  await expect(page.getByRole('link', { name: 'GitHub ↗', exact: true })).toHaveAttribute('href', 'https://github.com/Hedun20');
  await expect(page.getByRole('heading', { name: 'How I can help.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable 3D' })).toBeVisible();
  const directory = page.getByRole('navigation', { name: 'Engineering avenue facilities' });
  await expect(directory.getByRole('button')).toHaveCount(5);
  await directory.getByRole('button', { name: /AI Core/ }).click();
  await expect(page.getByRole('heading', { name: 'AI Core', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore AI expertise' }).click();
  await expect(page).toHaveURL(/\/classic\/#expertise$/);
  await expect(page.locator('#expertise')).toBeVisible();
  await expect(page.locator('#home canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore 3D campus' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#engineering-world')).toBeVisible();
});

test('mobile menu is hidden until opened and supports native anchors and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/classic/');
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


test('campus hides the document scrollbar but services remain reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'none');
  await page.getByRole('link', { name: 'Services ↓', exact: true }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#services')).toBeInViewport();
  await page.goto('/classic/');
  await expect(page.locator('html')).not.toHaveClass(/campus-page/);
});


test('project walkthrough explicitly uses sample data without entering the building', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Engineering avenue facilities' }).getByRole('button', { name: /AI Core/ }).click();
  await page.getByRole('button', { name: 'See how this project works ↗' }).click();
  await expect(page.getByText('All inputs and outputs are illustrative', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter facility ↗', exact: true })).toBeVisible();
  await page.getByRole('group', { name: 'Workflow stages' }).getByRole('button', { name: /Extract/ }).click();
  await expect(page.getByText('invoice_id: A-104 · total: €240')).toBeVisible();
  await page.getByRole('button', { name: 'Hide example workflow' }).click();
  await expect(page.getByRole('group', { name: 'Workflow stages' })).toHaveCount(0);
});
