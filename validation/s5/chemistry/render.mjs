import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'../../..'),out=import.meta.dirname;
const require=createRequire(path.resolve(root,'../../package.json'));const {chromium}=require('playwright');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);const f=path.resolve(out,'.'+p);if(!fs.existsSync(f)||!f.startsWith(out+path.sep))throw Error('scope');res.writeHead(200,{'content-type':mime[path.extname(f)]??'application/octet-stream'});fs.createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(5202,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1300,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const report={at:new Date().toISOString(),browser:browser.version(),playwright:require('playwright/package.json').version,scope:'Fresh exact current provider diagram renders; review layout, not whole player UX evidence',pages:[]};
try{for(const f of fs.readdirSync(out).filter(f=>/^diagrams-\d+.html$/.test(f)).sort()){
 await page.goto('http://127.0.0.1:5202/'+f);await page.locator('img').evaluateAll(async imgs=>await Promise.all(imgs.map(i=>i.decode())));const png=f.replace('.html','.png');await page.screenshot({path:path.join(out,png),fullPage:true});report.pages.push({html:f,png,imageChecks:await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}))) });}
 report.errors=errors;report.status=errors.length?'FAIL':'RENDERED-INSPECTION-PENDING';
}finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'render-results.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({status:report.status,pages:report.pages.length,browser:report.browser,playwright:report.playwright}));

