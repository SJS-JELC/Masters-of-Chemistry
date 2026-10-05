import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {releaseInventory} from '../../../scripts/release-s4.mjs';import {validateRelease} from '../../../scripts/validate-s4-release.mjs';
const root=path.resolve(import.meta.dirname,'../../..'),out=import.meta.dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const walk=(p)=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${p}/${e.name}`):[`${p}/${e.name}`]);
const files=['src','public','dist','release','development/authoring/templates'].flatMap(walk).concat(['AGENTS.md','IMPLEMENTATION.md','project-contract.json','package.json','package-lock.json','development/authoring/scaffold.mjs','development/authoring/family.ts','development/authoring/registry.ts','development/authoring/data.ts']);
fs.writeFileSync(path.join(out,'input-fingerprints.json'),JSON.stringify({at:new Date().toISOString(),files:Object.fromEntries(files.sort().map(p=>[p,sha(fs.readFileSync(path.join(root,p)))]))},null,2));
const report=['alevel','igcse'].map(c=>({check:validateRelease(c),freshInventory:releaseInventory(c)}));fs.writeFileSync(path.join(out,'release-validation.json'),JSON.stringify(report,null,2));
const generated=path.join(root,'development/authoring/families/dev-s5-independent'),g=JSON.parse(fs.readFileSync(path.join(generated,'generation-manifest.json')));
for(const [p,h]of Object.entries(g.generatedFingerprints))assert.equal(sha(fs.readFileSync(path.join(generated,p))),h);
for(const [p,h]of Object.entries(g.templateFingerprints))assert.equal(sha(fs.readFileSync(path.join(root,p))),h);
// Unchanged generated fixtures cannot run directly because their output directories
// are assigned to S4. This independent copy changes import/output locations only.
for(const name of ['family.test.mjs','browser.mjs']){
let s=fs.readFileSync(path.join(generated,name),'utf8');
s=s.replaceAll("from './family.ts'","from '../../../development/authoring/families/dev-s5-independent/family.ts'").replaceAll("from './registry.ts'","from '../../../development/authoring/families/dev-s5-independent/registry.ts'").replaceAll("from './provenance.ts'","from '../../../development/authoring/families/dev-s5-independent/provenance.ts'").replaceAll("from '../../../../src/domain/session/index.ts'","from '../../../src/domain/session/index.ts'").replaceAll("from '../../../../../../node_modules/playwright/index.mjs'","from '../../../../../node_modules/playwright/index.mjs'");
s=s.replace("path.resolve(import.meta.dirname,'../../../../validation/s4/authoring-release/refinement',path.basename(import.meta.dirname))","path.join(import.meta.dirname,'generated-fixtures')").replace("path.resolve(import.meta.dirname,'../../../../validation/s4/authoring-release/refinement','dev-s5-independent')","path.join(import.meta.dirname,'generated-browser')").replace("path.resolve(import.meta.dirname,'../../../../../..')","path.resolve(import.meta.dirname,'../../../../..')").replace("path.resolve(import.meta.dirname,'../../../../src/foundation/registry.ts')","path.resolve(import.meta.dirname,'../../../src/foundation/registry.ts')");
fs.writeFileSync(path.join(out,'independent-'+name),s);
}
fs.writeFileSync(path.join(out,'generated-integrity.json'),JSON.stringify({status:'PASS',generatorSha256:sha(fs.readFileSync(path.join(root,g.generator))),manifest:g,adaptation:'Only imports and evidence paths rewritten in separate owned fixture copies; generated output untouched'},null,2));
console.log(JSON.stringify(report.map(r=>r.check)));
