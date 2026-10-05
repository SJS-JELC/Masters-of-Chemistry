import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'../..'),repo=path.resolve(project,'../..');
const paths=['apps/Masters-of-Chemistry/development/authoring/data.ts','resources/curriculum/ocr-a-level/a-level-specification-map.md','resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json'];
const sources=paths.map(p=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),symbolOrSection:p.endsWith('data.ts')?'Independent DEV dilution family inputs':p.endsWith('sections.json')?'Retained official OCR2016 archive extraction,5.1.3(d) and(f)(i); not a current full-PDF audit':'Department OCR3.1 May2026 map,Acids Bases pH section5.1.3; reviewed2026-09-10'}));
fs.writeFileSync(path.join(project,'development/authoring/provenance.ts'),'// Regenerate: node development/authoring/regenerate.mjs\nimport type {SourceReference} from "../../src/contracts/index.ts";\nexport const authoringSources = '+JSON.stringify(sources,null,2)+' as const satisfies readonly SourceReference[];\n');
console.log('Authoring provenance regenerated');
