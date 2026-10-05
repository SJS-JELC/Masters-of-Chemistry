import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const owned=import.meta.dirname,project=path.resolve(owned,'../../..');
const require=createRequire(path.join(project,'package.json'));
const rootRequire=createRequire(path.resolve(project,'../../package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
assert.equal(rootRequire('playwright/package.json').version,'1.62.1');
const {chromium}=rootRequire('playwright');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=p=>fs.readFileSync(path.join(project,p));
const watched=['validation/s4/statistics/browser.mjs','validation/s4/statistics/harness.tsx','validation/s4/statistics/harness.html','validation/s4/statistics/browser-results.json','validation/s4/statistics/browser-initial-load-failure.json','validation/s4/statistics/browser-network.json','vite.config.ts','tsconfig.json','package.json','node_modules/react/package.json','node_modules/react/jsx-dev-runtime.js','node_modules/react/cjs/react-jsx-dev-runtime.development.js','node_modules/vite/package.json','node_modules/vite/dist/node/chunks/node.js'];
function walk(dir){for(const entry of fs.readdirSync(path.join(project,dir),{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else watched.push(p);}}
walk('src/statistics');walk('src/foundation');walk('src/persistence');walk('src/domain');
const fingerprints=()=>Object.fromEntries(watched.map(p=>[p,hash(read(p))]));
const before=fingerprints();
const original=read('validation/s4/statistics/browser.mjs').toString();
const replacement="include:['react','react-dom/client','react/jsx-runtime','react/jsx-dev-runtime','dexie','zustand','zustand/vanilla']";
const needle="include:['react','react-dom/client','react/jsx-runtime','dexie','zustand','zustand/vanilla']";
assert.equal(original.split(needle).length,2);
const proposed=original.replace(needle,replacement);
fs.writeFileSync(path.join(owned,'proposed-browser.mjs.txt'),proposed);
assert.equal(proposed.slice(proposed.indexOf('const snap=')),original.slice(original.indexOf('const snap=')));
const cssOnlyClient=original.match(/const cssOnlyClient=`([^`]+)`;/)[1];
const report={agentId:'A06',jobId:'S4-REVIEW-BROWSER-STARTUP',status:'FAIL',before,checks:[],errors:[],requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModelEffort:null,usage:null};
let server,context;
const base='http://127.0.0.1:5198';
async function launch(fixed){
  server=await createServer({root:project,cacheDir:path.join(owned,fixed?'cache-fixed':'cache-unfixed'),optimizeDeps:{noDiscovery:true,include:['react','react-dom/client','react/jsx-runtime',...(fixed?['react/jsx-dev-runtime']:[]),'dexie','zustand','zustand/vanilla']},server:{host:'127.0.0.1',port:5198,strictPort:true,hmr:false},plugins:[{name:'review-retained-css-only-client',configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/@vite/client'){res.setHeader('Content-Type','text/javascript');res.end(cssOnlyClient);}else next();});},transformIndexHtml:{order:'post',handler:html=>html.replace(/<script\b[^>]*src=["']\/@vite\/client[^"']*["'][^>]*>\s*<\/script>/g,'')}}]});
  await server.listen();
  const transformed=await server.transformRequest('/validation/s4/statistics/harness.tsx');
  fs.writeFileSync(path.join(owned,fixed?'harness-fixed-transform.js.txt':'harness-unfixed-transform.js.txt'),transformed.code);
  const line=transformed.code.split('\n').find(l=>l.includes('jsxDEV')&&l.includes('import'));
  assert(line);const runtimeURL=line.match(/from ["']([^"']+)/)[1];
  const body=await (await fetch(base+runtimeURL)).text();
  fs.writeFileSync(path.join(owned,fixed?'runtime-fixed.js.txt':'runtime-unfixed.js.txt'),body);
  report.checks.push({fixed,jsxImport:line,runtimeURL,bodySha256:hash(body),commonJS:body.includes('module.exports = require'),hasESMExport:/export\s*\{/.test(body)});
  return body;
}
try{
  const unfixed=await launch(false);assert(unfixed.includes('module.exports = require'));assert(!/export\s*\{/.test(unfixed));
  await server.close();server=null;
  const fixed=await launch(true);assert(/export\s*\{/.test(fixed));assert(fixed.includes('jsxDEV'));
  const profile=path.join(owned,'profile');
  context=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1366,height:1000},timezoneId:'Europe/London'});
  report.browser=context.browser()?.version();
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/validation/s4/statistics/harness.html?run=a06-s4-startup-'+Date.now()+'&course=alevel',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.__mastersActivity,null,{timeout:60000});
  const snapshot=await page.evaluate(()=>window.__mastersActivity.snapshot());
  report.host={databaseName:snapshot.databaseName,attempt:snapshot.attempt??null,historyLength:snapshot.history.length};
  assert.equal(snapshot.history.length,0);assert(!snapshot.attempt);
  await page.screenshot({path:path.join(owned,'actual-host-started.png'),fullPage:true});
  await page.goto(base+'/validation/s4/statistics/harness.html?panel=statistics&course=alevel&database='+encodeURIComponent(snapshot.databaseName)+'&profile=local',{waitUntil:'domcontentloaded',timeout:60000});
  await page.getByTestId('statistics-total').waitFor({timeout:60000});
  assert.equal(Number(await page.getByTestId('statistics-total').innerText()),0);
  await page.screenshot({path:path.join(owned,'actual-statistics-started.png'),fullPage:true});
  assert.deepEqual(report.errors,[]);
  report.after=fingerprints();report.changed=watched.filter(p=>before[p]!==report.after[p]);assert.deepEqual(report.changed,[]);
  report.assertionsUnchanged=true;report.originalLauncherSha256=hash(original);report.proposedLauncherSha256=hash(proposed);
  report.status='PASS';
}catch(error){report.failure=String(error.stack??error);throw error;}
finally{if(context)await context.close();if(server)await server.close();report.checkedAt=new Date().toISOString();fs.writeFileSync(path.join(owned,'execution.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks,errors:report.errors,failure:report.failure}));}
