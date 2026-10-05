import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url));
const run='attempt-'+Date.now();
const context=await chromium.launchPersistentContext(resolve(here,'browser-profile'),{channel:'chrome',headless:false,viewport:{width:1440,height:1000}});
const errors=[],checks=[],blocked=[];
const page=await context.newPage();
// Playwright enables permanent focused state for automation; disable that
// override so actual tab visibility/focus events reach the runtime binding.
const pageCdp=await context.newCDPSession(page);
await pageCdp.send('Emulation.setFocusEmulationEnabled',{enabled:false});
page.on('pageerror',error=>errors.push(error.message));
const snap=()=>page.evaluate(()=>window.__mastersFoundation.snapshot());
const flush=()=>page.evaluate(async()=>{await window.__mastersFoundation.checkpoint();await window.__mastersFoundation.flush();});
const history=()=>page.evaluate(()=>window.__mastersFoundation.history());
const tick=ms=>page.waitForTimeout(ms);
async function open(fixture,suffix) {
  await page.goto(`http://127.0.0.1:5181/alevel.html?run=${run}-${suffix}&fixture=${fixture}`);
  await page.getByRole('button',{name:'Start fixture',exact:true}).waitFor();
  await page.getByRole('button',{name:'Start fixture',exact:true}).click();
  await page.waitForFunction(()=>window.__mastersFoundation?.snapshot().attempt!==null);
  await flush();
}
const time=state=>state.attempt.phase==='answering'?state.attempt.timing.activeMs:state.attempt.firstResponse.timing.activeMs;
try {
  await open('numeric','clock');
  await page.locator('input[inputmode="decimal"]').fill('42');await tick(2500);await flush();
  const beforeHidden=await snap();assert.ok(time(beforeHidden)>=1000);
  const other=await context.newPage();
  const otherCdp=await context.newCDPSession(other);
  await otherCdp.send('Emulation.setFocusEmulationEnabled',{enabled:false});
  await other.goto('about:blank');await other.bringToFront();await tick(500);
  const windowInfo=await pageCdp.send('Browser.getWindowForTarget');
  let visibility=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus()}));
  // Some hosted Windows desktops leave every tab foreground. Minimise the
  // actual Chrome window there; this asks Chrome/Windows for a real state change.
  if(!visibility.hidden&&visibility.focused){
    await pageCdp.send('Browser.setWindowBounds',{windowId:windowInfo.windowId,bounds:{windowState:'minimized'}});
    await tick(500);
  }
  visibility=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus()}));
  const genuineBackground=visibility.hidden||!visibility.focused;
  if(!genuineBackground)blocked.push({check:'Actual hidden/background focus switching',reason:'Hosted Chrome remains visible and focused after real tab switching and window minimisation, with Playwright focus emulation disabled',visibility,window:await pageCdp.send('Browser.getWindowBounds',{windowId:windowInfo.windowId})});
  await flush();const hiddenStart=await snap();await tick(5000);await flush();const hiddenEnd=await snap();
  if(genuineBackground)assert.equal(time(hiddenEnd),time(hiddenStart));
  await pageCdp.send('Browser.setWindowBounds',{windowId:windowInfo.windowId,bounds:{windowState:'normal'}});
  await page.bringToFront();await other.close();await tick(2000);await flush();
  if(genuineBackground)assert.equal(time(await snap()),time(hiddenEnd),'Returning focus alone does not restart idle/background timing');
  await page.locator('input[inputmode="decimal"]').fill('41');await tick(1800);await flush();
  assert.ok(time(await snap())>time(hiddenEnd));if(genuineBackground)checks.push('Actual hidden/background focus switching excludes time; trusted input resumes');
  await page.getByRole('button',{name:'Pause',exact:true}).click();await tick(500);await flush();const paused=await snap();
  await tick(2500);await flush();assert.equal(time(await snap()),time(paused));
  const originalId=paused.attempt.attemptId;await page.reload();await page.waitForFunction(()=>window.__mastersFoundation?.snapshot().attempt?.attemptId!==undefined);
  await flush();const reloaded=await snap();assert.equal(reloaded.attempt.attemptId,originalId);
  assert.equal(reloaded.attempt.currentResponses.answer.raw,'41');assert.ok(time(reloaded)>=time(paused));
  const resume=page.getByRole('button',{name:'Resume saved attempt',exact:true});if(await resume.isVisible())await resume.click();
  await page.locator('input[inputmode="decimal"]').fill('42');await tick(1800);await flush();
  assert.ok(time(await snap())>time(paused));checks.push('Pause and reload preserve attempt, answer and measured time; resumption accrues fresh active time');
  await page.getByRole('button',{name:'Check answer',exact:true}).click();await flush();const first=await snap();
  assert.equal(first.attempt.phase,'assessed');const frozenTime=time(first);assert.equal((await history()).length,1);
  await tick(2000);await page.locator('input[inputmode="decimal"]').fill('99');await flush();
  assert.equal(time(await snap()),frozenTime);assert.equal((await history()).length,1);
  await page.reload();await page.waitForFunction(()=>window.__mastersFoundation?.snapshot().attempt?.phase==='assessed');await flush();
  assert.equal(time(await snap()),frozenTime);assert.equal((await history()).length,1);
  await page.screenshot({path:resolve(here,'numeric-first-freeze.png'),fullPage:true});
  await page.getByRole('button',{name:'Next question',exact:true}).click();await flush();const next=await snap();
  assert.notEqual(next.attempt.attemptId,originalId);assert.equal(next.attempt.phase,'answering');assert.ok(time(next)<1000);
  checks.push('First assessment, corrections and reload retain first timing and one evidence record; Next creates fresh identity/time');
  console.log(JSON.stringify({stage:'idle-cutoff-real-60-seconds',run}));
  await page.locator('input[inputmode="decimal"]').fill('42');await flush();const idleStart=await snap();
  for(let count=0;count<64;count++)await tick(1000);
  await flush();const cutoff=await snap();assert.ok(time(cutoff)-time(idleStart)<=60500);
  await tick(2500);await flush();assert.equal(time(await snap()),time(cutoff));
  checks.push('Real documented 60-second idle deadline caps active time and remains stopped without interaction');
  await page.screenshot({path:resolve(here,'idle-cutoff.png'),fullPage:true});

  await open('self-rubric','rubric');
  await page.getByLabel('Your explanation',{exact:true}).fill('My first explanation');
  await page.getByLabel('Your comparison',{exact:true}).fill('My first comparison');await tick(1800);
  await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();await flush();const pending=await snap();
  assert.equal(pending.attempt.phase,'rubric-review');const rubricTime=time(pending);assert.equal((await history()).length,0);
  await tick(2500);await flush();assert.equal(time(await snap()),rubricTime);
  await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();
  await page.getByLabel('Start',{exact:true}).fill('0');await page.getByLabel('End (exclusive)',{exact:true}).fill('20');
  await page.getByRole('button',{name:'Use selected text',exact:true}).click();
  await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();
  await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await flush();
  assert.equal((await snap()).attempt.firstAssessment.score,.5);assert.equal(time(await snap()),rubricTime);assert.equal((await history()).length,1);
  await page.screenshot({path:resolve(here,'rubric-first-freeze.png'),fullPage:true});
  checks.push('Real two-section/two-point rubric freezes text/time before sequential evidence-linked review and one final assessment');

  await open('self-drawing','drawing');await page.locator('input[inputmode="decimal"]').fill('42');await tick(1500);
  await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();await flush();const drawing=await snap();
  assert.equal(drawing.attempt.phase,'drawing-review');const drawingTime=time(drawing);assert.equal((await history()).length,0);
  await tick(2000);await page.getByRole('button',{name:'No, my drawing needs correction',exact:true}).click();await flush();
  const drawn=await snap();assert.equal(drawn.attempt.firstAssessment.kind,'self-drawing');assert.equal(drawn.attempt.firstAssessment.score,.5);
  assert.equal(time(drawn),drawingTime);assert.equal((await history()).length,1);
  await page.screenshot({path:resolve(here,'drawing-first-freeze.png'),fullPage:true});
  checks.push('Real drawing self-check adds original meaningful point after numeric/time freeze; final aggregate records once');

  await open('editor','chemical');await page.getByRole('button',{name:'Set excessive-valence drawing',exact:true}).click();
  await page.getByRole('button',{name:'Check answer',exact:true}).click();await flush();
  assert.equal((await snap()).attempt.phase,'assessed');assert.equal((await snap()).attempt.firstAssessment.score,0);
  checks.push('Excessive valence is assessed as chemically wrong through the real shared layers');
  assert.deepEqual(errors,[]);
  writeFileSync(resolve(here,'browser-results.json'),JSON.stringify({status:blocked.length?'PARTIAL':'PASS',checkedAt:new Date().toISOString(),run,
    browser:await context.browser().version(),playwright:JSON.parse(readFileSync(new URL('../../../../../node_modules/playwright/package.json',import.meta.url),'utf8')).version,
    profilePath:resolve(here,'browser-profile'),checks,errors,blocked,limits:['Development typed editor injection; full chemistry editor migration remains later stage','Browser observation does not replace complete source-bank activity acceptance']},null,2)+'\n');
  console.log(JSON.stringify({status:blocked.length?'PARTIAL':'PASS',checks:checks.length,blocked:blocked.length}));
} catch(error) {
  await page.screenshot({path:resolve(here,'browser-failure.png'),fullPage:true}).catch(()=>{});
  const failure=JSON.stringify({status:'FAIL',checkedAt:new Date().toISOString(),run,checks,errors,error:String(error),snapshot:await snap().catch(()=>null)},null,2)+'\n';
  writeFileSync(resolve(here,'browser-results.json'),failure);
  writeFileSync(resolve(here,`browser-failure-${run}.json`),failure);
  throw error;
} finally { await context.close(); }
