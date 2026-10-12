import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { allowedPairs } from '../../src/chemistry/formulae-equations/ions.ts';
import { formulaCode, decodeFormulaCode, selectFormula } from '../../src/chemistry/formulae-equations/generator.ts';
import { formulaIdentity, equationIdentity, canonicalFormulaEquationDisplayCode, formulaIdentities, equationIdentities } from '../../src/chemistry/formulae-equations/identity.ts';
import { formulaeProvider, formulaeRef } from '../../src/activities/igcse/formulae/provider.ts';
import { formulaeMarking } from '../../src/activities/igcse/formulae/marking.ts';
import { equationBank } from '../../src/activities/igcse/equations/bank.ts';
import { equationsProvider } from '../../src/activities/igcse/equations/provider.ts';
import { equationsMarking } from '../../src/activities/igcse/equations/marking.ts';
import { isCanonicalQuestionId, validatePreviousQuestionIds, fixedIdentity } from '../../src/content/canonical-identity.ts';
import { resolveCompatibilityLink } from '../../src/compatibility/links.ts';
import { equationBalance } from '../../src/chemistry/formulae-equations/notation.ts';
const model = q => Object.fromEntries(q.parts.map(p => [p.id, p.kind === 'numeric'
  ? {kind:'numeric', raw:String(p.acceptance.expected), unit:''}
  : p.kind === 'choice' ? {kind:'choice',selected:p.acceptedOptionSets[0]}
  : {kind:'text',value:p.accepted[0]}]));
const link = (activity, code, seed, level) => '/?' + new URLSearchParams({course:'igcse',activity,review:code,seed:String(seed),level:String(level)});

test('permanent assignments and generated closed membership agree exactly', () => {
  assert.equal(formulaIdentities.length,36); assert.equal(equationIdentities.length,28);
  const fo=fixedIdentity('FO'), eq=fixedIdentity('EQ');
  for (const [i,pair] of allowedPairs.entries()) {
    const code=fo.code(pair.id); assert.equal(code,'FO-'+(i+1).toString(36).toUpperCase().padStart(6,'0'));
    assert.deepEqual(formulaIdentity(code),{sourceId:pair.id,level:pair.level,code,seed:0});
    assert.equal(fo.sourceId(code),pair.id);
  }
  for (const [i,r] of equationBank.entries()) {
    const code=eq.code(r.id); assert.equal(code,'EQ-'+(i+1).toString(36).toUpperCase().padStart(6,'0'));
    assert.deepEqual(equationIdentity(code),{sourceId:r.id,level:r.level,code});
  }
  const canonical=JSON.parse(fs.readFileSync(new URL('../../src/chemistry/formulae-equations/canonical-equation-ids.json',import.meta.url)));
  assert.deepEqual(canonical,equationBank.map(r=>eq.code(r.id)));
  // Frozen authored chemistry input hashes from accepted S0.
  for(const [file,hash] of [['src/chemistry/formulae-equations/ions.ts','d75983b861163a8f92dd8c50d9a30e1f5c70ba696bf4abc026aac29431a8f3cc'],['scripts/tests/fixtures/formulae-equations-format/equations-bank-before.ts','1cace012dd0025116f121d4587584839ecdce7c9f6d6982bb1a7d1a8e024c88d']])
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../../'+file,import.meta.url))).digest('hex'),hash);
});

test('canonical pair identity separates seeds and old refs reconstruct exactly', () => {
  for(const pair of allowedPairs) for(const seed of [0,1,123,0xffffffff]) {
    const code=formulaCode(pair.id,seed), old='RF1:'+pair.id+':'+seed;
    const canonical=formulaeRef(code,seed), legacy=formulaeProvider.resolveLink(old);
    assert.deepEqual(legacy,{activityId:'igcse/formulae',questionId:old,seed,level:pair.level});
    assert.deepEqual(formulaeProvider.restore(legacy).ref,legacy);
    assert.equal(decodeFormulaCode(old).formula,decodeFormulaCode(code,seed).formula);
    assert.equal(formulaeProvider.restore(canonical).chemicalPresentation.compoundName,pair.name);
    assert.equal(canonicalFormulaEquationDisplayCode(old),code);
    assert.equal(formulaeProvider.resolveLink(code).seed,0);
    assert.throws(()=>formulaeProvider.restore({...legacy,seed:(seed+1)%0x100000000}));
    assert.throws(()=>formulaeProvider.restore({...canonical,level:pair.level===1?2:1}));
  }
  assert.equal(formulaCode('aluminium-chloride',0),'FO-000009');
});

