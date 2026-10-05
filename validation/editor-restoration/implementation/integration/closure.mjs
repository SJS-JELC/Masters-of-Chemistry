import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {currentInputs} from '../../../../scripts/current-inputs.mjs';
import {validateRelease} from '../../../../scripts/validate-s4-release.mjs';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const json=f=>JSON.parse(fs.readFileSync(path.join(project,f),'utf8'));
const write=(f,o)=>fs.writeFileSync(path.join(here,f),JSON.stringify(o,null,2)+'\n');
const old=json('validation/editor-restoration/audit/accepted-current-inputs.json').inputs,now=currentInputs();
const owned=p=>/^(dist\/(alevel|igcse)\/|release\/)/.test(p)||/^src\/editors\/(dot-and-cross|molecule)\//.test(p)||/^src\/chemistry\/dot-and-cross\/(engine\.ts|model\.ts|layout\.(js|d\.ts)|interaction\.ts)$/.test(p)||/^src\/chemistry\/molecule\/(engine|layout|interaction|depiction)\.ts$/.test(p)||/^src\/activities\/olympiad\/c3l6\/(C3L6View\.tsx|c3l6\.css)$/.test(p)||['src/contracts/editors.ts','src/persistence/validation.ts','src/ui/EditorFrame.tsx','src/ui/ResponseControl.tsx','src/ui/QuestionPlayer.tsx','src/ui/DotCrossPlayer.tsx','src/ui/dot-cross-player.css'].includes(p);
const prior=new Map(old.map(f=>[f.path,f])),fresh=new Map(now.map(f=>[f.path,f]));const changes=[];
for(const key of new Set([...prior.keys(),...fresh.keys()])){const a=prior.get(key),b=fresh.get(key);if(a?.sha256!==b?.sha256){assert(owned(key),'Unowned production change '+key);changes.push({path:key,kind:!a?'added':!b?'removed':'changed',before:a?.sha256??null,after:b?.sha256??null});}}
assert(changes.some(f=>f.path==='src/ui/DotCrossPlayer.tsx'));assert(now.filter(f=>f.path.startsWith('src/landing/')).every(f=>prior.get(f.path)?.sha256===f.sha256));
write('source-ownership.json',{status:'PASS',checkedAt:new Date().toISOString(),baseline:'validation/editor-restoration/audit/accepted-current-inputs.json',changes,unchangedProtectedSource:old.filter(f=>!owned(f.path)).length,landingExact:true});
const baseline=json('validation/original-app-baseline.json'),found=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else found.push(path.relative(workspace,full).replaceAll('\\','/'));}}
for(const root of baseline.roots)walk(path.join(workspace,root));const changed=[],counts={readable:0,metadataOnly:0,symlinks:0};
for(const key of new Set([...found,...Object.keys(baseline.files)])){const expected=baseline.files[key],full=path.join(workspace,key);if(!expected||!fs.existsSync(full)){changed.push({path:key,reason:'file-set'});continue;}if(expected.type==='symlink'){counts.symlinks++;if(fs.readlinkSync(full)!==expected.target)changed.push({path:key,reason:'symlink'});}else if(expected.contentHashUnavailable){counts.metadataOnly++;const stat=fs.statSync(full);if(stat.size!==expected.bytes||stat.mtimeMs!==expected.mtimeMs)changed.push({path:key,reason:'metadata'});}else{counts.readable++;if(fs.statSync(full).size!==expected.bytes||hash(full)!==expected.sha256)changed.push({path:key,reason:'bytes'});}}
write('protected-originals.json',{status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),method:'Readable baseline hashes; known offline placeholders metadata-only and never opened. No original writes, dependency/build changes or real profile stores used.',counts,changed});assert.equal(changed.length,0);
const releases=['alevel','igcse'].map(validateRelease);write('release-check.json',{status:'PASS',checkedAt:new Date().toISOString(),releases});
write('current-inputs.json',{status:'PASS',capturedAt:new Date().toISOString(),meaning:'E1 current source/build closure; prior stage acceptance evidence preserved separately.',inputs:now});
console.log(JSON.stringify({status:'PASS',changes:changes.length,protectedOriginals:counts,releases}));
