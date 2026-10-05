import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {currentInputs} from '../../../../scripts/current-inputs.mjs';
import {validateRelease} from '../../../../scripts/validate-s4-release.mjs';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(path.join(project,file),'utf8'));
const write=(file,value)=>fs.writeFileSync(path.join(here,file),JSON.stringify(value,null,2)+'\n');
const before=json('validation/question-chrome/audit/integration/accepted-current-inputs.json').inputs,now=currentInputs();
const ownedSource=new Set(['src/foundation/ActivityHost.tsx','src/foundation/question-heading.ts','src/foundation/session-continuation.ts','src/shell/CourseShell.tsx','src/shell/QuestionChrome.tsx','src/ui/QuestionLevelPill.tsx','src/styles/platform.css','src/ui/QuestionPlayer.tsx','src/ui/DotCrossPlayer.tsx','src/foundation/OlympiadHost.tsx','src/activities/olympiad/c3l6/C3L6View.tsx','src/activities/olympiad/c3l6/c3l6.css']);
const owned=file=>ownedSource.has(file)||/^(?:dist\/(?:alevel|igcse)\/|release\/)/.test(file);
const prior=new Map(before.map(file=>[file.path,file])),fresh=new Map(now.map(file=>[file.path,file])),changes=[];
for(const key of new Set([...prior.keys(),...fresh.keys()])) {const a=prior.get(key),b=fresh.get(key);if(a?.sha256!==b?.sha256){assert(owned(key),'Unowned production change '+key);changes.push({path:key,before:a?.sha256??null,after:b?.sha256??null,kind:!a?'added':!b?'removed':'changed'});}}
for(const root of ['src/editors/','src/chemistry/','src/landing/','src/domain/','src/persistence/','src/statistics/','src/contracts/','public/'])for(const file of before.filter(file=>file.path.startsWith(root)))assert.equal(fresh.get(file.path)?.sha256,file.sha256,file.path);
for(const file of before.filter(file=>file.path.startsWith('src/activities/')&&!ownedSource.has(file.path)))assert.equal(fresh.get(file.path)?.sha256,file.sha256,file.path);
write('source-ownership.json',{status:'PASS',checkedAt:new Date().toISOString(),changes,ownedRuntimeFiles:[...ownedSource],landingEditorsChemistryDomainPersistenceStatisticsContractsBanksExact:true,unchangedProtectedProductionInputs:before.filter(file=>!owned(file.path)).length});
const baseline=json('validation/original-app-baseline.json'),found=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});}
for(const root of baseline.roots)for(const file of walk(path.join(workspace,root)))found.push(path.relative(workspace,file).replaceAll('\\','/'));
const changed=[],counts={readable:0,metadataOnly:0,symlinks:0};
for(const key of new Set([...found,...Object.keys(baseline.files)])){const expected=baseline.files[key],full=path.join(workspace,key);if(!expected||!fs.existsSync(full)){changed.push({path:key,reason:'file-set'});continue;}if(expected.type==='symlink'){counts.symlinks++;if(fs.readlinkSync(full)!==expected.target)changed.push({path:key,reason:'symlink'});}else if(expected.contentHashUnavailable){counts.metadataOnly++;const stat=fs.statSync(full);if(stat.size!==expected.bytes||stat.mtimeMs!==expected.mtimeMs)changed.push({path:key,reason:'metadata'});}else{counts.readable++;if(fs.statSync(full).size!==expected.bytes||hash(full)!==expected.sha256)changed.push({path:key,reason:'bytes'});}}
write('protected-originals.json',{status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),counts,changed,method:'Readable protected original/Git/dependency baseline hashed;523 known offline files metadata-only and never opened. No original real-profile stores used.'});assert.equal(changed.length,0);
const historical=json('validation/question-chrome/audit/integration/historical-evidence-fingerprints.json');for(const file of historical.files){assert.equal(fs.statSync(path.join(project,file.path)).size,file.bytes,file.path);assert.equal(hash(path.join(project,file.path)),file.sha256,file.path);}
write('historical-evidence-check.json',{status:'PASS',checkedAt:new Date().toISOString(),files:historical.files.length,scope:'All previous S0-S5, landing and editor evidence byte-exact; no historical writers rerun.'});
write('release-check.json',{status:'PASS',checkedAt:new Date().toISOString(),releases:['alevel','igcse'].map(validateRelease)});
write('current-inputs.json',{status:'PASS',capturedAt:new Date().toISOString(),meaning:'Fresh H1 current source/build/release closure; prior stages historical and immutable.',inputs:now});
console.log(JSON.stringify({status:'PASS',changedInputs:changes.length,currentInputFiles:now.length,protectedOriginals:counts,historicalEvidence:historical.files.length}));
