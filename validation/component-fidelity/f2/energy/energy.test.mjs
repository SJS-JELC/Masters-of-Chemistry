import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
import {bank,energyProvider,energyRef,reviewCode} from '../../../../src/activities/igcse/energy-enthalpy/provider.ts';
import {energyMarking} from '../../../../src/activities/igcse/energy-enthalpy/marking.ts';
import {initialProfile,modelProfile,checkProfile} from '../../../../src/chemistry/energy-profile/index.ts';
import {profileSVG} from '../../../../src/chemistry/energy-profile/svg.ts';
const source=new URL('../../../../../Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/',import.meta.url),ctx={};
for(const file of ['data.js','core.js','editor.js'])vm.runInNewContext(fs.readFileSync(new URL(file,source),'utf8'),ctx);
const plain=x=>JSON.parse(JSON.stringify(x));
test('canonical full energy bank and all checked profile models retain source chemistry',()=>{
 assert.deepEqual(plain(bank),plain(ctx.EnergyData));
 assert.equal(bank.questions.filter(q=>q.editor).length,18);
 for(const q of bank.questions){const ref=energyRef(reviewCode(q.id)),question=energyProvider.restore(ref);assert.match(ref.questionId,/^EE-[A-Z0-9]{6}$/);assert.equal(ref.level,q.grade);assert.equal(question.parts.reduce((n,p)=>n+p.marks,0),q.points.length);
 if(!q.editor)continue;
 assert.deepEqual(plain(initialProfile(q)),{kind:'energy-profile',...plain(ctx.EnergyCore.initial(q))});assert.deepEqual(plain(modelProfile(q)),{kind:'energy-profile',...plain(ctx.EnergyCore.model(q))});
 const m=modelProfile(q);assert.equal(checkProfile(m,q).status,'ready');const got=energyMarking.mark(question,{profile:m});assert(got.accepted);assert.equal(got.marks.earned,q.points.length,q.id);
 for(const change of [{p:m.p<m.r?300:155},{peak:330},{left:'wrong'},{right:'wrong'},{vertical:'temperature'},{horizontal:'time'},{arrows:Object.fromEntries(Object.entries(m.arrows).map(([n,a])=>[n,{...a,tail:{anchor:'p'}}]))}]){const changed={...m,...change};const outcome=energyMarking.mark(question,{profile:changed});assert(outcome.accepted);assert.deepEqual(outcome.marks.points.map(p=>Boolean(p.earned)),plain(ctx.EnergyCore.check(q,changed,ctx.EnergyData)),q.id);}
 }
});
test('presentation paths, axes, labels, directions, marker geometry and source overlays preserved',()=>{
 const normalize=s=>s.replace(/<style>[\s\S]*?<\/style>/g,'').replace(' xmlns="http://www.w3.org/2000/svg"','').replace(/energy-arrow-[a-zA-Z0-9_-]+(?=-(?:ea|delta))/g,'energy-arrow-ID');
 for(const q of bank.questions.filter(q=>q.editor))for(const m of[initialProfile(q),modelProfile(q)])for(const interactive of[false,true])for(const guides of[false,true])assert.equal(normalize(profileSVG(m,q.editor,interactive,guides)),normalize(ctx.EnergyEditor.svg(m,q.editor,interactive,null,guides)),q.id+' '+interactive+' '+guides);
});
test('renderer escapes source labels and isolates arrow markers while retaining errors for assessment',()=>{const q=bank.questions.find(q=>q.id==='D03'),m=modelProfile(q);const a=profileSVG({...m,left:'<script>&"'},q.editor),b=profileSVG(m,q.editor);assert(a.includes('&lt;script&gt;&amp;&quot;'));assert.equal(profileSVG(m,q.editor),b);assert.notEqual(profileSVG(m,q.editor,true,false,undefined,'instance1').match(/id="([^"]+-ea)"/)[1],profileSVG(m,q.editor,true,false,undefined,'instance2').match(/id="([^"]+-ea)"/)[1]);assert.equal(checkProfile({...m,peak:NaN},q).status,'malformed');});
fs.writeFileSync(new URL('source-hashes.json',import.meta.url),JSON.stringify(Object.fromEntries(['data.js','core.js','editor.js','styles.css'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(new URL(f,source))).digest('hex')])),null,2));
