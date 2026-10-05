import assert from 'node:assert/strict';
import * as Core from '../../../src/chemistry/dot-and-cross/core.js';
import {bank as questions} from '../../../src/activities/alevel/dot-and-cross/bank.js';
import {createLayout} from '../../../src/chemistry/dot-and-cross/layout.js';
const Data={questions},Renderer=createLayout();
const newInventories = Object.freeze({
  'peroxide-ion':14, 'sodium-peroxide':14, 'magnesium-peroxide':14,
  'nitrogen-trichloride':26, 'nitrogen-trifluoride':26, 'sulfur-difluoride':20,
  'nitrosyl-chloride':18, phosgene:24, 'hydrogen-cyanide':10, 'boron-trifluoride':24,
  'ammonium-ion':8, 'carbonate-ion':24, 'nitrate-ion':24,
  'tetrahydridoaluminate-ion':8, 'sodium-borohydride':8,
  'phosphorus-pentachloride':40, 'sulfur-hexafluoride':48,
  'sulfur-tetrafluoride':34, 'chlorine-trifluoride':28,
});
const clone = (value) => JSON.parse(JSON.stringify(value));
const byId = (id) => Data.questions.find((question) => question.id === id);
const check = (question, state) => Core.check(state, question);
const pass = (question, state, message) => assert.equal(check(question, state).correct, true, message || question.id);
const fail = (question, state, message) => assert.equal(check(question, state).correct, false, message || question.id);
function remap(state, mapping){const value=clone(state);value.atoms.forEach((atom)=>{atom.id=mapping[atom.id];});value.electrons.forEach((electron)=>{if(electron.anchor.kind==='atom')electron.anchor.atomId=mapping[electron.anchor.atomId];else{electron.anchor.a=mapping[electron.anchor.a];electron.anchor.b=mapping[electron.anchor.b];}});value.groups.forEach((group)=>{group.atomIds=group.atomIds.map((id)=>mapping[id]);});return value;}

assert.equal(Data.questions.length, 91, '72 prerequisite/transfer examples plus 19 A-level species');
assert.equal(new Set(Data.questions.map((question) => question.id)).size, 91, 'stable IDs are unique');
assert.deepEqual(Data.questions.slice(0, 72).map((question) => question.id), [
  'h2','cl2','hcl','h2o','nh3','ch4','o2','n2','co2','c2h6','c2h4','ch3cl','chloroethene','f2','br2','i2','hf','hbr','hi','h2s','h2o2','n2h4','c2h5cl','c2h5br','c2h5i','c2h5f','c2h3br','c2h3f','c2h4cl2-11','c2h4cl2-12','c2h2cl2-11','c2h2cl2-12','ethanol','dimethylether','ethanal','ethanoic-acid','sih4','methanoic-acid','propane','propene','nacl','mgo','mgcl2','na2o','cacl2','potassium-chloride','potassium-fluoride','lithium-fluoride','lithium-chloride','lithium-oxide','potassium-bromide','potassium-iodide','sodium-fluoride','sodium-bromide','magnesium-sulfide','magnesium-fluoride','magnesium-bromide','calcium-sulfide','calcium-fluoride','calcium-bromide','calcium-oxide','aluminium-oxide','aluminium-sulfide','aluminium-fluoride','sodium-iodide','magnesium-nitride','calcium-nitride','sodium-sulfide','potassium-oxide','potassium-sulfide','naoh','caoh2'
], 'the inherited bank and ordering are retained');

for (const question of Data.questions) {
  assert(['ionic', 'covalent'].includes(question.practiceCategory), `${question.id}: practiceCategory`);
  assert(question.grades.length && question.grades.every((grade) => [1,2,3].includes(grade)), `${question.id}: grades`);
  assert.equal(typeof question.namedSpecies, 'boolean', `${question.id}: namedSpecies`);
  assert.equal(typeof question.displayFormula, 'string', `${question.id}: displayFormula`);
  assert(Number.isInteger(question.totalCharge), `${question.id}: totalCharge`);
  assert.deepEqual(Core.validateReference(question), [], `${question.id}: valid reference`);
  pass(question, Core.reference(question), `${question.id}: reference marks correct`);
  for (const electron of question.reference.electrons) assert(Renderer.point(question.reference, electron.anchor), `${question.id}: every electron renders`);
}
for (const question of Data.questions.slice(0,72).filter((q) => q.category === 'ionic')) {
  assert(question.grades.includes(2), `${question.id}: all inherited ionic questions appear at level 2`);
  assert.equal(question.grades.includes(1), question.reference.atoms.length <= 3, `${question.id}: only simple inherited ions appear at level 1`);
}
assert.deepEqual(byId('naoh').grades,[2]); assert.deepEqual(byId('caoh2').grades,[2]);

