import fs from 'node:fs';import crypto from 'node:crypto';import ts from '../../../../node_modules/typescript/lib/typescript.js';
const here='validation/s5/fixes/titration-typing';const before=fs.readFileSync(here+'/editor-before.tsx','utf8'),after=fs.readFileSync('src/editors/titration-curve/TitrationCurveEditor.tsx','utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync(here+'/source-fingerprints.json',JSON.stringify({before:hash(before),after:hash(after),changedRuntimeFiles:['src/editors/titration-curve/TitrationCurveEditor.tsx'],recordedAt:new Date().toISOString()},null,2));
fs.writeFileSync(here+'/editor-after.tsx',after);
