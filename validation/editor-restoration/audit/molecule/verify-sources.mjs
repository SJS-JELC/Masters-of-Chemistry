import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const here=import.meta.dirname,workspace=process.cwd();
const originals='apps/Masters-of-A-Level-Chemistry/src/',current='apps/Masters-of-Chemistry/src/';
const requested=JSON.parse(await fs.readFile(path.join(here,'reference-browser-results.json'),'utf8')).requested;
const explicit=[
 ...['molecule-builder/core.js','molecule-builder/layout.js','molecule-builder/editor.js','molecule-builder/styles.css','molecule-builder/index.html','molecule-builder/README.md','c3l6-organic-reactions/activity.js','c3l6-organic-reactions/activity.css','c3l6-organic-reactions/assessment.js','c3l6-organic-reactions/content.js','c3l6-organic-reactions/index.html','c3l6-organic-reactions/panels/intro.html','c3l6-organic-reactions/panels/a.html','c3l6-organic-reactions/panels/b.html','c3l6-organic-reactions/panels/c.html'].map(p=>originals+'activities/'+p),
 ...requested.map(p=>originals+p.replaceAll('\\','/')),
 ...['editors/molecule/MoleculeEditor.tsx','editors/molecule/molecule.css','editors/molecule/index.ts','chemistry/molecule/core.js','chemistry/molecule/engine.ts','contracts/editors.ts','contracts/olympiad.ts','foundation/OlympiadHost.tsx',...['C3L6View.tsx','c3l6.css','dependencies.ts','policy.ts','content.ts','source-bank.ts','bank.json','panels.json','qualification.ts','qualification.json','index.ts','legacy.ts'].map(p=>'activities/olympiad/c3l6/'+p)].map(p=>current+p),
 'apps/Masters-of-Chemistry/docs/inventory/c3-k-erratum.md'
];
const files=[];for(const file of [...new Set(explicit)].sort()){try{const data=await fs.readFile(path.join(workspace,file));files.push({path:file,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}catch(e){files.push({path:file,error:e.code});}}
await fs.writeFile(path.join(here,'source-fingerprints.json'),JSON.stringify({recordedAt:new Date().toISOString(),purpose:'E0 inspected and browser-requested original/current source fingerprints; current provenance independent of historical evidence',files},null,2));
const a=await fs.readFile(path.join(workspace,originals+'activities/molecule-builder/core.js'),'utf8'),b=await fs.readFile(path.join(workspace,current+'chemistry/molecule/core.js'),'utf8');
const body=s=>s.slice(s.indexOf('const LIMIT = 20;'),s.indexOf('const api =')).replace(/\s+/g,'');
const checks={originalAndCurrentCoreBodyEquivalent:body(a)===body(b),fingerprintedFiles:files.length,unreadable:files.filter(f=>f.error),sourceBrowser:JSON.parse(await fs.readFile(path.join(here,'reference-browser-results.json'),'utf8')).status,reactBrowser:JSON.parse(await fs.readFile(path.join(here,'react-browser-results.json'),'utf8')).status};
await fs.writeFile(path.join(here,'verification.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));
