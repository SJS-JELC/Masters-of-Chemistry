import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname,project=resolve(here,'../../..');
const path=resolve(here,'results.json'),raw=readFileSync(path),r=JSON.parse(raw);
const checks=[];
assert.equal(r.status,'ESCALATE');assert.match(r.failure.message,/Freeze must retain same document timeOrigin/);
for(const c of r.cases){
 assert.equal(c.status,'PASS');assert.equal(c.idle.deltaMs,c.allowance);assert(c.idle.actualWallMs>=c.allowance);assert(!c.idle.start.hidden&&c.idle.start.focused&&!c.idle.end.hidden&&c.idle.end.focused);assert.equal(c.idle.start.timeOrigin,c.idle.end.timeOrigin);assert(c.idle.keyEvent.trusted);
 assert.deepEqual(c.restored.attempt.firstResponse,c.firstResponse);assert.deepEqual(c.restored.attempt.firstAssessment,c.firstAssessment);assert.equal(c.restored.history.length,1);assert.deepEqual(c.restored.history[0].timing,c.firstResponse.timing);
 assert.notEqual(c.next.attempt.attemptId,c.initialAttemptId);assert.equal(c.next.attempt.phase,'answering');assert(c.next.attempt.timing.activeMs<1200);assert.equal(c.next.attempt.timing.idleLimitMs,c.allowance);assert.equal(c.next.history.length,1);
 checks.push({id:c.id,status:'PASS',actualWallMs:c.idle.actualWallMs,activeDeltaMs:c.idle.deltaMs,firstFrozenActiveMs:c.firstResponse.timing.activeMs,nextAttemptId:c.next.attempt.attemptId});
}
const c=r.cases.at(-1),events=c.freeze.events,freeze=events.find(e=>e.event==='freeze'&&e.stage==='after handlers'),resume=events.find(e=>e.event==='resume'&&e.stage==='after handlers');
assert(freeze&&resume&&freeze.trusted&&resume.trusted);assert(freeze.hidden&&resume.hidden);assert.equal(freeze.timeOrigin,resume.timeOrigin);assert.equal(freeze.token,resume.token);assert.equal(freeze.attempt.attemptId,resume.attempt.attemptId);assert.equal(freeze.attempt.phase,'answering');assert.equal(resume.attempt.phase,'answering');assert.equal(freeze.attempt.timing.activeMs,resume.attempt.timing.activeMs);assert(resume.wallMs-freeze.wallMs>=6500);assert(resume.monoMs-freeze.monoMs>=6500);
assert(!events.some(e=>e.event==='keydown'&&e.trusted&&e.wallMs>=freeze.wallMs&&e.wallMs<=resume.wallMs));assert(!c.freeze.navigations.some(n=>n.at>=freeze.wallMs&&n.at<=resume.wallMs));
checks.push({id:'same-document-native-suspension-boundaries',status:'PASS',freezeWallMs:freeze.wallMs,resumeWallMs:resume.wallMs,intervalMs:resume.wallMs-freeze.wallMs,monotonicIntervalMs:resume.monoMs-freeze.monoMs,activeBeforeMs:freeze.attempt.timing.activeMs,activeAfterMs:resume.attempt.timing.activeMs,activeDeltaMs:0,timeOrigin:freeze.timeOrigin,documentToken:freeze.token,attemptId:freeze.attempt.attemptId});
const after=c.observations.find(o=>o.label==='after thaw without input');assert.notEqual(after.timeOrigin,freeze.timeOrigin);assert.notEqual(after.documentToken,freeze.token);assert(c.freeze.navigations.some(n=>n.at>resume.wallMs));assert(r.console.some(m=>m.at>resume.wallMs&&m.text.includes('server connection lost')));
checks.push({id:'later-dev-document-replacement-guard',status:'EXPECTED_GUARD_FAILURE',reason:'Vite disconnect/reload follows clean native resume; later document cannot establish same-document frozen accrual',newTimeOrigin:after.timeOrigin,newToken:after.documentToken});
assert(r.sourceUnchanged);assert.deepEqual(r.sourceAfter,r.sourceBefore);assert.deepEqual(r.pageErrors,[]);
const prior=JSON.parse(readFileSync(resolve(project,r.priorEvidence.path)));
assert.equal(createHash('sha256').update(readFileSync(resolve(project,r.priorEvidence.path))).digest('hex'),r.priorEvidence.sha256);
const priorClockParity=['src/domain/timing/active-clock.ts','src/domain/timing/browser-binding.ts'].map(path=>{assert.equal(prior.sourceBefore.find(x=>x.path===path).sha256,r.sourceBefore.find(x=>x.path===path).sha256);return {path,unchangedSinceA07:true};});
const out={agentId:'A06',jobId:'S2-REVIEW-SUSPENSION',status:'PASS',verifiedAt:new Date().toISOString(),nativeExecutionStatus:r.status,nativeEvidenceSha256:createHash('sha256').update(raw).digest('hex'),checks,priorClockParity,priorDisposition:'A07 996ms is unclassified: missing native boundary/timeOrigin/navigation evidence prevents assigning it to legitimate pre-freeze time or frozen accrual. Replaced-document signs are retained. The independent run proves no accrual across trusted same-document freeze/resume and separately identifies later DEV replacement.',limits:['No claim about A07 missing 996ms boundary attribution','The later Vite replacement prevents a same-document post-thaw stability/foreground interval in this optional probe; native freeze/resume boundary proof is complete','Already accepted acid/structure/background/minimized/pause intervals were not repeated','No source changes, production deployment, or original-app storage access'],usage:null,effectiveModelEffort:null};
writeFileSync(resolve(here,'disposition.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,checks:checks.length,suspensionIntervalMs:resume.wallMs-freeze.wallMs,activeDeltaMs:0}));
