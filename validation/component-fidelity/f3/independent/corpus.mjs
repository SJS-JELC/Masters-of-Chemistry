import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {productionRegistry} from '../../../../src/foundation/registry.ts';
import {sourcePresentation} from '../../../../src/ui/source-presentation.ts';
import {sourceFamilies} from '../../../../src/ui/source-family.ts';
const here=import.meta.dirname;const rows=[],fixtures=[];
for(const activity of productionRegistry.activities.filter(a=>a.strand==='curriculum')){
 const provider=await activity.provider(),policy=await activity.marking();const refs=[];
 for(const coverage of provider.coverage)if(coverage.kind==='fixed')for(const id of coverage.questionIds){const r=provider.resolveLink(id);assert(r,id);refs.push(r)}
 for(const gem of activity.gems)for(const level of gem.supportedLevels)for(const seed of [3,17,123])refs.push(provider.select({activityId:activity.id,gemId:gem.id,level,seed,previousQuestionIds:[]}));
 let total=0;const seen=new Set(),reps=new Set();
 for(const ref of refs){if(seen.has(ref.questionId))continue;seen.add(ref.questionId);const q=provider.restore(ref),s=await sourcePresentation(q);assert.equal(s.family,sourceFamilies[activity.id]??'generic');
  if(s.modelResponses){const outcome=policy.mark(q,s.modelResponses);assert(outcome.accepted,ref.questionId);assert.equal(outcome.marks.earned,outcome.marks.available,ref.questionId+' checked model')}
  for(const part of q.parts)if(['text','numeric','choice','correction'].includes(part.kind)&&s.family!=='generic')assert(s.fields[part.id],ref.questionId+' '+part.id);
  const signature=q.parts.map(p=>p.kind+(p.kind==='choice'?p.presentation:p.kind==='explanation'?ref.level:'')).join(',')+ (s.practical?.diagram??'')+(s.practical?.type??'');
  if(!reps.has(signature)){reps.add(signature);fixtures.push({activity:activity.id,course:activity.course,gem:activity.gems.find(g=>g.supportedLevels.includes(ref.level)).id,ref,question:q,source:s,signature})}total++;
 }
 rows.push({activity:activity.id,family:sourceFamilies[activity.id]??'preserved-dot-cross',checked:total,signatures:[...reps]});
}
fs.writeFileSync(path.join(here,'coverage.json'),JSON.stringify({status:'PASS',rows},null,2));fs.writeFileSync(path.join(here,'fixtures.json'),JSON.stringify(fixtures,null,2));console.log(JSON.stringify({status:'PASS',records:rows.reduce((n,r)=>n+r.checked,0),representatives:fixtures.length,rows},null,2));

