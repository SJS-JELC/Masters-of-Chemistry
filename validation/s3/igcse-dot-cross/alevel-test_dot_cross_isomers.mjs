import assert from 'node:assert/strict';
import * as Core from '../../../src/chemistry/dot-and-cross/core.js';
import {bank as questions} from '../../../src/activities/alevel/dot-and-cross/bank.js';
const Data={questions};
// Explicit independent heavy-atom structures. Hydrogen counts are specified,
// not inferred by the checker under test. RDKit verifies these against SMILES.
function fixture(id,formula,smiles,elements,bonds,hydrogens){
 const state={atoms:elements.map((element,i)=>({id:'a'+i,element,x:350+i*104,y:325})),electrons:[],groups:[]};
 let serial=0;
 function bond(a,b,order){for(let slot=0;slot<order*2;slot++)state.electrons.push({id:'e'+serial++,symbol:slot%2?'cross':'dot',anchor:{kind:'bond',a,b,slot}});}
 bonds.forEach(([a,b,n])=>bond('a'+a,'a'+b,n));
 hydrogens.forEach((count,i)=>{for(let j=0;j<count;j++){const id='h'+i+'_'+j;state.atoms.push({id,element:'H',x:350+i*104,y:429+j*80});bond('a'+i,id,1);}});
 elements.forEach((el,i)=>{const count={C:0,N:2,O:4,F:6,Cl:6}[el];for(let slot=0;slot<count;slot++)state.electrons.push({id:'e'+serial++,symbol:'dot',anchor:{kind:'atom',atomId:'a'+i,slot}});});
 return{id,formula,smiles,reference:state};
}
const fixtures=[
 fixture('vinyl-alcohol','C2H4O','C=CO',['C','C','O'],[[0,1,2],[1,2,1]],[2,1,1]),
 fixture('oxirane','C2H4O','C1CO1',['C','C','O'],[[0,1,1],[1,2,1],[2,0,1]],[2,2,0]),
 fixture('cyclopropane','C3H6','C1CC1',['C','C','C'],[[0,1,1],[1,2,1],[2,0,1]],[2,2,2]),
 fixture('methyl-formate','C2H4O2','COC=O',['C','O','C','O'],[[0,1,1],[1,2,1],[2,3,2]],[3,0,1,0]),
 fixture('ethene-diol','C2H4O2','OC=CO',['O','C','C','O'],[[0,1,1],[1,2,2],[2,3,1]],[1,1,1,1])
];
// An equilateral ring uses editor-supported 60-degree directions. Spread H
// away from the ring so this fixture can also be constructed through the UI.
const ring=fixtures.find(f=>f.id==='cyclopropane').reference;
const centres=[{x:448,y:295},{x:552,y:295},{x:500,y:295+104*Math.sin(Math.PI/3)}];
centres.forEach((p,i)=>Object.assign(ring.atoms.find(a=>a.id==='a'+i),p));
[[180,240],[0,300],[60,120]].forEach((angles,i)=>angles.forEach((angle,j)=>{const radians=angle*Math.PI/180;Object.assign(ring.atoms.find(a=>a.id===`h${i}_${j}`),{x:centres[i].x+80*Math.cos(radians),y:centres[i].y+80*Math.sin(radians)});}));

function run(){
 const find=id=>Data.questions.find(q=>q.id===id),copy=Core.clone;
 for(const group of [['ethanol','dimethylether'],['c2h4cl2-11','c2h4cl2-12'],['c2h2cl2-11','c2h2cl2-12']])for(const target of group)for(const answer of group)assert(Core.check(Core.reference(find(answer)),find(target)).correct,`${target} accepts ${answer}`);
 for(const sample of fixtures){const q=Data.questions.find(q=>q.category==='covalent'&&q.formula===sample.formula);assert(q);assert(Core.check(sample.reference,q).correct,sample.id+' accepted beyond stored examples');}
 const ethanol=find('ethanol'),water=find('h2o');
 assert(!Core.check(Core.reference(water),ethanol).correct,'different formula rejected');
 // CH4 + CH2O has the same total formula as C2H6O, but is not one molecule.
 const methane=Core.reference(find('ch4')),formaldehyde=fixture('methanal','CH2O','C=O',['C','O'],[[0,1,2]],[2,0]).reference;
 const mixture={atoms:[...methane.atoms,...formaldehyde.atoms],electrons:[...methane.electrons,...formaldehyde.electrons.map(e=>({...e,id:'other-'+e.id}))],groups:[]};
 assert(!Core.check(mixture,ethanol).correct,'disconnected mixture with correct formula rejected');
 const wrongValence=copy(ethanol.reference);const carbon=wrongValence.atoms.find(a=>a.element==='C'),oxygen=wrongValence.atoms.find(a=>a.element==='O');const ch=wrongValence.electrons.find(e=>e.anchor.kind==='bond'&&[e.anchor.a,e.anchor.b].includes(carbon.id)&&wrongValence.atoms.find(a=>a.id===(e.anchor.a===carbon.id?e.anchor.b:e.anchor.a)).element==='H').anchor;
 wrongValence.electrons.filter(e=>e.anchor.kind==='bond'&&e.anchor.a===ch.a&&e.anchor.b===ch.b).forEach(e=>{if(e.anchor.a===carbon.id)e.anchor.a=oxygen.id;else e.anchor.b=oxygen.id;e.anchor.slot+=4;});assert(!Core.check(wrongValence,ethanol).correct,'overbonded oxygen rejected');
 const charged=copy(ethanol.reference);charged.groups.push({id:'charge',atomIds:[charged.atoms[0].id],charge:1,bracket:false});assert(!Core.check(charged,ethanol).correct,'charges are not a neutral isomer');
 for(const sample of [ethanol,...fixtures.map(f=>({reference:f.reference,formula:f.formula}))]){const q=Data.questions.find(q=>q.category==='covalent'&&q.formula===sample.formula);const s=copy(sample.reference);s.electrons.pop();assert(!Core.check(s,q).correct,'missing electron rejected');}
 console.log('Formula-only isomer tests passed: stored alternatives, five unseen isomers, and invalid structures.');
}
run();
export {fixtures,run};
