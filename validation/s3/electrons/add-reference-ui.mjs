import fs from 'node:fs';
import path from 'node:path';
const file=path.resolve(import.meta.dirname,'../../../src/editors/electron-configuration/index.tsx');
let s=fs.readFileSync(file,'utf8');s=s.replaceAll('<div className="ec-workspace">','<div className="ec-workspace"><PeriodicReference/>');fs.writeFileSync(file,s);
