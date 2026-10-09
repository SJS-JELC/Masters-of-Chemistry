import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {projectRoot,chromium} from './paths.mjs';
import {createPreviewServer} from '../preview-server.mjs';
import {runtimeAliasDefinitions} from '../runtime-aliases.mjs';
const output=path.join(projectRoot,'.artifacts/app-build/worker/browser');
fs.mkdirSync(path.join(output,'.tmp'),{recursive:true});process.env.TEMP=path.join(output,'.tmp');process.env.TMP=process.env.TEMP;
const manifest=JSON.parse(fs.readFileSync(path.join(projectRoot,'release/app.runtime.json'),'utf8'));
const report={status:'RUNNING',startedAt:new Date().toISOString(),playwright:'1.62.1',checks:[],pageErrors:[],httpErrors:[],requestErrors:[],screenshots:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});report.browser=await browser.version();
try {
  for(const prefix of ['/','/school/chemistry/']) {
    const server=createPreviewServer({prefix});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base='http://127.0.0.1:'+server.address().port+prefix;
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
    page.on('pageerror',error=>report.pageErrors.push({prefix,error:error.message}));
    page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({prefix,url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>report.requestErrors.push({prefix,url:request.url(),error:request.failure()?.errorText}));
    async function readyHome(course){await page.locator('.original-landing.'+course+'.navigation-ready').waitFor();await page.evaluate(()=>document.fonts.ready);assert.equal(await page.title(),'Masters of Chemistry');}
    async function shot(label){const filename=(prefix==='/'?'root':'nested')+'-'+label+'.png';await page.screenshot({path:path.join(output,filename),fullPage:true});report.screenshots.push(filename);}
    try {
      await page.goto(base);await readyHome('alevel');assert.equal(await page.getByRole('switch',{name:'A Level Chemistry',exact:true}).getAttribute('aria-checked'),'true');
      assert.equal(await page.evaluate(()=>typeof window.__mastersActivity),'undefined');await shot('alevel-home');
      const initialJS=new Set();
      for(const row of await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname.endsWith('.js')).map(r=>r.name)))initialJS.add(new URL(row).pathname.slice(prefix.length));
      assert([...initialJS].every(file=>manifest.initialJavascript.includes(file)), 'Provider code loaded before interaction');
      report.checks.push({prefix,id:'fresh-neutral-A-Level-default',status:'PASS',initialJavascript:[...initialJS]});
      await page.getByRole('switch',{name:'A Level Chemistry',exact:true}).click();await readyHome('igcse');await shot('igcse-home');
      await page.reload();await readyHome('igcse');
      await page.goto(base);await readyHome('igcse');
      report.checks.push({prefix,id:'runtime-switch-refresh-preference',status:'PASS'});
      for(const [course,activity,gem] of [['alevel','acid-base-calculations','u6-t1-1-2'],['igcse','calorimetry','lower-10-3']]) {
        await page.goto(base+'index.html?course='+course+'&view=practice&activity='+course+'/'+activity+'&gem='+gem+'&level=1&practice=fixed-level&fresh=1');
        await page.locator('.question-player').waitFor();await page.waitForFunction(()=>!new URL(location.href).searchParams.has('fresh'));assert.equal(await page.locator('.save-error').count(),0);
        const code=await page.locator('.header-question-code').innerText();
        const question=new URL(page.url());assert.equal(question.searchParams.get('activity'),course+'/'+activity);assert.equal(question.searchParams.has('fresh'),false);
        await page.reload();await page.locator('.question-player').waitFor();assert.equal(await page.locator('.header-question-code').innerText(),code);
        await page.getByRole('button',{name:'Back to course map',exact:true}).first().click();await readyHome(course);
        report.checks.push({prefix,id:course+'-launch-save-exact-question-reload',status:'PASS',code});
      }
      // Every historical flat/qualified alias is opened in the actual production browser.
      for(const alias of runtimeAliasDefinitions()) {
        await page.goto(base+alias.route+'?probe=retained');
        const target=new URL(page.url()),course=alias.defaultCourse;
        const activity=alias.candidates[course];
        if(activity.endsWith('/c3l6-organic-reactions')) await page.locator('.olympiad-question-frame').waitFor();
        else {await page.locator('.question-player, .practice-setup').first().waitFor();}
        const resolved=new URL(page.url());assert.equal(resolved.pathname,prefix+'index.html');assert.equal(resolved.searchParams.get('course'),course);assert.equal(resolved.searchParams.get('activity'),activity);assert.equal(resolved.searchParams.get('probe'),'retained');
      }
      await page.goto(base+'activities/dot-and-cross/index.html?course=igcse&leaf=fourth-3-1&level=1&fresh=1&probe=a%2Bb#fourth-3-1');await page.locator('.question-player').waitFor();await page.waitForFunction(()=>!new URL(location.href).searchParams.has('fresh'));
      let target=new URL(page.url());assert.equal(target.searchParams.get('activity'),'igcse/dot-and-cross');assert.equal(target.searchParams.get('probe'),'a+b');assert.equal(target.hash,'#fourth-3-1');
      const dotCode=await page.locator('.header-question-code').innerText();
      await page.goto(base+'igcse/activities/dot-and-cross/index.html?question='+encodeURIComponent(dotCode)+'&mode=teacher&category=ionic&probe=a%2Bb#fourth-3-1');
      await page.locator('.teacher-answer').waitFor();assert.equal(await page.locator('.header-question-code').innerText(),dotCode);assert.equal(await page.getByLabel('Teacher activity',{exact:true}).inputValue(),'igcse/dot-and-cross');
      target=new URL(page.url());assert.equal(target.searchParams.get('question'),dotCode);assert.equal(target.searchParams.get('mode'),'teacher');assert.equal(target.searchParams.get('category'),'ionic');assert.equal(target.hash,'#fourth-3-1');
      await page.reload();await page.locator('.teacher-answer').waitFor();assert.equal(await page.locator('.header-question-code').innerText(),dotCode);
      report.checks.push({prefix,id:'all-23-aliases-collision-query-hash-question-teacher-reload',status:'PASS',aliases:23,dotCode});
      for(const file of manifest.files) {const response=await fetch(base+file.path);assert.equal(response.status,200,file.path);assert.equal((await response.arrayBuffer()).byteLength,file.bytes,file.path);}
      assert.equal((await fetch(base+'not-a-route')).status,404);assert.equal((await fetch(base+'.vite/manifest.json')).status,404);
      report.checks.push({prefix,id:'complete-runtime-static-prefix-closure-and-404',status:'PASS',files:manifest.files.length});
      await page.setViewportSize({width:390,height:844});await page.goto(base+'?course=igcse&view=home');await readyHome('igcse');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot('mobile-igcse-home');
    } finally {await context.close();await new Promise(resolve=>server.close(resolve));}
  }
  assert.equal(report.pageErrors.length,0);assert.equal(report.httpErrors.length,0);assert.equal(report.requestErrors.length,0);report.status='PASS';
} catch(error){report.status='FAIL';report.error=error.stack;process.exitCode=1;}
finally {await browser.close();report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
