import { expect, test } from '@playwright/test';

test('home opens the campus directly, with professional links and classic expertise', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#engineering-world')).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn ↗', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/tymur-abbasov/');
  await expect(page.getByRole('link', { name: 'GitHub ↗', exact: true })).toHaveAttribute('href', 'https://github.com/Hedun20');
  await expect(page.getByRole('heading', { name: 'How I can help.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Enable|Disable) 3D$|^Motion (on|off)$/i })).toHaveCount(0);
  const directory = page.getByRole('navigation', { name: 'Engineering avenue facilities' });
  await expect(directory.getByRole('button')).toHaveCount(5);
  await directory.getByRole('button', { name: /AI Core/ }).click();
  await expect(page.getByRole('heading', { name: 'AI Core', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore AI expertise' }).click();
  await expect(page).toHaveURL(/\/classic\/#expertise$/);
  await expect(page.locator('#expertise')).toBeVisible();
  await expect(page.locator('#home canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore T3 Campus' }).click();
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


test('energy network overview preserves facility navigation without WebGL', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('DISTRICT OVERVIEW / QUANTUM ENERGY NETWORK')).toBeVisible();
  const directory = page.getByRole('navigation', { name: 'Engineering avenue facilities' });
  await expect(directory.getByRole('button')).toHaveCount(5);
  await directory.getByRole('button', { name: /Research Lab/ }).click();
  await expect(page.getByRole('heading', { name: 'Research Lab', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('DISTRICT OVERVIEW / QUANTUM ENERGY NETWORK')).toBeVisible();
});

test('classic has a primary campus CTA, seven distinct backgrounds and keyboard-accessible architecture', async ({ page }) => {
  await page.goto('/classic/');
  await expect(page.getByRole('link', { name: 'Explore T3 Campus', exact: true })).toHaveAttribute('href', '../');
  await expect(page.locator('[data-classic-scene]')).toHaveCount(7);
  const variants = await page.locator('[data-classic-scene]').evaluateAll(elements => elements.map(element => element.getAttribute('data-classic-scene')));
  expect(new Set(variants).size).toBe(7);
  await expect(page.locator('main canvas')).toHaveCount(0);
  const layer = page.getByRole('button', { name: /User Interface/ });
  await layer.focus();
  await page.keyboard.press('Enter');
  await expect(layer).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'View AI architecture' })).toHaveAttribute('href', '#architecture');
});

for (const [width, height] of [[320,568],[390,844],[768,1024],[1366,768],[1440,900],[1920,1080]]) {
  test(`classic layout fits ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/classic/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const sections = page.locator('main section[id]');
    await expect(sections).toHaveCount(7);
    for (const section of await sections.all()) {
      await section.scrollIntoViewIfNeeded();
      expect(await section.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}