for (const [id, inventory] of Object.entries(newInventories)) {
  const question = byId(id); assert(question && question.namedSpecies, `${id}: named record exists`);
  assert.equal(question.reference.electrons.length, inventory, `${id}: independent valence-electron inventory`);
  assert.equal(question.reference.groups.reduce((sum, group) => sum + group.charge, 0), question.totalCharge, `${id}: charge balance`);
  const missing = Core.reference(question); missing.electrons.pop(); fail(question, missing, `${id}: missing electron fails`);
  const wrongCharge = Core.reference(question);
  if (wrongCharge.groups.length) { wrongCharge.groups[0].charge += 1; fail(question, wrongCharge, `${id}: wrong charge fails`); }
  else { wrongCharge.groups.push({id:'spurious',atomIds:[wrongCharge.atoms[0].id],charge:1,bracket:true}); fail(question, wrongCharge, `${id}: neutral species rejects ionic group`); }
  const cycled = Core.reference(question);
  const cycle = {dot:'cross',cross:'triangle',triangle:'dot'};
  cycled.electrons.forEach((electron) => { electron.symbol = cycle[electron.symbol]; });
  pass(question, cycled, `${id}: full dot/cross/triangle permutation accepted`);
  const mapping=Object.fromEntries(question.reference.atoms.map((atom,index)=>[atom.id,'renamed-'+(question.reference.atoms.length-index)]));
  const renamed=remap(question.reference,mapping);renamed.atoms.reverse();renamed.electrons.reverse();renamed.groups.reverse();
  pass(question,renamed,`${id}: atom IDs and equivalent-atom ordering are irrelevant`);
}
for(const id of ['peroxide-ion','ammonium-ion','carbonate-ion','nitrate-ion','tetrahydridoaluminate-ion','boron-trifluoride','phosphorus-pentachloride','sulfur-hexafluoride','sulfur-tetrafluoride','chlorine-trifluoride'])assert.equal(byId(id).practiceCategory,'covalent',`${id}: covalent practice category`);
for(const id of ['sodium-peroxide','magnesium-peroxide','sodium-borohydride'])assert.equal(byId(id).practiceCategory,'ionic',`${id}: ionic practice category`);

function swapGainedBetweenLoneAndBond(id, oxygenId) {
  const question=byId(id), state=Core.reference(question);
  const gained=state.electrons.find((e)=>e.symbol==='triangle'&&e.anchor.kind==='atom'&&e.anchor.atomId===oxygenId);
  const ownBond=state.electrons.find((e)=>e.symbol==='cross'&&e.anchor.kind==='bond'&&[e.anchor.a,e.anchor.b].includes(oxygenId));
  assert(gained&&ownBond, `${id}: movable gained electron fixture`);
  gained.symbol='cross'; ownBond.symbol='triangle'; pass(question,state,`${id}: gained electron may be placed in the bond instead of a lone pair`);
}
swapGainedBetweenLoneAndBond('carbonate-ion','O2');
swapGainedBetweenLoneAndBond('nitrate-ion','O2');
for(const id of ['peroxide-ion','sodium-peroxide','magnesium-peroxide','carbonate-ion','nitrate-ion'])for(const [index,variant] of byId(id).marking.originAlternatives.entries())pass(byId(id),clone(variant),`${id}: explicit gained-electron variant ${index+1}`);
for(const id of ['peroxide-ion','sodium-peroxide','magnesium-peroxide','carbonate-ion','nitrate-ion'])for(const electron of byId(id).reference.electrons.filter((e)=>e.symbol==='triangle'&&e.anchor.kind==='atom'))assert.equal(electron.anchor.slot,5,`${id}: gained lone electron completes a compact third lone pair`);

