import '../check-output.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root=process.cwd(), source=path.resolve(root,'../Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions');
const out=path.resolve(root,'src/activities/olympiad/c3l6');
const coreSource=path.resolve(root,'../Masters-of-A-Level-Chemistry/src/activities/molecule-builder/core.js');
const c={};vm.runInNewContext(fs.readFileSync(path.join(source,'content.js'),'utf8'),c);
fs.writeFileSync(path.join(out,'bank.json'),JSON.stringify(c.C3L6Content,null,2)+'\n');
// This is a pure, bounded checked graph dependency, not a page/controller wrapper.
const core=fs.readFileSync(coreSource,'utf8').replace(/\(function \(root\) \{\s*'use strict';/,'').replace(/  root\.MoleculeCore = api;[\s\S]*$/, 'export default api;\n');
fs.writeFileSync(path.join(root,'src/chemistry/molecule/core.js'),core);
fs.cpSync(path.join(source,'assets/digitised'),path.join(out,'assets/digitised'),{recursive:true});
// Independent A07 disposition approved by A01: public naming metadata only.
const qualification=JSON.parse(fs.readFileSync(path.join(out,'qualification.json'),'utf8'));
const hydrazonePath=path.join(out,'assets/digitised/b/gyromitrin-skeletal-notes.svg');
const escapeXml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync(hydrazonePath,fs.readFileSync(hydrazonePath,'utf8').replace(/<title>[\s\S]*?<\/title>/,`<title>${escapeXml(qualification.publicCopiedSvgMetadata.title)}</title>`).replace(/<desc>[\s\S]*?<\/desc>/,`<desc>${escapeXml(qualification.publicCopiedSvgMetadata.description)}</desc>`));
const html=fs.readFileSync(path.join(source,'panels/a.html'),'utf8');
const reactions=[...html.matchAll(/data-reaction="([^"]+)"([\s\S]*?)(?=<div class="digitised-reaction"|$)/g)].map(m=>({id:m[1],images:[...m[2].matchAll(/src="\.\.\/([^"?]+)[^"]*" alt="([^"]+)"/g)].map(x=>({src:x[1],alt:x[2]}))}));
const intro=fs.readFileSync(path.join(source,'panels/intro.html'),'utf8');
const paragraphs=[...intro.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').replaceAll('&amp;','&'));
fs.writeFileSync(path.join(out,'panels.json'),JSON.stringify({reactions,paragraphs},null,2)+'\n');
const files=[coreSource,path.join(source,'content.js'),path.join(source,'assessment.js'),...['intro','a','b','c'].map(n=>path.join(source,'panels',n+'.html'))];
function visit(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())visit(p);else files.push(p);}}visit(path.join(source,'assets/digitised'));
fs.writeFileSync(path.join(root,'.artifacts/source-generation/c3l6/source-fingerprints.json'),JSON.stringify(files.map(p=>({path:path.relative(path.resolve(root,'../..'),p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')})),null,2)+'\n');
console.log(JSON.stringify({classifications:c.C3L6Content.stages.a.answers.length,b:c.C3L6Content.stages.b.answers.length,c:c.C3L6Content.stages.c.answers.length,alternatives:['b','c'].flatMap(k=>c.C3L6Content.stages[k].answers.flatMap(x=>x.alternatives)).length,reactions:reactions.length}));
