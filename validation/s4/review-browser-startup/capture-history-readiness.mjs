import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const owned=import.meta.dirname,project=path.resolve(owned,'../../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const copies=[['validation/s4/statistics/browser-results.json','history-readiness-browser-results.json'],['validation/s4/statistics/browser-network.json','history-readiness-browser-network.json'],['src/foundation/ActivityHost.tsx','history-readiness-host.tsx.txt'],['src/domain/attempt/attempt.ts','history-readiness-evidence-policy.ts.txt'],['validation/s4/statistics/actual-acid-first-score-correction-pause-reload-chart-failure.png','history-readiness-failure.png'],['validation/s4/review-browser-startup/pause-readiness-current-browser.mjs.txt','history-readiness-original-browser.mjs.txt']];
const fingerprints={};
for(const [from,to] of copies){const target=path.join(owned,to);const exists=fs.existsSync(target);const bytes=fs.readFileSync(exists?target:path.join(project,from));if(!exists)fs.writeFileSync(target,bytes);fingerprints[to]={from,sha256:hash(bytes)};}
const original=fs.readFileSync(path.join(owned,'history-readiness-original-browser.mjs.txt'),'utf8');
const needle="async function assess(){await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt?.phase==='assessed');await flush();return snap();}";
const replacement="async function assess(){await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt?.phase==='assessed');await flush();const expected=await page.evaluate(async()=>{const snapshot=window.__mastersActivity.snapshot();const {assessmentToEvidence}=await import('/src/domain/attempt/index.ts');return {attemptId:snapshot.attempt.attemptId,independent:!!assessmentToEvidence(snapshot.attempt)};});await page.waitForFunction(({attemptId,independent})=>{const snapshot=window.__mastersActivity?.snapshot();if(snapshot?.attempt?.attemptId!==attemptId||snapshot.saveStatus.kind!=='saved')return false;const present=snapshot.history.some(row=>row.id===attemptId);return independent?present:!present;},expected);return snap();}";
assert.equal(original.split(needle).length,2);
const proposed=original.replace(needle,replacement);fs.writeFileSync(path.join(owned,'history-readiness-proposed-browser.mjs.txt'),proposed);
fs.writeFileSync(path.join(owned,'history-readiness-inputs.json'),JSON.stringify({fingerprints,exactChange:{from:needle,to:replacement},originalSha256:hash(original),proposedSha256:hash(proposed)},null,2));
