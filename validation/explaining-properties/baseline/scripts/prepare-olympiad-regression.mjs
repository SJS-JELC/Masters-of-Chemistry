import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const source='validation/s5/chemistry/c3-current-source-regression.test.ts';
let text=fs.readFileSync(path.join(project,source),'utf8');
text=text.replaceAll("'../../../src/","'../../src/")
  .replace("'../../..'),original=", "'../..'),original=")
  .replaceAll("path.join(path.dirname(fileURLToPath(import.meta.url)),", "path.join(evidence,");
text=text.replace('const source:any=', "const evidence=path.resolve(project,process.env.OLYMPIAD_EVIDENCE_DIR || 'validation/olympiad-2011-q4/implementation');\nif(!evidence.startsWith(project+path.sep))throw Error('Evidence output must remain inside the project');\nfs.mkdirSync(evidence,{recursive:true});\nconst source:any=");
text=text.replace('const atoms=(formula:string)=>Object.fromEntries', 'const atoms=(formula:string):Record<string,number>=>Object.fromEntries');
fs.writeFileSync(path.join(project,'scripts/tests/c3-regression.test.ts'),`// Port of ${source}; chemistry assertions unchanged, evidence output redirected.\n`+text);
console.log('C3 regression source preserved; current-run evidence redirected.');
