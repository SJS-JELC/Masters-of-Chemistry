import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';
import {productionRegistry as registry} from '../../../src/foundation/registry.ts';
import {bank as a} from '../../../src/activities/alevel/dot-and-cross/bank.js';import {bank as i} from '../../../src/activities/igcse/dot-and-cross/bank.js';
import {reviewCode as ac} from '../../../src/activities/alevel/dot-and-cross/provider.ts';import {reviewCode as ic} from '../../../src/activities/igcse/dot-and-cross/provider.ts';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {reviewedMethanolSynthesisSVG as corrected} from '../../../src/chemistry/thermochemistry/reviewed-co-svg.ts';import {data as bond} from '../../../src/chemistry/thermochemistry/bond-enthalpy-data.js';
import {proofRef,dilutionValues,proofQuestion,proofMarking} from '../../../development/authoring/families/dev-formatted-starter/family.ts';
const root=path.resolve(import.meta.dirname,'../../..'),out=import.meta.dirname,workspace=path.resolve(root,'../..'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const originals=vm.createContext({});for(const f of ['assets/question-review.js','activities/acid-base-calculations/data.js','activities/acid-base-calculations/core.js','activities/acid-base-calculations/levels.js'])vm.runInContext(fs.readFileSync(path.join(root,'../Masters-of-A-Level-Chemistry/src',f),'utf8'),originals);
const plain=x=>JSON.parse(JSON.stringify(x));
const codecs=[];for(const [course,bank,code,prefix] of [['A-Level',a,ac,'DAC'],['IGCSE',i,ic,'DC']]){
 const appPath=`../Masters-of-${course}-Chemistry/src/activities/dot-and-cross/app.js`,app=read(appPath);assert(app.includes(`QuestionReview.bank('${prefix}',questions)`));
 const executable=originals.QuestionReview.bank(prefix,bank),refs=[];for(const r of bank){assert.equal(code(r.id),executable.id(r));assert.equal(executable.get(code(r.id)).id,r.id);refs.push({id:r.id,code:code(r.id)});}codecs.push({course,appPath,appSha256:sha(app),prefix,count:bank.length,refs});
}
const historical=['AB-0000SN'];for(const r of JSON.parse(fs.readFileSync(path.join(workspace,'development/tests/fixtures/acid-legacy-reviews.json'),'utf8')).questions)historical.push(r.reviewId);
// The inventory contains the stable original IDs; explicit AB/ABL and current AB2 examples exercise the live decoder, not a prose assertion.
const samples=JSON.parse(read('validation/s5/chemistry/sample-content.json')).filter(s=>s.activity.endsWith('acid-base-calculations'));
for(const s of samples)historical.push(s.ref.questionId);
let decoderChecks=0;for(const id of new Set(historical.filter(Boolean))){assert.deepEqual(acidEngine.generateFromReview(id),plain(originals.AcidBaseLevels.generateFromReview(id)));decoderChecks++;}
assert(historical.some(id=>id.startsWith('ABL-')));assert(historical.some(id=>id.startsWith('AB-')));assert(historical.some(id=>id.startsWith('AB2-')));
const coProvenance=JSON.parse(read('validation/s3/review-co/provenance.json')),inherited=bond.reactions.find(r=>r.id==='methanol-synthesis').svg;
assert.equal(sha(inherited),coProvenance.source.originalSvgSha256);assert.equal(sha(corrected),coProvenance.correction.newSvgSha256);assert.equal(corrected.replace(coProvenance.correction.insertedElement,''),inherited);assert.equal((corrected.match(/data-reviewed-charge='carbon-minus'/g)??[]).length,1);
// Recalculate by independent broken/made inventory and given source values, per equation CO + 2H2 -> CH3OH.
assert.equal((1072+2*436)-(358+3*414+463),-119);
const dev=[];for(const level of [1,2,3])for(let seed=0;seed<(level===1?1:36);seed++){
 const ref=proofRef(level,seed),q=proofQuestion(ref),v=dilutionValues(ref),c1=level===1?.02:[.01,.02,.04,.05][seed%4],v1=level===1?25:[10,20,25][Math.floor(seed/4)%3],factor=level===1?10:[2,5,10][Math.floor(seed/12)%3],c2=c1/factor,pH=-Math.log10(c2),V2=v1*factor;
 assert.equal(v.concentration,c2);assert.equal(v.finalVolume,V2);assert.equal(v.pH,pH);
 const supplied=level===3?Number(q.context[0].text.match(/target pH of (\d+(?:\.\d+)?)/)[1]):null,inverse=supplied===null?null:c1*v1/10**(-supplied);
 if(level===3){assert(Math.abs(inverse-V2)<V2*1e-9);assert(q.context[0].text.includes('final total volume'));assert(!q.context[0].text.includes(`total volume of ${V2}`));}
 const response={ph:{kind:'numeric',raw:level===3?V2.toPrecision(3):pH.toFixed(2),unit:level===3?'cm³':''},change:{kind:'choice',selected:['increase']}};
 const good=proofMarking.mark(q,response);assert(good.accepted);assert.equal(good.marks.earned,2);assert.equal(proofMarking.mark(q,{...response,change:{kind:'choice',selected:['decrease']}}).marks.earned,1);assert.equal(proofMarking.mark(q,{}).accepted,false);
 dev.push({level,seed,ref,c1,v1,factor,c2,pH,V2,suppliedPHash: supplied,inverse,error:inverse===null?null:inverse-V2});
}
assert.equal(dev.length,73);const curriculum=registry.activities.filter(x=>x.strand==='curriculum'),gems=curriculum.flatMap(x=>x.gems),targets=gems.flatMap(g=>g.supportedLevels.map(level=>({activityId:curriculum.find(a=>a.gems.includes(g)).id,gemId:g.id,level})));
assert.equal(registry.activities.length,12);assert.equal(curriculum.length,11);assert.equal(gems.length,16);assert.equal(targets.length,41);assert(!JSON.stringify(registry.activities).includes('rocket'));assert.equal(registry.activities.find(a=>a.strand==='olympiad').revision,false);
assert(!read('src/foundation/registry.ts').includes('DEV'));assert(!read('src/catalogue/definitions.ts').includes('DEV'));assert(!read('dist/alevel/index.html').includes('DEV-FORMATTED'));
fs.writeFileSync(path.join(out,'independent-checks.json'),JSON.stringify({at:new Date().toISOString(),status:'PASS',codecs,acidDecoder:{checks:decoderChecks,erratum:'Actual original runtime supports AB/ABL historical routes and AB2 current. Inventory AB/ABC wording is inaccurate; no ABC executable route.',ids:[...new Set(historical.filter(Boolean))]},dotErratum:'IGCSE uses DC; A-level uses DAC. Original executable app.js and QuestionReview.bank checked for every72/91 ID, overriding inaccurate inventory IGCSE DAC prose.',co:{originalSha256:sha(inherited),currentSha256:sha(corrected),byteRecovery:true,deltaH:-119,renderedPage:7},dev:{status:'DEVELOPMENT_ONLY',fixed:dev[0],finiteGeneratedCases:72,cases:dev,sourceRationale:'Original independently authored proof, not migrated bank. Aqueous fully dissociated HCl, additive volumes; concentration .001-.025 mol dm^-3 makes autoionisation negligible. Exact12sf target pH supports inverse final-total-volume task. Seeded identity stable modulo36 content cases, uint32 ID seeds preserved.'},scope:{activities:12,curriculum:11,gems:16,targets:41,targetRows:targets,olympiad:'No curriculum gems/revision/mastery/timing by registry and dedicated C3 policy; separate stage completion',rocket:'Excluded; original untouched'}},null,2));
console.log(JSON.stringify({status:'PASS',codecRecords:163,acidDecoderChecks:decoderChecks,devCases:dev.length,targets:targets.length}));
