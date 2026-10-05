import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chemicalChallenge as challenge,sourceBank,bUnits} from '../../../../../src/activities/olympiad/c3l6/source-bank.ts';
import {c3Policy,blankC3Progress,bUnitCount,c3Fingerprint,bFingerprint,cFingerprint} from '../../../../../src/activities/olympiad/c3l6/policy.ts';
import {revalidateC3Legacy,c3AnswerSignature} from '../../../../../src/activities/olympiad/c3l6/legacy.ts';
import {core,moleculeEngine,blankMolecule,assertMoleculeGraph} from '../../../../../src/chemistry/molecule/engine.ts';
import type {C3L6Progress,ChallengeCommand,C3BSlot} from '../../../../../src/contracts/olympiad.ts';
import type {MoleculeGraph,MoleculeState} from '../../../../../src/contracts/editors.ts';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../..'),original=path.resolve(project,'../Masters-of-A-Level-Chemistry/src/activities');
const source:any={};for(const file of ['molecule-builder/core.js','c3l6-organic-reactions/content.js','c3l6-organic-reactions/assessment.js'])vm.runInNewContext(fs.readFileSync(path.join(original,file),'utf8'),source);
const old=source.C3L6Assessment.create(source.C3L6Content,source.MoleculeCore);
const draw=(graph:MoleculeGraph):MoleculeState=>({kind:'molecule',graph:structuredClone(graph),history:[]});
function command(p:C3L6Progress,c:ChallengeCommand){const r=c3Policy.transition(challenge,p,c);assert.equal(r.accepted,true,JSON.stringify(c)+' '+r.message);return r.progress;}
function completeA(){let p=blankC3Progress('fixture');for(const a of challenge.classifications)p=command(p,{kind:'classify',id:a.id,value:a.answer});return command(p,{kind:'check-a'});}
function completeB(p=completeA()){for(const u of challenge.hydrolysis){for(const s of u.slots)p=command(p,{kind:'draw-b',slotId:s.id,drawing:draw(s.alternatives[0]!.graph)});p=command(p,{kind:'check-b-unit',unitId:u.unitId});}return p;}
function completeC(){let p=completeB();for(const s of challenge.network.slots){p=command(p,{kind:'draw-c',slotId:s.id,drawing:draw(s.alternatives[0]!.graph)});p=command(p,{kind:'check-c-slot',slotId:s.id});}return p;}
test('complete authoritative banks, alternatives, assets and answer signature equal source',()=>{
 assert.equal(challenge.classifications.length,10);assert.equal(challenge.hydrolysis.length,7);assert.equal(challenge.hydrolysis.flatMap(u=>u.slots).length,12);assert.equal(challenge.network.slots.length,9);
 assert.deepEqual(sourceBank,JSON.parse(JSON.stringify({stages:source.C3L6Content.stages})).stages?JSON.parse(JSON.stringify(source.C3L6Content)):null);
 assert.equal(c3AnswerSignature,old.signature);assert.deepEqual(bUnits,JSON.parse(JSON.stringify(old.bUnits)));
 let count=0;for(const stage of ['b','c'] as const)for(const slot of sourceBank.stages[stage].answers)for(const alternative of slot.alternatives){count++;assertMoleculeGraph(alternative.graph);assert.equal(core.validate(alternative.graph).kind,'valid');assert.equal(core.formula(alternative.graph),alternative.formula);assert.equal(core.check(alternative.graph,alternative.graph).kind,'correct');assert.equal(source.MoleculeCore.check(alternative.graph,alternative.graph).kind,'correct');
  const reindexed={atoms:alternative.graph.atoms.map(a=>({...a,id:a.id+100,x:a.y+200,y:-a.x})).reverse(),bonds:alternative.graph.bonds.map(b=>({...b,a:b.a+100,b:b.b+100})).reverse()};assert.equal(core.check(reindexed,alternative.graph).kind,'correct');
 }assert.equal(count,23);
});
test('bounded source-name qualification uses exact independent wording and changes no SVG glyph/geometry bytes',()=>{
 const qualification=JSON.parse(fs.readFileSync(path.join(project,'src/activities/olympiad/c3l6/qualification.json'),'utf8'));
 const reviewed=JSON.parse(fs.readFileSync(path.join(project,'scripts/tests/fixtures/legacy/s3/review-c3-name/wording-disposition.json'),'utf8'));
 for(const key of ['issueId','reviewId','disposition','student','teacher','publicCopiedSvgMetadata'])assert.deepEqual(qualification[key],reviewed[key]);
 const originalSvg=fs.readFileSync(path.join(original,'c3l6-organic-reactions/assets/digitised/b/gyromitrin-skeletal-notes.svg'),'utf8'),qualifiedSvg=fs.readFileSync(path.join(project,'src/activities/olympiad/c3l6/assets/digitised/b/gyromitrin-skeletal-notes.svg'),'utf8');
 const stripMetadata=(s:string)=>s.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<desc>[\s\S]*?<\/desc>/,'');
 assert.equal(stripMetadata(qualifiedSvg),stripMetadata(originalSvg));assert(qualifiedSvg.includes(`<title>${reviewed.publicCopiedSvgMetadata.title}</title>`));assert(qualifiedSvg.includes(`<desc>${reviewed.publicCopiedSvgMetadata.description}</desc>`));
});
test('all permitted G/K alternatives, E/F swaps and non-equivalent same-formula isomers',()=>{
 let p=completeA();for(const id of ['G','K'] as C3BSlot[]){const unit=challenge.hydrolysis.find(u=>u.slots.some(s=>s.id===id))!,slot=unit.slots[0]!;for(const alt of slot.alternatives){const state={...p,drawingsB:{[id]:draw(alt.graph)}};assert.equal(bUnitCount(challenge,state,unit.unitId),1);}}
 const get=(id:C3BSlot)=>sourceBank.stages.b.answers.find(s=>s.id===id)!.alternatives[0]!.graph;
 const swapped={...p,drawingsB:{D:draw(get('D')),E:draw(get('F')),F:draw(get('E'))}};assert.equal(bUnitCount(challenge,swapped,'b-iii'),3);
 const duplicated={...p,drawingsB:{D:draw(get('D')),E:draw(get('F')),F:draw(get('F'))}};assert.equal(bUnitCount(challenge,duplicated,'b-iii'),2);
 // Methoxyethane and propan-1-ol share a formula but cannot match.
 const chain=(els:string[])=>({atoms:els.map((element,i)=>({id:i+1,element,x:i*50,y:0})),bonds:els.slice(1).map((_,i)=>({a:i+1,b:i+2,order:1}))}) as MoleculeGraph;
 assert.equal(core.formula(chain(['C','O','C','C'])),core.formula(chain(['C','C','C','O'])));assert.equal(core.check(chain(['C','O','C','C']),chain(['C','C','C','O'])).kind,'incorrect');
});
test('graph corruption blocks assessment; wrong valence and disconnected fragments are assessable wrong',()=>{
 const bad={atoms:[{id:1,element:'C',x:0,y:0}],bonds:[{a:1,b:99,order:1}]} as MoleculeGraph;assert.equal(moleculeEngine.checkSubmission(draw(bad)).status,'malformed');
 const annotation={atoms:[{id:1,element:'C',x:0,y:0}],bonds:[],arrows:[{id:1,from:{kind:'atom',id:99},to:{kind:'atom',id:1},bend:0}]} as MoleculeGraph;assert.throws(()=>assertMoleculeGraph(annotation));
 assert.equal(moleculeEngine.checkSubmission(blankMolecule()).status,'incomplete');
 const pentavalent={atoms:[{id:1,element:'C',x:0,y:0},...Array.from({length:5},(_,i)=>({id:i+2,element:'H',x:i*20,y:60}))],bonds:Array.from({length:5},(_,i)=>({a:1,b:i+2,order:1}))} as MoleculeGraph;
 assert.equal(moleculeEngine.checkSubmission(draw(pentavalent)).status,'ready');assert.equal(core.validate(pentavalent).kind,'valence');
 let p=completeA();p=command(p,{kind:'draw-b',slotId:'A',drawing:draw(pentavalent)});p=command(p,{kind:'draw-b',slotId:'B',drawing:draw(sourceBank.stages.b.answers[1]!.alternatives[0]!.graph)});const r=c3Policy.transition(challenge,p,{kind:'check-b-unit',unitId:'b-i'});assert.equal(r.accepted,true);assert.equal(r.progress.unitChecks['b-i']?.correct,1);
 const broken=c3Policy.transition(challenge,p,{kind:'draw-b',slotId:'A',drawing:draw(bad)});assert.equal(broken.accepted,false);
});
test('full dependency progression, first completion dedup, restored selected structure and stale/counterfeit checks',()=>{
 let p=blankC3Progress('fixture');assert.equal(c3Policy.transition(challenge,p,{kind:'navigate',stage:'b'}).accepted,false);assert.equal(c3Policy.transition(challenge,p,{kind:'check-a'}).accepted,false);
 p=completeA();assert.equal(p.completed.a,true);assert.equal(c3Policy.transition(challenge,p,{kind:'navigate',stage:'c'}).accepted,false);assert.equal(c3Policy.transition(challenge,p,{kind:'classify',id:'(1)',value:'reduction'}).accepted,false);
 p=command(p,{kind:'select-slot',stage:'b',slotId:'G'});assert.equal(p.selected.b,'G');p=completeC();assert.deepEqual(p.completed,{a:true,b:true,c:true});
 const duplicate=c3Policy.transition(challenge,p,{kind:'check-c-slot',slotId:'Z'});assert.equal(duplicate.accepted,false);assert.deepEqual(duplicate.progress,p);
 assert.deepEqual(c3Policy.validateCompletion(challenge,JSON.parse(JSON.stringify(p))),p);
 const forged={...p,drawingsC:{...p.drawingsC,Z:draw(sourceBank.stages.c.answers.find(s=>s.id==='S')!.alternatives[0]!.graph)}};
 const stale=c3Policy.validateCompletion(challenge,forged);assert.equal(stale.completed.c,false);assert.equal(stale.slotChecks.Z?.passed,false);
 const newFingerprint={...forged,slotChecks:{...forged.slotChecks,Z:{correct:1,total:1,passed:true,drawingFingerprint:cFingerprint(forged,'Z')}}};assert.equal(c3Policy.validateCompletion(challenge,newFingerprint).completed.c,false);
 const fakeA={...p,classifications:{...p.classifications,'(1)':'reduction' as const}};assert.equal(c3Policy.validateCompletion(challenge,{...fakeA,aCheck:{correct:10,total:10,passed:true,drawingFingerprint:c3Fingerprint(fakeA.classifications)}}).completed.a,false);
 assert.deepEqual(command(p,{kind:'restart'}),blankC3Progress(p.profileId));
});
test('molecular edits preserve graph and bounded undo; explicit H representation is equivalent',()=>{
 let s=blankMolecule();s=moleculeEngine.apply(s,{kind:'add',element:'C',point:{x:0,y:0},order:1});s=moleculeEngine.apply(s,{kind:'add',element:'O',point:{x:60,y:0},parent:1,order:1});const before=s;
 s=moleculeEngine.apply(s,{kind:'move',id:2,point:{x:90,y:90}});s=moleculeEngine.apply(s,{kind:'undo'});assert.deepEqual(s,before);
 for(let i=0;i<110;i++)s=moleculeEngine.apply(s,{kind:'move',id:1,point:{x:i,y:0}});assert.equal(s.history.length,100);
 let methanol=blankMolecule();methanol=moleculeEngine.apply(methanol,{kind:'add',element:'C',point:{x:0,y:0},order:1});methanol=moleculeEngine.apply(methanol,{kind:'add',element:'O',point:{x:50,y:0},parent:1,order:1});const implicit=methanol.graph;methanol=moleculeEngine.apply(methanol,{kind:'add',element:'H',point:{x:100,y:0},parent:2,order:1});assert.equal(core.check(methanol.graph,implicit).kind,'correct');
});
function legacy(p:C3L6Progress,version=3){const r:any={version,signature:c3AnswerSignature,stage:p.stage,selected:p.selected,responses:{a:p.classifications,b:Object.fromEntries(Object.entries(p.drawingsB).map(([k,v])=>[k,{graph:v.graph,history:v.history}])),c:Object.fromEntries(Object.entries(p.drawingsC).map(([k,v])=>[k,{graph:v.graph,history:v.history}]))},complete:p.completed,submitted:{a:p.aCheck?{correct:p.aCheck.correct,total:10,snapshot:p.aCheck.drawingFingerprint}:undefined},unitChecks:{},slotChecks:{}};
 for(const u of bUnits)if(p.unitChecks[u.id])r.unitChecks[u.id]={...p.unitChecks[u.id],snapshot:bFingerprint(challenge,p,u.id)};
 for(const s of challenge.network.slots)if(p.slotChecks[s.id])r.slotChecks[s.id]={correct:p.slotChecks[s.id]!.passed,snapshot:cFingerprint(p,s.id)};
 if(version<3){r.submitted.b={correct:12,total:12,snapshot:c3Fingerprint(Object.fromEntries(sourceBank.stages.b.answers.map(a=>[a.id,p.drawingsB[a.id]?.graph??null])))};r.submitted.c={correct:9,total:9,snapshot:c3Fingerprint(Object.fromEntries(sourceBank.stages.c.answers.map(a=>[a.id,p.drawingsC[a.id]?.graph??null])))};delete r.unitChecks;delete r.slotChecks;}return r;
}
test('historical v1/v2/v3 completion is genuinely revalidated; missing/raw/rejected input is retained',()=>{
 const p=completeC();for(const version of [1,2,3]){const r=legacy(p,version);if(version===1)r.signature='2e364447';const result=revalidateC3Legacy(r,'import');assert.equal(result.accepted,true,result.issues.join('\n'));assert.deepEqual(result.progress?.completed,p.completed);assert.deepEqual(JSON.parse(JSON.stringify(old.restore(r).complete)),p.completed);}
 const minimal={version:3,signature:c3AnswerSignature};const absent=revalidateC3Legacy(minimal,'import');assert.equal(absent.accepted,true);assert.equal(absent.progress?.completed.a,false);assert(absent.absentFields.includes('submitted.a'));assert.equal(absent.raw,minimal);
 const forged=legacy(p);forged.responses.a['(1)']='reduction';forged.submitted.a.snapshot=c3Fingerprint(forged.responses.a);const fail=revalidateC3Legacy(forged,'import');assert.equal(fail.accepted,false);assert.equal(fail.progress,null);assert.equal(fail.raw,forged);
 const corrupt=legacy(p);corrupt.responses.c.Z.graph.bonds[0].b=999;const bad=revalidateC3Legacy(corrupt,'import');assert.equal(bad.accepted,false);assert(bad.issues.some(s=>s.includes('Rejected responses.c.Z')));assert.equal(bad.raw,corrupt);
 const unknown={...minimal,signature:'wrong'};assert.equal(revalidateC3Legacy(unknown,'import').accepted,false);
 const malformedHistory=legacy(p);malformedHistory.responses.b.A.history=null;assert.equal(revalidateC3Legacy(malformedHistory,'import').accepted,false);
 const malformedComplete={...minimal,complete:{a:'true'}};assert.equal(revalidateC3Legacy(malformedComplete,'import').accepted,false);
});
