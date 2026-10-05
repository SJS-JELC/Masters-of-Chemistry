import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const owned=import.meta.dirname,project=path.resolve(owned,'../../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const record=JSON.parse(fs.readFileSync(path.join(owned,'inputs.json'),'utf8'));
const read=f=>fs.readFileSync(path.join(project,f),'utf8').replaceAll('\r\n','\n');
const retained=f=>fs.readFileSync(path.join(project,record.files[f].path),'utf8').replaceAll('\r\n','\n');
const checks=[],currentChanges=[];
for(const [f,v] of Object.entries(record.files)){
 assert.equal(sha(fs.readFileSync(path.join(project,v.path))),v.sha256);
 const current=sha(fs.readFileSync(path.join(project,f)));
 if(current!==v.sha256)currentChanges.push({file:f,retained:v.sha256,current});
}
checks.push('All 26 retained artifacts match captured SHA256; current changes separately recorded.');
const proposalPath='validation/s5/behaviour/proposed-deep-browser-v3.mjs';
const proposalBytes=fs.readFileSync(path.join(project,proposalPath));
assert.equal(sha(proposalBytes),'0d4b3be1e3ce929485dbffddbaf46d8073e256a6cab08c9d255fe4d826124263');
const proposalCopy=path.join(owned,'retained/proposed-deep-browser-v3.mjs.txt');
if(!fs.existsSync(proposalCopy))fs.writeFileSync(proposalCopy,proposalBytes);
assert.equal(sha(fs.readFileSync(proposalCopy)),sha(proposalBytes));
const original=retained('validation/s5/behaviour/deep-browser.mjs').trim();
const v1=retained('validation/s5/behaviour/proposed-deep-browser.mjs');
const v3=proposalBytes.toString().replaceAll('\r\n','\n');
let reduced=v3;
const helperStart=reduced.indexOf('async function usePartialFixture(course){');
const helperEnd=reduced.indexOf('async function fill(q,mode)',helperStart);
assert(helperStart>0&&helperEnd>helperStart);
const helper=reduced.slice(helperStart,helperEnd);
reduced=reduced.slice(0,helperStart)+reduced.slice(helperEnd);
const call="if(mode==='partial')await usePartialFixture(course);";
assert.equal(reduced.split(call).length,2);
reduced=reduced.replace(call,'');
assert.equal(reduced.trim(),v1.trim());
checks.push('v3 differs from v1 only by partial-only fixture setup helper and one call.');
assert(helper.includes("await page.goto('http://127.0.0.1:5201/probe.html');const old="));
assert(helper.includes('await page.goto(returnURL)'));
assert(helper.indexOf("page.goto('http://127.0.0.1:5201/probe.html')")<helper.indexOf('saveCurriculum'));
assert(helper.includes("currentResponses:{},assistance:[],phase:'answering'"));
assert(helper.includes('activeMs:0,idleLimitMs:reg.idleAllowance(question),finished:false'));
assert(!helper.includes('evidence:')&&!helper.includes('firstAssessment:')&&!helper.includes('firstResponse:'));
assert(helper.includes("assert.equal(mounted.attemptId,'s5-fixed-partial-'+course);assert.deepEqual(mounted.ref,ref)"));
checks.push('Old host unloaded before replacement repository write; fresh unassessed source fixture restores through production UI, exact ID/ref checked.');
const waitStart=reduced.indexOf('await page.waitForFunction(async ({course,oldId})=>');
const waitEnd=reduced.indexOf("await page.locator('.question-player').waitFor();",waitStart);
assert(waitStart>0&&waitEnd>waitStart);
const wait=reduced.slice(waitStart,waitEnd);
assert(wait.includes('session.currentAttemptId===oldId'));
assert(wait.includes("db.transaction('attempts')"));
assert(wait.includes("document.querySelector('.question-meta code')?.textContent===attempt.ref.questionId"));
reduced=reduced.slice(0,waitStart)+reduced.slice(waitEnd);
const replacements=[
 ["response:{kind:'numeric',raw:String(p.acceptance.expected),unit:p.unit}","response:{kind:'numeric',value:String(p.acceptance.expected)}"],
 ["response:{kind:'numeric',raw:'999',unit:q.parts[0].unit}","response:{kind:'numeric',value:'999'}"]
];
for(const [correct,prior] of replacements){assert.equal(reduced.split(correct).length,2);reduced=reduced.replace(correct,prior);}
assert.equal(reduced.trim(),original);
checks.push('Deep script identical to failed original after removing approved setup/readiness additions and reverting two typed response repairs. All original assertions preserved.');
const imported=retained('validation/s5/behaviour/proposed-import-browser.mjs');
assert.equal(sha(fs.readFileSync(path.join(project,record.files['validation/s5/behaviour/proposed-import-browser.mjs'].path))),'9ca375bd374dc6dbedfb5a65aef36f07699fd48c0c3fee47952be02b31d9db8b');
assert.equal(imported.replace("page.locator('.legacy-import textarea').fill(raw)","page.getByLabel('Source JSON',{exact:true}).fill(raw)").trim(),retained('validation/s5/behaviour/import-browser.mjs').trim());
checks.push('Import proposal has exactly one locator replacement; source content and all import assertions unchanged.');
const dom=JSON.parse(fs.readFileSync(path.join(owned,'dom-probe.json'),'utf8'));
assert.equal(dom.errors.length,0);
for(const c of dom.cases){assert.equal(c.before.exactLabelCount,1);assert.equal(c.after.exactLabelCount,0);assert.equal(c.before.scopedCount,1);assert.equal(c.after.scopedCount,1);}
checks.push('Both actual production import views independently reproduce changing wrapped-label name; scoped textarea stable.');
assert(record.actualSourceTranspile.withoutFileNameDiagnostics.length>0);
assert.equal(record.actualSourceTranspile.withFileNameDiagnostics.length,0);
const server=retained('validation/s5/behaviour/server.mjs');
assert(server.includes('fileName:file')&&server.includes("'.mjs':'text/javascript'"));
checks.push('Actual installed TypeScript source transform fails without filename and succeeds with .ts filename; current server has exact MIME/filename repairs.');
const {acidProvider}=await import('../../../src/activities/alevel/acid-base-calculations/provider.ts');
const {acidMarking}=await import('../../../src/activities/alevel/acid-base-calculations/marking.ts');
const {calorimetryProvider}=await import('../../../src/activities/igcse/calorimetry/provider.ts');
const {calorimetryMarking}=await import('../../../src/activities/igcse/calorimetry/marking.ts');
const proofBytes=fs.readFileSync(path.join(project,record.files['validation/s5/behaviour/multipart-source-proof.jsonl'].path));
const proofText=proofBytes.subarray(0,2).equals(Buffer.from([255,254]))?proofBytes.subarray(2).toString('utf16le'):proofBytes.toString('utf8');
const proof=proofText.trim().split('\n').map(JSON.parse),partial=[];
for(const p of proof){const provider=p.course==='alevel'?acidProvider:calorimetryProvider,policy=p.course==='alevel'?acidMarking:calorimetryMarking,q=provider.restore(p.ref);assert.equal(q.parts.length,3);const responses={};
 for(let i=0;i<q.parts.length;i++){const part=q.parts[i];assert.equal(part.kind,'numeric');assert.equal(part.acceptance.expected,p.parts[i].acceptance.expected);assert.equal(part.unit,p.parts[i].unit);responses[part.id]={kind:'numeric',raw:String(i===0?part.acceptance.expected:part.acceptance.expected+Math.max(100,Math.abs(part.acceptance.expected)*2)),unit:part.unit};}
 const result=policy.mark(q,responses);assert(result.accepted);assert(result.marks.earned>0&&result.marks.earned<result.marks.available);partial.push({course:p.course,ref:p.ref,parts:q.parts.length,marks:result.marks});
}
checks.push('Actual source provider/marking restores both exact multipart refs and planned answers yield 1/3 marks. No clock/visibility mocking or browser suite replay.');
const result={agentId:'A06',jobId:'S5-REVIEW-BEHAVIOUR-HARNESS',verifiedAt:new Date().toISOString(),status:'PASS',scope:'Approved harness continuation only; substantive worker behaviour remains pending',checks,currentChanges,partial,proposals:{deep:{path:proposalPath,sha256:sha(proposalBytes)},import:{path:'validation/s5/behaviour/proposed-import-browser.mjs',sha256:'9ca375bd374dc6dbedfb5a65aef36f07699fd48c0c3fee47952be02b31d9db8b'},server:{path:'validation/s5/behaviour/server.mjs',sha256:'747cb5f6f51c610a5769fcd6780a94b4e2bfed4dd51b7ad295a9abcbc90ef385'}}};
fs.writeFileSync(path.join(owned,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks:checks.length,currentChanges,partial:partial.map(p=>({course:p.course,earned:p.marks.earned,available:p.marks.available}))}));
