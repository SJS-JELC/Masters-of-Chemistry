import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { core, blankMolecule, moleculeEngine, assertMoleculeGraph } from '../../../../src/chemistry/molecule/engine.ts';
import { clean } from '../../../../src/chemistry/molecule/layout.ts';
import { applyTarget, destination, gestureGraph } from '../../../../src/chemistry/molecule/interaction.ts';
import { bondLines, endpoint, labelFor, drawingViewBox } from '../../../../src/chemistry/molecule/depiction.ts';
import { chemicalChallenge } from '../../../../src/activities/olympiad/c3l6/source-bank.ts';
import type { MoleculeGraph } from '../../../../src/contracts/editors.ts';
const old:any={};vm.runInNewContext(fs.readFileSync('../Masters-of-A-Level-Chemistry/src/activities/molecule-builder/layout.js','utf8'),old);
test('growth snaps 74px/30deg; closes rings; cycling/deletion preserve graph integrity',()=>{
 let g=core.addAtom(core.empty(),'C',0,0);const p=destination(g,g.atoms[0]!,{x:200,y:101});assert(Math.abs(Math.hypot(p.x,p.y)-74)<1e-9);assert(Math.abs(Math.atan2(p.y,p.x)-Math.PI/6)<1e-9);
 g=gestureGraph(g,{target:{kind:'atom',id:1},start:g.atoms[0]!},p,'C',1,false);assert.equal(g.atoms.length,2);assert.deepEqual(g.atoms[0],{id:1,element:'C',x:0,y:0});
 g=core.addAtom(g,'C',74,74,2);g=gestureGraph(g,{target:{kind:'atom',id:3},start:g.atoms[2]!},{x:0,y:0},'C',1,false);assert.equal(g.atoms.length,3);assert.equal(g.bonds.length,3);
 for(const order of [2,3,1]){g=applyTarget(g,{kind:'bond',a:1,b:2},{x:0,y:0},'C',false);assert.equal(g.bonds[0]!.order,order);}g=applyTarget(g,{kind:'bond',a:1,b:2},{x:0,y:0},'C',true);assert.equal(g.bonds.length,2);assertMoleculeGraph(g);
});
test('chain is atomic/history bounded; cancelling draft cannot mutate state; limits/collisions',()=>{
 const initial=blankMolecule(),next=gestureGraph(initial.graph,{target:null,start:{x:0,y:0}},{x:600,y:0},'C',1,true);assert(next.atoms.length>5);assert.equal(initial.graph.atoms.length,0);
 const s=moleculeEngine.apply(initial,{kind:'commit-graph',graph:next});assert.equal(s.history.length,1);assert.deepEqual(moleculeEngine.apply(s,{kind:'undo'}),initial);
 const huge=gestureGraph(initial.graph,{target:null,start:{x:0,y:0}},{x:10000,y:0},'C',1,true);assert.equal(huge.atoms.length,20);assertMoleculeGraph(huge);
 assert.deepEqual(gestureGraph(next,{target:null,start:next.atoms[0]!},{x:600,y:0},'C',1,true),next);
 let h=initial;for(let i=0;i<120;i++)h=moleculeEngine.apply(h,{kind:'commit-graph',graph:core.addAtom(core.empty(),'C',i,0)});assert.equal(h.history.length,100);
 assert.throws(()=>moleculeEngine.apply(initial,{kind:'commit-graph',graph:{atoms:[],bonds:[{a:1,b:2,order:1}]}}));
});
test('exact source clean-up; all22 accepted structures retain chemistry/topology/formula; checked undo restores source coordinates',()=>{
 let count=0;for(const slot of [...chemicalChallenge.hydrolysis.flatMap(u=>u.slots),...chemicalChallenge.network.slots])for(const a of slot.alternatives){count++;const cleaned=clean(a.graph);assert.deepEqual(cleaned,structuredClone(old.MoleculeLayout.clean(a.graph)));assertMoleculeGraph(cleaned);assert.equal(core.formula(cleaned),a.formula);assert.equal(core.check(cleaned,a.graph).kind,'correct');assert.deepEqual(cleaned.bonds,a.graph.bonds);assert.deepEqual(cleaned.atoms.map(({x,y,...atom})=>atom),a.graph.atoms.map(({x,y,...atom})=>atom));const s={kind:'molecule' as const,graph:a.graph,history:[]};const next=moleculeEngine.apply(s,{kind:'clean'});assert.deepEqual(next===s?s:moleculeEngine.apply(next,{kind:'undo'}),s);}
 assert.equal(count,22);
});
test('source label direction/subscripts, clipped bonds and auto-fit; explicit-H equivalence and invalid valence remain assessable',()=>{
 let g=core.addAtom(core.empty(),'O',0,0);let l=labelFor(g.atoms[0]!,g,'structural',(s,n)=>s.length*n);assert.deepEqual(l!.chunks.map(c=>c.text),['H','2','O']);
 g=core.addAtom(g,'C',74,0,1);assert.equal(labelFor(g.atoms[1]!,g,'skeletal',(s,n)=>s.length*n),null);l=labelFor(g.atoms[0]!,g,'skeletal',(s,n)=>s.length*n);assert.deepEqual(l!.chunks.map(c=>c.text),['H','','O']);assert(endpoint(g.atoms[0]!,g.atoms[1]!,l).x>0);assert.equal(bondLines(g.atoms[0]!,g.atoms[1]!,3).length,3);
 assert.deepEqual(drawingViewBox(core.empty(),550,550),{x:-500,y:-500,w:1000,h:1000});
 const explicit=core.addAtom(g,'H',-74,0,1);assert.equal(core.check(explicit,g).kind,'correct');
 const invalid=core.addAtom(g,'C',0,-74,1,3);const state={kind:'molecule' as const,graph:invalid,history:[]};assert.equal(moleculeEngine.validate(state).valid,true);assert.equal(moleculeEngine.checkSubmission(state).status,'ready');assert.equal(core.validate(invalid).kind,'valence');
});
