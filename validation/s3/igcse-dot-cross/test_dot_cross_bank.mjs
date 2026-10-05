import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import * as Core from '../../../src/chemistry/dot-and-cross/core.js';
import {createLayout} from '../../../src/chemistry/dot-and-cross/layout.js';
const workspace=path.resolve(import.meta.dirname,'../../../../..');
const require=createRequire(import.meta.url);
import {bank as questions} from '../../../src/activities/igcse/dot-and-cross/bank.js';
const Data={questions,shellRadius:element=>typeof element==='string'?element==='H'?40:64:element.element==='H'?40:64,bondDistance:(a,b)=>createLayout().bondDistance(a,b)};
const Renderer=createLayout();
const migration=JSON.parse(fs.readFileSync(path.join(workspace,'development/shared/validation/layout-migration.json'),'utf8').replace(/^\uFEFF/,''));
assert(JSON.stringify(migration).includes('resources/past-paper-atlas/data/atlas.json'),'historical migration lookup exists');
const currentPath='resources/igcse-past-paper-atlas/data/atlas.json';
const bytes=fs.readFileSync(path.join(workspace,currentPath));
const atlas=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
assert(Array.isArray(atlas.records),'actual corpus records are present');
const provenance={historicalPath:'resources/past-paper-atlas/data/atlas.json',currentPath,sha256:createHash('sha256').update(bytes).digest('hex'),records:atlas.records.length,lookupEvidence:'layout-migration.json records the historic output-to-resources path; current resources/igcse-past-paper-atlas README and real atlas identify IGCSE corpus. No source values reconstructed.'};
fs.writeFileSync(path.join(import.meta.dirname,'atlas-provenance.json'),JSON.stringify(provenance,null,2));
// Textbook outer-electron inventories, retained independently of the bank's
// reference generator.  This object is exported so the broader regression
// test can reuse the same independent fixture without importing bank logic.
const expectedElectronCounts = Object.freeze({
  h2: 2, cl2: 14, hcl: 8, h2o: 8, nh3: 8, ch4: 8, o2: 12, n2: 10, co2: 16,
  c2h6: 14, c2h4: 12, ch3cl: 14, chloroethene: 18,
  f2: 14, br2: 14, i2: 14, hf: 8, hbr: 8, hi: 8, h2s: 8, h2o2: 14, n2h4: 14,
  c2h5cl: 20, c2h5br: 20, c2h5i: 20, c2h5f: 20, c2h3br: 18, c2h3f: 18,
  'c2h4cl2-11': 26, 'c2h4cl2-12': 26, 'c2h2cl2-11': 24, 'c2h2cl2-12': 24,
  ethanol: 20, dimethylether: 20, ethanal: 18, 'ethanoic-acid': 24,
  nacl: 8, mgo: 8, mgcl2: 16, na2o: 8, cacl2: 16,
  'lithium-fluoride': 8, 'lithium-chloride': 8, 'lithium-oxide': 8,
  'potassium-chloride': 8, 'potassium-fluoride': 8, 'potassium-bromide': 8, 'potassium-iodide': 8,
  'sodium-fluoride': 8, 'sodium-bromide': 8, 'magnesium-sulfide': 8,
  'magnesium-fluoride': 16, 'magnesium-bromide': 16, 'calcium-sulfide': 8,
  'calcium-fluoride': 16, 'calcium-bromide': 16, 'calcium-oxide': 8,
  'aluminium-oxide': 24, 'aluminium-sulfide': 24, 'aluminium-fluoride': 24,
  'sodium-iodide': 8, 'magnesium-nitride': 16, 'calcium-nitride': 16,
  'sodium-sulfide': 8, 'potassium-oxide': 8, 'potassium-sulfide': 8,
  sih4: 8, 'methanoic-acid': 18, propane: 20, propene: 18, naoh: 8, caoh2: 16
});