for(const [id,central,terminal] of [['nitrogen-trichloride','N1','Cl1'],['nitrosyl-chloride','N1','Cl1'],['sulfur-difluoride','S1','F1']]){
  const question=byId(id),state=Core.reference(question),centralElectron=state.electrons.find((e)=>e.anchor.kind==='atom'&&e.anchor.atomId===central),terminalElectron=state.electrons.find((e)=>e.anchor.kind==='atom'&&e.anchor.atomId===terminal);
  [centralElectron.symbol,terminalElectron.symbol]=[terminalElectron.symbol,centralElectron.symbol];
  fail(question,state,`${id}: central and terminal lone-pair origins cannot be exchanged`);
}

for (const id of ['ammonium-ion','nitrate-ion']) {
  const question=byId(id), state=Core.reference(question);
  const samePair=[];
  for(const electron of state.electrons) if(electron.anchor.kind==='bond'){
    const peers=state.electrons.filter((other)=>other.anchor.kind==='bond'&&other.anchor.a===electron.anchor.a&&other.anchor.b===electron.anchor.b&&Math.floor(other.anchor.slot/2)===Math.floor(electron.anchor.slot/2));
    if(peers.length===2&&peers[0].symbol===peers[1].symbol){samePair.push(...peers);break;}
  }
  assert.equal(samePair.length,2,`${id}: coordinate pair represented by matching symbols`);
  samePair[0].symbol=samePair[0].symbol==='dot'?'cross':'dot'; fail(question,state,`${id}: mixed-symbol coordinate pair fails`);
}

for (const [id, central, shell] of [['boron-trifluoride','B1',6],['phosphorus-pentachloride','P1',10],['sulfur-tetrafluoride','S1',10],['sulfur-hexafluoride','S1',12],['chlorine-trifluoride','Cl1',10]]) {
  const question=byId(id), graphState=Core.reference(question);
  const around=graphState.electrons.filter((electron)=>electron.anchor.kind==='atom'?electron.anchor.atomId===central:[electron.anchor.a,electron.anchor.b].includes(central)).length;
  assert.equal(around,shell,`${id}: permitted central-shell inventory`);
}

function withRetainedMetals(question,symbol){const state=Core.reference(question);let serial=0;for(const group of state.groups.filter((g)=>g.charge>0&&g.atomIds.length===1)){const atom=state.atoms.find((a)=>a.id===group.atomIds[0]);if(!['Na','Mg'].includes(atom.element))continue;for(let slot=0;slot<8;slot++)state.electrons.push({id:'retained-'+serial++,symbol,anchor:{kind:'atom',atomId:atom.id,slot}});}return state;}
for(const id of ['sodium-borohydride','sodium-peroxide','magnesium-peroxide']){
  const question=byId(id);
  pass(question,withRetainedMetals(question,'triangle'),`${id}: retained metal shell uses the transferred-electron symbol`);
  fail(question,withRetainedMetals(question,'dot'),`${id}: retained metal shell may not contradict the transferred-electron symbol`);
  const remapped=withRetainedMetals(question,'dot'),cycle={dot:'cross',cross:'triangle',triangle:'dot'};
  remapped.electrons.filter((electron)=>!electron.id.startsWith('retained-')).forEach((electron)=>{electron.symbol=cycle[electron.symbol];});
  pass(question,remapped,`${id}: retained shell follows a remapped transferred symbol`);
}

const h2o=byId('h2o'), waterIsomer=Core.reference(h2o); waterIsomer.atoms.reverse(); waterIsomer.electrons.reverse(); pass(h2o,waterIsomer,'legacy formula-only neutral marking remains active');
for(const id of ['nacl','mgcl2','naoh']) pass(byId(id),Core.reference(byId(id)),`${id}: inherited ionic convention remains valid`);

console.log(`A-level dot-and-cross chemistry tests passed (${Data.questions.length} references; 19 independent inventories and failure cases)`);
