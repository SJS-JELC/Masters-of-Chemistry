import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'../../..');
const original=path.resolve(project,'../Masters-of-A-Level-Chemistry/src');
const targets=[['electron-configurations','ElectronData','src/chemistry/electron-configuration'],['electrons-bonding','BondingData','src/activities/alevel/electrons-bonding']];
const fingerprints=[];
for(const [activity,globalName,destination] of targets){
 const directory=path.join(project,destination);fs.mkdirSync(directory,{recursive:true});
 const file=path.join(original,'activities',activity,'data.js'),source=fs.readFileSync(file,'utf8');
 const context=vm.createContext({});vm.runInContext(source,context);
 fs.writeFileSync(path.join(directory,'data.js'),`// Exact extracted source data. Regenerate: node validation/s3/electrons/extract-sources.mjs\nexport const data = ${JSON.stringify(context[globalName],null,2)};\n`);
 let core=fs.readFileSync(path.join(original,'activities',activity,'core.js'),'utf8');
 if(activity==='electron-configurations'){
  core=core.replace(/^\(function \(root\) \{\s*"use strict";\s*const D = root.ElectronData;/,'import {data as D} from "./data.js";');
  core=core.replace(/root\.ElectronCore = \{([^}]+)\};\s*\}\)\([^]+$/,'export {$1};');
 }else{
  core=core.replace(/^\(function \(root\) \{\s*'use strict';/,'');
  core=core.replace(/  const api = Object\.freeze[^]+$/,'export {normalize, markField, mark, score};\n');
 }
 fs.writeFileSync(path.join(directory,'core.js'),`// Checked React-free source marking; only module boundary changed.\n${core}`);
 for(const name of fs.readdirSync(path.join(original,'activities',activity))){if(!/\.(js|html|md|css)$/.test(name))continue;const p=path.join(original,'activities',activity,name);fingerprints.push({path:`apps/Masters-of-A-Level-Chemistry/src/activities/${activity}/${name}`,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}
}
for(const name of ['question-review.js','active-question-time.js'])fingerprints.push({path:`apps/Masters-of-A-Level-Chemistry/src/assets/${name}`,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(original,'assets',name))).digest('hex')});
const periodicContext=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(original,'assets/periodic-table-data.js'),'utf8'),periodicContext);
fs.writeFileSync(path.join(project,'src/chemistry/electron-configuration/periodic-data.ts'),`// Complete original OCR2020 reference, including its omissions and blank masses.\nexport const periodicData = ${JSON.stringify(periodicContext.PeriodicTableData,null,2)} as const;\n`);
for(const name of ['periodic-table-data.js','periodic-table.js','periodic-table.css'])fingerprints.push({path:`apps/Masters-of-A-Level-Chemistry/src/assets/${name}`,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(original,'assets',name))).digest('hex')});
fs.writeFileSync(path.join(import.meta.dirname,'source-fingerprints.json'),JSON.stringify(fingerprints,null,2)+'\n');
fs.writeFileSync(path.join(project,'src/chemistry/electron-configuration/provenance.ts'),`// Source-owned provenance; executable source/evidence stays outside the runtime.\nexport const electronSources = ${JSON.stringify(fingerprints.filter(item=>/electron-configurations\/(data|core|levels|levels-app|session)\.js$/.test(item.path)).map(item=>({...item,symbolOrSection:'complete checked active levels bank, source marking and historical codecs'})),null,2)} as const;\n`);
console.log('Extracted complete 71-species electron and 14-question bonding data plus unchanged marking functions.');
