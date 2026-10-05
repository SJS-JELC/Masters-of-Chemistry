import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {proofRef,proofProvider,proofQuestion,proofMarking,dilutionValues,activityId,gemId} from './family.ts';
import {proofRegistry} from './registry.ts';
import {authoringSources} from './provenance.ts';
import {topicTargets} from '../../../../src/domain/session/index.ts';
const evidence=path.resolve(import.meta.dirname,'../../../../.artifacts/authoring',path.basename(import.meta.dirname));fs.mkdirSync(evidence,{recursive:true});
const repo=path.resolve(import.meta.dirname,'../../../../../..');
test('every independent finite configuration conserves moles and yields correct logarithm; identity stable',()=>{
 const rows=[];
 for(const level of [2,3])for(let s=0;s<36;s++){
  const ref=proofRef(level,s),q=proofProvider.restore(ref),v=dilutionValues(ref);
  assert.match(q.ref.questionId,/^AB-[A-Z0-9]{6}$/);assert.equal(q.ref.level,level);assert.equal(q.ref.seed,s);
  assert(Math.abs(v.c*v.initialVolume-v.concentration*v.finalVolume)<1e-12);
  assert(Math.abs(10**(-v.pH)-v.concentration)<1e-12);
  assert(v.pH> -Math.log10(v.c));assert(v.pH<4);assert(v.concentration>=0.001);
  assert.deepEqual(proofProvider.resolveLink(ref.questionId),ref);
  assert.deepEqual(JSON.parse(JSON.stringify(proofProvider.restore(ref))),q);
  const good={ph:{kind:'numeric',raw:level===3?String(v.finalVolume):v.pH.toFixed(2),unit:level===3?'cm³':''},change:{kind:'choice',selected:['increase']}};
  if(level===3)assert(Math.abs(v.c*v.initialVolume/10**(-Number(v.pH.toPrecision(12)))-v.finalVolume)<1e-7);
  assert.equal(proofMarking.mark(q,good).marks.earned,2);
  assert.equal(proofMarking.mark(q,{...good,ph:{...good.ph,raw:'99'}}).marks.earned,1);
  assert.equal(proofMarking.mark(q,{...good,change:{kind:'choice',selected:['same']}}).marks.earned,1);
  assert.equal(proofMarking.mark(q,{ph:{...good.ph,raw:'NaN'}}).accepted,false);
  assert.equal(proofMarking.mark(q,{...good,change:{kind:'choice',selected:['increase','same']}}).accepted,false);
  rows.push({...ref,...v});
 }
 assert.equal(new Set(rows.map(r=>`${r.c}:${r.initialVolume}:${r.factor}`)).size,36);
 const fixed=proofQuestion(proofRef(1,0));assert.equal(fixed.scaffolds.length,1);assert.equal(dilutionValues(fixed.ref).pH.toFixed(2),'2.70');
 assert.throws(()=>proofProvider.restore({...proofRef(1,0),seed:1}));assert.throws(()=>proofProvider.restore({...proofRef(2,2),questionId:'AB2-fake'}));
 for(const seed of [-1,NaN,1.5,2**32])assert.throws(()=>proofRef(2,seed));
 assert.equal(proofProvider.resolveLink('DEV-PH-v1-GENERATED-00'),null);
 fs.writeFileSync(path.join(evidence,'configuration-validation.json'),JSON.stringify(rows,null,2));
});
test('registration supplies only existing strong-acid gem/true levels; source hashes are current',()=>{
 const targets=topicTargets(proofRegistry.curriculumFor('alevel'),'alevel','u6-t1-1');
 assert.deepEqual(targets.map(t=>[t.activityId,t.gemId,t.level]),[[activityId,gemId,1],[activityId,gemId,2],[activityId,gemId,3]]);
 assert.equal(proofRegistry.curriculumFor('igcse').length,0);
 assert.equal(proofRegistry.get(activityId).idleAllowance(proofQuestion(proofRef(1,0))),180000);
 for(const src of authoringSources)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,src.path))).digest('hex'),src.sha256);
 assert(!fs.readFileSync(path.resolve(import.meta.dirname,'../../../../src/foundation/registry.ts'),'utf8').includes('authoring'));
});
