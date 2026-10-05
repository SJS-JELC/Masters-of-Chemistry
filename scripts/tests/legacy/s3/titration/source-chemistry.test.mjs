import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../../../../src/chemistry/titration-curve/core.js';
import {bank} from '../../../../../src/activities/alevel/ph-titration-curves/bank.ts';
const D={questions:bank};
const close=(a,b,tol=1e-6)=>assert(Math.abs(a-b)<=tol,`${a} differs from ${b}`);
test('bank has 36 distinct reachable questions across Levels 2 and 3',()=>{
 assert.equal(D.questions.length,36);assert.equal(new Set(D.questions.map(q=>q.id)).size,36);
 assert.equal(new Set(D.questions.map(q=>q.prompt)).size,36);
 for(const level of [2,3])assert.equal(D.questions.filter(q=>q.level===level).length,18);
 for(const q of D.questions){
  assert(['before-weak-acid','before-strong-acid','before-strong-base'].includes(q.before));
  const a=C.answer(q),ve=q.initialVolume*q.initialConcentration*q.initialFactor/(q.titrantConcentration*q.titrantFactor);
  close(ve/.5,Math.round(ve/.5));close(a.equivalenceVolume,ve);assert(ve>0&&ve<q.maxVolume);
  for(const value of [a.initialPH,a.finalPH,a.equivalencePH]){close(value*10,Math.round(value*10));assert(value>=0&&value<=14);}
  for(const volume of [q.initialVolume,q.maxVolume])close(volume*2,Math.round(volume*2));
  assert.match(q.prompt,/Round pH to 0.1/);
  if(q.diprotic){assert.equal(q.level,3);assert.match(q.prompt,/both protons.*dissociate completely/);}
 }
 assert.equal(D.questions.filter(q=>q.diprotic).length,6);
});
test('independent acid/base and buffer calculations agree with all reference answers',()=>{
 for(const q of D.questions){
  const initial=q.initialVolume*q.initialConcentration*q.initialFactor/1000;
  const added=q.maxVolume*q.titrantConcentration*q.titrantFactor/1000;
  const total=(q.initialVolume+q.maxVolume)/1000;
  let initialPH,finalPH;
  if(q.acidWeak&&!q.reverse){const ka=10**-q.pKa,c=q.initialConcentration;initialPH=-Math.log10((-ka+Math.sqrt(ka*ka+4*ka*c))/2);close(C.answer(q).initialPH,C.snap(-Math.log10(Math.sqrt(ka*c)),.1));}
  else initialPH=q.reverse?14+Math.log10(q.initialConcentration*q.initialFactor):-Math.log10(q.initialConcentration*q.initialFactor);
  if(q.baseWeak)finalPH=q.basePKa+Math.log10((added-initial)/initial);
  else if(q.acidWeak&&q.reverse)finalPH=q.pKa+Math.log10(initial/(added-initial));
  else finalPH=q.reverse?-Math.log10((added-initial)/total):14+Math.log10((added-initial)/total);
  close(C.equilibriumPH(q,0),initialPH,1e-5);close(C.equilibriumPH(q,q.maxVolume),finalPH,.015);
  close(C.answer(q).initialPH,C.snap(initialPH,.1));close(C.answer(q).finalPH,C.snap(finalPH,.1));
  if(!q.acidWeak&&!q.baseWeak)close(C.equilibriumPH(q,C.equivalenceVolume(q)),7,1e-6);
  for(const v of [0,C.equivalenceVolume(q)/2,C.equivalenceVolume(q),q.maxVolume]){
   const h=10**-C.equilibriumPH(q,v),volume=(q.initialVolume+v)/1000;
   const start=initial/volume,add=v*q.titrantConcentration*q.titrantFactor/1000/volume;
   const acid=q.reverse?add:start,base=q.reverse?start:add;
   const negative=1e-14/h+(q.acidWeak?acid/(1+h/(10**-q.pKa)):acid);
   const positive=h+(q.baseWeak?base/(1+(10**-q.basePKa)/h):base);
   close(negative,positive,1e-10);
  }
 }
 const example=C.answer(D.questions[0]);close(example.initialPH,2.8);close(example.equivalenceVolume,22.5);close(example.finalPH,12.9);
});
test('indicator marking accepts valid alternatives and all six rubric items are checked',()=>{
 for(const q of D.questions){
  const a=C.answer(q);assert(a.acceptedIndicators.length>0,q.id);
  if(!q.acidWeak&&!q.baseWeak)assert.deepEqual(a.acceptedIndicators,['phenolphthalein','methyl-orange','methyl-red'],q.id);
  if(q.acidWeak)assert.deepEqual(a.acceptedIndicators,['phenolphthalein'],q.id);
  if(q.baseWeak){assert(a.acceptedIndicators.includes('methyl-orange'),q.id);assert(!a.acceptedIndicators.includes('phenolphthalein'),q.id);}
  for(const indicator of a.acceptedIndicators)assert.equal(C.grade(q,{...a,indicator}).earned,6,q.id);
  for(const patch of [{indicator:'none'},{equivalenceVolume:a.equivalenceVolume+.5},{initialPH:a.initialPH+.1},{finalPH:NaN},{before:null},{after:null}])assert.equal(C.grade(q,{...a,...patch}).earned,5,q.id);
 }
});
test('all correct curves remain continuous, monotonic and fixed to snapped anchors',()=>{
 for(const q of D.questions){
  for(const v of [10,C.answer(q).equivalenceVolume,q.maxVolume-5]){
   const a={...C.answer(q),equivalenceVolume:v},c=C.curve(q,a),points=[...c.before,...c.after],direction=q.reverse?-1:1;
   close(points[0].v,0);close(points[0].pH,a.initialPH);close(c.before.at(-1).v,v);close(c.after[0].v,v);
   close(c.before.at(-1).pH,c.after[0].pH);close(c.equivalencePH,a.equivalencePH);
   close(points.at(-1).v,q.maxVolume);close(points.at(-1).pH,a.finalPH);
   for(let i=1;i<points.length;i++){assert(points[i].v>=points[i-1].v);assert(direction*(points[i].pH-points[i-1].pH)>=-1e-9,q.id);}
  }
 }
 assert.equal(C.pieces.length,8);assert.equal(new Set(C.pieces.map(p=>p.id)).size,8);
});
