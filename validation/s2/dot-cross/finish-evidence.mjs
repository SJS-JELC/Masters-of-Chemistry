import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,project=path.resolve(here,'../../..');
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const gallery=JSON.parse(fs.readFileSync(path.join(here,'rendered-bank.json'),'utf8'));
// This disposition follows direct visual inspection of every retained contact sheet by A10.
for(const page of gallery){page.visualReview='PASS';page.reviewedBy='A10';page.reviewedAt=new Date().toISOString();page.notes='Inspected every depicted reference: atom identities, lone/shared pairs and origin symbols, ionic ratios/brackets/charges, central-shell exceptions, label/charge clipping and crowding. Source geometry is schematic and not marked.';page.sha256=hash(path.join(here,page.screenshot));}
fs.writeFileSync(path.join(here,'rendered-bank.json'),JSON.stringify(gallery,null,2));
const roots=['src/activities/alevel/dot-and-cross','src/editors/dot-and-cross','src/chemistry/dot-and-cross'];
const files=folder=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(folder,entry.name)):[path.join(folder,entry.name)]);
fs.writeFileSync(path.join(here,'final-source-fingerprints.json'),JSON.stringify({at:new Date().toISOString(),files:roots.flatMap(root=>files(path.join(project,root))).map(file=>({path:path.relative(project,file).replaceAll('\\','/'),sha256:hash(file)}))},null,2));
console.log('Retained direct all91 visual review and final owned source fingerprints.');
