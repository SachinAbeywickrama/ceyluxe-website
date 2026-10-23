const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const width of [1440,820,390,320]){
  const page=await browser.newPage({viewport:{width,height:1050}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:4173/payment.html',{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)),true);
  assert.equal(await page.locator('.pay-button').isDisabled(),true);
  assert.equal(await page.locator('#card-number').isDisabled(),false);
  assert.equal(await page.locator('.preview-banner').count(),0);
  assert.doesNotMatch(await page.locator('body').innerText(), /demo|display only|sample|preview/i);
  for(const [field,value] of [['card-holder','A Test'],['card-number','4111111111111111'],['expiry','12 / 29'],['security-code','123']]){
   assert.equal(await page.locator('#'+field).inputValue(),'');
   await page.locator('#'+field).fill(value);
   assert.equal(await page.locator('#'+field).inputValue(),value);
  }
  assert.equal(await page.locator('#security-code').getAttribute('type'),'password');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#card-number').inputValue(),'');
  for(const [method,panel] of [['bank','.bank-details'],['delivery','.delivery-details'],['card','.card-details']]){
   await page.locator('#method-'+method).check();assert.equal(await page.locator(panel).isVisible(),true);
  }
  await page.locator('#method-card').focus();await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#method-bank').isChecked(),true);
  await page.locator('#method-card').check();
  for(const a of await page.locator('a').all()){
   const href=await a.getAttribute('href');if(href.startsWith('#') || /^https?:/.test(href))continue;
   const response=await page.request.get('http://127.0.0.1:4173/'+href.split('#')[0]);assert.equal(response.status(),200);
  }
  await page.screenshot({path:`qa/payment-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[]);
  console.log(`${width}px passed: layout, images, payment previews, keyboard, empty editable fields, unavailable payment button, links, console`);
  await page.close();
 }
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('link',{name:'View payment options'}).click();assert.ok(page.url().endsWith('/payment.html'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