test('new selection preserves seeded compound algorithm and mixed histories avoid repeats', () => {
  for(const level of [1,2]) for(const seed of [0,1,42,123,0xffffffff]) {
    let n=seed>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;
    const eligible=allowedPairs.filter(p=>p.level===level);
    const expected=eligible[(n>>>0)%eligible.length];
    const a=formulaeProvider.select({activityId:'igcse/formulae',level,seed,previousQuestionIds:[]});
    assert.equal(a.questionId,formulaCode(expected.id,seed));assert.equal(a.seed,seed);
    const legacy='RF1:'+expected.id+':'+seed;
    for(const previousQuestionIds of [[a.questionId],[legacy],[a.questionId,legacy],[legacy,a.questionId]]) {
      validatePreviousQuestionIds('igcse/formulae',previousQuestionIds);
      const b=selectFormula(level,seed,previousQuestionIds);assert.notEqual(b,a.questionId);
    }
  }
  for(const level of [1,2,3]) {
    const selection={activityId:'igcse/equations',level,seed:0,previousQuestionIds:[]};
    const a=equationsProvider.select(selection),old=equationIdentity(a.questionId).sourceId;
    for(const ids of [[old],[a.questionId],[old,a.questionId],[a.questionId,old]]) {
      validatePreviousQuestionIds('igcse/equations',ids);
      assert.notEqual(equationsProvider.select({...selection,previousQuestionIds:ids}).questionId,a.questionId);
    }
  }
});

test('exact membership rejects wrong courses, unknown aliases, malformed seeds and level mismatches', async () => {
  for(const id of ['FO-000000','FO-000011','FO-00000a','RF1:unknown:1','RF1:sodium-chloride:01','RF1:sodium-chloride:-1','RF1:sodium-chloride:4294967296'])
    assert.equal(isCanonicalQuestionId('igcse/formulae',id),false,id);
  for(const id of ['EQ-000000','EQ-00000T','EQ-paragraph-05','EQ-wrong-01'])assert.equal(isCanonicalQuestionId('igcse/equations',id),false,id);
  assert.equal(isCanonicalQuestionId('igcse/formulae','EQ-000001'),false);
  assert.equal(isCanonicalQuestionId('igcse/equations','FO-000001'),false);
  for(const code of ['FO-000001','RF1:sodium-chloride:123']) {
    const good=link('igcse/formulae',code,123,1);
    const resolution=await resolveCompatibilityLink('igcse',good);
    assert.equal(resolution.kind,'curriculum');assert.equal(resolution.ref.questionId,code);assert.equal(resolution.ref.seed,123);
    assert.equal((await resolveCompatibilityLink('alevel',good)).kind,'unrecognized');
    assert.equal((await resolveCompatibilityLink('igcse',good.replace('level=1','level=2'))).kind,'unrecognized');
    for(const bad of ['-1','1.2','4294967296','wat'])assert.equal((await resolveCompatibilityLink('igcse',good.replace('seed=123','seed='+bad))).kind,'unrecognized');
  }
  assert.equal((await resolveCompatibilityLink('igcse',link('igcse/formulae','RF1:sodium-chloride:123',124,1))).kind,'unrecognized');
  assert.equal((await resolveCompatibilityLink('igcse',link('igcse/formulae','FO-000001',124,1))).ref.seed,124);
  for(const code of ['EQ-000001','EQ-simple-balance-01']) {
    assert.equal((await resolveCompatibilityLink('igcse',link('igcse/equations',code,0,1))).kind,'curriculum');
    assert.equal((await resolveCompatibilityLink('igcse',link('igcse/equations',code,1,1))).kind,'unrecognized');
    assert.equal((await resolveCompatibilityLink('igcse',link('igcse/equations',code,0,2))).kind,'unrecognized');
  }
});

