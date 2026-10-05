import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { IsomerProgress, MoleculeGraph, MoleculeState } from '../../src/contracts/index.ts';
import { isomerChallenge as challenge, isomerBoxes } from '../../src/activities/olympiad/isomers2011/content.ts';
import { blankIsomerProgress, countIsomers, isomerPolicy, isomerFingerprint } from '../../src/activities/olympiad/isomers2011/policy.ts';
import { blankMolecule, core } from '../../src/chemistry/molecule/engine.ts';
import { validateOlympiad } from '../../src/persistence/validation.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { routeView } from '../../src/shell/navigation-view.ts';
const draw = (graph: MoleculeGraph): MoleculeState => ({kind:'molecule',graph:structuredClone(graph),history:[]});
const progress = (ids: readonly (number | null)[]): IsomerProgress => ({...blankIsomerProgress('test'),drawings:Object.fromEntries(ids.flatMap((id,i) => id === null ? [] : [[String(i+1),draw(challenge.answers[id]!.graph)]]))});
function permutations(values: number[]): number[][] { return values.length ? values.flatMap((v,i) => permutations(values.filter((_,j) => j !== i)).map(p => [v,...p])) : [[]]; }
test('checked reference chemistry: seven different neutral connected C4H10O single-bond structures', () => {
  assert.deepEqual(challenge.answers.map(a => a.smiles),['CCCCO','CCC(C)O','CC(C)CO','CC(C)(C)O','CCOCC','CCCOC','COC(C)C']);
  for (const [i,a] of challenge.answers.entries()) {
    assert.equal(core.validate(a.graph).kind,'valid'); assert.equal(core.formula(a.graph),'C4H10O');
    assert.equal(a.graph.atoms.length,5); assert(a.graph.bonds.every(b => b.order === 1));
    for (const b of challenge.answers.slice(i+1)) assert.equal(core.check(a.graph,b.graph).kind,'incorrect');
  }
});
test('all 5040 permutations conserve seven distinct identities and report exactly the fixed positions', () => {
  for (const ids of permutations([0,1,2,3,4,5,6])) {
    const exact = ids.filter((v,i) => v === i).length;
    assert.deepEqual(countIsomers(challenge,progress(ids)),{fullyCorrect:exact,wrongPlace:7-exact});
  }
});
test('partial, blank, mixtures and surplus duplicates reserve exact placements first', () => {
  for (const [ids,counts] of [
    [[],[0,0]], [[0,null,null,null,null,null,null],[1,0]], [[1,null,null,null,null,null,null],[0,1]],
    [[1,1,null,null,null,null,null],[1,0]], [[1,0,1,4,3,6,5],[0,6]], [[0,0,0,0,0,0,0],[1,0]],
    [[null,null,0,0,0,0,0],[0,1]], [[0,1,null,4,3,null,null],[2,2]],
  ] as const) assert.deepEqual(countIsomers(challenge,progress(ids)),{fullyCorrect:counts[0],wrongPlace:counts[1]});
  let seed = 42;
  for (let n=0;n<1500;n++) {
    const ids = isomerBoxes.map(() => {seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed % 9 < 7 ? seed % 9 : null;});
    const exact = ids.filter((v,i) => v === i).length, reserved = new Set(ids.filter((v,i) => v === i));
    const others = new Set(ids.filter((v,i) => v !== null && v !== i && !reserved.has(v)));
    assert.deepEqual(countIsomers(challenge,progress(ids)),{fullyCorrect:exact,wrongPlace:others.size});
  }
});
test('atom order, IDs, orientation and explicit attached hydrogen drawings are equivalent', () => {
  for (const a of challenge.answers) {
    const g = a.graph;
    const shuffled: MoleculeGraph = {atoms:g.atoms.map(atom => ({...atom,id:atom.id+20,x:-atom.y,y:atom.x})).reverse(),bonds:g.bonds.map(b=>({...b,a:b.a+20,b:b.b+20})).reverse()};
    const explicit = {atoms:[...g.atoms],bonds:[...g.bonds]}; let next=100;
    for (const atom of g.atoms) for(let i=0;i<core.hydrogens(g,atom);i++) {explicit.atoms.push({id:next,element:'H',x:atom.x+i*5,y:atom.y+40}); explicit.bonds.push({a:atom.id,b:next++,order:1});}
    for(const graph of [shuffled,explicit]) {
      assert.equal(core.check(graph,g).kind,'correct');
      const p = {...blankIsomerProgress('test'),drawings:{[a.id]:draw(graph)}};
      assert.deepEqual(countIsomers(challenge,p),{fullyCorrect:1,wrongPlace:0});
    }
  }
});
test('wrong valence, charge, formula and disconnected drawings never count', () => {
  const base = structuredClone(challenge.answers[0]!.graph);
  const charged: MoleculeGraph={...base,atoms:base.atoms.map((a,i)=>i===0?{...a,charge:1}:a)};
  const disconnected={...base,bonds:base.bonds.slice(0,-1)};
  const wrongBond: MoleculeGraph={...base,bonds:base.bonds.map((b,i)=>i===0?{...b,order:2}:b)};
  const pentavalent: MoleculeGraph={...base,bonds:base.bonds.map((b,i)=>i<2?{...b,order:3}:b)};
  for(const graph of [charged,disconnected,wrongBond,pentavalent,core.empty()]) assert.deepEqual(countIsomers(challenge,{...blankIsomerProgress('test'),drawings:{'1':draw(graph)}}),{fullyCorrect:0,wrongPlace:0});
});
test('partial checks enabled, edits clear feedback; completed work locks and restart resets only this record', () => {
  const blank=blankIsomerProgress('test'); assert.equal(isomerPolicy.transition(challenge,blank,{kind:'check'}).accepted,false);
  let p=progress([1,1]); p=isomerPolicy.transition(challenge,p,{kind:'check'}).progress;
  assert.equal(p.check?.fullyCorrect,1); assert.equal(p.check?.wrongPlace,0); validateOlympiad(p);
  p=isomerPolicy.transition(challenge,p,{kind:'select-box',box:'7'}).progress; assert(p.check);
  p=isomerPolicy.transition(challenge,p,{kind:'draw',box:'7',drawing:blankMolecule()}).progress; assert.equal(p.check,null);
  p=isomerPolicy.transition(challenge,progress([0,1,2,3,4,5,6]),{kind:'check'}).progress;
  assert(p.completed); validateOlympiad(p); assert.equal(isomerPolicy.transition(challenge,p,{kind:'draw',box:'1',drawing:blankMolecule()}).accepted,false);
  assert.deepEqual(isomerPolicy.transition(challenge,p,{kind:'restart'}).progress,blank);
});
test('restoration rejects stale fingerprint, forged totals, false completion and extra score evidence', () => {
  const p = isomerPolicy.transition(challenge,progress([0,1,2,3,4,5,6]),{kind:'check'}).progress;
  assert.equal(isomerPolicy.validateCompletion(challenge,p).completed,true);
  for(const altered of [{...p,completed:false},{...p,check:{...p.check!,fullyCorrect:6,wrongPlace:0}},{...p,drawings:{...p.drawings,'1':blankMolecule()}},{...p,score:7},{...p,mastery:1},{...p,selected:'8'}]) assert.throws(()=>validateOlympiad(altered));
  assert.equal(isomerPolicy.validateCompletion(challenge,{...p,check:{...p.check!,drawingFingerprint:'old'}}).completed,false);
  assert.equal(isomerFingerprint({...p,selected:'7'}),isomerFingerprint(p));
});
test('fourteen exact registrations, two Olympiad policies and direct routing outside all curriculum channels', () => {
  const contract = JSON.parse(fs.readFileSync(new URL('../../project-contract.json',import.meta.url),'utf8'));
  assert.deepEqual(productionRegistry.activities.map(a=>a.id).sort(),contract.activities.map((a:{id:string})=>a.id).sort());
  for(const a of productionRegistry.activities.filter(a=>a.strand==='olympiad')) {
    assert.equal(a.revision,false); for(const key of ['gems','mastery','idleAllowance']) assert(!Object.hasOwn(a,key));
    assert.equal(routeView(new URL('https://local/?activity='+a.id),'alevel'),'olympiad');
  }
  assert.equal(productionRegistry.curriculumFor('alevel').length,6);
  assert.equal(routeView(new URL('https://local/?olympiad=c3l6'),'alevel'),'olympiad');
});
