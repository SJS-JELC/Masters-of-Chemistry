import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,project=path.resolve(here,'../../..'),workspace=path.resolve(project,'../..');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const refs=[
 ['apps/Masters-of-A-Level-Chemistry/src/assets/alevel-mastery.js','Original result keys, canonical diagram alias, acid progression ownership, optional timing'],
 ['apps/Masters-of-IGCSE-Chemistry/src/landing/progress.js','Original result key, supported grade checks, timing and retained optional flags'],
 ['apps/Masters-of-IGCSE-Chemistry/src/assets/igcse-mastery-config.js','Course grade/leaf boundary'],
 ['apps/Masters-of-A-Level-Chemistry/src/assets/question-review.js','Original stable review hash and query parameter'],
 ['apps/Masters-of-IGCSE-Chemistry/src/assets/question-review.js','Original stable review hash and query parameter'],
 ...['alevel','igcse'].flatMap(course=>{
  const app=course==='alevel'?'Masters-of-A-Level-Chemistry':'Masters-of-IGCSE-Chemistry';
  const slugs=course==='alevel'?['acid-base-calculations','electrons-bonding','electron-configurations','dot-and-cross','ph-titration-curves','c3l6-organic-reactions']:['calorimetry','bond-enthalpy','structure-and-bonding','dot-and-cross','energy-enthalpy','energetics-practical'];
  return slugs.map(slug=>[`apps/${app}/src/activities/${slug}/index.html`,'Actual released original route filename']);
 }),
 ['apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/app.js',"S0 erratum: actual original reviewBank=QuestionReview.bank('DC',questions); all 72 actual DC codes checked. S0 DAC wording remains unchanged."],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/app.js',"Actual original QuestionReview.bank('DAC',questions); old/new draft key patterns."],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels.js','S0 erratum: actual custom historical prefix ABL, not ABC; retained fixtures cover AB and ABL.'],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/session.js','All original ECB group masks and exact seeded matching options compared'],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assessment.js','C3 original V1/V2/V3 signature/saved completion source'],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/content.js','C3 source answers and molecular graph alternatives'],
 ['development/tests/fixtures/acid-legacy-reviews.json','33 immutable historical AB/ABL fixtures'],
 ['apps/Masters-of-IGCSE-Chemistry/src/assets/numeric-practice.js','Finite original calorimetry/bond enthalpy scheduler key patterns'],
 ...['structure-and-bonding','energy-enthalpy','energetics-practical'].map(slug=>[`apps/Masters-of-IGCSE-Chemistry/src/activities/${slug}/app.js`,'Original draft store patterns and optional saved-result metadata']),
 ['apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/session.js','Original Level2/3 saved practice keys and state limits'],
];
const sources=refs.map(([file,reason])=>{const bytes=fs.readFileSync(path.join(workspace,file));return {path:file,sha256:hash(bytes),bytes:bytes.length,reason};});
fs.writeFileSync(path.join(here,'source-audit.json'),JSON.stringify({checkedAt:new Date().toISOString(),readOnly:true,originalsExecutedInBrowser:false,sources,errata:[{inventory:'validation/s0/inventory/identity-index.json',activity:'igcse/dot-and-cross',inventoried:'DAC',actual:'DC',disposition:'Actual released source authoritative; no invented DAC alias.'},{inventory:'validation/s0/inventory/identity-index.json',activity:'alevel/acid-base-calculations',inventoried:'AB/ABC',actual:'AB/ABL',disposition:'Actual original custom decoder and frozen fixtures authoritative; no invented ABC alias.'}]},null,2));
const outputRoots=['src/compatibility','src/persistence/legacy'];const outputs={};
function walk(dir,visit){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const full=path.join(dir,entry.name);if(entry.isSymbolicLink())visit(full,true);else if(entry.isDirectory())walk(full,visit);else if(entry.isFile())visit(full,false);}}
for(const root of outputRoots)walk(path.join(project,root),file=>outputs[path.relative(project,file).replaceAll('\\','/')]=hash(fs.readFileSync(file)));
outputs['src/persistence/legacy.ts']=hash(fs.readFileSync(path.join(project,'src/persistence/legacy.ts')));
fs.writeFileSync(path.join(here,'output-fingerprints.json'),JSON.stringify({checkedAt:new Date().toISOString(),outputs},null,2));
// Same exact-byte/metadata-only semantics as protected-app gate; output is owned here.
const baseline=JSON.parse(fs.readFileSync(path.join(project,'validation/original-app-baseline.json'),'utf8')),files={};
for(const relativeRoot of baseline.roots)walk(path.join(workspace,relativeRoot),(full,symlink)=>{
 const key=path.relative(workspace,full).replaceAll('\\','/');
 if(symlink){files[key]={type:'symlink',target:fs.readlinkSync(full)};return;}
 try{const data=fs.readFileSync(full);files[key]={bytes:data.length,sha256:hash(data)};}catch(error){const stat=fs.statSync(full);files[key]={bytes:stat.size,mtimeMs:stat.mtimeMs,contentHashUnavailable:true,readError:error.code};}
});
const changed=[...new Set([...Object.keys(baseline.files),...Object.keys(files)])].filter(key=>JSON.stringify(files[key])!==JSON.stringify(baseline.files[key]));
const protectedResult={status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),fileCount:Object.keys(files).length,changed,metadataOnly:Object.keys(files).filter(k=>files[k].contentHashUnavailable)};
fs.writeFileSync(path.join(here,'protected-originals.json'),JSON.stringify(protectedResult,null,2));
console.log(JSON.stringify({sources:sources.length,outputs:Object.keys(outputs).length,protected:protectedResult.status,fileCount:protectedResult.fileCount}));
if(changed.length)process.exitCode=1;
