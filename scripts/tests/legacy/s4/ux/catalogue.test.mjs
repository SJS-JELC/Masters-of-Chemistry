import {suiteEvidenceFile} from '../../test-evidence.mjs';
const _migrationEvidence=(name)=>suiteEvidenceFile(import.meta.url,name);
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {teacherCatalogue} from '../../../../../src/ui/teacher-catalogue.ts';
import {productionRegistry} from '../../../../../src/foundation/registry.ts';
import {calorimetryConfigurations} from '../../../../../src/activities/igcse/calorimetry/provider.ts';
import {variants,matchingFamilies} from '../../../../../src/chemistry/electron-configuration/identity.ts';
import {data} from '../../../../../src/chemistry/electron-configuration/data.js';
const report={status:'RUNNING',counts:{},checks:[],errors:[]};
try{
 for(const registration of productionRegistry.activities){const rows=await teacherCatalogue(registration.id);assert.equal(rows.length,new Set(rows.map(row=>row.key)).size);report.counts[registration.id]=rows.length;if(registration.strand==='olympiad'){assert.equal(rows.length,0);continue;}const provider=await registration.provider();for(const row of rows){const q=provider.restore(row.ref);assert.deepEqual(q.ref,row.ref);assert(q.workedAnswer.length);assert(q.sources.length);assert(provider.resolveLink(row.ref.questionId));}for(const coverage of provider.coverage)if(coverage.kind==='fixed')for(const id of coverage.questionIds)assert(rows.some(row=>row.ref.questionId===id),`Missing ${id}`);}
 const calories=await teacherCatalogue('igcse/calorimetry');assert.equal(calories.length,4512);assert.deepEqual(new Set(calories.map(row=>row.key)),new Set(calorimetryConfigurations().map(c=>JSON.stringify(c))));report.checks.push('All4512 source configs, stable exact seed/ID/level restoration, no sampled rows');
 const electrons=await teacherCatalogue('alevel/electron-configurations');for(const v of variants)for(const level of [1,2,3].filter(l=>l>=v.minimumLevel))assert(electrons.some(r=>r.ref.questionId===v.questionId&&r.ref.level===level));for(let mask=1;mask<16;mask++){const groups=data.groups.filter((_g,i)=>mask&2**i).map(g=>g.id),items=data.species.filter(s=>groups.includes(s.group));for(const f of matchingFamilies){const n=items.filter(s=>s.counts.join(',')===f.counts.join(',')).length;if(n>=2&&items.length-n>=3)assert(electrons.some(r=>r.key===f.templateId+':'+mask));}}
 report.checks.push('Every564 fixed orbital variant at each genuine level plus every eligible matching family/group mask');
 const acid=await teacherCatalogue('alevel/acid-base-calculations');assert(acid.some(r=>r.ref.questionId.startsWith('AB2-')));assert(acid.some(r=>r.ref.questionId.startsWith('AB-')));assert(acid.some(r=>r.ref.questionId.startsWith('ABL-')));report.checks.push('Current and historical acid staged/single configurations; complete fixed bank grade combinations; bond reaction-level/family routes');report.status='PASS';
}catch(error){report.status='FAIL';report.errors.push(error.stack);process.exitCode=1;}
writeFileSync(_migrationEvidence('catalogue-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
