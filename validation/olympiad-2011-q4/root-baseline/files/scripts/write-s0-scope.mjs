// Historical verification alias: scope now derives from canonical definitions.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { activityScope } from '../src/catalogue/scope.ts';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(project,'validation/s0/inventory/coverage-manifest.json'),'utf8'));
const acceptedScope=manifest.activities.map(activity=>({id:activity.id,course:activity.course,strand:activity.strand,supportedLevels:activity.supportedLevels,gems:Object.entries(activity.masteryRegistrations).map(([key,setting])=>({id:setting.leafId||key,supportedLevels:setting.availableGrades||activity.supportedLevels}))}));
assert.deepEqual(activityScope,acceptedScope,'Canonical runtime scope differs from the complete accepted source scope');
console.log(JSON.stringify({status:'PASS',activities:activityScope.length,gems:activityScope.reduce((n,a)=>n+a.gems.length,0),authority:'src/catalogue/definitions.ts',regeneration:'node scripts/write-catalogue-definitions.mjs',note:'Scope derives at runtime; this command verifies without writing another list.'}));
