const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const width of [1440,820,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.getByRole('button',{name:'Switch to dark theme'}).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.equal(await page.locator('.theme-toggle').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>localStorage.getItem('ceyluxe-theme')),'dark');
  for(const file of ['index.html','payment.html']){
   await page.goto('http://127.0.0.1:4173/'+file,{waitUntil:'networkidle'});
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 59, 42)');
   assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).color),'rgb(252, 250, 245)');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const controls=await page.locator('.header-action').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};});
   assert.ok(controls.left>=0&&controls.right<=width);
   if(file==='payment.html'){
    await page.locator('#method-bank').check();assert.equal(await page.locator('.bank-details').isVisible(),true);
    await page.locator('#method-card').check();await page.locator('#card-holder').fill('Theme check');
    assert.equal(await page.locator('#card-holder').evaluate(el=>getComputedStyle(el).color),'rgb(252, 250, 245)');
    await page.locator('#card-holder').fill('');
   }
   await page.evaluate(()=>Array.from(document.images).forEach(image=>image.loading='eager'));
   await page.locator('footer').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>Array.from(document.images).every(image=>image.complete&&image.naturalWidth>0));
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`qa/dark-${file}-${width}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Switch to light theme'}).focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);console.log(`${width}px: themes, persistence, both pages, layout and keyboard passed`);
  await context.close();
 }
 const system=await browser.newContext({colorScheme:'dark',reducedMotion:'reduce'});const page=await system.newPage();
 await page.goto('http://127.0.0.1:4173/');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await system.close();
 const blocked=await browser.newContext({reducedMotion:'reduce'});await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked')}}));const p=await blocked.newPage();await p.goto('http://127.0.0.1:4173/');await p.locator('.theme-toggle').click();assert.ok(['dark','light'].includes(await p.locator('html').getAttribute('data-theme')));await blocked.close();
 console.log('System theme changes and disabled-storage fallback passed');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
