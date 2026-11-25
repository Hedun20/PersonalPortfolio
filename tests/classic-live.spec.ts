import { expect, test } from '@playwright/test';

test.use({ reducedMotion:'no-preference', launchOptions:{args:['--enable-unsafe-swiftshader']} });

  test('a real canvas renders visible hotspots and clicking selects the corresponding point',async({page})=>{
    await page.setViewportSize({width:1440,height:900});
    await page.goto('/classic/#about');
    const section=page.locator('#about');
    await expect(section.locator('.classic-art-live[data-ready=true] canvas')).toBeVisible({timeout:20000});
    const active=section.locator('[data-scene-marker][aria-pressed=true]');
    await expect(active).toBeVisible();
    await page.screenshot({path:'test-results/classic-live-about.png'});
    const marker=section.locator('[data-scene-marker]').nth(1);
    // Select using the accessible controls first; the actual model must rotate to the same point.
    await section.locator('.immersive-navigation').getByRole('button',{name:'Full-Stack Development'}).click();
    await expect(section.getByRole('heading',{name:'Full-Stack Development'})).toBeVisible();
    await expect(marker).toHaveAttribute('aria-pressed','true');
    await expect(marker).toBeVisible();
    // A projected live marker can be clicked; either side of the active point is a valid choice.
    const other=section.locator('[data-scene-marker][aria-pressed=false]:visible').first();
    await expect(other).toBeVisible({timeout:10000});
    const title=(await other.getAttribute('aria-label'))!.replace(/^Focus point \d+: /,'');
    await other.click();
    await expect(section.getByRole('heading',{name:title,exact:true})).toBeVisible();
  });
