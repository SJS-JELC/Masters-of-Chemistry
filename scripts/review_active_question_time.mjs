// Current source-owned timing inventory. Runtime/lifecycle acceptance remains a real-browser check.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { productionRegistry } from '../src/foundation/registry.ts';
import { IDLE_LIMITS } from '../src/domain/timing/active-clock.ts';
const project=path.resolve(import.meta.dirname,'..');
const output=process.env.ACTIVE_TIME_REVIEW_OUTPUT
 ?path.resolve(project,process.env.ACTIVE_TIME_REVIEW_OUTPUT)
 :path.join(project,'.artifacts/checks/active-question-time-review.json');
assert(output.startsWith(project+path.sep),'Review output must stay inside project');
const targets=[];
for(const course of ['alevel','igcse'])for(const registration of productionRegistry.curriculumFor(course)){
 const provider=await registration.provider();
 for(const gem of registration.gems)for(const level of gem.supportedLevels){
  const ref=provider.select({activityId:registration.id,gemId:gem.id,level,seed:42,previousQuestionIds:[]});
  const question=provider.restore(ref),idleLimitMs=registration.idleAllowance(question);
  assert(IDLE_LIMITS.includes(idleLimitMs));assert(registration.idleRationale.trim());
  targets.push({course,activityId:registration.id,gemId:gem.id,level,questionId:ref.questionId,idleLimitMs,rationale:registration.idleRationale});
 }
}
const host=fs.readFileSync(path.join(project,'src/foundation/ActivityHost.tsx'),'utf8');
for(const source of ['createActiveClock','bindBrowserAttemptTiming','assessmentToEvidence'])assert(host.includes(source),'Missing shared host timing integration '+source);
const result={status:'PASS',checkedAt:new Date().toISOString(),targets,scope:'Current registration and question-appropriate allowance inventory only; this structural report does not establish browser idle/hidden/suspension/restore/first-assessment behaviour.'};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,targets:targets.length,output:path.relative(project,output).replaceAll('\\','/'),scope:result.scope}));
