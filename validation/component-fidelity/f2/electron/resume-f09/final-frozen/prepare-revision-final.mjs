import fs from 'node:fs';import path from 'node:path';
const here=import.meta.dirname,source=fs.readFileSync(path.join(here,'lifecycle.mjs'),'utf8'),helper=source.split(/try\{\r?\n/)[0],tail=source.split(" const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),p=await startReact(ctx,'EC-5AUBIM','revision');")[1];
let s=helper+"try{const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),p=await startReact(ctx,'EC-5AUBIM','revision');const resumeURL=p.url();"+tail;
s=s.replace("await p.getByRole('button',{name:'Revision',exact:true}).click();","await p.goto(resumeURL);").replaceAll('lifecycle-results.json','revision-final-results.json').replace('pauseHomeReloadRestore:true','pauseHomeReloadRestore:true,resumeMethod:\'Saved revision URL after home and reload; landing Revision tile opens selection picker\'');
fs.writeFileSync(path.join(here,'revision-final.mjs'),s);
