import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import aliases from '../../src/content/question-display-aliases.json' with {type:'json'};
import proposal from './fixtures/recall-codes/alias-proposal.json' with {type:'json'};
import {questionDisplayCode,questionLookupInput,recallLookupIdentity} from '../../src/content/question-display-identity.ts';
import {resolveCompatibilityLink} from '../../src/compatibility/links.ts';
import {recallFacts,factsFor} from '../../src/recall/facts.ts';
import {recallFields,markRecallFactFields,createRecallMarkingPolicy,createRecallLearningReviewPolicy} from '../../src/recall/marking.ts';
import {rawModelResponses} from '../../src/recall/marking-fixtures.mjs';
import {createRecallProvider,recallRef} from '../../src/recall/provider.ts';
import {toggleRecallTopics,allRecallTopicsSelected} from '../../src/recall/recall-hub.ts';
const f=n=>factsFor('igcse').find(x=>x.id==='igcse-recall-'+n),pattern=/^[A-Z]{2,3}-[A-Z0-9]{6}$/;
test('permanent158 aliases are unique and exact approved assignments;127 active refs stay internal',()=>{
 assert.deepEqual(aliases.rows,proposal.rows);assert.equal(aliases.rows.length,158);assert.equal(new Set(aliases.rows.map(x=>x.code)).size,158);
 for(const row of aliases.rows){assert.match(row.code,pattern);assert.equal(questionDisplayCode(row),row.code);assert.equal(questionLookupInput(row.course,row.activityId,row.code),row.questionId);assert.deepEqual(recallLookupIdentity(row.course,row.code),row);}
 for(const fact of recallFacts){const ref=recallRef(fact.course,fact.id);assert.equal(ref.questionId,fact.id);assert.equal(ref.seed,0);const p=createRecallProvider([fact],fact.course);assert.deepEqual(p.resolveLink(questionDisplayCode({course:fact.course,...ref})),ref);}
 assert.equal(questionDisplayCode({course:'alevel',activityId:'igcse/recall',questionId:'igcse-recall-037'}),undefined);
 assert.equal(questionDisplayCode({course:'igcse',activityId:'igcse/recall',questionId:'unknown'}),undefined);
});
test('all current graded code families preserve existing valid refs and legacy encoded seeds',async()=>{
 const cases=[['igcse','igcse/formulae','RF1:sodium-chloride:17','FO-000001',17],['igcse','igcse/equations','EQ-simple-balance-01','EQ-000001',0]];
 for(const [course,activityId,old,code,seed] of cases){assert.equal(questionDisplayCode({course,activityId,questionId:old}),code);const a=await resolveCompatibilityLink(course,old),b=await resolveCompatibilityLink(course,'/?activity='+activityId+'&review='+code+'&seed='+seed);assert.equal(a.kind,'curriculum');assert.equal(b.kind,'curriculum');assert.equal(questionDisplayCode({course,...a.ref}),code);assert.equal(questionDisplayCode({course,...b.ref}),code);assert.equal(a.ref.seed,seed);assert.equal(b.ref.seed,seed);}
 const audit=JSON.parse(fs.readFileSync(new URL('./fixtures/recall-codes/audit.json',import.meta.url)));
 for(const activity of audit.activities)if(activity.strand==='curriculum'){assert.equal(activity.nonconforming.length,0);for(const prefix of activity.prefixes)assert.equal(questionDisplayCode({course:activity.activityId.split('/')[0],activityId:activity.activityId,questionId:prefix+'-000001'}),prefix+'-000001');}
 assert.equal((await resolveCompatibilityLink('igcse','/?activity=igcse/formulae&review=RF1:sodium-chloride:17&seed=18')).kind,'unrecognized');
});
test('Recall standard codes route read-only exact live/history; old codes and conflicting context reject',async()=>{
 for(const row of aliases.rows)for(const input of [row.code]){const result=await resolveCompatibilityLink(row.course,input);assert.equal(result.kind,'recall');assert.equal(result.ref.questionId,row.questionId);assert.equal(result.historical,!row.live);}
 for(const url of ['/?review=RCI-000037&course=alevel','/?review=RCI-000037&activity=igcse/formulae','/?review=RCI-000037&seed=9','/?review=RCI-000037&level=2','/?review=RCI-000037&question=RCI-000038','/?review=RCI-ZZZZZZ'])assert.equal((await resolveCompatibilityLink(url.includes('course=alevel')?'alevel':'igcse',url)).kind,'unrecognized',url);
 for (const old of ['igcse-recall-037','electron-shell-capacities','EB01']) assert.equal((await resolveCompatibilityLink(old==='electron-shell-capacities'?'alevel':'igcse',old)).kind,'unrecognized');
 assert.equal((await resolveCompatibilityLink('igcse','/?review=RCI-000037&question=igcse-recall-037')).kind,'unrecognized');
});
test('bulk toggles preserve outside topics; partial adds all; full removes scoped eligible only',()=>{
 assert.deepEqual(toggleRecallTopics(['outside'],['a','b']),['outside','a','b']);assert.deepEqual(toggleRecallTopics(['outside','b'],['a','b']),['outside','b','a']);assert.deepEqual(toggleRecallTopics(['outside','a','b'],['a','b']),['outside']);assert.equal(allRecallTopicsSelected(['a'],['a','b']),false);assert.equal(allRecallTopicsSelected(['a','b'],['a','b']),true);assert.equal(allRecallTopicsSelected([],[]),false);
});
test('037/039/046 model, raw IDs and paired accepted alternatives preserve chemistry',()=>{
 assert.equal(f('037').prompt,'What percentage of air is carbon dioxide?');assert.equal(f('037').answer,'0.04%');assert.equal(f('037').entry.unit,'%');
 assert.equal(f('039').entry.presentation,'buttons');assert.deepEqual(f('039').entry.options.map(x=>x.id),['acidic','basic']);
 assert.equal(f('046').answer,'Test: Heat it until boiling\nResult: Boils at exactly 100°C');assert.equal(f('046').context,undefined);assert.equal(f('046').fields[0].answer,'Heat it until boiling');assert.equal(f('046').fields[1].answer,'Boils at exactly 100°C');
 for(const [method,result] of [['Heat it until boiling','Boils at exactly 100°C'],['Measure the boiling point','100 °C'],['Measure the freezing point','Freezes at 0 °C'],['Measure the melting point','Melts at 0 °C']])assert(markRecallFactFields(f('046'),{'part-1':{kind:'text',value:method},'part-2':{kind:'text',value:result}}).correct,method);
 assert(!markRecallFactFields(f('046'),{'part-1':{kind:'text',value:'Measure freezing point'},'part-2':{kind:'text',value:'100'}}).correct);
});
test('048 genuinely equivalent unrecognized Test/Result remain eligible; false claims fail closed',()=>{
 const fact=f('048'),base=rawModelResponses(fact);
 for(const [id,value] of [['part-1','Position a lighted splint just inside the mouth of the test tube'],['part-1','Carefully bring a burning splint close to the opening of the test tube'],['part-2','A short squeaky pop is heard'],['part-2','You hear an audible squeaky pop']]){const r=markRecallFactFields(fact,{...base,[id]:{kind:'text',value}}).fields.find(x=>x.fieldId===id);assert.equal(r.correct,false,value);assert.equal(r.classification,'unrecognized',value);assert.equal(r.alternativeEligible,true,value);}
 for(const [id,value] of [['part-1','Position a glowing splint just inside the mouth of the test tube'],['part-1','Use an unlit splint'],['part-1','Use a damp lit splint'],['part-1','Hold a lit splint at the mouth of the test tube and oxygen is produced'],['part-1','Hold a lit splint at the mouth of the test tube but no pop occurs'],['part-2','A short squeaky pop is heard but the gas is oxygen'],['part-2','The glowing splint relights'],['part-2','A pop is heard and the gas explodes'],['part-2','No squeaky pop is heard']]){const r=markRecallFactFields(fact,{...base,[id]:{kind:'text',value}}).fields.find(x=>x.fieldId===id);assert.equal(r.correct,false,value);assert.equal(r.alternativeEligible,false,value);assert.equal(r.classification,'rejected',value);}
});
test('048 learning review/undo does not mutate first result or response/timing evidence',()=>{
 const fact=f('048'),responses={...rawModelResponses(fact),'part-1':{kind:'text',value:'Position a lighted splint just inside the mouth of the test tube'}},q=createRecallProvider([fact],'igcse').restore(recallRef('igcse',fact.id));
 const marked=createRecallMarkingPolicy([fact]).mark(q,responses);assert(marked.accepted);const first={responses,submittedAt:1,timing:{activeMs:5000,idleLimitMs:60000},assistance:[]},assessment={kind:'marked',assessedAt:1,marks:marked.marks,score:0,selfAssessed:false},before=structuredClone({first,assessment});
 const policy=createRecallLearningReviewPolicy([fact]),decision={partId:'part-1',pointId:'part-1',judgement:'equivalent',reviewer:'student'},review=policy.review(q,first,assessment,responses,[decision]);assert.equal(review.reviewedMarks.earned,2);const undo=policy.review(q,first,assessment,responses,[{...decision,judgement:'not-equivalent'}]);assert.equal(undo.reviewedMarks.earned,1);assert.deepEqual({first,assessment},before);
});
