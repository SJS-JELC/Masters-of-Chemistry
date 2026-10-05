import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateAttempt,validateEvidence,validateSession,validateImport} from '../../../../../../src/persistence/validation.ts';
import {planLegacyImport,CURRENT_IMPORT_KEY} from '../../../../../../src/persistence/legacy/plan.ts';
import {readableLegacyKeys} from '../../../../../../src/compatibility/import.ts';
import {alphaDatabaseName,ALPHA_COURSE_PREFERENCE_KEY,ALPHA_LANDING_PREFERENCE_PREFIX} from '../../../../../../src/persistence/alpha-namespace.ts';
import {acidProvider} from '../../../../../../src/activities/alevel/acid-base-calculations/provider.ts';
import {electronsBondingProvider} from '../../../../../../src/activities/alevel/electrons-bonding/provider.ts';
const batch=JSON.parse(fs.readFileSync(new URL('../../../../fixtures/legacy/component-fidelity/f1-correction/identity/current-export.json',import.meta.url),'utf8')),namespace=batch.namespace,evidence=batch.curriculum[0];
const copy=x=>JSON.parse(JSON.stringify(x));
test('current ImportBatch preserves canonical refs, first evidence and all timing; old format rejected',async()=>{
 validateImport(batch);validateEvidence(evidence);
 const plan=await planLegacyImport(namespace,{[CURRENT_IMPORT_KEY]:JSON.stringify(batch)});assert.equal(plan.rejected.length,0);assert.deepEqual(plan.batches[0].curriculum,batch.curriculum);
 for(const sourceKey of ['masters-alevel-results-v1','masters-alevel-results-acid-v2','masters-igcse-results-v2','sjs:c3l6:2012-q2:draft:v1']){const rejected=await planLegacyImport(namespace,{[sourceKey]:JSON.stringify(batch)});assert.equal(rejected.batches.length,0);assert.equal(rejected.rejected.length,1);}
 assert.deepEqual(readableLegacyKeys('alevel'),[]);assert.deepEqual(readableLegacyKeys('igcse'),[]);
 for(const change of [{questionId:'AB2-0-1-7'},{questionId:'TC-000000'},{seed:8},{level:2},{questionId:'AB-ZZZZZZ'}]){const invalid=copy(batch);Object.assign(invalid.curriculum[0].ref,change);const rejected=await planLegacyImport(namespace,{[CURRENT_IMPORT_KEY]:JSON.stringify(invalid)});assert.equal(rejected.batches.length,0);assert.equal(rejected.rejected.length,1);}
 const legacy=copy(batch);legacy.curriculum[0].provenance='legacy-import';legacy.curriculum[0].sourceKey='masters-alevel-results-v1';assert.throws(()=>validateImport(legacy));
});
test('canonical practice/session history and attempt serializer reject incompatible refs',()=>{
 const session={kind:'practice',namespace,id:'F1-session',target:{course:'alevel',activityId:'alevel/acid-base-calculations',gemId:'u6-t1-1-2',level:1},selection:'fixed-level',currentAttemptId:evidence.id,previousQuestionIds:[evidence.ref.questionId],paused:true};validateSession(session);assert.throws(()=>validateSession({...session,previousQuestionIds:['AB2-0-1-7']}));assert.throws(()=>validateSession({...session,previousQuestionIds:['TC-000000']}));
 const attempt={mode:'student',namespace,attemptId:evidence.id,target:session.target,ref:evidence.ref,phase:'assessed',currentResponses:evidence.firstResponse.responses,assistance:[],firstResponse:evidence.firstResponse,firstAssessment:evidence.firstAssessment};validateAttempt(attempt);assert.throws(()=>validateAttempt({...attempt,ref:{...attempt.ref,questionId:'AB2-0-1-7'}}));
 const ref=acidProvider.resolveLink(evidence.ref.questionId);assert.throws(()=>acidProvider.select({activityId:ref.activityId,gemId:'u6-t1-1-2',level:ref.level,seed:1,previousQuestionIds:['AB2-0-1-7']}));assert.throws(()=>electronsBondingProvider.select({activityId:'alevel/electrons-bonding',level:1,seed:1,previousQuestionIds:['EB01']}));
});
test('fresh alpha database and preferences differ from old identifiers',()=>{
 assert.equal(alphaDatabaseName('alevel'),'masters-of-chemistry-alpha-v2-alevel-local');assert.equal(alphaDatabaseName('igcse'),'masters-of-chemistry-alpha-v2-igcse-local');assert.equal(ALPHA_COURSE_PREFERENCE_KEY,'masters-of-chemistry-alpha-v2:landing:course');assert.equal(ALPHA_LANDING_PREFERENCE_PREFIX,'masters-of-chemistry-alpha-v2:landing:');
 const importUI=fs.readFileSync(new URL('../../../../../../src/compatibility/LegacyImportView.tsx',import.meta.url),'utf8');assert(!importUI.includes('localStorage'));assert(!importUI.includes('Read original keys'));
});
