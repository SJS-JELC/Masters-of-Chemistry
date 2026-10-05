import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const app=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const require=createRequire(path.resolve(app,'../../package.json'));
process.env.TEMP=path.join(app,'btmp-popup');process.env.TMP=process.env.TEMP;
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true}),page=await context.newPage();
const run='toolbar-'+Date.now(),base=`http://127.0.0.1:5188/alevel.html?course=alevel&view=olympiad&run=${run}`;
const report={at:new Date().toISOString(),checks:[],layouts:[],errors:[],status:'RUNNING'};page.on('pageerror',e=>report.errors.push(e.message));
const d=page.locator('.olympiad-drawing-dialog'),canvas=d.locator('.molecule-workspace');
const tool=name=>d.locator('.editor-bar').getByRole('button',{name,exact:true});
const flush=()=>page.evaluate(()=>window.__mastersOlympiad.flush());
const snap=()=>page.evaluate(()=>window.__mastersOlympiad.snapshot().progress);
const view=()=>canvas.evaluate(e=>{const b=e.viewBox.baseVal,m=e.getScreenCTM();return{x:b.x,y:b.y,w:b.width,h:b.height,scale:m.a};});
const check=async(name,fn)=>{await fn();report.checks.push(name);console.log('PASS '+name);};
async function drag(x,y,dx,dy){await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:6});await page.mouse.up();}
try {
  await page.goto(base+'&activity=alevel/olympiad-2011-q4');await page.locator('[data-isomer-box="1"]').click();await d.waitFor();await page.evaluate(()=>document.fonts.ready);
  await check('Large initial view and main toolbar controls',async()=>{
    assert((await view()).scale>=1.39);assert.equal(await d.getByText('Alternative controls and view',{exact:true}).count(),0);
    for(const name of ['Zoom in','Zoom out','Pan canvas','Fit molecule'])assert(await tool(name).isVisible());
    const r=await canvas.boundingBox();await canvas.click({position:{x:r.width/2,y:r.height/2}});await flush();
  });
  await check('Zoom stays centred and preserves graph/history/progress',async()=>{
    const before=await snap(),a=await view();await tool('Zoom in').click();const b=await view();assert(Math.abs(b.scale-a.scale*1.25)<.001);assert(Math.abs(a.x+a.w/2-b.x-b.w/2)<.01);
    await tool('Zoom out').click();assert(Math.abs((await view()).scale-a.scale)<.001);assert.deepEqual(await snap(),before);
  });
  await check('Hand drag over an atom pans only, with cancellation and keyboard access',async()=>{
    await tool('Pan canvas').click();const before=await snap(),a=await view();const r=await canvas.boundingBox();await drag(r.x+r.width/2,r.y+r.height/2,100,50);const b=await view();assert(Math.abs(b.x-(a.x-100/a.scale))<.1);assert(Math.abs(b.y-(a.y-50/a.scale))<.1);assert.deepEqual(await snap(),before);
    await canvas.focus();await page.keyboard.press('ArrowRight');assert.notEqual((await view()).x,b.x);await page.keyboard.press('Enter');assert.deepEqual(await snap(),before);
    await page.mouse.move(r.x+100,r.y+100);await page.mouse.down();await page.mouse.move(r.x+150,r.y+120);await page.keyboard.press('Escape');const cancelled=await view();await page.mouse.move(r.x+200,r.y+140);await page.mouse.up();assert.deepEqual(await view(),cancelled);assert.deepEqual(await snap(),before);
  });
  await check('Drawing and undo retain the chosen zoom/pan',async()=>{
    await tool('Carbon').click();assert.equal(await tool('Pan canvas').getAttribute('aria-pressed'),'false');const camera=await view();const r=await canvas.boundingBox();await canvas.click({position:{x:r.width*.2,y:r.height*.75}});await flush();assert.equal((await snap()).drawings['1'].graph.atoms.length,2);assert.deepEqual(await view(),camera);
    await tool('Undo').click();await flush();assert.equal((await snap()).drawings['1'].graph.atoms.length,1);assert.deepEqual(await view(),camera);
    await tool('Fit molecule').click();assert(Math.abs((await view()).scale-1.4)<.001);
  });
  await check('Zoom limits preserve centre and aspect ratio',async()=>{
    for(let i=0;i<12;i++)if(await tool('Zoom in').isEnabled())await tool('Zoom in').click();assert(await tool('Zoom in').isDisabled());const v=await view();assert(Math.abs(v.scale-4)<.001);
    for(let i=0;i<30;i++)if(await tool('Zoom out').isEnabled())await tool('Zoom out').click();assert(await tool('Zoom out').isDisabled());assert(Math.abs((await view()).scale-.15)<.001);await tool('Fit molecule').click();
  });
  await check('Responsive toolbar, larger labels and touch panning',async()=>{
    for(const width of [1440,820,390,350]){
      await page.setViewportSize({width,height:900});await tool('Fit molecule').click();const r=await canvas.boundingBox();const s=await view();
      assert(Math.abs(s.w/s.h-r.width/r.height)<.01);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      for(const name of ['Zoom in','Zoom out','Pan canvas','Fit molecule']){const b=await tool(name).boundingBox();assert(b.x>=0&&b.x+b.width<=width);assert(b.height>=44);}
      await page.screenshot({path:path.join(out,'toolbar-'+width+'.png')});report.layouts.push({width,scale:s.scale,canvas:r});
    }
    await tool('Pan canvas').click();const before=await snap(),a=await view(),r=await canvas.boundingBox();const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width/2+40,y:r.y+130}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
    assert.notEqual((await view()).x,a.x);assert.deepEqual(await snap(),before);
    await d.getByRole('button',{name:'Done',exact:true}).click();await flush();await page.reload();await page.locator('[data-isomer-box="1"]').click();assert.equal((await snap()).drawings['1'].graph.atoms.length,1);assert((await view()).scale>1);
  });
  await check('C3 read-only structures support zoom and hand without edits',async()=>{
    await page.goto(base+'&activity=alevel/c3l6-organic-reactions&mode=teacher');await page.getByRole('button',{name:'Part (b)',exact:true}).click();await page.getByRole('button',{name:/Draw structure A|Edit structure A|Structure A/}).first().click();await d.waitFor();
    const before=await snap();assert(await tool('Clear structure').isDisabled());await tool('Zoom in').click();await tool('Pan canvas').click();const r=await canvas.boundingBox(),a=await view();await drag(r.x+100,r.y+100,30,40);assert.notEqual((await view()).x,a.x);assert.deepEqual(await snap(),before);await page.screenshot({path:path.join(out,'c3-readonly-350.png')});
  });
  assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;await page.screenshot({path:path.join(out,'failure.png')});}
finally{fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
