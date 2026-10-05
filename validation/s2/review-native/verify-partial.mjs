import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=import.meta.dirname,sha=p=>createHash('sha256').update(readFileSync(resolve(here,p))).digest('hex');
const priorPath='a07s2-murneguj-results.json',prior=JSON.parse(readFileSync(resolve(here,priorPath),'utf8')),tail=JSON.parse(readFileSync(resolve(here,'tail-results.json'),'utf8'));
assert.equal(prior.status,'ESCALATE');assert.equal(tail.status,'ESCALATE');assert(prior.sourceUnchanged&&tail.sourceUnchanged);assert.deepEqual(prior.pageErrors,[]);assert.deepEqual(tail.pageErrors,[]);assert.equal(prior.playwright,'1.62.1');assert.equal(tail.playwright,'1.62.1');assert(prior.noDefaults&&tail.noDefaults);
const acid=prior.cases.find(c=>c.id==='acid-60000'),structure=prior.cases.find(c=>c.id==='structure-180000'),dot=tail.cases.find(c=>c.id==='dot-180000');
assert.equal(acid.status,'PASS');assert.equal(tail.structureContinuation.status,'PASS');assert.equal(structure.initialAttemptId,tail.structureContinuation.priorAttemptId);
for(const c of [acid,structure,dot]){
 const o=Object.fromEntries(c.observations.map(v=>[v.label,v]));
 assert.equal(o['native other tab foreground'].hidden,true);assert.equal(o['native other tab foreground'].focused,false);assert.equal(o['native other tab foreground'].activeMs,o['after background interval'].activeMs);assert.equal(o['foreground without input'].activeMs,o['after background interval'].activeMs);assert(o['trusted key resumes'].activeMs>o['foreground without input'].activeMs);
 assert.equal(o.minimized.window.bounds.windowState,'minimized');assert(o.minimized.hidden&&!o.minimized.focused);assert.equal(o['minimized interval'].activeMs,o.minimized.activeMs);assert.equal(o['restore without input'].activeMs,o.minimized.activeMs);assert(o['input after restore'].activeMs>o.minimized.activeMs);
 assert(o.minimized.events.some(e=>e.trusted&&e.hidden&&e.name==='visibilitychange'));assert(o.minimized.events.some(e=>e.trusted&&!e.focused&&e.name==='blur'));
}
for(const c of [acid,structure]){
 assert(c.actualIdleWallMs>=c.allowance);assert(c.idleDeltaMs>=c.allowance-1800&&c.idleDeltaMs<=c.allowance+500);const o=Object.fromEntries(c.observations.map(v=>[v.label,v]));assert.equal(o['real documented idle cutoff'].hidden,false);assert.equal(o['real documented idle cutoff'].focused,true);assert.equal(o['after cutoff no input'].activeMs,o['real documented idle cutoff'].activeMs);
}
assert.equal(acid.firstTiming.idleLimitMs,60000);assert.equal(tail.structureContinuation.firstResponse.timing.idleLimitMs,180000);assert.notEqual(acid.initialAttemptId,acid.nextAttemptId);assert.notEqual(structure.initialAttemptId,tail.structureContinuation.nextAttemptId);
const old=Object.fromEntries(prior.sourceAfter.map(v=>[v.path,v.sha256])),current=Object.fromEntries(tail.sourceBefore.map(v=>[v.path,v.sha256]));
const changedPaths=[...new Set([...Object.keys(old),...Object.keys(current)])].filter(p=>old[p]!==current[p]);
// Only acid/structure checks are carried across the authorised UI mutation
// window. Dot-cross observations were made entirely against the final source.
for(const path of Object.keys(old).filter(p=>p.startsWith('src/domain/timing/')||p.startsWith('src/domain/attempt/')||p.startsWith('src/activities/alevel/acid-base-calculations/')||p.startsWith('src/activities/igcse/structure-and-bonding/'))){assert.equal(old[path],current[path],`Carried timing/activity source unchanged: ${path}`);}
const dotObs=Object.fromEntries(dot.observations.map(v=>[v.label,v]));
assert.equal(dotObs['before native lifecycle freeze'].activeMs,3267);assert.equal(dotObs['after native lifecycle thaw'].activeMs,4263);assert.equal(dotObs['before native lifecycle freeze'].events.length,8);assert.equal(dotObs['after native lifecycle thaw'].events.length,0);
const verification={status:'PASS_FOR_RETAINED_CHECKS',overallDisposition:'ESCALATE',checkedAt:new Date().toISOString(),evidence:[{path:priorPath,sha256:sha(priorPath)},{path:`${tail.run}-results.json`,sha256:sha(`${tail.run}-results.json`)}],unchangedCoreTimingAndActivitySources:true,authorisedUiChangesBetweenSegments:changedPaths,retainedIdle:[{id:acid.id,wallMs:acid.actualIdleWallMs,activeDeltaMs:acid.idleDeltaMs},{id:structure.id,wallMs:structure.actualIdleWallMs,activeDeltaMs:structure.idleDeltaMs}],retainedFirstTiming:[acid.firstTiming,tail.structureContinuation.firstResponse.timing],unresolved:{nativeLifecycleDeltaMs:996,nativeGlobalEventsBefore:8,nativeGlobalEventsAfter:0,dot180000Idle:'NOT_RUN',dot300000Idle:'NOT_RUN'},screenshots:[acid.screenshot,tail.structureContinuation.screenshot].map(path=>({path,sha256:sha(path)}))};
writeFileSync(resolve(here,'partial-verification.json'),JSON.stringify(verification,null,2)+'\n');console.log(JSON.stringify(verification));
