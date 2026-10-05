import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const source='scripts/tests/legacy/s5/chemistry/c3-current-source-regression.test.ts';
let text=fs.readFileSync(path.join(project,source),'utf8');
text=text.replace(/^import \{suiteEvidenceFile\}[^\n]*\nconst _migrationEvidence=[^\n]*\n/,'')
  .replaceAll("'../../../../../src/","'../../src/")
  .replace("'../../../../..'),original=", "'../..'),original=")
  .replaceAll('_migrationEvidence(', 'path.join(evidence,');
text=text.replace('const source:any=', "const evidence=process.env.OLYMPIAD_EVIDENCE_DIR ? path.resolve(project,process.env.OLYMPIAD_EVIDENCE_DIR) : path.dirname(suiteEvidenceFile(import.meta.url,'unit-tests.txt'));\nif(process.env.OLYMPIAD_EVIDENCE_DIR && !evidence.startsWith(project+path.sep))throw Error('Evidence output must remain inside the project');\nfs.mkdirSync(evidence,{recursive:true});\nconst source:any=");
text=text.replace('const atoms=(formula:string)=>Object.fromEntries', 'const atoms=(formula:string):Record<string,number>=>Object.fromEntries');
fs.writeFileSync(path.join(project,'scripts/tests/c3-regression.test.ts'),`import {suiteEvidenceFile} from './legacy/test-evidence.mjs';\n// Port of ${source}; chemistry assertions unchanged, evidence output redirected.\n`+text);
console.log('C3 regression source preserved; current-run evidence redirected.');
