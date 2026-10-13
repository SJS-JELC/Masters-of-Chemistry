import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { allRateQuestionSources, rateActivityId, rateGemIds, rateQuestionCode, decodeRateQuestionCode, rateSource } from '../../src/activities/alevel/rate-equations/identity.ts';
import { rateProvider, restoreRateExample } from '../../src/activities/alevel/rate-equations/provider.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { questionDisplayCode } from '../../src/content/question-display-identity.ts';
import { resolveCompatibilityLink } from '../../src/compatibility/links.ts';
import { teacherCatalogue } from '../../src/ui/teacher-catalogue.ts';
import { defaultRateGraphWorkspace, restoreRateGraphWorkspace } from '../../src/activities/alevel/rate-equations/workspace-state.ts';

const added = allRateQuestionSources.filter(s => s.bank === 'new-types');
const refFor = (s, seed = 0) => ({ activityId: rateActivityId, questionId: s.questionId, level: s.level, seed: s.gem === 'mechanisms' ? 0 : seed });
test('all 15 new configurations restore, mark automatically and conserve complete responses', () => {
  assert.equal(added.length, 15);
  for (const source of added) for (const seed of source.style === 'numerical' ? Array.from({length:100}, (_,i)=>i) : [0,1,99]) {
    const example = restoreRateExample(refFor(source,seed));
    assert.equal(example.gem,source.gem);
    assert.deepEqual(example.question.ref,refFor(source,seed));
    assert.equal(example.question.parts.some(p=>p.kind==='explanation'),false);
    assert.deepEqual(Object.keys(example.correctResponses).sort(),example.question.parts.map(p=>p.id).sort());
    const marked = rateMarking.mark(example.question,example.correctResponses);
    assert.equal(marked.accepted,true,source.questionId);
    assert.equal(marked.marks.earned,marked.marks.available,source.questionId+':'+seed);
  }
});
test('new permanent codes preserve full seed and teacher lookup rejects conflicts and reserved slots', async () => {
  const seen = new Set();
  for (const source of added) for (const seed of source.gem==='mechanisms'?[0]:[0,1,99,100,0x7fffffff,0xffffffff]) {
    const ref=refFor(source,seed),code=questionDisplayCode({course:'alevel',...ref});
    assert.match(code,source.gem==='mechanisms'?/^RE-[0-9A-Z]{6}$/:/^RE-[0-9A-Z]{8}$/);
    assert(!seen.has(code));seen.add(code);
    assert.deepEqual(rateProvider.resolveLink(code),ref);
    assert.deepEqual((await resolveCompatibilityLink('alevel',code)).ref,ref);
    if(source.gem!=='mechanisms') {
      assert.deepEqual(decodeRateQuestionCode(code),ref);
      assert.equal(rateQuestionCode(source.questionId,seed),code);
      const url=`/?course=alevel&activity=alevel%2Frate-equations&review=${code}&seed=${seed===0?1:0}&level=${source.level}`;
      assert.equal((await resolveCompatibilityLink('alevel',url)).kind,'unrecognized');
    } else assert.throws(()=>restoreRateExample({...ref,seed:1}));
  }
  for(const slot of [0,64,66,67,72,80,86,96,98,255]) assert.equal(decodeRateQuestionCode('RE-'+slot.toString(36).padStart(8,'0')),null);
});
test('practice selection covers current templates and avoids recent IDs before repeating', () => {
  for(const gem of Object.keys(rateGemIds)) for(const level of [1,2,3]) {
    const pool=allRateQuestionSources.filter(s=>s.gem===gem&&s.level===level&&(gem==='mechanisms'||s.bank!=='legacy'));
    const recent=[];
    for(let i=0;i<pool.length;i++) {
      const ref=rateProvider.select({activityId:rateActivityId,gemId:rateGemIds[gem],level,seed:i,previousQuestionIds:recent});
      assert(!recent.includes(ref.questionId));recent.push(ref.questionId);
      assert(pool.some(s=>s.questionId===ref.questionId));
    }
    assert.deepEqual([...recent].sort(),pool.map(s=>s.questionId).sort());
  }
  assert.equal(rateSource('RATE-NEW-graphs-mixed-L3').gem,'graphs');
});
test('all 1863 measured pre-run legacy and expanded outputs remain byte equivalent', () => {
  const baseline=JSON.parse(fs.readFileSync(new URL('../../.artifacts/re-new-types/before-output-hashes.json',import.meta.url)));
  assert.equal(baseline.cases.length,1863);
  for(const row of baseline.cases) assert.equal(crypto.createHash('sha256').update(JSON.stringify(restoreRateExample(row.ref))).digest('hex'),row.sha256,row.ref.questionId+':'+row.ref.seed);
});
test('new graph marker/tangent/extension state clamps and restores independently of answers', () => {
  for(const source of added) {
    const example=restoreRateExample(refFor(source,99));
    if(!example.graph) continue;
    const state={...defaultRateGraphWorkspace(example.graph),tangentAdded:true,extended:example.graph.kind==='arrhenius'};
    assert.deepEqual(restoreRateGraphWorkspace(example.graph,JSON.parse(JSON.stringify(state))),state);
  }
});
test('teacher catalogue includes42 stable configurations and exact codes', async () => {
  const rows=await teacherCatalogue(rateActivityId);assert.equal(rows.length,42);
  assert.equal(new Set(rows.map(row=>row.ref.questionId)).size,42);
  for(const row of rows) assert.deepEqual(rateProvider.resolveLink(questionDisplayCode({course:'alevel',...row.ref})),row.ref);
});

