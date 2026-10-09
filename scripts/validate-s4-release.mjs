import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {releaseInventory} from './release-s4.mjs';
import {runtimeAliasDefinitions} from './runtime-aliases.mjs';
const project=path.resolve(import.meta.dirname,'..');
const forbidden=/(?:development|authoring|fixtures|node_modules|\.map$|\.test\.|rocket|\.tsx?$|\.mjs$|package(?:-lock)?\.json)/i;
function walk(root,p=''){return fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(root,p+e.name+'/'):[p+e.name]);}
export function validateRelease(){
 const file=path.join(project,'release','app.runtime.json'),manifest=JSON.parse(fs.readFileSync(file,'utf8')),fresh=releaseInventory();
 const compared=o=>{const {generatedAt,...rest}=o;return rest;};assert.deepEqual(compared(manifest),compared(fresh),'Manifest stale: explicitly regenerate for current build');
 const contract=JSON.parse(fs.readFileSync(path.join(project,'project-contract.json'),'utf8'));
 assert.deepEqual(manifest.activities.map(a=>a.id).sort(),contract.activities.map(a=>a.id).sort());
 assert.deepEqual(manifest.switchableCourses,['alevel','igcse']);
 assert.equal(manifest.hubViews.length,1);
 const recall=manifest.hubViews[0];assert.equal(recall.id,'recall');assert.equal(recall.mastery,false);assert.equal(recall.timingEvidence,false);assert.equal(recall.curriculumRevision,false);assert.deepEqual(recall.courses,['alevel','igcse']);
 const recallRuntime=manifest.lazyJavascript.find(name=>/RecallView-/.test(name));assert(recallRuntime,'Recall must be in the lazy runtime closure');
 assert.deepEqual(manifest.switchableActivities.map(a=>a.id).sort(),contract.activities.map(a=>a.id).sort(),'Switchable entry must expose exactly the authorised fourteen activities');
 assert.equal(manifest.activities.length,14);assert.equal(manifest.productionBuild,contract.productionBuild);assert.equal(manifest.buildRoot,'dist/app');assert.equal(manifest.defaultCourse,'alevel');assert.deepEqual(manifest.courses,['alevel','igcse']);assert.deepEqual(manifest.courseMetadata.map(row=>[row.course,row.activityIds.length]),[['alevel',8],['igcse',6]]);assert.equal(new Set(manifest.files.map(f=>f.path)).size,manifest.files.length);
 const root=path.join(project,'dist','app'),physical=walk(root).filter(p=>!p.startsWith('.vite/'));assert.deepEqual(physical.sort(),manifest.files.map(f=>f.path).sort(),'Unexpected built file outside explicitly approved runtime closure');
 assert(manifest.initialJavascriptGzipBytes<=204800,'Initial JS gzip budget exceeded');assert(manifest.lazyJavascript.length>0,'No lazy activity code');
 for(const f of manifest.files){assert(!forbidden.test(f.path),`Nonruntime/excluded release file ${f.path}`);const full=path.resolve(root,f.path);assert(full.startsWith(root+path.sep));const b=fs.readFileSync(full);assert.equal(b.length,f.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),f.sha256);if(f.path.endsWith('.js')){
  // A19's pure decoder must explicitly reject old excluded links. This exact rejection
  // is permitted; the application/assets/other Rocket references remain forbidden.
  let runtime=b.toString('utf8');if(/^assets\/compatibility-[\w-]+\.js$/.test(f.path))runtime=runtime.replace(/if\([\w$]+===`rocket-recall`\)return [\w$]+\([\w$]+,`Rocket Recall is excluded from this application\.`\);/g,'');
  assert(!/DEV-PH-v1|Development authoring catalogue|rocket-recall|RocketRecall|__mastersActivity|__mastersOlympiad|__mastersFoundation|development-fixture/.test(runtime),`Excluded content ${f.path}`);
 }}
 for(const asset of manifest.requiredBrandAssets){assert(manifest.files.some(f=>f.path===asset));assert.deepEqual(fs.readFileSync(path.join(root,asset)),fs.readFileSync(path.join(project,'public',asset)),`Licensed brand asset differs from source: ${asset}`);}
 assert.deepEqual(manifest.files.filter(f=>f.role==='compatibility-alias').map(f=>f.path).sort(),runtimeAliasDefinitions().map(alias=>alias.route).sort());
 for(const {route:alias,rootLink} of runtimeAliasDefinitions()){const html=fs.readFileSync(path.join(root,alias),'utf8');assert(html.length<5000,'Alias should be a tiny relative redirect');assert(!/https?:\/\/|<iframe|DEV-PH-v1|rocket/i.test(html),'Alias contains excluded/external runtime');assert(html.includes(rootLink),'Alias must preserve nested static prefix');}
 for(const a of manifest.activities){assert(a.sourceHashes?.length||Object.keys(a.sourceHashes||{}).length,`Missing provenance ${a.id}`);assert.equal(a.revision,a.strand==='curriculum');if(a.strand==='olympiad'){assert.equal(a.course,'alevel');assert(['alevel/c3l6-organic-reactions','alevel/olympiad-2011-q4'].includes(a.id));assert.equal(a.leafIds.length,0);assert.equal(a.supportedLevels.length,0);}}
 assert(!/iframe|https?:\/\/[^"']+\.js/i.test(fs.readFileSync(path.join(root,'index.html'),'utf8')));
 return {productionBuild:'app',courses:manifest.courses,status:'PASS',activityCount:manifest.activities.length,runtimeFileCount:manifest.files.length,initialJavascriptGzipBytes:manifest.initialJavascriptGzipBytes,lazyJavascriptChunks:manifest.lazyJavascript.length,manifestSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),checkedAt:new Date().toISOString()};
}
if(process.argv[1]===import.meta.filename){if(process.argv[2]&&process.argv[2]!=='app')throw Error('Usage: node scripts/validate-s4-release.mjs [app]');const report=validateRelease();fs.mkdirSync(path.join(project,'.artifacts/release'),{recursive:true});fs.writeFileSync(path.join(project,'.artifacts/release','release-app-check.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
