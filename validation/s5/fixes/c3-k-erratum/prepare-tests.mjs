import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'../../../..');
const original=fs.readFileSync(path.join(project,'validation/s3/c3l6/c3l6.test.ts'),'utf8');
fs.writeFileSync(path.join(import.meta.dirname,'original-s3-test.txt'),original);
let port=original.replaceAll("from '../../../src/", "from '../../../../src/").replace("'../../..'),original=", "'../../../..'),original=");
port=port.replace("chemicalChallenge as challenge,sourceBank,bUnits", "chemicalChallenge as challenge,sourceBank,bUnits,currentBAnswers,c3KErratum");
port=port.replace("}assert.equal(count,23);", "}assert.equal(count,23);assert.equal([...currentBAnswers,...sourceBank.stages.c.answers].reduce((n,s)=>n+s.alternatives.length,0),22);assert.equal(currentBAnswers.find(s=>s.id==='K')!.alternatives.length,1);assert.equal(currentBAnswers.find(s=>s.id==='K')!.alternatives[0]!.smiles,c3KErratum.acceptedSmiles);");
// Preserve all raw alternative chemistry/isomorphism checks above. Current policy coverage
// additionally distinguishes the rejected source K graph rather than omitting it.
port=port.replace("test('all permitted G/K alternatives,", "test('all current permitted G/K alternatives,");
port += `\n\nimport {validateOlympiad} from '../../../../src/persistence/validation.ts';
test('K aldehyde hydration vs same-formula orthoacid: source preserved, current rejected, history never erased',()=>{
 const correct=completeC(), rawK=sourceBank.stages.b.answers.find(s=>s.id==='K')!;
 const wrongK=rawK.alternatives.find(a=>a.smiles===c3KErratum.rejectedSourceSmiles)!;
 const correctK=rawK.alternatives.find(a=>a.smiles===c3KErratum.acceptedSmiles)!;
 assert.equal(core.formula(wrongK.graph),core.formula(correctK.graph));
 assert.equal(core.formula(wrongK.graph),'C2H4O4');assert.equal(core.check(wrongK.graph,correctK.graph).kind,'incorrect');
 assert.equal(moleculeEngine.checkSubmission(draw(wrongK.graph)).status,'ready');
 assert.equal(old.bUnitCount({responses:{b:{K:{graph:wrongK.graph}}}},'b-iv-3'),1);
 let attempted=command(completeA(),{kind:'draw-b',slotId:'K',drawing:draw(wrongK.graph)});
 attempted=command(attempted,{kind:'check-b-unit',unitId:'b-iv-3'});
 assert.equal(attempted.unitChecks['b-iv-3']?.correct,0);assert.equal(attempted.unitChecks['b-iv-3']?.passed,false);assert.equal(attempted.historicalOutcome,undefined);
 const wrong:C3L6Progress={...correct,stage:'c',selected:{b:'K',c:'Z'},drawingsB:{...correct.drawingsB,K:draw(wrongK.graph)}};
 const historical={...wrong,unitChecks:{...wrong.unitChecks,'b-iv-3':{correct:1,total:1,passed:true,drawingFingerprint:bFingerprint(challenge,wrong,'b-iv-3')}}};
 validateOlympiad(historical); const pristine=structuredClone(historical),revalidated=c3Policy.validateCompletion(challenge,historical);
 assert.deepEqual(historical,pristine);assert.deepEqual(revalidated.completed,{a:true,b:false,c:false});assert.equal(revalidated.unitChecks['b-iv-3']?.correct,0);
 assert.deepEqual(revalidated.historicalOutcome?.raw,pristine);validateOlympiad(revalidated);
 assert.deepEqual(c3Policy.validateCompletion(challenge,revalidated),revalidated);
 const afterNavigate=command(revalidated,{kind:'navigate',stage:'b'});assert.deepEqual(afterNavigate.historicalOutcome?.raw,pristine);
 const afterCorrection=command(afterNavigate,{kind:'draw-b',slotId:'K',drawing:draw(correctK.graph)});
 const checked=command(afterCorrection,{kind:'check-b-unit',unitId:'b-iv-3'});assert.deepEqual(checked.completed,{a:true,b:true,c:true});assert.deepEqual(checked.historicalOutcome?.raw,pristine);
 const reset=command(checked,{kind:'restart'});assert.deepEqual(reset.completed,{a:false,b:false,c:false});assert.deepEqual(reset.drawingsB,{});assert.deepEqual(reset.historicalOutcome?.raw,pristine);validateOlympiad(reset);
 for(const version of [1,2,3]){const raw=legacy(historical,version);if(version===1)raw.signature='2e364447';assert.deepEqual(JSON.parse(JSON.stringify(old.restore(raw).complete)),historical.completed);const result=revalidateC3Legacy(raw,'import');assert.equal(result.accepted,false);assert.equal(result.progress,null);assert.equal(result.raw,raw);assert(result.issues.some(i=>i.includes('Source erratum for K')));}
 fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'native-correct.json'),JSON.stringify(correct,null,2)+'\\n');
 fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'native-historical-wrong-k.json'),JSON.stringify(pristine,null,2)+'\\n');
 fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'legacy-v3-historical-wrong-k.json'),JSON.stringify(legacy(pristine),null,2)+'\\n');
 fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'native-revalidated.json'),JSON.stringify(revalidated,null,2)+'\\n');
});
test('history structural boundary rejects nested, cross-profile, unknown policy and corrupted original snapshot',()=>{
 const historical=JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'native-revalidated.json'),'utf8'));
 for(const mutate of [(p:any)=>p.historicalOutcome.raw.historicalOutcome=structuredClone(p.historicalOutcome),(p:any)=>p.historicalOutcome.raw.profileId='other',(p:any)=>p.historicalOutcome.policyVersion='unknown',(p:any)=>p.historicalOutcome.raw.drawingsB.K.graph.bonds[0].b=999,(p:any)=>p.historicalOutcome.raw.unitChecks['b-iv-3'].drawingFingerprint='f']){const forged=structuredClone(historical);mutate(forged);assert.throws(()=>validateOlympiad(forged));}
 validateOlympiad(historical);
});
test('current22 alternatives retain nominal masses; hydration balances atoms but formula cannot select K connectivity',()=>{
 const atoms=(formula:string)=>Object.fromEntries([...formula.matchAll(/([A-Z][a-z]?)(\\d*)/g)].map((m)=>[m[1],Number(m[2]||1)]));
 const weights:Record<string,number>={C:12,H:1,N:14,O:16};let count=0;
 for(const slot of [...currentBAnswers,...sourceBank.stages.c.answers])for(const alternative of slot.alternatives){count++;const formula=core.formula(alternative.graph);assert.equal(formula,alternative.formula);const mass=Object.entries(atoms(formula)).reduce((sum,[element,n])=>sum+weights[element]!*n,0);assert(Number.isInteger(mass));if(slot.mass!==undefined)assert.equal(mass,slot.mass,slot.id);}
 assert.equal(count,22);const h=atoms('C2H2O3'),water=atoms('H2O'),hydrate=atoms('C2H4O4');for(const element of ['C','H','O'])assert.equal((h[element]||0)+(water[element]||0),hydrate[element]);
});
`;
fs.writeFileSync(path.join(import.meta.dirname,'c3-reference.test.ts'),port);

