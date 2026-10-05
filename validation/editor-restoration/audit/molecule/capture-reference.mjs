import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const workspace = process.cwd(), here = import.meta.dirname;
const { chromium } = await import(pathToFileURL(path.join(workspace, 'node_modules/playwright/index.mjs')).href);
const root = path.join(workspace, 'apps/Masters-of-A-Level-Chemistry/src');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.ttf':'font/ttf', '.json':'application/json' };
const requested = [], errors = [], checks = [];
const server = http.createServer(async (req,res) => {
  try {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    requested.push(path.relative(root,file));
    res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({channel:'msedge',headless:true});
const report = {status:'RUNNING',method:'Pinned root Playwright; headless Edge; fresh nonpersistent contexts; script-owned ephemeral read-only server',checks,errors,requested};
try {
  for (const [name, viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}), page=await context.newPage();
    page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
    await page.goto(origin+'/activities/c3l6-organic-reactions/index.html');
    await page.locator('#panel-intro .digitised-intro').waitFor(); await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(here,`original-${name}-intro.png`),fullPage:true});
    await page.locator('#startQuestions').click(); await page.locator('#questionPanel .classification-row').first().waitFor();
    await page.screenshot({path:path.join(here,`original-${name}-a.png`),fullPage:true});
    await page.evaluate(()=>{for(const item of C3L6Content.stages.a.answers) document.querySelector(`input[name="reaction-${item.id}"][value="${item.answer}"]`).click();});
    await page.locator('#checkPart').click(); await page.locator('#continue').click();
    await page.locator('#questionPanel .digitised-b').waitFor();
    await page.screenshot({path:path.join(here,`original-${name}-b-blank.png`),fullPage:true});
    await page.locator('#drawingSection').scrollIntoViewIfNeeded();
    const canvas=page.locator('#canvas'), bounds=await canvas.boundingBox();
    const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
    await page.mouse.click(x,y); assert.equal(await canvas.locator('[data-atom]').count(),1);
    const atom=await canvas.locator('[data-atom]').first().boundingBox(), ax=atom.x+atom.width/2,ay=atom.y+atom.height/2;
    await page.mouse.move(ax,ay);await page.mouse.down();await page.mouse.move(ax+65,ay-35,{steps:8});
    await page.screenshot({path:path.join(here,`original-${name}-bond-preview.png`)});
    await page.mouse.up(); assert.equal(await canvas.locator('[data-atom]').count(),2);
    assert.equal(await canvas.locator('[data-bond]').count(),1);
    await canvas.locator('[data-bond]').click();assert.equal(await canvas.locator('.bond-line').count(),2);
    await page.getByRole('button',{name:'Oxygen',exact:true}).click();await canvas.locator('[data-atom]').last().click();
    await page.screenshot({path:path.join(here,`original-${name}-carbonyl.png`)});
    await page.locator('#drawingSection').screenshot({path:path.join(here,`original-${name}-editor-detail.png`)});
    await page.locator('#undo').click(); await page.locator('#clean').click();
    const atomCount=await canvas.locator('[data-atom]').count();await page.locator('#chain').click();
    const cb=await canvas.boundingBox();await page.mouse.move(cb.x+40,cb.y+cb.height*.78);await page.mouse.down();await page.mouse.move(cb.x+cb.width*.8,cb.y+cb.height*.78,{steps:12});await page.mouse.up();
    assert((await canvas.locator('[data-atom]').count())>atomCount);await page.locator('#undo').click();assert.equal(await canvas.locator('[data-atom]').count(),atomCount);
    checks.push(`${name}: introduction and all ten original classifications; A correct unlocks B; atom placement; bond-growing drag; ghost preview; bond click cycles; oxygen replacement; clean-up; whole chain drag is one undo`);
    report[name]={viewport,horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),freshStorageKeys:await page.evaluate(()=>Object.keys(localStorage))};
    await page.goto(origin+'/activities/c3l6-organic-reactions/index.html?inspect=c');await page.locator('#questionPanel .digitised-c').waitFor();
    await page.screenshot({path:path.join(here,`original-${name}-c.png`),fullPage:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);report.status='PASS';
} catch(e) {report.status='FAIL';report.failure=e.stack;process.exitCode=1;}
finally {await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(here,'reference-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:checks.length,errors,failure:report.failure}));}