test('all 28 models still earn full marks with exact aliases and minimal metadata', () => {
  for(const record of equationBank) {
    assert.ok(equationBalance(record.answer),record.id);
    const canonical=equationIdentity(record.id).code;
    for(const code of [record.id,canonical]) {
      const ref=equationsProvider.resolveLink(code),q=equationsProvider.restore(ref);
      assert.deepEqual(q.ref,{activityId:'igcse/equations',questionId:code,seed:0,level:record.level});
      const result=equationsMarking.mark(q,model(q));assert.equal(result.accepted,true);assert.equal(result.marks.earned,result.marks.available);
      assert.equal(equationsMarking.mark(q,{}).accepted,false);
      assert.equal(canonicalFormulaEquationDisplayCode(code),canonical);
      const balancing=record.family.includes('balance')||record.task==='balance-and-states';
      if(balancing || record.family==='states') {
        assert.equal(q.chemicalPresentation.kind,'equation-row');
        const species=[...q.chemicalPresentation.reactants,...q.chemicalPresentation.products];
        assert.equal(species.length,q.parts.filter(p=>p.kind==='numeric').length || q.parts.filter(p=>p.kind==='choice').length);
        assert.ok(species.every(s=>s.coefficient.kind==='fixed' || q.parts.some(p=>p.id===s.coefficient.partId)));
      } else assert.equal(q.chemicalPresentation?.kind,'equation-writing');
    }
  }
});

test('paragraph state point ignores coefficients but requires matching species and sides', () => {
  for(const record of equationBank.filter(r=>r.family==='paragraph')) {
    const q=equationsProvider.restore(equationsProvider.resolveLink(record.id));
    // Multiply every expected coefficient by two; all formulae/states remain identifiable.
    const wrong=record.answer.replace(/(^|\+ |-> )(\d*)([A-Z(])/g,(_m,sep,n,formula)=>sep+String(2*(Number(n)||1))+formula);
    const result=equationsMarking.mark(q,{equation:{kind:'text',value:wrong}});
    assert.deepEqual(result.marks.points.map(p=>[p.pointId,p.earned]),[['formulae',1],['coefficients',0],['states',1]],record.id);
    assert.ok(result.marks.points[0].message.startsWith('Formulae'));
    assert.ok(result.marks.points[1].message.startsWith('Balancing'));
    assert.ok(result.marks.points[2].message.startsWith('State Symbols'));
    const noStates=record.answer.replace(/\((s|l|g|aq)\)/g,'');
    assert.deepEqual(equationsMarking.mark(q,{equation:{kind:'text',value:noStates}}).marks.points.map(p=>p.earned),[1,1,0]);
    assert.deepEqual(equationsMarking.mark(q,{equation:{kind:'text',value:'H2(g) -> H2(g)'}}).marks.points.map(p=>p.earned),[0,0,0]);
    assert.equal(equationsMarking.mark(q,{equation:{kind:'text',value:' '}}).accepted,false);
  }
  const combined=equationsProvider.restore(equationsProvider.resolveLink('EQ-states-04'));
  const responses=model(combined);
  for(const p of combined.parts.filter(p=>p.kind==='numeric'))responses[p.id]={kind:'numeric',raw:'1',unit:''};
  const states=equationsMarking.mark(combined,responses).marks.points.filter(p=>p.pointId==='choice');
  assert.ok(states.every(p=>p.earned===1));
  const fq=formulaeProvider.restore(formulaeRef('FO-000009',123));
  assert.equal(formulaeMarking.mark(fq,{}).accepted,false);
  assert.equal(formulaeMarking.mark(fq,{formula:{kind:'text',value:'AlCl2'}}).marks.earned,0);
});

test('all 36 generated canonical teacher links and retained aliases resolve with exact seeds', async () => {
  const index=JSON.parse(fs.readFileSync(new URL('../../resources/recall-formulae/content/review-index.json',import.meta.url)));
  assert.equal(index.entries.length,36);assert.equal(new Set(index.entries.map(e=>e.id)).size,36);
  for(const e of index.entries) {
    assert.match(e.id,/^(FO|EQ)-[A-Z0-9]{6}$/);
    const r=await resolveCompatibilityLink('igcse',e.reviewLink);
    assert.equal(r.kind,'curriculum');assert.deepEqual(r.ref,{activityId:e.activityId,questionId:e.id,seed:e.seed,level:e.level});
    const old=await resolveCompatibilityLink('igcse',e.legacyReviewLink);
    assert.equal(old.kind,'curriculum');assert.equal(old.ref.questionId,e.legacyId);assert.equal(old.ref.seed,e.seed);
  }
});
