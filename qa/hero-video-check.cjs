const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-accelerated-video-decode']});
 for(const width of [1440,820,390,320]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.getElementById('hero-video').currentTime>.05);
  const info=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,loop:v.loop,inline:v.playsInline}));
  assert.ok(Math.abs(info.duration-10.05)<.15);assert.equal(info.width,576);assert.equal(info.height,720);assert.ok(info.muted&&info.loop&&info.inline);
  await page.getByRole('button',{name:'Pause hero video'}).click();
  assert.equal(await page.locator('video').evaluate(v=>v.paused),true);
  await page.locator('video').evaluate(v=>{v.currentTime=8.4});
  await page.waitForFunction(()=>!document.getElementById('hero-video').seeking);
  await page.waitForTimeout(250);
  const frame=await page.locator('video').evaluate(v=>{
    const c=document.createElement('canvas');c.width=64;c.height=80;
    const context=c.getContext('2d');context.drawImage(v,0,0,64,80);
    const pixels=context.getImageData(0,0,64,80).data;
    let low=255,high=0;for(let i=0;i<pixels.length;i+=4){low=Math.min(low,pixels[i]);high=Math.max(high,pixels[i]);}
    return {time:v.currentTime,contrast:high-low};
  });
  assert.ok(frame.time>8 && frame.time<9, 'MP4 must seek to the infusion frame');
  assert.ok(frame.contrast>25, 'Decoded frame must show the scene rather than a blank video');
  await page.screenshot({path:`qa/hero-video-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Play hero video'}).click();
  await page.waitForFunction(()=>!document.getElementById('hero-video').paused);
  assert.deepEqual(errors,[]);await page.close();
  console.log(`${width}px: MP4 playback, dimensions, controls, mute, loop, inline, overflow and console passed`);
 }
 const reduced=await browser.newPage({reducedMotion:'reduce'});
 await reduced.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 assert.equal(await reduced.locator('video').evaluate(v=>v.paused),true);
 assert.equal(await reduced.locator('.hero-image').evaluate(el=>el.classList.contains('is-video-ready')),false);
 await reduced.getByRole('button',{name:'Play hero video'}).click();await reduced.waitForFunction(()=>!document.getElementById('hero-video').paused);
 await reduced.close();console.log('Reduced motion: static fallback and explicit play passed');
 const failed=await browser.newPage();await failed.route('**/ceyluxe-hero-ritual.mp4',route=>route.abort());
 await failed.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 assert.equal(await failed.locator('.hero-image').evaluate(el=>el.classList.contains('is-video-ready')),false);
 assert.equal(await failed.locator('.hero-image>img').evaluate(el=>el.naturalWidth>0),true);
 assert.equal(await failed.locator('.hero-video-toggle').isVisible(),false);await failed.close();
 console.log('Unavailable video: image fallback passed');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