function deepCopy(value) { return JSON.parse(JSON.stringify(value)); }
function counts(object) { return Object.keys(object).sort().map((key) => `${key}:${object[key]}`).join('|'); }

assert.strictEqual(Data.questions.length, Object.keys(expectedElectronCounts).length, 'fixture covers every bank question');
for (const question of Data.questions) {
  assert.ok(Object.prototype.hasOwnProperty.call(expectedElectronCounts, question.id), `${question.id}: independent fixture entry`);
  assert.deepStrictEqual(Core.validateReference(question), [], `${question.id}: reference validation`);
  assert.strictEqual(question.reference.electrons.length, expectedElectronCounts[question.id], `${question.id}: electron inventory`);
  assert.strictEqual(question.reference.groups.reduce((sum, group) => sum + group.charge, 0), 0, `${question.id}: neutral overall charge`);
  assert.ok(Array.isArray(question.grades), `${question.id}: grades array`);
  for(const evidence of question.atlasEvidence||[]){const source=atlas.records.find(r=>r.id===evidence.questionId);assert.ok(source,`${question.id}: atlas ID exists`);assert.equal(source.classification.band,evidence.observedBand,`${question.id}: observed atlas band`);}
  const atoms=question.reference.atoms,bonds=Renderer.bondPairs(question.reference).map(pair=>pair.sort().join(':'));
  if(question.category==='covalent'&&question.grades.includes(1)){assert.equal(atoms.length,2);assert(question.reference.electrons.filter(e=>e.anchor.kind==='bond').length<=4);}
  if(question.category==='ionic'){assert(atoms.length<=5);if(question.grades.includes(1))assert(atoms.length<=3);}
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const a=atoms[i],b=atoms[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
    if(bonds.includes([a.id,b.id].sort().join(':')))assert(Math.abs(distance-Data.bondDistance(a,b))<1e-6,`${question.id}: standard bonded overlap`);
    else assert(distance>=Data.shellRadius(a)+Data.shellRadius(b)-.1,`${question.id}: non-bonded shells do not overlap`);
  }
  if (question.extension) assert.deepStrictEqual(question.grades, [], `${question.id}: extension has no normal grade`);
  else if (question.category === 'ionic') assert.ok(question.grades.every((grade) => grade === 1 || grade === 2), `${question.id}: ionic grades are 1/2 only`);
  else assert.ok(question.grades.every((grade) => grade === 1 || grade === 2 || grade === 3), `${question.id}: covalent grades are 1/2/3`);
  assert.strictEqual(Core.check(Core.reference(question), question).correct, true, `${question.id}: reference marks correctly`);
  for (const electron of question.reference.electrons) assert.ok(Renderer.point(question.reference, electron.anchor), `${question.id}: every electron has a renderable point`);
  const moved = deepCopy(question.reference);
  moved.atoms.forEach((atom) => { atom.x = 1000 - atom.x; atom.y = 650 - atom.y; });
  assert.strictEqual(Core.check(moved, question).correct, true, `${question.id}: reflected reference marks correctly`);
}

const ids = new Set(Data.questions.map((question) => question.id));
assert.strictEqual(ids.size, Data.questions.length, 'question IDs are unique');
assert.ok(Data.questions.some((question) => question.category === 'ionic' && question.grades.length === 2), 'simple ionic grades present');
assert.ok(Data.questions.some((question) => question.category === 'ionic' && counts(question.grades) === '0:2'), 'complex ionic grade 2 present');
assert.ok(Data.questions.some((question) => question.id === 'n2' && question.grades.includes(2) && question.grades.includes(3)), 'N2 reflects both upper atlas bands');
assert.ok(Data.questions.filter((question) => question.category === 'covalent' && question.grades.includes(3)).length >= 10, 'two-carbon organic grade 3 bank present');
console.log(`expanded dot-and-cross bank tests passed (${Data.questions.length} references; independent inventories, grades, charges, connectivity, and geometry)`);

export {expectedElectronCounts};
