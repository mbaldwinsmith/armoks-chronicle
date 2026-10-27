const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    const base = process.env.BASE_URL || 'http://127.0.0.1:8000/armoks-chronicle/';
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('[data-route="library"]').hasAttribute('aria-current'));
    assert(await page.locator('#view-library').isVisible());
    await page.locator('#theme-toggle').click();
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'parchment');
    await page.locator('[data-route="import"]').click();
    await page.waitForFunction(() => document.activeElement.id === 'main');
    await page.locator('#export-files').setInputFiles([
      {name:'region-legends.xml',mimeType:'text/xml',buffer:Buffer.from('<?xml version="1.0"?><df_world><regions></regions></df_world>')},
      {name:'region-world_map.csv',mimeType:'text/csv',buffer:Buffer.from('DFHACK_WORLD_MAP,3,129,129\nx,y,elevation\n0,0,42')},
      {name:'<img src=x onerror=alert(1)>.txt',mimeType:'text/plain',buffer:Buffer.from('Unknown file')}
    ]);
    await page.waitForFunction(() => document.querySelector('#preview-status').textContent.startsWith('3 files checked'));
    assert.equal(await page.locator('#file-list li').count(),3);
    assert((await page.locator('#file-list').innerText()).includes('World map CSV'));
    assert.equal(await page.locator('#file-list img').count(),0);
    await page.locator('#clear-files').click();
    assert.equal(await page.locator('#file-list li').count(),0);
    await page.goto(`${base}#/guide`); await page.reload();
    await page.waitForFunction(() => !document.querySelector('#view-guide').hidden);
    await page.goto(`${base}#/unknown`);
    await page.waitForFunction(() => !document.querySelector('#view-not-found').hidden);
    await page.locator('#view-not-found a').click();
    await page.waitForFunction(() => !document.querySelector('#view-library').hidden);
    await page.locator('#theme-toggle').click();
    if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+'/desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('#view-library').evaluate(el=>getComputedStyle(el).animationName),'none');
    if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+'/mobile.png',fullPage:true});
    // Block preference storage: app must still boot and change theme.
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => { Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}}); });
    const other = await blocked.newPage();
    await other.goto(base);
    await other.waitForFunction(() => document.querySelector('[data-route="library"]').hasAttribute('aria-current'));
    await other.locator('#theme-toggle').click();
    assert.equal(await other.locator('html').getAttribute('data-theme'),'parchment');
    await blocked.close();
    assert.deepEqual(failures,[]);
    console.log('PASS: project-subpath assets, routing/reload, theme persistence and blocked storage, worker file preview, safe filenames, clear, mobile overflow, reduced motion; no page errors or HTTP failures.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
