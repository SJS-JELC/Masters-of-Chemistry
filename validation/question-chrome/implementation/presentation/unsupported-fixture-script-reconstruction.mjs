import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const here = import.meta.dirname;
const project = path.resolve(here, '../../../..');
const require = createRequire(path.join(project, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
fs.mkdirSync(path.join(here, 'screens'), { recursive: true });
fs.mkdirSync(path.join(here, 'temp'), { recursive: true });
process.env.TEMP = path.join(here, 'temp');
process.env.TMP = process.env.TEMP;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const audit = JSON.parse(fs.readFileSync(path.join(project,'validation/question-chrome/audit/presentation/source-inventory.json'),'utf8'));
const immutable = audit.unchangedRuntimeBoundaries.map(row => ({...row,actual:hash(path.resolve(project,'../..',row.path))}));
assert(immutable.every(row=>row.sha256===row.actual));
const tsc=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{cwd:project,encoding:'utf8'});
fs.writeFileSync(path.join(here,'typecheck.txt'),(tsc.stdout||'')+'\n'+(tsc.stderr||''));
assert.equal(tsc.status,0,'Typecheck');
const ts = createRequire(path.join(project,'package.json'))('typescript');
const emitted=ts.transpileModule(fs.readFileSync(path.join(project,'src/shell/QuestionChrome.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
fs.writeFileSync(path.join(here,'question-chrome-compiled.mjs'),emitted);
const {questionDisplayTitle,repeatsQuestionSubtopic}=await import(pathToFileURL(path.join(here,'question-chrome-compiled.mjs')).href);
for(const [activityId,title,id,expected] of [
 ['alevel/dot-and-cross','Water, H₂O · DAC-X01234','water','Water, H₂O'],
 ['igcse/dot-and-cross','Methane · DC-X01234','methane','Methane'],
 ['alevel/ph-titration-curves','Strong acid and weak base · TC-X01234','tc-01','Strong acid and weak base'],
 ['igcse/energy-enthalpy','Reaction energy · EE-X01234','ee-01','Reaction energy'],
 ['alevel/electron-configurations','Carbon · orbital boxes · EC-01','EC-01','Carbon · orbital boxes'],
 ['igcse/energetics-practical','Energetics practical · EP-01','EP-01','Energetics practical'],
 ['alevel/electrons-bonding','Ionisation energy · EB-01','EB-01','Ionisation energy'],
 ['igcse/bond-enthalpy','Bond enthalpy · combustion of methane','BH-01','Bond enthalpy · combustion of methane'],
 ['alevel/acid-base-calculations','pH to [H⁺]','AB2-01','pH to [H⁺]'],
])assert.equal(questionDisplayTitle({title,ref:{activityId,questionId:id,seed:0,level:1}}),expected);
assert(repeatsQuestionSubtopic('Dot-and-cross diagrams',{subtopic:'Dot and Cross Diagrams'}));
assert(!repeatsQuestionSubtopic('Methane, CH₄',{subtopic:'Dot and Cross Diagrams'}));
const definitionsText=fs.readFileSync(path.join(project,'src/catalogue/definitions.ts'),'utf8');
const definitions=JSON.parse(definitionsText.slice(definitionsText.indexOf('= [')+2,definitionsText.lastIndexOf('] as const')+1));
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const report={runId:'QUESTION-CHROME-20261003',jobId:'H1-PRESENTATION',startedAt:new Date().toISOString(),browser:await browser.version(),playwright:'1.62.1',surface:'Fresh isolated headless Edge contexts, source Vite 5183; screenshots visually inspected separately. No physical mobile/native screen-reader claim.',checks:[],failures:[],pageErrors:[],immutableFiles:immutable.length,typecheck:'PASS',identityTitleFixtures:9,subtopicSuppressionFixtures:2};
async function capture(page,id,expectedPill,{olympiad=false}={}) {
  await page.locator('.header-question-code').waitFor();
  await page.locator('.question-level-pill').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const details=await page.evaluate(()=>{
    const badge=document.querySelector('.header-question-code'),style=getComputedStyle(badge);
    const text=document.body.innerText;
    return {header:document.querySelector('.question-subject').textContent,badge:badge.textContent.trim(),pill:document.querySelector('.question-level-pill').textContent.trim(),questionHeading:document.querySelector('.question-header h2,.dot-question-panel h2')?.textContent??null,badgeCount:document.querySelectorAll('.header-question-code').length,nav:document.querySelectorAll('.platform-navigation,.course-navigation').length,duplicateMeta:document.querySelectorAll('.question-meta,.dot-level,.review-id').length,overflow:document.documentElement.scrollWidth>innerWidth,body:text,badgeStyle:{colour:style.color,border:style.borderTopColor,background:style.backgroundColor,font:style.font,letterSpacing:style.letterSpacing,padding:style.padding,borderRadius:style.borderRadius},missingHeadingRefs:[...document.querySelectorAll('[aria-labelledby]')].flatMap(e=>e.getAttribute('aria-labelledby').split(/\s+/).filter(id=>!document.getElementById(id)))};
  });
  assert.equal(details.pill,expectedPill);
  assert.equal(details.badgeCount,1);
  assert.equal(details.nav,0);
  assert.equal(details.duplicateMeta,0);
  assert.equal(details.overflow,false);
  assert.equal(details.badgeStyle.colour,'rgb(255, 94, 203)');
  assert.equal(details.badgeStyle.border,'rgba(255, 94, 203, 0.46)');
  assert.equal(details.badgeStyle.background,'rgba(255, 94, 203, 0.1)');
  assert.equal(details.badgeStyle.padding,'4px 10px');
  assert.equal(details.badgeStyle.borderRadius,'999px');
  assert.equal(details.missingHeadingRefs.length,0);
  assert(!/\bPause\b|\bResume\b|Active (?:answering )?time|Timing|saved practice results|Saved on this device|Revision in progress/i.test(details.body));
  assert.equal(await page.getByRole('button',{name:'Back to course map',exact:true}).count(),2);
  if(!olympiad){
    const actual=await page.evaluate(()=>window.__mastersActivity?.snapshot());
    if(actual?.question){assert.equal(details.badge,actual.question.ref.questionId);assert.equal(details.questionHeading, repeatsQuestionSubtopic(questionDisplayTitle(actual.question),{subtopic:details.header.split(' - ').slice(1).join(' - ')})?null:questionDisplayTitle(actual.question));}
  }
  const screen=`screens/${id}.png`;
  await page.screenshot({path:path.join(here,screen),fullPage:true});
  const {body,...retained}=details;
  report.checks.push({id,status:'PASS',...retained,screen});
}
async function run(id,course,activity,level,width=1440,{teacher=false,olympiad=false}={}) {
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  page.on('pageerror',error=>report.pageErrors.push({id,message:error.message}));
  try {
    const def=definitions.find(item=>item.id===activity);
    const query=new URLSearchParams({course,activity,run:`presentation-${id}-${Date.now()}`});
    if(olympiad)query.set('view','olympiad');
    else if(teacher)query.set('view','teacher');
    else {query.set('fresh','1');query.set('gem',def.gems[0].id);query.set('level',String(level));}
    await page.goto(`http://127.0.0.1:5183/${course}.html?${query}`);
    const pill=olympiad?'OLYMPIAD QUESTION':course==='alevel'?`LEVEL ${level} QUESTION`:`${level===1?'GRADE 5–6':level===2?'GRADE 7–8':'GRADE 9'} QUESTION`;
    if(teacher){
      await page.locator('.question-player').waitFor();
      const firstPill=await page.locator('.question-level-pill').innerText();
      await capture(page,id,firstPill);
      assert(await page.getByText('This read-only view creates no assessment or progress evidence.',{exact:true}).count()||await page.getByText('Read only. This view creates no assessment or progress evidence.',{exact:true}).count());
    } else await capture(page,id,pill,{olympiad});
    if(olympiad){
      await page.getByRole('button',{name:'Start part (a)',exact:true}).click();
      await page.getByRole('heading',{name:'Part (a): classify the reactions'}).waitFor();
      await capture(page,id+'-part-a',pill,{olympiad});
    }
  } catch(error){
    report.failures.push({id,error:error.stack});
    await page.screenshot({path:path.join(here,'screens',id+'-failure.png'),fullPage:true}).catch(()=>{});
  } finally {await context.close();}
}
try {
  for(const level of [1,2,3]){
    await run(`alevel-level-${level}`,'alevel','alevel/acid-base-calculations',level,level===2?390:1440);
    await run(`igcse-grade-${level}`,'igcse','igcse/calorimetry',level,level===2?390:1440);
  }
  await run('dot-mobile','alevel','alevel/dot-and-cross',1,390);
  await run('electron-editor','alevel','alevel/electron-configurations',2);
  await run('titration-editor','alevel','alevel/ph-titration-curves',1);
  await run('energy-editor','igcse','igcse/energy-enthalpy',1);
  await run('practical-title','igcse','igcse/energetics-practical',1);
  await run('electrons-title','alevel','alevel/electrons-bonding',1);
  await run('rubric-multipart','igcse','igcse/structure-and-bonding',2);
  await run('teacher','alevel','alevel/acid-base-calculations',1,390,{teacher:true});
  await run('c3-mobile','alevel','alevel/c3l6-organic-reactions',1,390,{olympiad:true});
} finally {
  await browser.close();
  report.status=report.failures.length===0&&report.pageErrors.length===0?'PASS':'FAIL';
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(here,'verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,pageErrors:report.pageErrors}));
}
if(report.status!=='PASS')process.exitCode=1;
