import { expect, test } from '@playwright/test';
import { nearestPoint, snapAngle } from '../src/utils/classicRotation';

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
  const layer = page.getByRole('button', { name: 'User Interface', exact: true });
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

for (const width of [320,390,768]) {
  test(`campus mobile directory is a compact vertical list at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const directory = page.getByRole('navigation', { name: 'Engineering avenue facilities' });
    const rows = directory.getByRole('button');
    await expect(rows).toHaveCount(5);
    const boxes = await rows.evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, height:r.height, width:r.width }; }));
    expect(boxes.every((box,i) => i===0 || (Math.abs(box.x-boxes[0].x)<1 && box.y>=boxes[i-1].y+boxes[i-1].height-1))).toBe(true);
    expect(boxes.every(box => box.height>=44 && box.height<=64)).toBe(true);
    await rows.first().click();
    const detail = page.getByRole('button', { name:'Project details +' });
    await expect(detail).toBeVisible();
    await expect(page.locator('#campus-project-details')).toBeHidden();
    await detail.click();
    await expect(page.locator('#campus-project-details')).toBeVisible();
    await page.getByRole('button', { name:'Hide project details −' }).click();
    await expect(page.locator('#campus-project-details')).toBeHidden();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  });
}



test('classic immersive sections preserve all seven scene identities and full-size artwork', async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/classic/');
  await expect(page.locator('.immersive-section')).toHaveCount(6);
  for (const section of await page.locator('.immersive-section').all()) {
    const art=section.locator('.classic-backdrop');
    await expect(art).toBeVisible();
    const [artBox,sectionBox]=await Promise.all([art.boundingBox(),section.boundingBox()]);
    expect(artBox!.width).toBeGreaterThan(sectionBox!.width*.95);
    expect(artBox!.height).toBeGreaterThan(sectionBox!.height*.95);
    await expect(section.locator('.glass-card')).toHaveCount(0);
    await expect(section.locator('.immersive-navigation button[aria-pressed=true]')).toHaveCount(1);
  }
});
test('classic drag snaps to a new information point and keyboard selection stays synchronized', async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/classic/#about');
  const section=page.locator('#about');
  const selector=section.locator('.immersive-navigation');
  await expect(selector.getByRole('button',{name:'Software Architecture'})).toHaveAttribute('aria-pressed','true');
  const area=section.locator('[data-scene-drag-area]');
  await area.scrollIntoViewIfNeeded();
  const b=await area.boundingBox();
  const x=b!.x+b!.width*.65,y=b!.y+b!.height*.5;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x-140,y,{steps:12});
  await page.mouse.up();
  await expect(selector.getByRole('button',{name:'Full-Stack Development'})).toHaveAttribute('aria-pressed','true');
  await expect(section.getByRole('heading',{name:'Full-Stack Development'})).toBeVisible();
  await selector.getByRole('button',{name:'Technical Leadership'}).focus();
  await page.keyboard.press('Enter');
  await expect(section.getByRole('heading',{name:'Technical Leadership'})).toBeVisible();
  await section.getByRole('button',{name:'Next point'}).click();
  await expect(section.getByRole('heading',{name:'Software Architecture'})).toBeVisible();
});
test('all architecture layers are accessible on mobile with reduced motion',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/classic/#architecture');
  const section=page.locator('#architecture');
  await expect(section.locator('.immersive-navigation button')).toHaveCount(9);
  await section.getByRole('button',{name:'Security & Permissions',exact:true}).click();
  await expect(section.getByRole('heading',{name:'Security & Permissions',exact:true})).toBeVisible();
  await expect(section.locator('.classic-art-static')).toBeVisible();
  await expect(section.locator('canvas')).toHaveCount(0);
});

test('rotation snap chooses the intended point across repeated revolutions',()=>{
  for(const count of [3,4,5,6,9]) for(let i=0;i<count;i++) for(let turn=-10;turn<=10;turn++){
    const current=turn*.85;
    const angle=snapAngle(i,count,current);
    expect(nearestPoint(angle,count)).toBe(i);
    expect(Math.abs(angle-current)).toBeLessThanOrEqual(Math.PI+1e-9);
  }
  expect(nearestPoint(-140*.012,4)).toBe(1);
  expect(nearestPoint(140*.012,4)).toBe(3);
});
