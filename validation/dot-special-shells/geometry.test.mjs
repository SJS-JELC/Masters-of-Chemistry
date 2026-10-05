import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {bank} from '../../src/activities/alevel/dot-and-cross/bank.js';
import {bank as igcseBank} from '../../src/activities/igcse/dot-and-cross/bank.js';
import {fixedIdentity} from '../../src/content/canonical-identity.ts';
import {editorLayoutQuestionId} from '../../src/chemistry/dot-and-cross/layout-identity.ts';
import {createLayout} from '../../src/chemistry/dot-and-cross/layout.js';
import {snapPoint} from '../../src/chemistry/dot-and-cross/interaction.ts';
import {modelSVG} from '../../src/chemistry/dot-and-cross/model.ts';
import {dotCrossProvider} from '../../src/activities/alevel/dot-and-cross/provider.ts';
import {dotCrossMarking} from '../../src/activities/alevel/dot-and-cross/marking.ts';
const require=createRequire(import.meta.url),originalRoot=path.resolve(import.meta.dirname,'../../../Masters-of-A-Level-Chemistry/src/activities/dot-and-cross'),original=require(path.join(originalRoot,'data.js'));
const context=vm.createContext({DotCrossData:original});vm.runInContext(fs.readFileSync(path.join(originalRoot,'renderer.js'),'utf8'),context);const renderer=context.DotCrossRenderer;
const identity=fixedIdentity('DAC');
test('all 91 original reference records and every source/canonical shell, hit, electron, lens and snap geometry agree',()=>{
 assert.deepEqual(bank,original.questions);
 const specials=[];
 for(const record of bank){const code=identity.code(record.id),q=dotCrossProvider.restore({activityId:'alevel/dot-and-cross',questionId:code,seed:0,level:record.grades[0]}),policy=q.parts[0].markingPolicyId;
 assert.equal(policy,`dot-cross:${code}`);assert.equal(editorLayoutQuestionId(policy),record.id);assert.equal(editorLayoutQuestionId(`dot-cross:${record.id}`),record.id);
 const layout=createLayout(editorLayoutQuestionId(policy)),state={kind:'dot-and-cross',...record.reference};renderer.setQuestion(record);
 for(const atom of state.atoms){assert.equal(layout.shellRadius(atom),original.shellRadius(atom,record.id));if(layout.shellRadius(atom)===100)specials.push([record.id,atom.element]);}
 for(const electron of state.electrons){const a=layout.point(state,electron.anchor),b=renderer.point(state,electron.anchor);assert(a&&b);assert(Math.hypot(a.x-b.x,a.y-b.y)<1e-7,`${record.id}:${electron.id}`);}
 for(const [aId,bId] of layout.nearbyPairs(state)){const a=state.atoms.find(a=>a.id===aId),b=state.atoms.find(a=>a.id===bId);assert.equal(layout.bondDistance(a,b),renderer.bondDistance(a,b));assert(layout.lensPath(a,b));}
 const assessed=dotCrossMarking.mark(q,{diagram:state});assert(assessed.accepted);assert.equal(assessed.marks.earned,1);
 assert(modelSVG(record).includes('<svg'));assert(!modelSVG(record,{circles:false}).includes('class="shell"'));
 }
 assert.deepEqual(specials,[['phosphorus-pentachloride','P'],['sulfur-hexafluoride','S']]);
 for(const [id,centre,terminal] of [['sulfur-hexafluoride','S','F'],['phosphorus-pentachloride','P','Cl']]){const layout=createLayout(editorLayoutQuestionId(`dot-cross:${identity.code(id)}`)),state={kind:'dot-and-cross',atoms:[{id:'c',element:centre,x:500,y:325}],electrons:[],groups:[]};assert.deepEqual(snapPoint(state,{x:635,y:325},[],terminal,layout,{left:0,right:1000,top:0,bottom:650}),{x:640,y:325});const withTerminal={...state,atoms:[...state.atoms,{id:'t',element:terminal,x:640,y:325}]};const region=layout.regionAt(withTerminal,{x:588,y:325});assert.equal(region.kind,'bond');assert(layout.point(withTerminal,region));}
});
test('ordinary sulfur/phosphorus and all IGCSE layouts retain ordinary shells; canonical public IDs stay unchanged',()=>{
 for(const id of ['h2s','sulfur-difluoride','sulfur-tetrafluoride','chlorine-trifluoride']){const record=bank.find(r=>r.id===id);assert(record);const layout=createLayout(editorLayoutQuestionId(`dot-cross:${identity.code(id)}`));for(const a of record.reference.atoms)assert.equal(layout.shellRadius(a),a.element==='H'?40:64);assert.equal(layout.shellRadius('P'),64);}
 const dc=fixedIdentity('DC');for(const record of igcseBank){const code=dc.code(record.id);assert.equal(editorLayoutQuestionId(`igcse-dot-cross:${code}`),code);const layout=createLayout(editorLayoutQuestionId(`igcse-dot-cross:${code}`));for(const a of record.reference.atoms)assert.equal(layout.shellRadius(a),a.element==='H'?40:64);}
 assert.throws(()=>dotCrossProvider.restore({activityId:'alevel/dot-and-cross',questionId:'sulfur-hexafluoride',seed:0,level:3}),/canonical/);
});
