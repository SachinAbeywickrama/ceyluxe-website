// Development-only renderer. Dependencies are installed outside the website.
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/private/tmp/ceylux-qa/node_modules/playwright-core');
const scenePath=path.join(__dirname,'scene.html');
const server=http.createServer((req,res)=>{
 const file=req.url==='/'?scenePath:path.join('/private/tmp/ceylux-motion',decodeURIComponent(req.url));
 try{const data=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':'text/javascript');res.end(data);}catch(e){res.writeHead(404);res.end('Not found');}
});
(async()=>{
 await new Promise(resolve=>server.listen(4190,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
 const page=await browser.newPage({viewport:{width:768,height:960}});
 page.on('pageerror',e=>console.error('Browser:',e.message));
 await page.goto('http://127.0.0.1:4190/');await page.waitForFunction(()=>window.sceneReady,{timeout:60000});
 const output=process.env.FRAME_DIR||'/private/tmp/ceylux-motion/frames';fs.mkdirSync(output,{recursive:true});
 if(process.argv.includes('--stills')){
  for(const t of [0.6,2.2,4.0,7.5]){await page.evaluate(t=>window.renderFrame(t),t);await page.screenshot({path:path.join(output,`preview-${t}.png`)});}
  console.log('Preview stills ready:',output);
 }else{
  for(let i=0;i<240;i++){
   const data=await page.evaluate(t=>{window.renderFrame(t);return document.querySelector('canvas').toDataURL('image/png').split(',')[1]},i/24);
   fs.writeFileSync(path.join(output,String(i).padStart(4,'0')+'.png'),Buffer.from(data,'base64'));
   if(i%24===0)console.log(`Rendered ${i}/240 frames`);
  }
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
