import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bank as questions} from '../../../../src/activities/alevel/dot-and-cross/bank.js';
import {createLayout} from '../../../../src/chemistry/dot-and-cross/layout.js';
const Data={questions},R=createLayout(),app='Masters-of-Chemistry migrated pure layout';
{
  const clone = value => JSON.parse(JSON.stringify(value));
  function centres(state, atom) {
    const pairs = new Map();
    for (const e of state.electrons.filter(e => e.anchor.kind==='atom' && e.anchor.atomId===atom.id)) {
      const group = Math.floor(e.anchor.slot/2);
      // Query both members even while the last pair is only partly entered.
      if (!pairs.has(group)) {
        const ps = [0,1].map(i => R.point(state,{kind:'atom',atomId:atom.id,slot:group*2+i}));
        assert(ps.every(Boolean));
        pairs.set(group,{x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2});
      }
    }
    return [...pairs.values()];
  }
  function verify(state, atomId, expected) {
    const atom=state.atoms.find(a=>a.id===atomId);
    const ids=R.bondPairs(state).find(ids=>ids.includes(atomId));
    const other=state.atoms.find(a=>a.id===ids.find(id=>id!==atomId));
    const axis=Math.atan2(other.y-atom.y,other.x-atom.x);
    const angles=centres(state,atom).map(p=>(Math.atan2(p.y-atom.y,p.x-atom.x)-axis+4*Math.PI)%(2*Math.PI)*180/Math.PI).sort((a,b)=>a-b);
    assert.equal(angles.length,expected.length);
    angles.forEach((value,i)=>assert(Math.abs(value-expected[i])<1e-6,`${app}: ${value} expected ${expected[i]}`));
  }
  function clear(state) {
    for (const e of state.electrons.filter(e=>e.anchor.kind==='atom')) {
      const p=R.point(state,e.anchor); assert(p);
      for(const a of state.atoms.filter(a=>a.id!==e.anchor.atomId))
        assert(Math.hypot(p.x-a.x,p.y-a.y)>=R.shellRadius(a)+6-1e-6);
    }
  }
  for(const [id,element,expected] of [['c2h3br','Br',[90,180,270]],['co2','O',[120,240]],['hcl','Cl',[90,180,270]],['f2','F',[90,180,270]],['i2','I',[90,180,270]]]) {
    test(`${app}: ${id} bond-relative orientation, rotations and restoration`,()=>{
      const reference=Data.questions.find(q=>q.id===id).reference;
      const atomIds=reference.atoms.filter(a=>a.element===element).map(a=>a.id);
      for(let step=0;step<12;step++) {
        const s=clone(reference),theta=step*Math.PI/6;
        s.atoms.forEach(a=>{const x=a.x,y=a.y;a.x=x*Math.cos(theta)-y*Math.sin(theta);a.y=x*Math.sin(theta)+y*Math.cos(theta);});
        s.atoms.reverse();s.electrons.reverse();
        const before=JSON.stringify(s);
        atomIds.forEach(id=>verify(s,id,expected));clear(s);
        assert.equal(JSON.stringify(s),before,'rendering must not mutate saved state');
        atomIds.forEach(id=>verify(clone(s),id,expected));
      }
    });
  }
  test(`${app}: partial entry, deletion and prospective placement stay safe`,()=>{
    for(const [id,element,expected] of [['c2h3br','Br',[90,180,270]],['co2','O',[120,240]]]) {
      const s=clone(Data.questions.find(q=>q.id===id).reference),atom=s.atoms.find(a=>a.element===element);
      const removed=s.electrons.filter(e=>e.anchor.kind==='atom'&&e.anchor.atomId===atom.id).sort((a,b)=>a.anchor.slot-b.anchor.slot).pop();
      s.electrons=s.electrons.filter(e=>e.id!==removed.id);
      verify(s,atom.id,expected);clear(s);
      const before=JSON.stringify(s),anchor=R.freeAnchor(s,{kind:'atom',atomId:atom.id});assert(anchor);
      assert.equal(JSON.stringify(s),before);
      const preview=clone(s);preview.electrons.push({...removed,anchor});clear(preview);
      s.electrons.push(removed);verify(s,atom.id,expected);
      s.electrons=s.electrons.filter(e=>!(e.anchor.kind==='atom'&&e.anchor.atomId===atom.id));
      for(let i=0;i<expected.length*2;i++) {
        const next=R.freeAnchor(s,{kind:'atom',atomId:atom.id});assert(next);
        s.electrons.push({id:'new'+i,symbol:'dot',anchor:next});clear(s);
      }
      verify(s,atom.id,expected);
    }
  });
  test(`${app}: obstructed preferred sector falls back without losing electrons`,()=>{
    const s=clone(Data.questions.find(q=>q.id==='hcl').reference),atom=s.atoms.find(a=>a.element==='Cl');
    const p=centres(s,atom)[0];
    s.atoms.push({id:'obstacle',element:'H',x:p.x,y:p.y});
    clear(s);
    assert.equal(centres(s,atom).length,3);
  });
}
