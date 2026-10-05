import assert from 'node:assert/strict';
import * as Core from '../../../src/chemistry/dot-and-cross/core.js';
import {bank as questions} from '../../../src/activities/alevel/dot-and-cross/bank.js';
const Data={questions};
for(const q of Data.questions.filter(q=>q.id.startsWith('lithium-'))){
 assert.deepEqual(q.grades,[1,2]);assert.deepEqual(Core.validateReference(q),[]);
 const lithium=q.reference.atoms.filter(a=>a.element==='Li');assert(lithium.length>0);
 function shells(count,symbol='dot',only=null){const s=Core.reference(q);for(const atom of lithium.filter(a=>!only||a.id===only))for(let slot=0;slot<count;slot++)s.electrons.push({id:`retained-${atom.id}-${slot}`,symbol,anchor:{kind:'atom',atomId:atom.id,slot}});return s;}
 for(const count of [0,2])for(const symbol of ['dot','cross'])assert(Core.check(shells(count,symbol),q).correct,`${q.id}: ${count} retained ${symbol} electrons accepted`);
 for(const count of [1,3,8])assert(!Core.check(shells(count),q).correct,`${q.id}: ${count} retained electrons rejected`);
 const mixed=shells(2);mixed.electrons.find(e=>e.id.startsWith('retained-')).symbol='cross';assert(!Core.check(mixed,q).correct,'mixed-origin retained duet rejected');
 const charged=shells(2);charged.groups.find(g=>g.atomIds.includes(lithium[0].id)).charge=2;assert(!Core.check(charged,q).correct,'wrong lithium charge rejected');
 const noBracket=shells(2);noBracket.groups.find(g=>g.atomIds.includes(lithium[0].id)).bracket=false;assert(!Core.check(noBracket,q).correct,'missing lithium bracket rejected');
 const missingTransfer=shells(2);missingTransfer.electrons.splice(missingTransfer.electrons.findIndex(e=>e.symbol==='cross'),1);assert(!Core.check(missingTransfer,q).correct,'missing transferred electron rejected');
 if(lithium.length===2){assert(Core.check(shells(2,'dot',lithium[0].id),q).correct,'one retained duet and one empty Li shell accepted');const permuted=shells(2);permuted.atoms.reverse();permuted.electrons.reverse();permuted.groups.reverse();assert(Core.check(permuted,q).correct,'equivalent Li ions can be reordered');}
}
assert.equal(Data.questions.filter(q=>q.id.startsWith('lithium-')).length,3);
console.log('Lithium checks passed: LiF, LiCl, Li2O; empty/retained duets and invalid shells, charges, brackets and transfers.');
