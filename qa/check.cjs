// Optional browser QA. Install playwright-core separately; the site has no dependencies.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
  const report = [];
  for (const [name, width, columns] of [['desktop',1440,4],['tablet',820,2],['phone',390,1],['small-phone',320,1]]) {
    const page = await browser.newPage({viewport:{width,height:1000}, reducedMotion:'reduce'});
    const errors = [], failed = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {if(m.type()==='error') errors.push(m.text());});
    page.on('response', r => {if(r.status()>=400) failed.push(r.url());});
    page.on('request', r => {if(!r.url().startsWith('http://127.0.0.1:4173/')) external.push(r.url());});
    await page.goto('http://127.0.0.1:4173/', {waitUntil:'networkidle'});
    await page.evaluate(()=>Array.from(document.images).forEach(image=>image.loading='eager'));
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Array.from(document.images).every(i => i.complete));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true,`${name} overflow`);
    assert.equal(await page.locator('.product-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),columns);
    assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete && i.naturalWidth>0)),true);
    for(const link of await page.locator('header nav a').all()) {
      const href = await link.getAttribute('href');
      await link.click();
      assert.equal(await page.evaluate(()=>location.hash),href);
      assert.ok(await page.locator(href).evaluate(el=>el.getBoundingClientRect().top<150));
    }
    for(const product of await page.locator('.product').all()) {
      for(const pack of ['30-drop tin','Single pack']) {
        await product.getByRole('button',{name:pack,exact:true}).click();
        assert.equal(await product.getByRole('button',{name:pack,exact:true}).getAttribute('aria-pressed'),'true');
        assert.equal(await product.locator('[aria-pressed=true]').count(),1);
        await product.locator('.product-inquiry').click();
        const text = await page.locator('#message').inputValue();
        assert.ok(text.includes(await product.getAttribute('data-product')) && text.includes(pack));
        assert.equal(await page.evaluate(()=>location.hash),'#inquiry');
      }
    }
    for(const link of await page.locator('[data-inquiry]').all()) {
      await link.click();
      assert.equal(await page.locator('#message').inputValue(),await link.getAttribute('data-inquiry'));
    }
    for(const item of await page.locator('details').all()) {
      const summary = item.locator('summary');
      await summary.focus(); await page.keyboard.press('Enter');
      assert.equal(await item.getAttribute('open'),'');
      await page.keyboard.press('Enter'); assert.equal(await item.getAttribute('open'),null);
    }
    await page.locator('#name').fill('');
    await page.locator('#inquiry-form button').click();
    assert.equal(await page.locator('#name').evaluate(el=>el.validity.valueMissing),true);
    await page.locator('#name').fill('Student Demo');
    await page.locator('#email').fill('invalid');
    await page.locator('#inquiry-form button').click();
    assert.equal(await page.locator('#email').evaluate(el=>el.validity.typeMismatch),true);
    await page.locator('#email').fill('student@example.com');
    await page.locator('#message').fill('   ');
    await page.locator('#inquiry-form button').click();
    assert.equal(await page.locator('#message').evaluate(el=>el.validity.valid),false);
    await page.locator('#message').fill('Botanical Blue — 30-drop tin, quantity 2');
    await page.locator('#inquiry-form button').click();
    assert.match(await page.locator('#inquiry-status').textContent(),/No inquiry was sent/);
    await page.locator('#newsletter-form button').click();
    assert.equal(await page.locator('#newsletter-email').evaluate(el=>el.validity.valueMissing),true);
    await page.locator('#newsletter-email').fill('invalid');
    await page.locator('#newsletter-form button').click();
    assert.equal(await page.locator('#newsletter-email').evaluate(el=>el.validity.typeMismatch),true);
    await page.locator('#newsletter-email').fill('student@example.com');
    await page.locator('#newsletter-form button').click();
    assert.match(await page.locator('#newsletter-status').textContent(),/No subscription was created/);
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
    await page.evaluate(()=>Array.from(document.images).forEach(image=>image.loading='eager'));
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`qa/${name}.png`,fullPage:true});
    report.push({viewport:name,width,columns,overflow:false,brokenImages:0,consoleErrors:0,interactions:'passed'});
    await page.close();
  }
  await browser.close();
  fs.writeFileSync('qa/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
