/** Source-owned independent course release inventories. No build/deploy/copy side effects. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {gzipSync} from 'node:zlib';
import {compatibilityRoutes} from '../src/compatibility/routes.ts';
import { olympiad2011Definition } from '../src/catalogue/olympiad-2011-definition.ts';
const project=path.resolve(import.meta.dirname,'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const coverage=JSON.parse(fs.readFileSync(path.join(project,'validation/s0/inventory/coverage-manifest.json'),'utf8'));
// Keep frozen migration inventory intact; append separately authorised content.
coverage.activities.push({id:olympiad2011Definition.id,course:'alevel',strand:'olympiad',supportedLevels:[],leafIds:[],activeBank:'Seven fixed C4H10O constitutional structures',generatorFamilies:[],finiteGeneratorConfigurations:7,sourceRoot:'resources/Olympiads/audit/organic-pilot-brief.md',sourceHashes:olympiad2011Definition.source});
const explicitAssets=['assets/SJS-Eagle.svg','assets/fonts/Comfortaa-Bold.ttf','assets/fonts/OFL-Comfortaa.txt','assets/landing/SJS-Eagle.svg','assets/landing/fonts/Comfortaa-Bold.ttf'];
export function releaseInventory(course){
 if(!['alevel','igcse'].includes(course))throw Error('Course must be alevel or igcse');
 const root=path.join(project,'dist',course),vite=JSON.parse(fs.readFileSync(path.join(root,'.vite/manifest.json'),'utf8'));
 const entries=Object.entries(vite).filter(([,v])=>v.isEntry);if(entries.length!==1||entries[0][0]!==`${course}.html`)throw Error('Expected single independent course entry');
 const initialKeys=new Set(),allKeys=new Set();
 function visit(key,set,dynamic){if(set.has(key))return;const v=vite[key];if(!v)throw Error(`Missing chunk ${key}`);set.add(key);for(const i of v.imports||[])visit(i,set,dynamic);if(dynamic)for(const i of v.dynamicImports||[])visit(i,set,true);}
 visit(entries[0][0],initialKeys,false);
 const entryOnlyKeys=[...initialKeys];
 const productionKey=Object.keys(vite).find(k=>k.endsWith('/ProductionFoundation.tsx'));if(!productionKey)throw Error('Actual production host chunk missing');
 visit(productionKey,initialKeys,false);
 const landingKey=Object.keys(vite).find(k=>k.endsWith('/landing/index.ts'));if(!landingKey)throw Error('Actual original landing chunk missing');
 visit(landingKey,initialKeys,false);visit(entries[0][0],allKeys,true);
 const aliases=compatibilityRoutes[course];
 const initial=[...initialKeys].map(k=>vite[k].file),runtime=new Set(['index.html',...explicitAssets,...aliases]);
 for(const k of allKeys){const v=vite[k];for(const f of [v.file,...v.css||[],...v.assets||[]])runtime.add(f);}
 const files=[...runtime].sort().map(f=>{const b=fs.readFileSync(path.join(root,f));return {path:f,bytes:b.length,sha256:sha(b),...(f.endsWith('.js')?{gzipBytes:gzipSync(b).length}:{}),role:f==='index.html'?'entry':aliases.includes(f)?'compatibility-alias':explicitAssets.includes(f)?'licensed-brand-asset':initial.includes(f)?'initial-javascript':'lazy-runtime'};});
 const activities=coverage.activities.filter(a=>a.course===course).map(a=>({id:a.id,course:a.course,strand:a.strand,revision:a.strand==='curriculum',supportedLevels:a.supportedLevels,leafIds:a.leafIds,activeBank:a.activeBank,generatorFamilies:a.generatorFamilies,finiteGeneratorConfigurations:a.finiteGeneratorConfigurations,sourceRoot:a.sourceRoot,sourceHashes:a.sourceHashes}));
 const result={schemaVersion:1,course,generatedAt:new Date().toISOString(),status:'local-runtime-inventory-no-publication',buildRoot:`dist/${course}`,entry:'index.html',shellGzipBudgetBytes:204800,gzipMethod:'node:zlib gzipSync default compression; individual files summed',initialScope:'course entry plus actual ProductionFoundation, default original landing and their eager imports; excludes deferred providers/editors/statistics/import',entryOnlyJavascriptGzipBytes:files.filter(f=>entryOnlyKeys.map(k=>vite[k].file).includes(f.path)).reduce((n,f)=>n+f.gzipBytes,0),initialJavascript:initial,initialJavascriptGzipBytes:files.filter(f=>initial.includes(f.path)).reduce((n,f)=>n+f.gzipBytes,0),lazyJavascript:files.filter(f=>f.path.endsWith('.js')&&!initial.includes(f.path)).map(f=>f.path),activities,requiredBrandAssets:explicitAssets,provenance:{inventoryPath:'validation/s0/inventory/coverage-manifest.json',inventorySha256:sha(fs.readFileSync(path.join(project,'validation/s0/inventory/coverage-manifest.json'))),viteManifestSha256:sha(fs.readFileSync(path.join(root,'.vite/manifest.json')))},files};
 // Entry-specific historical inventory remains explicit; both entries now expose
 // the same authorised course switch and complete lazy runtime closure.
 result.switchableCourses=['alevel','igcse'];
 result.switchableActivities=coverage.activities.map(a=>({id:a.id,course:a.course,strand:a.strand,revision:a.strand==='curriculum',leafIds:a.leafIds,supportedLevels:a.supportedLevels}));
 const recall=JSON.parse(fs.readFileSync(path.join(project,'project-contract.json'),'utf8')).hubViews.find(view=>view.id==='recall');
 result.hubViews=[{...recall,provenanceSha256:sha(fs.readFileSync(path.join(project,recall.sourceProvenance)))}];
 return result;
}
if(process.argv[1]===import.meta.filename){
 const course=process.argv[2];if(!['alevel','igcse'].includes(course))throw Error('Usage: node scripts/release-s4.mjs alevel|igcse');
 const output=path.join(project,'release',`${course}.runtime.json`);fs.writeFileSync(output,JSON.stringify(releaseInventory(course),null,2)+'\n');console.log(`${course} explicit runtime manifest written`);
}
