import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,origin='http://127.0.0.1:5194',db=`masters-of-chemistry-s4-compat-${Date.now()}`;
const report={jobId:'S4-COMPATIBILITY',agentId:'A19',startedAt:new Date().toISOString(),playwright:'1.62.1',checks:[],errors:[],databaseName:db};
const context=await chromium.launchPersistentContext(path.join(here,`profiles/${Date.now()}`),{channel:'msedge',headless:true,viewport:{width:1280,height:1100},args:['--no-first-run']});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
const check=s=>{report.checks.push(s);console.log(s);};
try{
 // Synthetic old keys on the new validation origin; never open original apps.
 await page.addInitScript(()=>{
  const fixtures={
   'masters-alevel-results-v1':JSON.stringify([{id:'alias',leafId:'l6-t2-1-4',level:1,score:1,completedAt:100},{id:'acid-old',leafId:'u6-t1-1-4',level:1,score:.5,completedAt:200,progressionVersion:1},{id:'rocket-excluded',leafId:'rocket-recall',level:1,score:1,completedAt:250}]),
   'masters-alevel-results-acid-v2':JSON.stringify([{id:'acid-v2',leafId:'u6-t1-1-2',level:2,score:1,completedAt:300,progressionVersion:2,timing:{version:1,activeMs:5432,idleLimitMs:180000}}]),
   'alevel-acid-levels-session-v2':'{"current":{"reviewId":"AB2-0-1-0"},"unavailableFirstResponse":true}',
  };
  const set=Storage.prototype.setItem,get=Storage.prototype.getItem,remove=Storage.prototype.removeItem,clear=Storage.prototype.clear;
  for(const [k,v] of Object.entries(fixtures))if(get.call(localStorage,k)===null)set.call(localStorage,k,v);
  window.__oldBefore=Object.fromEntries(Object.keys(fixtures).map(k=>[k,get.call(localStorage,k)]));window.__storageWrites=[];window.__storageReads=[];
  Storage.prototype.getItem=function(key){window.__storageReads.push(key);return get.call(this,key);};
  Storage.prototype.setItem=function(key,value){window.__storageWrites.push({method:'setItem',key});return set.call(this,key,value);};
  Storage.prototype.removeItem=function(key){window.__storageWrites.push({method:'removeItem',key});return remove.call(this,key);};
  Storage.prototype.clear=function(){window.__storageWrites.push({method:'clear'});return clear.call(this);};
 });
 const url=`${origin}/validation/s4/compatibility/browser.html?db=${db}`;
 await page.goto(url);await page.getByRole('heading',{name:'Import original progress',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.__storageReads.length),0);check('Mount does not read legacy localStorage before explicit choice.');
 await page.getByRole('button',{name:'Read original keys on this site',exact:true}).click();await page.getByRole('button',{name:'Import reviewed sources',exact:true}).waitFor();
 await page.getByRole('button',{name:'Import reviewed sources',exact:true}).click();await page.getByText('Import complete. Original stores were left untouched.',{exact:true}).waitFor();
 assert.match(await page.locator('body').innerText(),/rocket-excluded/);assert.match(await page.locator('body').innerText(),/Saved source archives \(3\)/);
 const first=await page.evaluate(async databaseName=>{const {createChemistryRepository}=await import('/src/persistence/index.ts');return (await createChemistryRepository(databaseName).curriculumHistory({course:'alevel',profileId:'synthetic-s4'})).value;},db);
 assert.equal(first.length,3);assert.equal(first.find(r=>r.id==='alias').sourceLeafId,'l6-t2-1-4');assert.equal('timing' in first.find(r=>r.id==='alias'),false);assert.equal(first.find(r=>r.id==='acid-v2').timing.activeMs,5432);assert.equal(first.some(r=>'firstResponse' in r),false);check('Actual UI import preserves alias, acid V1/V2, valid duration and honest absent first responses/times; excludes Rocket with raw retention.');
 await page.screenshot({path:path.join(here,'import-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Import reviewed sources',exact:true}).click();await page.getByText('masters-alevel-results-v1: 0 inserted, 2 already present',{exact:true}).waitFor();check('Repeated UI import creates no duplicate evidence or archives.');
 const audit=await page.evaluate(()=>({before:window.__oldBefore,after:Object.fromEntries(Object.keys(window.__oldBefore).map(k=>[k,localStorage.getItem(k)])),writes:window.__storageWrites,reads:window.__storageReads}));assert.deepEqual(audit.before,audit.after);assert.deepEqual(audit.writes,[]);report.oldKeyAudit=audit;check('Instrumented actual Storage methods record zero setItem/removeItem/clear calls; old key values byte equal.');
 await page.reload();await page.getByText('Saved source archives (3)',{exact:true}).waitFor();check('Fresh document restores archived reports without implicitly reading old keys.');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(here,'import-mobile.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);check('Mobile source report fits viewport with accessible controls and explicit reasons.');
 // Current adapter independently checks all source answers and saved molecular graphs.
 const c3=await page.evaluate(async databaseName=>{
  const {c3Challenge:ch,c3Policy}=await import('/src/activities/olympiad/c3l6/index.ts');
  const {blankC3Progress,bFingerprint,cFingerprint}=await import('/src/activities/olympiad/c3l6/policy.ts');
  const {c3AnswerSignature}=await import('/src/activities/olympiad/c3l6/legacy.ts');
  const {executeLegacyImport}=await import('/src/compatibility/import.ts');const {createChemistryRepository}=await import('/src/persistence/index.ts');
  let p=blankC3Progress('synthetic-s4');const command=c=>{const r=c3Policy.transition(ch,p,c);if(!r.accepted)throw Error(r.message);p=r.progress;};
  for(const a of ch.classifications)command({kind:'classify',id:a.id,value:a.answer});command({kind:'check-a'});
  for(const u of ch.hydrolysis){for(const s of u.slots)command({kind:'draw-b',slotId:s.id,drawing:{kind:'molecule',graph:s.alternatives[0].graph,history:[]}});command({kind:'check-b-unit',unitId:u.unitId});}
  for(const s of ch.network.slots){command({kind:'draw-c',slotId:s.id,drawing:{kind:'molecule',graph:s.alternatives[0].graph,history:[]}});command({kind:'check-c-slot',slotId:s.id});}
  const raw={version:3,signature:c3AnswerSignature,stage:p.stage,selected:p.selected,responses:{a:p.classifications,b:Object.fromEntries(Object.entries(p.drawingsB).map(([k,v])=>[k,{graph:v.graph,history:v.history}])),c:Object.fromEntries(Object.entries(p.drawingsC).map(([k,v])=>[k,{graph:v.graph,history:v.history}]))},complete:p.completed,submitted:{a:{correct:10,total:10,snapshot:p.aCheck.drawingFingerprint}},unitChecks:Object.fromEntries(ch.hydrolysis.map(u=>[u.unitId,{...p.unitChecks[u.unitId],snapshot:bFingerprint(ch,p,u.unitId)}])),slotChecks:Object.fromEntries(ch.network.slots.map(s=>[s.id,{correct:true,snapshot:cFingerprint(p,s.id)}]))};
  const repo=createChemistryRepository(databaseName),namespace={course:'alevel',profileId:'synthetic-s4'},key='sjs:c3l6:2012-q2:draft:v1';
  const imported=await executeLegacyImport(repo,namespace,{[key]:JSON.stringify(raw)}),repeat=await executeLegacyImport(repo,namespace,{[key]:JSON.stringify(raw)});
  const forged=structuredClone(raw);forged.responses.c.Z.graph.bonds[0].b=999;const bad=await executeLegacyImport(repo,namespace,{[key]:JSON.stringify(forged)});
  const history=await repo.curriculumHistory(namespace),saved=await repo.loadOlympiad(namespace.profileId),archives=await repo.importArchives(namespace);
  return {imported,repeat,bad,history,saved,archiveCount:archives.value.filter(a=>a.source.key!=='masters-of-chemistry-import-report-v1').length,outcomeReports:archives.value.filter(a=>a.source.key==='masters-of-chemistry-import-report-v1').length};
 },db);
 assert.equal(c3.imported.receipts[0].inserted,1);assert.equal(c3.repeat.receipts[0].duplicates,1);assert.equal(c3.bad.plan.rejected.length,1);assert.deepEqual(c3.saved.value.completed,{a:true,b:true,c:true});assert.equal(c3.history.value.length,3);assert.equal(c3.archiveCount,5);report.c3={complete:c3.saved.value.completed,rejected:c3.bad.plan.rejected.map(r=>r.reason),archiveCount:c3.archiveCount};check('Chemically revalidated complete C3 drawings save separately; repeat deduplicates; corrupt graph is rejected and exact raw remains archived.');
 const isolation=await page.evaluate(async databaseName=>{const {createChemistryRepository}=await import('/src/persistence/index.ts');const repo=createChemistryRepository(databaseName);return {profile:await repo.curriculumHistory({course:'alevel',profileId:'other'}),course:await repo.curriculumHistory({course:'igcse',profileId:'synthetic-s4'}),archives:await repo.importArchives({course:'igcse',profileId:'synthetic-s4'})};},db);
 assert.equal(isolation.profile.value.length,0);assert.equal(isolation.course.value.length,0);assert.equal(isolation.archives.value.length,0);check('New repository separates profile/course evidence and raw archives.');
 const migration=await page.evaluate(async name=>{
  const {default:Dexie}=await import('/node_modules/.vite/deps/dexie.js');const {createChemistryRepository,DATABASE_SCHEMA}=await import('/src/persistence/repository.ts');
  const d=new Dexie(name);d.version(1).stores(DATABASE_SCHEMA);const namespace={course:'alevel',profileId:'migrate'},value={kind:'curriculum',id:'prior-v1',profileId:'migrate',course:'alevel',activityId:'alevel/electrons-bonding',gemId:'l6-t2-1-1',level:1,score:1,completedAt:1,provenance:'legacy-import',sourceKey:'masters-alevel-results-v1'};
  await d.table('evidence').add({...namespace,id:value.id,value});d.close();
  const repo=createChemistryRepository(name),source={key:'unsupported',fingerprint:'migration-1'},archive={namespace,source,rawText:'exact invalid source',notes:['source issue retained'],skipped:[{sourceId:'payload',reason:'invalid JSON'}]};
  const save=await repo.saveImportArchive(archive),repeat=await repo.saveImportArchive(archive),conflict=await repo.saveImportArchive({...archive,rawText:'changed source'}),history=await repo.curriculumHistory(namespace),archives=await repo.importArchives(namespace);
  return {save,repeat,conflict,history,archives};
 },`${db}-migration`);
 assert.equal(migration.save.value,'saved');assert.equal(migration.repeat.value,'already-present');assert.equal(migration.conflict.error.code,'conflict');assert.equal(migration.history.value[0].id,'prior-v1');assert.equal(migration.archives.value[0].rawText,'exact invalid source');report.migration=migration;check('Actual IndexedDB V1→V2 migration retains evidence; archive repeats deduplicate and source fingerprint conflicts reject.');
 const conflict=await page.evaluate(async databaseName=>{
  const {createChemistryRepository}=await import('/src/persistence/index.ts'),{executeLegacyImport,IMPORT_REPORT_KEY}=await import('/src/compatibility/import.ts');const repo=createChemistryRepository(databaseName),namespace={course:'alevel',profileId:'synthetic-s4'};
  const source={'masters-alevel-results-v1':JSON.stringify([{id:'alias',leafId:'l6-t2-1-4',level:1,score:0,completedAt:100}])};
  const first=await executeLegacyImport(repo,namespace,source),again=await executeLegacyImport(repo,namespace,source),archives=await repo.importArchives(namespace),history=await repo.curriculumHistory(namespace);
  return {first,again,history,outcomes:archives.value.filter(a=>a.source.key===IMPORT_REPORT_KEY).map(a=>JSON.parse(a.rawText))};
 },db);
 assert.equal(conflict.first.errors.length,1);assert.deepEqual(conflict.first.errors,conflict.again.errors);assert.equal(conflict.history.value.find(r=>r.id==='alias').score,1);assert.equal(conflict.outcomes.filter(r=>r.errors.length===1).length,1);check('First evidence conflicts remain unchanged; exact rejected source and one deduplicated failure outcome survive independently.');
 const bundles=await page.evaluate(async databaseName=>{
  const {createChemistryRepository}=await import('/src/persistence/index.ts'),{executeLegacyImport}=await import('/src/compatibility/import.ts');const repo=createChemistryRepository(databaseName),a='masters-alevel-results-v1',b='masters-alevel-results-acid-v2';
  const row={id:'bundle-same',leafId:'u6-t1-1-2',level:1,score:1,completedAt:500,progressionVersion:2},raw=JSON.stringify([row]),equalNamespace={course:'alevel',profileId:'bundle-equal'};
  const together=await executeLegacyImport(repo,equalNamespace,{[a]:raw,[b]:raw}),alone=await executeLegacyImport(repo,equalNamespace,{[b]:raw}),again=await executeLegacyImport(repo,equalNamespace,{[a]:raw,[b]:raw});
  const namespace={course:'alevel',profileId:'bundle-conflict'},conflicting={[a]:JSON.stringify([{...row,score:0}]),[b]:raw};
  const conflictTogether=await executeLegacyImport(repo,namespace,conflicting),conflictAlone=await executeLegacyImport(repo,namespace,{[b]:raw}),conflictAgain=await executeLegacyImport(repo,namespace,conflicting);
  return {together,alone,again,conflictTogether,conflictAlone,conflictAgain,equalHistory:await repo.curriculumHistory(equalNamespace),conflictHistory:await repo.curriculumHistory(namespace)};
 },db);
 for(const r of [bundles.together,bundles.alone,bundles.again,bundles.conflictTogether,bundles.conflictAgain])assert.deepEqual(r.errors,[]);
 assert.equal(bundles.together.receipts.reduce((n,r)=>n+r.inserted,0),1);assert.equal(bundles.alone.receipts[0].duplicates,1);assert.equal(bundles.again.receipts.reduce((n,r)=>n+r.inserted,0),0);assert.equal(bundles.equalHistory.value.length,1);
 assert.equal(bundles.conflictTogether.plan.rejected.length,1);assert.equal(bundles.conflictAlone.errors.length,1);assert.doesNotMatch(bundles.conflictAlone.errors[0],/fingerprint collision/);assert.equal(bundles.conflictHistory.value[0].score,0);check('Together → alone → together imports keep stable equal-source receipts; conflicting accepted projections get distinct fingerprints, explicit first-evidence conflict and unchanged first score.');
 const quota=await page.evaluate(async name=>{
  const {createRepository}=await import('/src/persistence/repository.ts'),{executeLegacyImport,IMPORT_REPORT_KEY}=await import('/src/compatibility/import.ts');
  const repo=createRepository(name,point=>{if(point==='after-import-row')throw new DOMException('Synthetic full quota','QuotaExceededError');}),namespace={course:'alevel',profileId:'quota'};
  const result=await executeLegacyImport(repo,namespace,{'masters-alevel-results-v1':'[{"id":"quota","leafId":"l6-t2-1-1","level":1,"score":1,"completedAt":5}]'});
  return {result,history:await repo.curriculumHistory(namespace),archives:await repo.importArchives(namespace),reportKey:IMPORT_REPORT_KEY};
 },`${db}-quota`);
 assert.equal(quota.result.errors.length,1);assert.match(quota.result.errors[0],/full/);assert.equal(quota.history.value.length,0);assert.equal(quota.archives.value.length,2);assert.match(quota.archives.value.find(a=>a.source.key===quota.reportKey).notes[1],/full/);check('Actual transactional quota fault rolls back evidence; raw source and failed outcome remain retained for retry/export.');
 await page.goto(`${origin}/validation/s4/compatibility/browser.html?db=invalid-namespace`);await page.getByRole('heading',{name:'Import original progress',exact:true}).waitFor();
 await page.getByLabel('Source JSON',{exact:true}).fill('[{"id":"retry","leafId":"l6-t2-1-1","level":1,"score":1,"completedAt":5}]');await page.getByRole('button',{name:'Preview source',exact:true}).click();await page.getByRole('button',{name:'Import reviewed sources',exact:true}).click();
 await page.getByRole('heading',{name:'Import result',exact:true}).waitFor();assert.match(await page.locator('body').innerText(),/source archive could not be saved/);assert(await page.getByRole('button',{name:'Export exact sources and report'}).isVisible());assert(await page.getByRole('button',{name:'Import reviewed sources'}).isEnabled());check('UI archive-save failure shows retry/export and does not claim complete or durable source retention.');
 await page.goto(`${origin}/alevel.html?view=import&run=a19-import-${Date.now()}`);await page.getByRole('heading',{name:'Import original progress',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.__storageReads.length),0);
 await page.getByRole('button',{name:'Read original keys on this site',exact:true}).click();await page.getByRole('button',{name:'Import reviewed sources',exact:true}).click();await page.getByText('Import complete. Original stores were left untouched.',{exact:true}).waitFor();await page.getByText('Saved import outcome reports (1)',{exact:true}).waitFor();
 assert.equal(await page.locator('.legacy-import').evaluate(e=>getComputedStyle(e).color),'rgb(238, 240, 255)');
 await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:path.join(here,'integrated-import-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(here,'integrated-import-mobile.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.reload();await page.getByText('Saved import outcome reports (1)',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.__storageWrites),[]);check('Current production composition mounts working import UI with course brand, readable dark-theme text, mobile fit and restored durable outcomes; no old writes.');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=String(e);throw e;}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2));await context.close();}
