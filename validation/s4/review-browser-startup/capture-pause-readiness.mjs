import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const owned=import.meta.dirname,project=path.resolve(owned,'../../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const copies=[['validation/s4/statistics/browser-results.json','pause-readiness-browser-results.json'],['validation/s4/statistics/browser-progress.json','pause-readiness-browser-progress.json'],['validation/s4/statistics/browser-network.json','pause-readiness-browser-network.json'],['validation/s4/review-browser-startup/proposed-browser.mjs.txt','pause-readiness-original-browser.mjs.txt'],['src/foundation/ActivityHost.tsx','pause-readiness-host.tsx.txt'],['validation/s4/statistics/actual-acid-first-score-correction-pause-reload-chart-failure.png','pause-readiness-failure.png']];
const fingerprints={};
for(const [from,to] of copies){const target=path.join(owned,to);const exists=fs.existsSync(target);const bytes=fs.readFileSync(exists?target:path.join(project,from));if(!exists)fs.writeFileSync(target,bytes);fingerprints[to]={from,sha256:hash(bytes),retainedCopy:exists};}
const original=fs.readFileSync(path.join(owned,'pause-readiness-original-browser.mjs.txt'),'utf8');
const needle="await page.waitForFunction(()=>window.__mastersActivity?.snapshot().session?.paused===true);";
const replacement="await page.waitForFunction(id=>{const restored=window.__mastersActivity?.snapshot();return restored?.session?.paused===true&&restored.attempt?.attemptId===id;},paused.attempt.attemptId);";
assert.equal(original.split(needle).length,2);
const proposed=original.replace(needle,replacement);
fs.writeFileSync(path.join(owned,'pause-readiness-proposed-browser.mjs.txt'),proposed);
const report={agentId:'A06',jobId:'S4-REVIEW-BROWSER-PAUSE-READINESS',status:'PASS',checkedAt:new Date().toISOString(),confidence:0.99,classification:'Fixture readiness race; no application restore failure established',exactChange:{from:needle,to:replacement},fingerprints,proposedSha256:hash(proposed),originalSha256:hash(original),assertionsTailSha256:hash(original.slice(original.indexOf('await flush();const reloaded=await snap();'))),reason:'sessionRef is applied before await loadAttempt and await resolve; stateRef remains null until applyAttempt. flush does not await initialization.',approvedScope:'One exact readiness predicate addition, all response/time/identity and later suite assertions unchanged',limits:['Current source ordering and retained TypeError support the readiness race; no retry performed and restored state correctness still requires unchanged assertions','Screenshot captured later shows restored paused UI, not the exact failing snapshot','Earlier correct/partial/correction/reveal/reload assertions were reached successfully in this sequential execution; no standalone completed scenario PASS exists'],effectiveModelEffort:null,usage:null};
fs.writeFileSync(path.join(owned,'pause-readiness-disposition.json'),JSON.stringify(report,null,2));
