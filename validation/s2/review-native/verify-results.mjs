import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=import.meta.dirname,report=JSON.parse(readFileSync(resolve(here,'latest-results.json'),'utf8'));
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
assert.equal(report.status,'PASS');assert.equal(report.noDefaults,true);assert.equal(report.playwright,'1.62.1');assert.equal(report.sourceUnchanged,true);assert.deepEqual(report.sourceBefore,report.sourceAfter);assert.deepEqual(report.pageErrors,[]);
assert.deepEqual(report.cases.map(c=>[c.id,c.allowance]),[['acid-60000',60000],['structure-180000',180000],['dot-180000',180000],['dot-300000',300000]]);
for(const c of report.cases){
 assert.equal(c.status,'PASS');assert(c.actualIdleWallMs>=c.allowance);assert(c.idleDeltaMs>=c.allowance-1800&&c.idleDeltaMs<=c.allowance+500);assert.equal(c.firstTiming.idleLimitMs,c.allowance);assert.notEqual(c.initialAttemptId,c.nextAttemptId);
 const o=Object.fromEntries(c.observations.map(value=>[value.label,value]));
 assert.equal(o.foreground.hidden,false);assert.equal(o.foreground.focused,true);
 assert.equal(o['native other tab foreground'].hidden,true);assert.equal(o['native other tab foreground'].focused,false);assert.equal(o['after background interval'].activeMs,o['native other tab foreground'].activeMs);assert.equal(o['foreground without input'].activeMs,o['native other tab foreground'].activeMs);assert(o['trusted key resumes'].activeMs>o['foreground without input'].activeMs);
 assert.equal(o.minimized.window.bounds.windowState,'minimized');assert.equal(o.minimized.hidden,true);assert.equal(o.minimized.focused,false);assert.equal(o['minimized interval'].activeMs,o.minimized.activeMs);assert.equal(o['restore without input'].activeMs,o.minimized.activeMs);assert(o['input after restore'].activeMs>o.minimized.activeMs);
 assert(c.suspensionWallMs>=6500);assert.equal(o['after native lifecycle thaw'].activeMs,o['before native lifecycle freeze'].activeMs);assert.equal(o['native foreground after thaw'].hidden,false);assert.equal(o['native foreground after thaw'].activeMs,o['after native lifecycle thaw'].activeMs);assert(o['trusted input after thaw'].activeMs>o['after native lifecycle thaw'].activeMs);
 assert.equal(o['after cutoff no input'].activeMs,o['real documented idle cutoff'].activeMs);assert.equal(o['real documented idle cutoff'].idleLimitMs,c.allowance);assert.equal(o['real documented idle cutoff'].hidden,false);assert.equal(o['real documented idle cutoff'].focused,true);
 assert(c.observations.some(value=>value.events.some(event=>event.name==='visibilitychange'&&event.hidden&&event.trusted)));assert(c.observations.some(value=>value.events.some(event=>event.name==='blur'&&!event.focused&&event.trusted)));
 assert.equal(c.checks.length,6);assert.equal(sha(resolve(here,'native-check.mjs')),report.scriptSha256);
}
const verification={status:'PASS',checkedAt:new Date().toISOString(),run:report.run,resultSha256:sha(resolve(here,`${report.run}-results.json`)),scriptSha256:report.scriptSha256,screenshots:report.cases.map(c=>({path:c.screenshot,sha256:sha(resolve(here,c.screenshot))})),cases:report.cases.map(c=>({id:c.id,allowanceMs:c.allowance,actualIdleWallMs:c.actualIdleWallMs,activeIdleDeltaMs:c.idleDeltaMs,firstTiming:c.firstTiming}))};
writeFileSync(resolve(here,'verification.json'),JSON.stringify(verification,null,2)+'\n');console.log(JSON.stringify(verification));
