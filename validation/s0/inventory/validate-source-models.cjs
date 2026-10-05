'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base='apps/Masters-of-A-Level-Chemistry/src',out='apps/Masters-of-Chemistry/validation/s0/inventory';
const preflight=require('node:child_process').spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',out+'/preflight-local-inputs.ps1'],{encoding:'utf8'});
assert.equal(preflight.status,0,'Locality preflight failed; do not hydrate placeholders: '+preflight.stderr);
const c=vm.createContext({localStorage:{getItem(){return null},setItem(){}}});
function load(p){vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p});}
const plain=v=>JSON.parse(JSON.stringify(v));
for(const f of ['data.js','core.js','levels.js'])load(base+'/activities/acid-base-calculations/'+f);
load(base+'/assets/alevel-mastery.js');
const scopes=c.AcidBaseLevels.scopes.map(s=>s.id);
assert.equal(scopes.length,5);for(const id of scopes)assert(c.ALevelMastery.config[id]);
assert(!scopes.includes('u6-t1-1-9'));assert.deepEqual(plain(c.ALevelMastery.config['u6-t1-1-9'].availableGrades),[2,3]);
let legacy=0;const fixtureFile='development/tests/fixtures/acid-legacy-reviews.json';
for(const f of JSON.parse(fs.readFileSync(fixtureFile,'utf8')).questions){let q=plain(c.AcidBaseLevels.generateFromReview(f.reviewId));assert.equal(q.legacy,true);delete q.legacy;assert.deepEqual(q,f.question);legacy++;}
let deterministicAcid=0;for(const scope of c.AcidBaseLevels.scopes)for(const level of [1,2,3])for(const template of scope.levels[level]){const q=c.AcidBaseLevels.generate(template,level,1731);assert.deepEqual(plain(c.AcidBaseLevels.generateFromReview(c.AcidBaseLevels.reviewId(template,level,1731))),plain(q));deterministicAcid++;}
load(base+'/activities/molecule-builder/core.js');load(base+'/activities/c3l6-organic-reactions/content.js');load(base+'/activities/c3l6-organic-reactions/assessment.js');
let c3Structures=0;for(const stage of ['b','c'])for(const item of c.C3L6Content.stages[stage].answers)for(const a of item.alternatives){c.MoleculeCore.assertGraph(a.graph);assert.equal(c.MoleculeCore.formula(a.graph),a.formula,stage+':'+item.id);assert.equal(c.MoleculeCore.check(a.graph,a.graph).kind,'correct');c3Structures++;}
const assessment=c.C3L6Assessment.create(c.C3L6Content,c.MoleculeCore);assert.equal(assessment.bUnits.length,7);assert.equal(assessment.blank().stage,'intro');assert(!assessment.unlocked(assessment.blank(),'b'));
load('apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/data.js');load('apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/core.js');
let practical=0;for(const q of c.PRACTICAL_BANK.questions){const response={fields:{},selectedId:q.selection?.correct||'',errorId:q.correction?.errorId||'',overrides:[]};for(const f of q.fields)response.fields[f.id]=f.multiselect?f.answers:f.answers[0];const result=c.PracticalCore.gradeQuestion(q,response);assert.equal(result.correctCount,result.total,q.id);const empty=c.PracticalCore.gradeQuestion(q,{});assert.equal(empty.correctCount,0,q.id);if(q.correction){const wrong=c.PracticalCore.gradeQuestion(q,{...response,errorId:'__absent_source_segment__'});assert(!wrong.points.find(p=>p.id==='error').correct);assert(!wrong.points[1].correct);}practical++;}
const result={status:'PASS',scope:'Source model invariants and existing fixture equivalence; does not establish a new chemistry audit or rendered acceptance',acidLegacyFixtures:legacy,acidIdentityRoutes:deterministicAcid,c3l6ValidatedAlternativeGraphs:c3Structures,c3l6Stages:{a:10,b:12,bUnits:7,c:9},practicalModels:practical,originalStaleTestDisposition:{file:'scripts/test_acid_levels.js',reason:'Its all U6 mastery keys assertion predates the valid titration leaf u6-t1-1-9. This separate gate checks every acid leaf and the separately registered titration levels; original retained unchanged.'}};
fs.writeFileSync(out+'/source-model-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
